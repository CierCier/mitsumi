import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyPassword, createSession, getSession, destroySession, getAdminCredentials } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    const creds = getAdminCredentials()
    if (!creds || username !== creds.username) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await verifyPassword(password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const sessionId = await createSession()
    const cookieStore = await cookies()
    cookieStore.set('mts_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  const sessionId = await getSession()
  if (!sessionId) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  return NextResponse.json({ authenticated: true })
}

export async function DELETE() {
  await destroySession()
  return NextResponse.json({ ok: true })
}
