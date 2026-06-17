'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Link, Ban, Gauge, Settings, LogOut, Menu, X,
  ExternalLink, Trash2, Plus, Search, ShieldAlert,
  Globe, Unlock, RefreshCw, Clock, Activity,
  Sparkles, ChevronLeft,
} from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Tab = 'urls' | 'bans' | 'ratelimits' | 'settings'

interface UrlEntry {
  slug: string
  target: string
  createdAt: number
  elevated: boolean
  visits: number
  ttl: number | null
}

interface BanEntry {
  type: 'slug' | 'domain'
  pattern: string
  reason: string
  createdAt: number
}

interface RateLimitEntry {
  ip: string
  count: number
  window: number
  ttl: number
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'urls', label: 'URLs', icon: Link },
  { id: 'bans', label: 'Bans', icon: Ban },
  { id: 'ratelimits', label: 'Rate Limits', icon: Gauge },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('urls')
  const [urls, setUrls] = useState<UrlEntry[]>([])
  const [bans, setBans] = useState<BanEntry[]>([])
  const [rateLimits, setRateLimits] = useState<RateLimitEntry[]>([])
  const [env, setEnv] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [mobileMenu, setMobileMenu] = useState(false)
  const router = useRouter()

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [urlsRes, bansRes, limitsRes, envRes] = await Promise.all([
        fetch('/api/urls'),
        fetch('/api/urls/bans'),
        fetch('/api/urls/ratelimits'),
        fetch('/api/urls/env'),
      ])

      if (urlsRes.status === 401) {
        router.push('/admin/login')
        return
      }

      if (urlsRes.ok) {
        const data = await urlsRes.json()
        setUrls(data.urls || [])
      }
      if (bansRes.ok) {
        const data = await bansRes.json()
        setBans(data.bans || [])
      }
      if (limitsRes.ok) {
        const data = await limitsRes.json()
        setRateLimits(data.ips || [])
      }
      if (envRes.ok) {
        const data = await envRes.json()
        setEnv(data.env || {})
      }
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-paper-border">
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="ink-btn-ghost p-2"
        >
          {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <img src="/brand/logo.svg" alt="Mitsumi" className="h-7" />
        <button onClick={handleLogout} className="ink-btn-ghost p-2">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:flex flex-col w-56 min-h-screen border-r border-paper-border bg-paper-card">
          <div className="p-5 border-b border-paper-border">
            <img src="/brand/logo.svg" alt="Mitsumi" className="h-48" />
            <p className="text-xs text-ink-muted mt-0.5">Admin dashboard</p>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  tab === t.id
                    ? 'bg-primary-light/30 text-primary font-medium'
                    : 'text-ink-muted hover:text-ink hover:bg-paper-bg'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-paper-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-muted hover:text-ink hover:bg-paper-bg transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Mobile nav overlay */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              className="fixed inset-0 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-ink/20" onClick={() => setMobileMenu(false)} />
              <motion.nav
                className="absolute left-0 top-0 bottom-0 w-56 bg-paper-card border-r border-paper-border p-3 pt-16"
                initial={{ x: -256 }}
                animate={{ x: 0 }}
                exit={{ x: -256 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {tabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTab(t.id); setMobileMenu(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all mb-1 ${
                      tab === t.id
                        ? 'bg-primary-light/30 text-primary font-medium'
                        : 'text-ink-muted hover:text-ink hover:bg-paper-bg'
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                    {t.label}
                  </button>
                ))}
                <hr className="my-3 border-paper-border" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-muted hover:text-ink hover:bg-paper-bg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {tab === 'urls' && (
                  <UrlsTab
                    urls={urls}
                    loading={loading}
                    onRefresh={fetchAll}
                  />
                )}
                {tab === 'bans' && (
                  <BansTab
                    bans={bans}
                    loading={loading}
                    onRefresh={fetchAll}
                  />
                )}
                {tab === 'ratelimits' && (
                  <RateLimitsTab
                    rateLimits={rateLimits}
                    env={env}
                    loading={loading}
                    onRefresh={fetchAll}
                  />
                )}
                {tab === 'settings' && (
                  <SettingsTab env={env} loading={loading} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}

function UrlsTab({
  urls,
  loading,
  onRefresh,
}: {
  urls: UrlEntry[]
  loading: boolean
  onRefresh: () => void
}) {
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newTarget, setNewTarget] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [creating, setCreating] = useState(false)

  const filtered = urls.filter(u =>
    u.slug.includes(search.toLowerCase()) ||
    u.target.toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: newTarget.startsWith('http') ? newTarget : `https://${newTarget}`,
          slug: newSlug || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to create URL')
        return
      }
      toast.success('Elevated URL created')
      setNewTarget('')
      setNewSlug('')
      setShowCreate(false)
      onRefresh()
    } catch {
      toast.error('Failed to create URL')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(slug: string) {
    try {
      const res = await fetch('/api/urls', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      if (!res.ok) {
        toast.error('Failed to delete URL')
        return
      }
      toast.success(`Deleted /${slug}`)
      onRefresh()
    } catch {
      toast.error('Failed to delete URL')
    }
  }

  const elevatedCount = urls.filter(u => u.elevated).length
  const expiredCount = urls.filter(u => !u.elevated && u.ttl === null).length
  const visitsTotal = urls.reduce((s, u) => s + u.visits, 0)

  if (loading) {
    return <StatsSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total URLs" value={urls.length} icon={Link} />
        <StatCard label="Elevated" value={elevatedCount} icon={ShieldAlert} />
        <StatCard label="Expired" value={expiredCount} icon={Clock} />
        <StatCard label="Visits" value={visitsTotal} icon={Activity} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search URLs..."
            className="ink-input pl-9"
          />
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="ink-btn-primary"
        >
          <Plus className="w-4 h-4" />
          New URL
        </button>
        <button
          onClick={onRefresh}
          className="ink-btn-secondary"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.form
            onSubmit={handleCreate}
            className="card p-4 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex gap-3 flex-col sm:flex-row">
              <div className="flex-1">
                <input
                  type="text"
                  value={newTarget}
                  onChange={e => setNewTarget(e.target.value)}
                  placeholder="https://example.com"
                  className="ink-input"
                  required
                />
              </div>
              <div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light text-sm font-mono">/</span>
                  <input
                    type="text"
                    value={newSlug}
                    onChange={e => setNewSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                    placeholder="custom-slug"
                    className="ink-input pl-7 font-mono text-sm"
                    maxLength={32}
                  />
                </div>
              </div>
              <motion.button
                type="submit"
                disabled={creating}
                className="ink-btn-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {creating ? 'Creating...' : 'Create'}
              </motion.button>
            </div>
            <p className="text-xs text-ink-muted">
              Elevated URLs are permanent. Leave slug empty for random.
            </p>
          </motion.form>
        )}
      </AnimatePresence>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Link}
          title={search ? 'No matching URLs' : 'No URLs yet'}
          description={search ? 'Try a different search term' : 'Create your first short URL'}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-paper-border text-ink-muted text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Slug</th>
                  <th className="text-left px-4 py-3 font-medium">Target</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Created</th>
                  <th className="text-center px-4 py-3 font-medium hidden md:table-cell">Visits</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-border">
                {filtered.map((entry, i) => (
                  <motion.tr
                    key={entry.slug}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-paper-bg/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <a
                        href={`/${entry.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-primary hover:text-primary-hover flex items-center gap-1"
                      >
                        /{entry.slug}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-4 py-3 text-ink-muted max-w-[200px] truncate">
                      {entry.target}
                    </td>
                    <td className="px-4 py-3 text-ink-muted text-xs hidden sm:table-cell">
                      {timeAgo(entry.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-xs hidden md:table-cell">
                      {entry.visits}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {entry.elevated ? (
                        <span className="ink-badge-elevated">Elevated</span>
                      ) : entry.ttl && entry.ttl < 300 ? (
                        <span className="ink-badge-expiring">Expiring</span>
                      ) : !entry.ttl ? (
                        <span className="ink-badge-expired">Expired</span>
                      ) : (
                        <span className="ink-badge bg-paper-border text-ink-muted">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(entry.slug)}
                        className="ink-btn-ghost p-1.5 text-ink-muted hover:text-danger"
                        title="Delete URL"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function BansTab({
  bans,
  loading,
  onRefresh,
}: {
  bans: BanEntry[]
  loading: boolean
  onRefresh: () => void
}) {
  const [type, setType] = useState<'slug' | 'domain'>('slug')
  const [pattern, setPattern] = useState('')
  const [reason, setReason] = useState('')
  const [adding, setAdding] = useState(false)

  const slugBans = bans.filter(b => b.type === 'slug')
  const domainBans = bans.filter(b => b.type === 'domain')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!pattern) return
    setAdding(true)
    try {
      const res = await fetch('/api/urls/bans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, pattern: pattern.toLowerCase(), reason }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to add ban')
        return
      }
      toast.success(`${type} "${pattern}" banned`)
      setPattern('')
      setReason('')
      onRefresh()
    } catch {
      toast.error('Failed to add ban')
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(type: string, pattern: string) {
    try {
      await fetch('/api/urls/bans', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, pattern }),
      })
      toast.success(`Unbanned ${pattern}`)
      onRefresh()
    } catch {
      toast.error('Failed to remove ban')
    }
  }

  if (loading) return <StatsSkeleton />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Slug Bans" value={slugBans.length} icon={Ban} />
        <StatCard label="Domain Bans" value={domainBans.length} icon={Globe} />
      </div>

      <form onSubmit={handleAdd} className="card p-4 space-y-3">
        <div className="flex gap-2">
          <select
            value={type}
            onChange={e => setType(e.target.value as 'slug' | 'domain')}
            className="ink-input w-28"
          >
            <option value="slug">Slug</option>
            <option value="domain">Domain</option>
          </select>
          <input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder={type === 'slug' ? 'spam-link*' : 'spam.com'}
            className="ink-input flex-1 font-mono text-sm"
            required
          />
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Reason (optional)"
            className="ink-input w-40 hidden sm:block"
          />
          <motion.button
            type="submit"
            disabled={adding}
            className="ink-btn-danger"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Ban className="w-4 h-4" />
            Ban
          </motion.button>
        </div>
        <p className="text-xs text-ink-muted">
          Slug bans: exact match or prefix with <code className="font-mono text-xs">*</code> wildcard.
          Domain bans: exact or subdomain match.
        </p>
      </form>

      {bans.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No bans"
          description="No slugs or domains are currently banned"
        />
      ) : (
        <div className="space-y-4">
          {slugBans.length > 0 && (
            <BanSection
              title="Banned Slugs"
              icon={Ban}
              items={slugBans}
              onRemove={handleRemove}
            />
          )}
          {domainBans.length > 0 && (
            <BanSection
              title="Banned Domains"
              icon={Globe}
              items={domainBans}
              onRemove={handleRemove}
            />
          )}
        </div>
      )}
    </div>
  )
}

function BanSection({
  title,
  icon: Icon,
  items,
  onRemove,
}: {
  title: string
  icon: any
  items: BanEntry[]
  onRemove: (type: string, pattern: string) => void
}) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-paper-border flex items-center gap-2 text-sm font-medium text-ink">
        <Icon className="w-4 h-4" />
        {title}
        <span className="text-ink-muted text-xs font-normal">({items.length})</span>
      </div>
      <div className="divide-y divide-paper-border">
        {items.map((ban, i) => (
          <motion.div
            key={ban.pattern}
            className="px-4 py-3 flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02 }}
          >
            <div>
              <code className="font-mono text-sm text-ink">{ban.pattern}</code>
              {ban.reason && (
                <span className="text-ink-muted text-xs ml-2">— {ban.reason}</span>
              )}
            </div>
            <button
              onClick={() => onRemove('slug', ban.pattern)}
              className="ink-btn-ghost p-1.5 text-ink-muted hover:text-danger"
              title="Remove ban"
            >
              <Unlock className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function RateLimitsTab({
  rateLimits,
  env,
  loading,
  onRefresh,
}: {
  rateLimits: RateLimitEntry[]
  env: Record<string, string>
  loading: boolean
  onRefresh: () => void
}) {
  async function handleUnblock(ip: string) {
    try {
      await fetch('/api/urls/ratelimits', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
      })
      toast.success(`Unblocked ${ip}`)
      onRefresh()
    } catch {
      toast.error('Failed to unblock')
    }
  }

  async function handleClearAll() {
    try {
      await fetch('/api/urls/ratelimits', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true }),
      })
      toast.success('All rate limits cleared')
      onRefresh()
    } catch {
      toast.error('Failed to clear rate limits')
    }
  }

  if (loading) return <StatsSkeleton />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Blocked IPs" value={rateLimits.length} icon={Gauge} />
        <StatCard label="Max/Window" value={`${env.MTS_RATE_LIMIT_MAX || '10'}/${env.MTS_RATE_LIMIT_WINDOW || '60'}s`} icon={Activity} />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          className="ink-btn-secondary"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
        {rateLimits.length > 0 && (
          <button
            onClick={handleClearAll}
            className="ink-btn-danger"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {rateLimits.length === 0 ? (
        <EmptyState
          icon={Gauge}
          title="No rate-limited IPs"
          description="All IPs are within their rate limits"
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-paper-border text-ink-muted text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">IP</th>
                  <th className="text-center px-4 py-3 font-medium">Requests</th>
                  <th className="text-center px-4 py-3 font-medium hidden sm:table-cell">Window</th>
                  <th className="text-center px-4 py-3 font-medium hidden sm:table-cell">TTL</th>
                  <th className="text-right px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-border">
                {rateLimits.map((entry, i) => (
                  <motion.tr
                    key={entry.ip}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-paper-bg/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-sm">{entry.ip}</td>
                    <td className="px-4 py-3 text-center font-mono text-sm">{entry.count}</td>
                    <td className="px-4 py-3 text-center text-ink-muted text-xs hidden sm:table-cell">
                      #{entry.window}
                    </td>
                    <td className="px-4 py-3 text-center text-ink-muted text-xs hidden sm:table-cell">
                      {entry.ttl > 60 ? `${Math.floor(entry.ttl / 60)}m` : `${entry.ttl}s`}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleUnblock(entry.ip)}
                        className="ink-btn-ghost p-1.5 text-ink-muted hover:text-success"
                        title="Unblock IP"
                      >
                        <Unlock className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingsTab({
  env,
  loading,
}: {
  env: Record<string, string>
  loading: boolean
}) {
  if (loading) return <StatsSkeleton />

  const envVars = [
    { key: 'MTS_ADMIN_UNAME', label: 'Admin Username', value: env.MTS_ADMIN_UNAME || '—' },
    { key: 'MTS_URL_EXPIRY', label: 'URL Expiry (minutes)', value: env.MTS_URL_EXPIRY || '15' },
    { key: 'MTS_RATE_LIMIT_MAX', label: 'Rate Limit Max', value: env.MTS_RATE_LIMIT_MAX || '10' },
    { key: 'MTS_RATE_LIMIT_WINDOW', label: 'Rate Limit Window (seconds)', value: env.MTS_RATE_LIMIT_WINDOW || '60' },
  ]

  return (
    <div className="space-y-6">
      <StatCard label="Environment" value="" icon={Settings} />

      <div className="card divide-y divide-paper-border">
        {envVars.map(v => (
          <div key={v.key} className="px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">{v.label}</p>
              <code className="text-xs text-ink-muted font-mono">{v.key}</code>
            </div>
            <code className="font-mono text-sm text-ink bg-paper-bg px-2 py-1 rounded">
              {v.key === 'MTS_ADMIN_PASS' ? '••••••••' : v.value || 'not set'}
            </code>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-medium text-ink mb-2">KV Connection</h3>
        <p className="text-xs text-ink-muted">
          {env.KV_URL ? 'Connected' : 'Not configured — see Vercel KV dashboard'}
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-ink-muted">
        <p>Environment variables are set in your Vercel project dashboard. Changes take effect on next deployment.</p>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: any }) {
  return (
    <motion.div
      className="card p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-paper-bg">
          <Icon className="w-4 h-4 text-ink-muted" />
        </div>
        <div>
          <p className="text-xs text-ink-muted">{label}</p>
          <motion.p
            className="text-lg font-semibold text-ink font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {value}
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card p-4">
            <div className="flex items-center gap-3">
              <div className="skeleton w-8 h-8 rounded-lg" />
              <div className="space-y-1.5">
                <div className="skeleton w-12 h-3 rounded" />
                <div className="skeleton w-16 h-5 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="skeleton w-full h-64 rounded-lg" />
    </div>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: any
  title: string
  description: string
}) {
  return (
    <motion.div
      className="card p-12 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Icon className="w-12 h-12 text-ink-light mx-auto mb-3" />
      </motion.div>
      <h3 className="font-serif text-lg text-ink mb-1">{title}</h3>
      <p className="text-sm text-ink-muted">{description}</p>
    </motion.div>
  )
}
