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
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // New Link modal state
  const [showModal, setShowModal] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    fetch('/api/url', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setLinks(d.links || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [router])

  function handleCopy(slug: string) {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`)
    setCopied(slug)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleDelete(slug: string) {
    setDeleting(slug)
    setDeleteError(null)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/url/${slug}/delete`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.status === 401) {
        // Token expired or invalid — log out
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        router.push('/login')
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setDeleteError(data.error || 'Failed to delete link')
        return
      }

      setLinks(prev => prev.filter(l => l.slug !== slug))
    } catch {
      setDeleteError('Network error. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault()
    setAddLoading(true)
    setAddError('')

    try {
      const token = localStorage.getItem('token')
      if (!token) { router.push('/login'); return }

      const res = await fetch('/api/url/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ longUrl: newUrl, customSlug: newSlug || undefined }),
      })

      if (res.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        router.push('/login')
        return
      }

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      // Prepend the new link to the list
      const newLink: Link_ = {
        id: data.slug,           // use slug as temp id until page refresh
        slug: data.slug,
        longUrl: data.longUrl,
        createdAt: data.createdAt,
        _count: { clicks: 0 },
      }
      setLinks(prev => [newLink, ...prev])

      // Reset and close modal
      setNewUrl('')
      setNewSlug('')
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'Failed to shorten URL')
    } finally {
      setAddLoading(false)
    }
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
      <nav className="flex items-center justify-between px-6 py-5 border-b border-[var(--card-border)] bg-black">
        <Link href="/" className="flex items-center gap-3 text-white">
          <Icons.SnapLink className="w-6 h-6" />
          <span className="font-mono font-bold text-lg tracking-widest uppercase">SnapURL</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setAddError(''); setShowModal(true) }}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-none transition-colors"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            + New Link
          </button>
          <button
            onClick={handleLogout}
            className="text-sm font-mono px-3 py-1.5 rounded-none border transition-colors"
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
            <div key={label} className="rounded-none border p-4"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>{label}</p>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Delete error banner */}
        {deleteError && (
          <div className="mb-4 text-red-400 text-sm p-3 rounded-none border"
            style={{ background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.2)' }}>
            {deleteError}
            <button className="ml-3 opacity-60 hover:opacity-100" onClick={() => setDeleteError(null)}>✕</button>
          </div>
        )}

        {/* Links list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-none border animate-pulse"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }} />
            ))}
          </div>
        ) : links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-none border"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <Icons.api className="w-8 h-8 mb-3" style={{ color: '#3f3f46' }} />
            <p className="text-sm font-mono mb-4" style={{ color: 'var(--muted)' }}>No links yet</p>
            <button
              onClick={() => { setAddError(''); setShowModal(true) }}
              className="text-sm font-semibold px-4 py-2 rounded-none transition-colors"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              Shorten your first URL
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {links.map(link => {
              const shortUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${link.slug}`
              const date = new Date(link.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

              return (
                <div key={link.id}
                  className="rounded-none border p-4 transition-colors"
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
                        className="text-xs font-mono px-3 py-1.5 rounded-none border transition-colors"
                        style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.color = 'var(--muted)' }}
                      >
                        analytics
                      </Link>
                      <button
                        onClick={() => handleCopy(link.slug)}
                        className="text-xs font-mono px-3 py-1.5 rounded-none border transition-colors"
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
                        className="text-xs font-mono px-3 py-1.5 rounded-none border transition-colors disabled:opacity-40"
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
     <footer className="flex items-center justify-between px-6 py-6 border-t border-[var(--card-border)] bg-black mt-auto">
       <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
         <Icons.checkShield className="w-4 h-4" />
         <span>AES-256 ENCRYPTION</span>
       </div>
       <div className="flex gap-6 text-xs font-mono text-zinc-500 uppercase tracking-widest">
         <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
         <Link href="#" className="hover:text-white transition-colors">Status</Link>
       </div>
     </footer>

      {/* New Link Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div
            className="w-full max-w-md rounded-none border p-6"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-mono uppercase tracking-widest text-white">New Link</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-xs font-mono px-2 py-1"
                style={{ color: 'var(--muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLink} className="flex flex-col gap-4">
              {/* Long URL */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                  Destination URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: '#3f3f46' }}>
                    <Icons.api className="h-4 w-4" />
                  </div>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    placeholder="https://your-long-url.com/..."
                    required
                    autoFocus
                    className="w-full text-sm rounded-none py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 transition-colors"
                    style={{
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      color: 'white',
                    }}
                  />
                </div>
              </div>

              {/* Custom Slug */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                  Custom Slug <span className="normal-case" style={{ color: '#3f3f46' }}>(optional)</span>
                </label>
                <div className="flex items-center rounded-none border overflow-hidden"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)' }}>
                  <span className="px-3 py-2.5 text-sm border-r font-mono" style={{ color: '#3f3f46', borderColor: 'var(--input-border)' }}>
                    {typeof window !== 'undefined' ? window.location.host : ''}/
                  </span>
                  <input
                    type="text"
                    value={newSlug}
                    onChange={e => setNewSlug(e.target.value)}
                    placeholder="my-link"
                    className="flex-1 bg-transparent text-sm py-2.5 px-3 focus:outline-none"
                    style={{ color: 'white' }}
                  />
                </div>
              </div>

              {addError && (
                <div className="text-red-400 text-sm p-3 rounded-none border"
                  style={{ background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.2)' }}>
                  {addError}
                </div>
              )}

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 text-sm font-mono py-2.5 rounded-none border transition-colors"
                  style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 font-semibold py-2.5 rounded-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  {addLoading ? 'Shortening...' : 'Shorten URL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}