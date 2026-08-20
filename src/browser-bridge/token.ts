/**
 * Token helpers adapted from Lum1104/dsh-browser (MIT).
 * Copyright (c) 2026 Yuxiang Lin.
 */
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { chmod, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { homedir } from 'node:os'

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex')
}

export function verifyToken(expected: string, actual: string): boolean {
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(actual, 'utf8')
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b)
}

export function tokenFilePath(): string {
  const home = process.env.DSH_HOME?.trim() || join(homedir(), '.dsh')
  return join(home, 'ext-bridge-token')
}

export async function resolveToken(configured?: string, file = tokenFilePath()): Promise<{ token: string; file: string; generated: boolean }> {
  if (configured !== undefined && configured.trim() !== '') return { token: configured, file, generated: false }
  try {
    const existing = (await readFile(file, 'utf8')).trim()
    if (existing !== '') return { token: existing, file, generated: false }
  } catch { /* create below */ }
  const token = generateToken()
  await mkdir(dirname(file), { recursive: true })
  const temp = `${file}.tmp-${process.pid}`
  await writeFile(temp, `${token}\n`, { mode: 0o600 })
  await chmod(temp, 0o600)
  await rename(temp, file)
  return { token, file, generated: true }
}
