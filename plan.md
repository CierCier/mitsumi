# Mitsumi — URL Shortener

## Stack
- **Runtime:** Bun 1.x (local) + Bun on Vercel (serverless) + Edge Runtime (redirect)
- **Framework:** Next.js 14 App Router
- **Storage:** Vercel KV (Redis via @vercel/kv)
- **Animations:** motion (framer-motion v11)
- **Icons:** lucide-react
- **Toasts:** sonner
- **CSS:** TailwindCSS + tailwindcss-animate + @tailwindcss/typography

## Design — "Paper Notebook"
- Light mode only, warm paper background (`#F8F6F3`)
- White cards, terracotta primary (`#D4784C`), steel blue secondary
- Serif headings (DM Serif Display) + Inter body + JetBrains Mono code
- Faint CSS noise grain texture on background
- Subtle paper-like shadows

## Bun-Native Replacements
| External lib | Bun replacement |
|---|---|
| jose (JWT) | crypto.randomUUID() + KV sessions |
| bcryptjs / any password lib | Bun.password.hash/verify (argon2id) |
| dotenv | Bun.env (auto-loads) |
| uuid lib | crypto.randomUUID() |

## Architecture
```
Edge Runtime:        app/[slug]/route.ts    (fast 301 redirect, pure Web APIs)
Bun Serverless:      app/api/*              (password hash, full Bun)
                     app/admin/*            (RSC pages, client components)
```

## Data Model (KV)
```
url:{slug}          → Hash { target, createdAt, elevated, visits }
session:{id}        → Hash { username, at } + TTL 24h
ratelimit:{ip}      → Hash { count, windowStart } + TTL
ban:slug:{pattern}  → Hash { reason, createdAt }
ban:domain:{domain} → Hash { reason, createdAt }
```

## Admin Dashboard — 4 Tabs
1. **URLs** — searchable table, create elevated, delete with confirm
2. **Bans** — ban by slug pattern or domain, list/remove, optional purge
3. **Rate Limits** — config display, blocked IPs table, unblock/clear
4. **Settings** — read-only env vars, KV status

## API Routes
| Method | Path | Auth | Rate-Limited | Action |
|---|---|---|---|---|
| POST | /api/auth | No | No | Login → set session cookie |
| GET | /api/auth | Yes | No | Verify session |
| POST | /api/url | No | Yes (10/min/IP) | Create non-elevated URL |
| POST | /api/url | Yes | No | Create elevated URL |
| GET | /api/urls | Yes | No | List all URLs |
| DELETE | /api/urls | Yes | No | Delete URL |
| GET | /[slug] | No | No | 301 redirect (Edge) |

## Env Vars
```
MTS_ADMIN_UNAME=admin
MTS_ADMIN_PASS=<password>
MTS_URL_EXPIRY=15           # minutes, default 15
MTS_RATE_LIMIT_MAX=10       # requests per window
MTS_RATE_LIMIT_WINDOW=60    # seconds
```

## Dependencies
```json
{
  "dependencies": {
    "next": "^14.2",
    "react": "^18",
    "react-dom": "^18",
    "@vercel/kv": "^1",
    "motion": "^11",
    "lucide-react": "^0.468",
    "sonner": "^1.7"
  },
  "devDependencies": {
    "tailwindcss": "^3.4",
    "tailwindcss-animate": "^1",
    "@tailwindcss/typography": "^0",
    "postcss": "^8",
    "autoprefixer": "^10",
    "typescript": "^5",
    "@types/react": "^18",
    "@types/node": "^20"
  }
}
```

## Local Dev
```bash
bun install
bun run dev
```

## Deploy
```bash
bunx vercel link
bunx vercel kv create
bunx vercel env add MTS_ADMIN_UNAME
bunx vercel env add MTS_ADMIN_PASS
bunx vercel
```
