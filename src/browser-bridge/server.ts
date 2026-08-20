/**
 * Minimal bridge carrier adapted from Lum1104/dsh-browser (MIT).
 * Copyright (c) 2026 Yuxiang Lin.
 */
import { randomUUID } from 'node:crypto'
import type { IncomingMessage } from 'node:http'
import type { Duplex } from 'node:stream'
import { WebSocket, WebSocketServer } from 'ws'
import {
  HELLO_TIMEOUT_MS,
  PING_INTERVAL_MS,
  parseClientFrame,
  type BridgeCaps,
  type ServerFrame,
} from './protocol.ts'
import { verifyToken } from './token.ts'

export class BridgeToolError extends Error {
  constructor(readonly code: string, message: string) {
    super(message)
    this.name = 'BridgeToolError'
  }
}

interface PendingTool {
  resolve(value: unknown): void
  reject(error: BridgeToolError): void
  timer: NodeJS.Timeout
  signal: AbortSignal
  abort: () => void
}

export interface BridgeServerOptions {
  token: string
  toolTimeoutMs: number
  caps: BridgeCaps
  helloTimeoutMs?: number
  pingIntervalMs?: number
}

export function isLoopbackAddress(value: string | undefined): boolean {
  return value === '127.0.0.1' || value === '::1' || value === '::ffff:127.0.0.1'
}

export function extensionOrigin(origin: string | undefined): boolean {
  return typeof origin === 'string' && origin.startsWith('chrome-extension://')
}

export class BrowserBridgeServer {
  private readonly wss = new WebSocketServer({ noServer: true })
  private current: { ws: WebSocket; ping: NodeJS.Timeout } | null = null
  private readonly pending = new Map<string, PendingTool>()
  private closed = false

  constructor(private readonly options: BridgeServerOptions) {}

  get connected(): boolean {
    return this.current?.ws.readyState === WebSocket.OPEN
  }

  handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer): void {
    this.wss.handleUpgrade(req, socket, head, ws => this.attach(ws, req.socket.remoteAddress, req.headers.origin))
  }

  requestTool(name: string, args: Record<string, unknown>, signal: AbortSignal, sessionId?: string): Promise<unknown> {
    const connection = this.current
    if (connection === null || connection.ws.readyState !== WebSocket.OPEN) {
      throw new BridgeToolError('bridge-closed', 'no browser extension is connected to the bridge')
    }
    if (signal.aborted) throw new BridgeToolError('bridge-closed', 'browser action cancelled before dispatch')
    const id = randomUUID()
    return new Promise((resolve, reject) => {
      const abort = (): void => this.cancel(id, new BridgeToolError('bridge-closed', 'browser action cancelled'))
      const timer = setTimeout(() => this.cancel(id, new BridgeToolError('timeout', `browser action "${name}" timed out`)), this.options.toolTimeoutMs)
      this.pending.set(id, { resolve, reject, timer, signal, abort })
      signal.addEventListener('abort', abort, { once: true })
      this.send({
        t: 'tool.call', id, name, args,
        expiresAt: Date.now() + this.options.toolTimeoutMs,
        ...(sessionId === undefined ? {} : { sessionId }),
      })
    })
  }

  async close(): Promise<void> {
    if (this.closed) return
    this.closed = true
    this.drop(new BridgeToolError('bridge-closed', 'browser bridge stopped'))
    for (const ws of this.wss.clients) ws.terminate()
    await new Promise<void>(resolve => this.wss.close(() => resolve()))
  }

  private attach(ws: WebSocket, remoteAddress: string | undefined, origin: string | undefined): void {
    let authenticated = false
    const helloTimer = setTimeout(() => ws.close(4001, 'hello timeout'), this.options.helloTimeoutMs ?? HELLO_TIMEOUT_MS)
    ws.on('message', data => {
      const frame = parseClientFrame(Buffer.isBuffer(data) ? data.toString('utf8') : String(data))
      if (frame === undefined) { ws.close(1008, 'unparseable frame'); return }
      if (!authenticated) {
        if (frame.t !== 'hello') { ws.close(1008, 'hello first'); return }
        const localExtension = isLoopbackAddress(remoteAddress) && extensionOrigin(origin)
        if (!localExtension && !verifyToken(this.options.token, frame.token)) { ws.close(4002, 'bad token'); return }
        authenticated = true
        clearTimeout(helloTimer)
        this.promote(ws)
        return
      }
      if (frame.t === 'pong') return
      if (frame.t === 'tool.result') {
        const pending = this.pending.get(frame.id)
        if (pending === undefined) return
        this.settle(frame.id)
        if (frame.ok) pending.resolve(frame.result)
        else pending.reject(new BridgeToolError(frame.error.code, frame.error.message))
        return
      }
      if (frame.t === 'rpc') this.send({ t: 'rpc.result', id: frame.id, ok: false, error: { code: 'unsupported', message: 'better-sidebar bridge exposes browser tools only' } })
      if (frame.t === 'respond') this.send({ t: 'respond.result', id: frame.id, ok: false, error: { code: 'unsupported', message: 'better-sidebar bridge does not proxy DSH interactions' } })
    })
    ws.once('close', () => { clearTimeout(helloTimer); if (this.current?.ws === ws) this.drop(new BridgeToolError('bridge-closed', 'browser extension disconnected')) })
    ws.once('error', () => { clearTimeout(helloTimer); if (this.current?.ws === ws) this.drop(new BridgeToolError('bridge-closed', 'browser extension disconnected')) })
  }

  private promote(ws: WebSocket): void {
    this.drop(new BridgeToolError('bridge-closed', 'browser extension connection replaced'))
    const ping = setInterval(() => this.send({ t: 'ping' }), this.options.pingIntervalMs ?? PING_INTERVAL_MS)
    this.current = { ws, ping }
    this.send({ t: 'hello.ok', caps: this.options.caps })
  }

  private send(frame: ServerFrame): void {
    const ws = this.current?.ws
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(frame))
  }

  private cancel(id: string, error: BridgeToolError): void {
    if (!this.pending.has(id)) return
    this.send({ t: 'tool.cancel', id })
    const pending = this.pending.get(id)!
    this.settle(id)
    pending.reject(error)
  }

  private settle(id: string): void {
    const pending = this.pending.get(id)
    if (pending === undefined) return
    this.pending.delete(id)
    clearTimeout(pending.timer)
    pending.signal.removeEventListener('abort', pending.abort)
  }

  private drop(error: BridgeToolError): void {
    const current = this.current
    this.current = null
    if (current !== null) {
      clearInterval(current.ping)
      if (current.ws.readyState === WebSocket.OPEN || current.ws.readyState === WebSocket.CONNECTING) current.ws.close(4000, 'replaced')
    }
    for (const [id, pending] of this.pending) {
      this.settle(id)
      pending.reject(error)
    }
  }
}
