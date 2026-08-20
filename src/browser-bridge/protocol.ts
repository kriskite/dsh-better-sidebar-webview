/**
 * Minimal wire-compatible subset of Lum1104/dsh-browser's bridge protocol.
 * Adapted from packages/browser/bridge-browser under the MIT License.
 * Copyright (c) 2026 Yuxiang Lin.
 */
export const BRIDGE_PATH = '/ext/bridge'
export const BRIDGE_CONFIG_PATH = '/ext/bridge-config'
export const HELLO_TIMEOUT_MS = 5_000
export const PING_INTERVAL_MS = 30_000
export const DEFAULT_SNAPSHOT_MAX_CHARS = 32_000
export const MIN_SNAPSHOT_MAX_CHARS = 500

export interface BridgeCaps {
  textOnly: true
  snapshotMaxChars: number
  maxInteractiveItems: number
}

export interface ToolError {
  code: string
  message: string
}

export type ClientFrame =
  | { t: 'hello'; token: string; caps: BridgeCaps }
  | { t: 'rpc'; id: string; method: string; payload: unknown }
  | { t: 'respond'; id: string; rpcId: string; result: unknown }
  | { t: 'tool.result'; id: string; ok: true; result: unknown }
  | { t: 'tool.result'; id: string; ok: false; error: ToolError }
  | { t: 'pong' }

export type ServerFrame =
  | { t: 'hello.ok'; caps: BridgeCaps }
  | { t: 'rpc.result'; id: string; ok: false; error: ToolError }
  | { t: 'respond.result'; id: string; ok: false; error: ToolError }
  | { t: 'tool.call'; id: string; name: string; args: Record<string, unknown>; expiresAt: number; sessionId?: string }
  | { t: 'tool.cancel'; id: string }
  | { t: 'ping' }
  | { t: 'error'; code: string; message: string }

export type BridgeFrame = ClientFrame | ServerFrame

export function parseClientFrame(text: string): ClientFrame | undefined {
  let value: unknown
  try { value = JSON.parse(text) } catch { return undefined }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  const frame = value as Record<string, unknown>
  switch (frame.t) {
    case 'hello':
      return typeof frame.token === 'string' && isCaps(frame.caps)
        ? { t: 'hello', token: frame.token, caps: frame.caps }
        : undefined
    case 'rpc':
      return typeof frame.id === 'string' && typeof frame.method === 'string'
        ? { t: 'rpc', id: frame.id, method: frame.method, payload: frame.payload }
        : undefined
    case 'respond':
      return typeof frame.id === 'string' && typeof frame.rpcId === 'string'
        ? { t: 'respond', id: frame.id, rpcId: frame.rpcId, result: frame.result }
        : undefined
    case 'tool.result':
      if (typeof frame.id !== 'string') return undefined
      if (frame.ok === true) return { t: 'tool.result', id: frame.id, ok: true, result: frame.result }
      return isToolError(frame.error)
        ? { t: 'tool.result', id: frame.id, ok: false, error: frame.error }
        : undefined
    case 'pong': return { t: 'pong' }
    default: return undefined
  }
}

function isCaps(value: unknown): value is BridgeCaps {
  if (typeof value !== 'object' || value === null) return false
  const caps = value as Record<string, unknown>
  return caps.textOnly === true
    && Number.isInteger(caps.snapshotMaxChars)
    && Number(caps.snapshotMaxChars) >= MIN_SNAPSHOT_MAX_CHARS
    && Number.isInteger(caps.maxInteractiveItems)
    && Number(caps.maxInteractiveItems) > 0
}

function isToolError(value: unknown): value is ToolError {
  return typeof value === 'object' && value !== null
    && typeof (value as Record<string, unknown>).code === 'string'
    && typeof (value as Record<string, unknown>).message === 'string'
}
