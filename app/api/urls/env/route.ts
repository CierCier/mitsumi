import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  const sessionId = await getSession()
  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const env: Record<string, string> = {
    MTS_ADMIN_UNAME: process.env.MTS_ADMIN_UNAME || '',
    MTS_URL_EXPIRY: process.env.MTS_URL_EXPIRY || '15',
    MTS_RATE_LIMIT_MAX: process.env.MTS_RATE_LIMIT_MAX || '10',
    MTS_RATE_LIMIT_WINDOW: process.env.MTS_RATE_LIMIT_WINDOW || '60',
    KV_URL: process.env.KV_URL ? 'configured' : '',
  }

  return NextResponse.json({ env })
}
