import { getKv } from './kv'

const DEFAULT_MAX = 10
const DEFAULT_WINDOW = 60

interface RateLimitResult {
  allowed: boolean
  remaining: number
  reset: number
}

export async function checkRateLimit(
  ip: string,
  max = parseInt(process.env.MTS_RATE_LIMIT_MAX || String(DEFAULT_MAX)),
  window = parseInt(process.env.MTS_RATE_LIMIT_WINDOW || String(DEFAULT_WINDOW))
): Promise<RateLimitResult> {
  const kv = getKv()
  if (!kv) return { allowed: true, remaining: max, reset: 0 }

  const key = `ratelimit:${ip}`
  const now = Date.now()
  const windowKey = Math.floor(now / (window * 1000))

  const current = await kv.get<{ count: number; window: number }>(key)

  if (!current || current.window !== windowKey) {
    await kv.set(key, { count: 1, window: windowKey }, { ex: window })
    return { allowed: true, remaining: max - 1, reset: now + window * 1000 }
  }

  const remaining = max - current.count

  if (current.count >= max) {
    return { allowed: false, remaining: 0, reset: (windowKey + 1) * window * 1000 }
  }

  await kv.set(key, { count: current.count + 1, window: windowKey }, { ex: window })
  return { allowed: true, remaining: remaining - 1, reset: now + window * 1000 }
}

export async function getRateLimitedIps(): Promise<Array<{ ip: string; count: number; window: number; ttl: number }>> {
  const kv = getKv()
  if (!kv) return []

  const keys = await kv.keys('ratelimit:*')
  const ips: Array<{ ip: string; count: number; window: number; ttl: number }> = []

  for (const key of keys) {
    const data = await kv.get<{ count: number; window: number }>(key)
    if (data) {
      const ttl = await kv.ttl(key)
      ips.push({
        ip: key.replace('ratelimit:', ''),
        count: data.count,
        window: data.window,
        ttl,
      })
    }
  }

  return ips.sort((a, b) => b.count - a.count)
}

export async function unblockIp(ip: string): Promise<void> {
  const kv = getKv()
  if (!kv) return
  await kv.del(`ratelimit:${ip}`)
}

export async function clearAllRateLimits(): Promise<void> {
  const kv = getKv()
  if (!kv) return
  const keys = await kv.keys('ratelimit:*')
  for (const key of keys) {
    await kv.del(key)
  }
}
