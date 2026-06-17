import { kv as vercelKv } from '@vercel/kv'

let client: typeof vercelKv | null = null

export function getKv() {
  if (!client) {
    try {
      if (vercelKv) client = vercelKv
    } catch {
      return null
    }
  }
  return client
}
