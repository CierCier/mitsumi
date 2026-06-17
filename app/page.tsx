'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link, Copy, Check, Sparkles, Globe } from 'lucide-react'
import { toast } from 'sonner'

const FLOWER = (
  <svg viewBox="0 0 20 20" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <g fill="currentColor">
      {/* Petals */}
      <path d="M10 10C8.5 8.5 7.5 6.5 7.5 5C7.5 3.5 9 2 9.5 2C9.7 2 9.9 2.6 10 3C10.1 2.6 10.3 2 10.5 2C11 2 12.5 3.5 12.5 5C12.5 6.5 11.5 8.5 10 10Z" />
      <path d="M10 10C8.5 8.5 7.5 6.5 7.5 5C7.5 3.5 9 2 9.5 2C9.7 2 9.9 2.6 10 3C10.1 2.6 10.3 2 10.5 2C11 2 12.5 3.5 12.5 5C12.5 6.5 11.5 8.5 10 10Z" transform="rotate(72 10 10)" />
      <path d="M10 10C8.5 8.5 7.5 6.5 7.5 5C7.5 3.5 9 2 9.5 2C9.7 2 9.9 2.6 10 3C10.1 2.6 10.3 2 10.5 2C11 2 12.5 3.5 12.5 5C12.5 6.5 11.5 8.5 10 10Z" transform="rotate(144 10 10)" />
      <path d="M10 10C8.5 8.5 7.5 6.5 7.5 5C7.5 3.5 9 2 9.5 2C9.7 2 9.9 2.6 10 3C10.1 2.6 10.3 2 10.5 2C11 2 12.5 3.5 12.5 5C12.5 6.5 11.5 8.5 10 10Z" transform="rotate(216 10 10)" />
      <path d="M10 10C8.5 8.5 7.5 6.5 7.5 5C7.5 3.5 9 2 9.5 2C9.7 2 9.9 2.6 10 3C10.1 2.6 10.3 2 10.5 2C11 2 12.5 3.5 12.5 5C12.5 6.5 11.5 8.5 10 10Z" transform="rotate(288 10 10)" />
      
      {/* Center overlay circle */}
      <circle cx="10" cy="10" r="1.5" fill="white" opacity="0.35" />

      {/* Delicate stamens */}
      <g stroke="currentColor" strokeWidth="0.35" opacity="0.85">
        <line x1="10" y1="10" x2="10" y2="6.2" transform="rotate(36 10 10)" />
        <circle cx="10" cy="6.2" r="0.4" fill="currentColor" stroke="none" transform="rotate(36 10 10)" />
        
        <line x1="10" y1="10" x2="10" y2="6.2" transform="rotate(108 10 10)" />
        <circle cx="10" cy="6.2" r="0.4" fill="currentColor" stroke="none" transform="rotate(108 10 10)" />
        
        <line x1="10" y1="10" x2="10" y2="6.2" transform="rotate(180 10 10)" />
        <circle cx="10" cy="6.2" r="0.4" fill="currentColor" stroke="none" transform="rotate(180 10 10)" />
        
        <line x1="10" y1="10" x2="10" y2="6.2" transform="rotate(252 10 10)" />
        <circle cx="10" cy="6.2" r="0.4" fill="currentColor" stroke="none" transform="rotate(252 10 10)" />
        
        <line x1="10" y1="10" x2="10" y2="6.2" transform="rotate(324 10 10)" />
        <circle cx="10" cy="6.2" r="0.4" fill="currentColor" stroke="none" transform="rotate(324 10 10)" />
      </g>
    </g>
  </svg>
)

