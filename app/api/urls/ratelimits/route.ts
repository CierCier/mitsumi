import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getRateLimitedIps, unblockIp, clearAllRateLimits } from '@/lib/ratelimit'

export async function GET() {
  const sessionId = await getSession()
  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ips = await getRateLimitedIps()
  return NextResponse.json({ ips })
}

export async function DELETE(req: NextRequest) {
  const sessionId = await getSession()
  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { ip, clearAll } = await req.json()

  if (clearAll) {
    await clearAllRateLimits()
    return NextResponse.json({ ok: true })
  }

  if (!ip) {
    return NextResponse.json({ error: 'IP required' }, { status: 400 })
  }

  await unblockIp(ip)
  return NextResponse.json({ ok: true })
}
