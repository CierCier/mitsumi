import { NextRequest, NextResponse } from 'next/server'
import { getKv } from '@/lib/kv'
import { getSession } from '@/lib/auth'

export async function GET() {
  const sessionId = await getSession()
  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const kv = getKv()
  if (!kv) {
    return NextResponse.json({ error: 'Storage unavailable' }, { status: 500 })
  }

  const keys = await kv.keys('ban:*')
  const bans: Array<{ type: 'slug' | 'domain'; pattern: string; reason: string; createdAt: number }> = []

  for (const key of keys) {
    const data = await kv.get<{ reason: string; createdAt: number }>(key)
    if (data) {
      const parts = key.split(':')
      bans.push({
        type: parts[1] as 'slug' | 'domain',
        pattern: parts.slice(2).join(':'),
        reason: data.reason || '',
        createdAt: data.createdAt || 0,
      })
    }
  }

  bans.sort((a, b) => b.createdAt - a.createdAt)

  return NextResponse.json({ bans })
}

export async function POST(req: NextRequest) {
  const sessionId = await getSession()
  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { type, pattern, reason } = await req.json()

  if (!type || !pattern) {
    return NextResponse.json({ error: 'Type and pattern required' }, { status: 400 })
  }

  if (type !== 'slug' && type !== 'domain') {
    return NextResponse.json({ error: 'Type must be slug or domain' }, { status: 400 })
  }

  const kv = getKv()
  if (!kv) {
    return NextResponse.json({ error: 'Storage unavailable' }, { status: 500 })
  }

  const key = `ban:${type}:${pattern}`
  const exists = await kv.exists(key)
  if (exists) {
    return NextResponse.json({ error: 'Ban already exists' }, { status: 409 })
  }

  await kv.set(key, { reason: reason || '', createdAt: Date.now() })

  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const sessionId = await getSession()
  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { type, pattern } = await req.json()

  if (!type || !pattern) {
    return NextResponse.json({ error: 'Type and pattern required' }, { status: 400 })
  }

  const kv = getKv()
  if (!kv) {
    return NextResponse.json({ error: 'Storage unavailable' }, { status: 500 })
  }

  await kv.del(`ban:${type}:${pattern}`)

  return NextResponse.json({ ok: true })
}
