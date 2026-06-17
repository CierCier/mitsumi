import { NextRequest, NextResponse } from 'next/server'
import { getKv } from '@/lib/kv'

export const runtime = 'edge'

function isBrowser(req: NextRequest): boolean {
  const accept = req.headers.get('accept') || ''
  const ua = req.headers.get('user-agent') || ''
  if (accept.includes('text/html')) return true
  if (/curl|wget|python-requests|go-http|x-vercel/i.test(ua)) return false
  if (/mozilla|chrome|safari|firefox|edge|opera/i.test(ua)) return true
  return false
}

function renderPage(target: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Redirecting\u2026</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Inter', system-ui, sans-serif;
  background: #F8F6F3;
  color: #1C1814;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.card {
  background: #FFFFFF;
  border: 1px solid #EDE9E4;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
}
.brand-img {
  display: block;
  margin: 0 auto 1.5rem;
  height: 36px;
}
.target {
  font-size: 0.8rem;
  color: #7A746E;
  background: #F8F6F3;
  border-radius: 6px;
  padding: 0.6rem 0.75rem;
  word-break: break-all;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}
.counter {
  font-variant-numeric: tabular-nums;
  font-size: 2.75rem;
  font-weight: 500;
  color: #D4784C;
  line-height: 1;
  margin-bottom: 0.35rem;
}
.label {
  font-size: 0.7rem;
  color: #B5B0A8;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}
.btn {
  display: inline-block;
  padding: 0.55rem 1.25rem;
  border-radius: 8px;
  background: #D4784C;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.15s;
}
.btn:hover { background: #C1683E; }
</style>
</head>
<body>
<div class="card">
  <img src="/brand/logo.svg" alt="Mitsumi" class="brand-img" />
  <div class="target">${escapeHtml(target)}</div>
  <div class="counter" id="count">5</div>
  <div class="label">redirecting</div>
  <a class="btn" href="${escapeHtml(target)}">Redirect now</a>
</div>
<script>
(function(){var c=5,i=setInterval(function(){c--;document.getElementById('count').textContent=c;if(c<=0){clearInterval(i);window.location.replace('${escapeHtml(target)}')}},1000)})()
</script>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  if (!slug || slug.length > 32) {
    return new NextResponse(null, { status: 404 })
  }

  const kv = getKv()
  if (!kv) {
    return new NextResponse(null, { status: 500 })
  }

  const data = await kv.hgetall<{
    target?: string
    elevated?: boolean
    visits?: number
  }>(`url:${slug}`)

  if (!data?.target) {
    return new NextResponse(null, { status: 404 })
  }

  await kv.hincrby(`url:${slug}`, 'visits', 1)

  if (isBrowser(req)) {
    const html = renderPage(data.target)
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  return NextResponse.redirect(data.target, 301)
}
