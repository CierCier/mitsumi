import { cookies } from 'next/headers'
import { getKv } from './kv'

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(data))
  return toHex(hash)
}

let adminHash: string | null = null

async function getAdminHash(): Promise<string | null> {
  if (adminHash) return adminHash
  const pass = process.env.MTS_ADMIN_PASS
  if (!pass) return null
  adminHash = await sha256(pass)
  return adminHash
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = await getAdminHash()
  if (!hash) return false
  const attemptHash = await sha256(password)
  return hash === attemptHash
}

export async function createSession(): Promise<string> {
  const sessionId = crypto.randomUUID()
  const kv = getKv()
  await kv?.set(`session:${sessionId}`, {
    username: process.env.MTS_ADMIN_UNAME || 'admin',
    at: Date.now(),
  }, { ex: 86400 })
  return sessionId
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('mts_session')?.value
  if (!sessionId) return null
  const kv = getKv()
  const session = await kv?.get(`session:${sessionId}`)
  if (!session) return null
  return sessionId
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('mts_session')?.value
  if (!sessionId) return
  const kv = getKv()
  await kv?.del(`session:${sessionId}`)
  cookieStore.delete('mts_session')
}

export function getAdminCredentials(): { username: string; password: string } | null {
  const username = process.env.MTS_ADMIN_UNAME
  const password = process.env.MTS_ADMIN_PASS
  if (!username || !password) return null
  return { username, password }
}
