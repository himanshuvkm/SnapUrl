'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/icons'

interface Link_ {
  id: string
  slug: string
  longUrl: string
  createdAt: string
  _count: { clicks: number }
}

export default function Dashboard() {
  const [links, setLinks] = useState<Link_[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    fetch('/api/url', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setLinks(d.links || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function handleCopy(slug: string) {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`)
    setCopied(slug)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleDelete(slug: string) {
    setDeleting(slug)
    const token = localStorage.getItem('token')
    await fetch(`/api/url/${slug}/delete`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setLinks(prev => prev.filter(l => l.slug !== slug))
    setDeleting(null)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    router.push('/')
  }

  const totalClicks = links.reduce((sum, l) => sum + l._count.clicks, 0)

  return (
    <div className="min-h-screen flex flex-col"  style={{ background: 'var(--background)' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
        <Link href="/" className="flex items-center gap-2 text-white font-semibold tracking-tight">
          <Icons.SnapLink className="w-6 h-6" />
          <span>SnapURL</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-md transition-colors"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            + New Link
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm font-mono px-3 py-1.5 rounded-md border transition-colors"
            style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1" style={{ letterSpacing: '-0.5px' }}>
            My Links
          </h1>
          <p className="text-sm font-mono" style={{ color: 'var(--muted)' }}>
            Manage and track your shortened URLs
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Links', value: links.length },
            { label: 'Total Clicks', value: totalClicks },
            { label: 'Avg. Clicks', value: links.length ? Math.round(totalClicks / links.length) : 0 },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border p-4"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>{label}</p>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Links list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-xl border animate-pulse"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }} />
            ))}
          </div>
        ) : links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-xl border"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <Icons.api className="w-8 h-8 mb-3" style={{ color: '#3f3f46' }} />
            <p className="text-sm font-mono mb-4" style={{ color: 'var(--muted)' }}>No links yet</p>
            <Link href="/"
              className="text-sm font-semibold px-4 py-2 rounded-md transition-colors"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              Shorten your first URL
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {links.map(link => {
              const shortUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${link.slug}`
              const date = new Date(link.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

              return (
                <div key={link.id}
                  className="rounded-xl border p-4 transition-colors"
                  style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#3f3f46'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--card-border)'}
                >
                  <div className="flex items-start justify-between gap-4">

                    {/* Left */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icons.api className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
                        <a href={shortUrl} target="_blank"
                          className="text-sm font-semibold hover:underline truncate"
                          style={{ color: 'var(--primary)' }}>
                          /{link.slug}
                        </a>
                      </div>
                      <p className="text-xs font-mono truncate mb-2" style={{ color: '#52525b' }}>
                        {link.longUrl}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs font-mono" style={{ color: 'var(--muted)' }}>
                          <Icons.activity className="w-3 h-3" />
                          {link._count.clicks} click{link._count.clicks !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs font-mono" style={{ color: '#3f3f46' }}>·</span>
                        <span className="text-xs font-mono" style={{ color: '#52525b' }}>{date}</span>
                      </div>
                    </div>

                    {/* Right — actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/dashboard/${link.slug}`}
                        className="text-xs font-mono px-3 py-1.5 rounded border transition-colors"
                        style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.color = 'var(--muted)' }}
                      >
                        analytics
                      </Link>
                      <button
                        onClick={() => handleCopy(link.slug)}
                        className="text-xs font-mono px-3 py-1.5 rounded border transition-colors"
                        style={{
                          borderColor: copied === link.slug ? 'var(--primary)' : 'var(--card-border)',
                          color: copied === link.slug ? 'var(--primary)' : 'var(--muted)',
                        }}
                      >
                        {copied === link.slug ? 'copied!' : 'copy'}
                      </button>
                      <button
                        onClick={() => handleDelete(link.slug)}
                        disabled={deleting === link.slug}
                        className="text-xs font-mono px-3 py-1.5 rounded border transition-colors disabled:opacity-40"
                        style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.color = '#f87171' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.color = 'var(--muted)' }}
                      >
                        {deleting === link.slug ? '...' : 'delete'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer */}
     <footer className="flex items-center justify-between px-6 py-4 border-t mt-auto" style={{ borderColor: 'var(--card-border)' }} > <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--muted)' }} > <Icons.checkShield className="w-3.5 h-3.5" /> AES-256 ENCRYPTION </div> <div className="flex gap-4 text-xs font-mono" style={{ color: 'var(--muted)' }} > <Link href="#" className="hover:text-white transition-colors" > Privacy </Link> <Link href="#" className="hover:text-white transition-colors" > Status </Link> </div> </footer>
    </div>
  )
}