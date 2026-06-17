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

  const keys = await kv.keys('url:*')
  const urls: Array<{
    slug: string
    target: string
    createdAt: number
    elevated: boolean
    visits: number
    ttl: number | null
  }> = []

  for (const key of keys) {
    const slug = key.replace('url:', '')
    const data = await kv.hgetall<{
      target: string
      createdAt: string
      elevated: string
      visits: string
    }>(key)

    if (data?.target) {
      const ttl = await kv.ttl(key)
      urls.push({
        slug,
        target: data.target,
        createdAt: parseInt(data.createdAt as string) || 0,
        elevated: data.elevated === '1',
        visits: parseInt(data.visits as string) || 0,
        ttl: ttl > 0 ? ttl : null,
      })
    }
  }

  urls.sort((a, b) => b.createdAt - a.createdAt)

  return NextResponse.json({ urls })
}

export async function DELETE(req: NextRequest) {
  const sessionId = await getSession()
  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await req.json()
  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  const kv = getKv()
  if (!kv) {
    return NextResponse.json({ error: 'Storage unavailable' }, { status: 500 })
  }

  await kv.del(`url:${slug}`)
  return NextResponse.json({ ok: true })
}
