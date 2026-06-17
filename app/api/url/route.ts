import { NextRequest, NextResponse } from 'next/server'
import { getKv } from '@/lib/kv'
import { randomSlug, isValidSlug } from '@/lib/slug'
import { getSession } from '@/lib/auth'
import { checkRateLimit } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  try {
    const { target, slug: customSlug, elevated: reqElevated } = await req.json()

    if (!target) {
      return NextResponse.json({ error: 'Target URL is required' }, { status: 400 })
    }

    let targetUrl: URL
    try {
      targetUrl = new URL(target.startsWith('http') ? target : `https://${target}`)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      return NextResponse.json({ error: 'Only http and https URLs are allowed' }, { status: 400 })
    }

    const sessionId = await getSession()
    const isElevated = !!(sessionId && reqElevated)

    if (!isElevated) {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || req.headers.get('x-real-ip')
        || '127.0.0.1'
      const rateCheck = await checkRateLimit(ip)
      if (!rateCheck.allowed) {
        return NextResponse.json({
          error: 'Rate limit exceeded. Try again later.',
          retryAfter: Math.ceil((rateCheck.reset - Date.now()) / 1000),
        }, { status: 429 })
      }
    }

    const kv = getKv()
    if (!kv) {
      return NextResponse.json({ error: 'Storage unavailable' }, { status: 500 })
    }

    let slug: string
    if (customSlug) {
      if (!isValidSlug(customSlug)) {
        return NextResponse.json({
          error: 'Slug must be 1-32 characters, lowercase alphanumeric',
        }, { status: 400 })
      }

      const exists = await kv.exists(`url:${customSlug}`)
      if (exists) {
        return NextResponse.json({ error: 'This slug is already taken' }, { status: 409 })
      }

      const bannedSlug = await checkSlugBan(kv, customSlug)
      if (bannedSlug) {
        return NextResponse.json({ error: `Slug "${customSlug}" is banned: ${bannedSlug}` }, { status: 403 })
      }

      const bannedDomain = await checkDomainBan(kv, targetUrl.hostname)
      if (bannedDomain) {
        return NextResponse.json({ error: `Domain "${targetUrl.hostname}" is banned: ${bannedDomain}` }, { status: 403 })
      }

      slug = customSlug
    } else {
      let attempts = 0
      do {
        slug = randomSlug()
        attempts++
        if (attempts > 10) {
          return NextResponse.json({ error: 'Could not generate unique slug' }, { status: 500 })
        }
      } while (await kv.exists(`url:${slug}`))
    }

    const expiryMinutes = parseInt(process.env.MTS_URL_EXPIRY || '15')

    await kv.hset(`url:${slug}`, {
      target: targetUrl.href,
      createdAt: Date.now(),
      elevated: isElevated ? 1 : 0,
      visits: 0,
    })

    if (!isElevated) {
      await kv.expire(`url:${slug}`, expiryMinutes * 60)
    }

    return NextResponse.json({
      slug,
      target: targetUrl.href,
      elevated: isElevated,
      expiresIn: isElevated ? null : expiryMinutes * 60,
    }, { status: 201 })
  } catch (err) {
    console.error('URL creation error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function checkSlugBan(kv: any, slug: string): Promise<string | null> {
  const banKeys = await kv.keys('ban:slug:*')
  for (const key of banKeys) {
    const pattern = key.replace('ban:slug:', '')
    if (slug === pattern || (pattern.endsWith('*') && slug.startsWith(pattern.slice(0, -1)))) {
      const data: { reason?: string } | null = await kv.get(key)
      return data?.reason || 'banned'
    }
  }
  return null
}

async function checkDomainBan(kv: any, hostname: string): Promise<string | null> {
  const banKeys = await kv.keys('ban:domain:*')
  for (const key of banKeys) {
    const domain = key.replace('ban:domain:', '')
    if (hostname === domain || hostname.endsWith(`.${domain}`)) {
      const data: { reason?: string } | null = await kv.get(key)
      return data?.reason || 'banned'
    }
  }
  return null
}
