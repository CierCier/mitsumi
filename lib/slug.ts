const BASE36 = 'abcdefghijklmnopqrstuvwxyz0123456789'

export function randomSlug(length = 8): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => BASE36[b % 36]).join('')
}

export function isValidSlug(slug: string): boolean {
  return /^[a-zA-Z0-9_-]{1,32}$/.test(slug)
}