export default function HomePage() {
  const [url, setUrl] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [result, setResult] = useState<{ slug: string; target: string; shortUrl: string } | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [elevated, setElevated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const urlRef = useRef<HTMLInputElement>(null)
  const slugRef = useRef<HTMLInputElement>(null)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    fetch('/api/auth')
      .then(r => r.ok && setIsAdmin(true))
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!url) {
      setError('Enter a URL to shorten')
      urlRef.current?.focus()
      return
    }

    try {
      new URL(url.startsWith('http') ? url : `https://${url}`)
    } catch {
      setError('Enter a valid URL')
      return
    }

    setLoading(true)

    const target = url.startsWith('http') ? url : `https://${url}`
    const slug = customSlug.trim() || undefined

    try {
      const res = await fetch('/api/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, slug, elevated }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      setResult({
        slug: data.slug,
        target: data.target,
        shortUrl: `${origin}/${data.slug}`,
      })
      setUrl('')
      setCustomSlug('')
      toast.success('Short URL created')
    } catch {
      setError('Failed to create short URL')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!result) return
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(result.shortUrl).catch(() => {})
    }
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  function toggleElevated() {
    setElevated(p => !p)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <img src="/brand/logo.svg" alt="Mitsumi" className="h-48 mx-auto mb-3" />
            <p className="text-ink-muted text-sm">
              Fast, ephemeral URL shortening
            </p>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="card overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="p-5 pb-0">
                <label htmlFor="url" className="sr-only">
                  URL to shorten
                </label>
                
                {/* Seamless Input Container */}
                <div className="bg-white border border-paper-border rounded-xl shadow-sm overflow-hidden focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/80 transition-all duration-200 divide-y divide-paper-border/60">
                  
                  {/* Row 1: Target URL */}
                  <div className="relative flex items-center px-4 py-3 bg-white hover:bg-paper-bg/5 focus-within:bg-paper-bg/15 transition-all duration-150 group">
                    <div className="flex items-center gap-2 w-20 shrink-0 select-none">
                      <Link className="w-4 h-4 text-ink-muted group-focus-within:text-primary transition-colors" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted group-focus-within:text-primary transition-colors">URL</span>
                    </div>
                    <input
                      ref={urlRef}
                      id="url"
                      type="text"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="https://example.com/very/long/url"
                      className="w-full bg-transparent border-none outline-none text-ink placeholder:text-ink-light text-sm focus:ring-0 p-0"
                      autoFocus
                    />
                  </div>

                  {/* Row 2: Custom Slug */}
                  <div className="relative flex items-center px-4 py-3 bg-white hover:bg-paper-bg/5 focus-within:bg-paper-bg/15 transition-all duration-150 group">
                    <div className="flex items-center gap-2 w-20 shrink-0 select-none">
                      <Globe className="w-4 h-4 text-ink-muted group-focus-within:text-primary transition-colors" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted group-focus-within:text-primary transition-colors">Alias</span>
                    </div>
                    <div className="flex items-center w-full min-w-0">
                      <span className="text-sm font-mono text-ink-light select-none shrink-0 mr-0.5">
                        {origin ? origin.replace(/^https?:\/\//, '') : 'mitsumi.app'}/
                      </span>
                      <input
                        ref={slugRef}
                        id="slug"
                        type="text"
                        value={customSlug}
                        onChange={e => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                        onKeyDown={handleKeyDown}
                        placeholder="custom-slug-or-blank"
                        className="w-full bg-transparent border-none outline-none text-ink placeholder:text-ink-light font-mono text-sm focus:ring-0 p-0"
                        maxLength={32}
                      />
                    </div>
                    {isAdmin && (
                      <div className="flex items-center pl-2 shrink-0">
                        <motion.button
                          type="button"
                          onClick={toggleElevated}
                          className="flex items-center justify-center p-1 rounded text-ink-muted hover:text-primary transition-colors shrink-0"
                          animate={{ color: elevated ? '#D4784C' : '#7A746E' }}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                          title={elevated ? 'Permanent' : 'Ephemeral'}
                        >
                          <span className="w-5 h-5 block">{FLOWER}</span>
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dynamic Help Text & Info */}
                <div className="flex items-center justify-between mt-3 px-1 text-xs text-ink-muted select-none">
                  <div>
                    {elevated ? (
                      <span className="text-primary font-medium flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        Permanent link (no expiration)
                      </span>
                    ) : (
                      <span>
                        Expires after {process.env.NEXT_PUBLIC_URL_EXPIRY || 15} minutes
                      </span>
                    )}
                  </div>
                  {customSlug && (
                    <span className="font-mono text-[10px] text-ink-light">
                      Alias: /{customSlug}
                    </span>
                  )}
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -4 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -4 }}
                      className="overflow-hidden"
                    >
                      <div className="text-danger text-sm mt-3 flex items-center gap-1.5 px-1 font-medium">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-danger shrink-0 animate-ping" />
                        {error}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="px-5 pb-5 pt-4">
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="ink-btn-primary w-full py-2.5 text-sm font-medium shadow-sm"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      Shorten URL
                    </span>
                  )}
                </motion.button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="result"
              className="card overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center text-success mb-3">
                  <Check className="w-6 h-6 stroke-[3.5]" />
                </div>
                
                <h3 className="text-xl font-serif text-ink mb-1">Link Shortened!</h3>
                <p className="text-xs text-ink-muted truncate w-full max-w-[340px] px-1 mb-5">
                  Redirects to: <span className="font-mono text-ink-light break-all select-all">{result.target}</span>
                </p>

                {/* Main Short URL Copy Row */}
                <div className="w-full bg-paper-bg border border-paper-border rounded-xl p-3 flex items-center justify-between gap-3 mb-6 hover:border-primary/30 transition-all duration-200">
                  <span className="font-mono text-base text-primary font-medium truncate select-all pl-1">
                    {result.shortUrl.replace(/^https?:\/\//, '')}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-white border border-paper-border text-ink-muted hover:text-primary hover:border-primary/20 hover:shadow-sm active:scale-95 transition-all duration-150 shrink-0"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setResult(null)
                    setUrl('')
                    setCustomSlug('')
                    setTimeout(() => {
                      urlRef.current?.focus()
                    }, 100)
                  }}
                  className="ink-btn-secondary w-full py-2.5 text-sm font-medium shadow-sm"
                >
                  Shorten another link
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.p
        className="mt-12 text-xs text-ink-light"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        URLs expire after {process.env.NEXT_PUBLIC_URL_EXPIRY || 15} minutes
      </motion.p>
    </div>
  )
}
