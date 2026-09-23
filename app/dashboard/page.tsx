'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/icons'
import { QRModal } from '@/components/qr-modal'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useToast } from '@/components/toast'

interface LinkItem {
  id: string
  slug: string
  longUrl: string
  createdAt: string
  _count: { clicks: number }
}

export default function Dashboard() {
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'hightraffic'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'clicks'>('newest')

  // QR Modal state
  const [qrState, setQrState] = useState<{ isOpen: boolean; shortUrl: string; slug: string }>({
    isOpen: false,
    shortUrl: '',
    slug: '',
  })

  // Delete Confirm Modal state
  const [deleteState, setDeleteState] = useState<{ isOpen: boolean; slug: string | null; loading: boolean }>({
    isOpen: false,
    slug: null,
    loading: false,
  })

  // New Link Modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

  const router = useRouter()
  const { addToast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetch('/api/url', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (r.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return { links: [] }
        }
        return r.json()
      })
      .then(d => {
        setLinks(d.links || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  // Filter & Sort logic
  const filteredLinks = useMemo(() => {
    return links
      .filter(link => {
        const matchesSearch =
          link.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
          link.longUrl.toLowerCase().includes(searchQuery.toLowerCase())
        if (!matchesSearch) return false

        if (filterMode === 'active') return link._count.clicks > 0
        if (filterMode === 'hightraffic') return link._count.clicks >= 10
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'clicks') return b._count.clicks - a._count.clicks
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [links, searchQuery, filterMode, sortBy])

  const totalClicks = links.reduce((sum, l) => sum + l._count.clicks, 0)
  const topLink = useMemo(() => {
    if (links.length === 0) return null
    return [...links].sort((a, b) => b._count.clicks - a._count.clicks)[0]
  }, [links])

  function handleCopy(slug: string) {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const shortUrl = `${origin}/${slug}`
    navigator.clipboard.writeText(shortUrl)
    setCopiedSlug(slug)
    addToast('Link copied to clipboard', 'success')
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  function confirmDelete(slug: string) {
    setDeleteState({ isOpen: true, slug, loading: false })
  }

  async function handleDelete() {
    if (!deleteState.slug) return
    setDeleteState(prev => ({ ...prev, loading: true }))

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/url/${deleteState.slug}/delete`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        throw new Error('Failed to delete link')
      }

      setLinks(prev => prev.filter(l => l.slug !== deleteState.slug))
      addToast('Link deleted', 'success')
    } catch {
      addToast('Failed to delete link', 'error')
    } finally {
      setDeleteState({ isOpen: false, slug: null, loading: false })
    }
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault()
    setAddLoading(true)
    setAddError('')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const res = await fetch('/api/url/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ longUrl: newUrl, customSlug: newSlug || undefined }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to shorten URL')

      const newLink: LinkItem = {
        id: data.slug,
        slug: data.slug,
        longUrl: data.longUrl,
        createdAt: data.createdAt || new Date().toISOString(),
        _count: { clicks: 0 },
      }

      setLinks(prev => [newLink, ...prev])
      addToast('URL shortened successfully', 'success')
      setNewUrl('')
      setNewSlug('')
      setShowAddModal(false)
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'Failed to shorten URL')
    } finally {
      setAddLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    addToast('Logged out', 'info')
    router.push('/')
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#111111] bg-grid-pattern">

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-[#DCD8CF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-[#111111]">
            <div className="w-8 h-8 rounded-lg bg-[#111111] flex items-center justify-center text-white">
              <Icons.SnapLink className="w-4 h-4 text-indigo-400" />
            </div>
            <span>SnapURL</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setAddError(''); setShowAddModal(true) }}
              className="text-xs sm:text-sm font-semibold text-white bg-[#111111] hover:bg-[#222222] px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-[0_1px_0_rgba(17,17,17,0.04)]"
            >
              <Icons.plus className="w-4 h-4" />
              New Link
            </button>
            <button
              onClick={handleLogout}
              className="text-xs sm:text-sm font-medium text-[#71717A] hover:text-[#111111] px-3 py-1.5 rounded-lg border border-[#DCD8CF] bg-white hover:bg-[#F0EEE8] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="badge-mono mb-2 text-[10px]">
              [ DASHBOARD ]
            </div>
            <h1 className="text-3xl font-bold text-[#111111] mb-1">Links</h1>
            <p className="text-xs sm:text-sm text-[#71717A]">Manage and monitor your shortened URLs.</p>
          </div>
          
          {/* Action Row: Search & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial min-w-[200px]">
              <Icons.search className="w-4 h-4 text-[#71717A] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search links..."
                className="w-full bg-[#FFFFFF] border border-[#DCD8CF] focus:border-[#4F46E5] rounded-lg py-2 pl-9 pr-3 text-xs text-[#111111] placeholder-[#71717A] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[#71717A] hover:text-[#111111]"
                >
                  <Icons.x className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter chips */}
            <div className="flex items-center bg-[#FFFFFF] border border-[#DCD8CF] rounded-lg p-1 text-xs">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterMode === 'all' ? 'bg-[#F8F7F4] text-[#111111] font-semibold border border-[#DCD8CF]' : 'text-[#71717A] hover:text-[#111111]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('active')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterMode === 'active' ? 'bg-[#F8F7F4] text-[#111111] font-semibold border border-[#DCD8CF]' : 'text-[#71717A] hover:text-[#111111]'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterMode('hightraffic')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterMode === 'hightraffic' ? 'bg-[#F8F7F4] text-[#111111] font-semibold border border-[#DCD8CF]' : 'text-[#71717A] hover:text-[#111111]'
                }`}
              >
                High traffic
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'newest' | 'clicks')}
              className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-lg text-xs text-[#111111] px-3 py-2 focus:outline-none focus:border-[#4F46E5] cursor-pointer"
            >
              <option value="newest">Sort: Newest ↓</option>
              <option value="clicks">Sort: Most clicked</option>
            </select>
          </div>
        </div>

        {/* Metric Cards (Real stats derived safely) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-4 shadow-[0_1px_0_rgba(17,17,17,0.04)]">
            <span className="text-[11px] text-[#71717A] font-mono uppercase block mb-1">Total Links</span>
            <span className="text-2xl font-bold text-[#111111]">{links.length}</span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-4 shadow-[0_1px_0_rgba(17,17,17,0.04)]">
            <span className="text-[11px] text-[#71717A] font-mono uppercase block mb-1">Total Clicks</span>
            <span className="text-2xl font-bold text-[#111111]">{totalClicks}</span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-4 shadow-[0_1px_0_rgba(17,17,17,0.04)]">
            <span className="text-[11px] text-[#71717A] font-mono uppercase block mb-1">Avg. Clicks</span>
            <span className="text-2xl font-bold text-[#111111]">
              {links.length ? Math.round(totalClicks / links.length) : 0} <span className="text-xs font-normal text-[#71717A]">/ link</span>
            </span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-4 shadow-[0_1px_0_rgba(17,17,17,0.04)] min-w-0">
            <span className="text-[11px] text-[#71717A] font-mono uppercase block mb-1">Top Link</span>
            {topLink ? (
              <div>
                <span className="text-sm font-bold text-[#4F46E5] block truncate">/{topLink.slug}</span>
                <span className="text-xs text-[#71717A] font-mono">{topLink._count.clicks} clicks</span>
              </div>
            ) : (
              <span className="text-sm text-[#71717A]">—</span>
            )}
          </div>
        </div>

        {/* Links List */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredLinks.length === 0 ? (
          /* Empty State */
          <div className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-12 text-center flex flex-col items-center shadow-[0_1px_0_rgba(17,17,17,0.04)]">
            <div className="w-12 h-12 rounded-md bg-[#F8F7F4] border border-[#DCD8CF] flex items-center justify-center text-[#71717A] mb-4">
              <Icons.search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111111] mb-1">No links found</h3>
            <p className="text-xs text-[#71717A] mb-6 max-w-xs">
              {searchQuery ? 'Try another search term or reset your filter criteria.' : 'Create your first short link to start tracking clicks.'}
            </p>
            <button
              onClick={() => { setAddError(''); setShowAddModal(true) }}
              className="text-xs font-semibold text-white bg-[#111111] hover:bg-[#222222] px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-[0_1px_0_rgba(17,17,17,0.04)]"
            >
              <Icons.plus className="w-4 h-4" />
              Create Link
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredLinks.map(link => {
              const shortUrl = `${origin}/${link.slug}`
              const dateStr = new Date(link.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              const isCopied = copiedSlug === link.slug

              return (
                <div
                  key={link.id}
                  className="bg-[#FFFFFF] hover:bg-[#FAF9F5] border border-[#DCD8CF] hover:border-[#C9C4B8] rounded-xl p-4 transition-all shadow-[0_1px_0_rgba(17,17,17,0.04)]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Left details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icons.link className="w-4 h-4 text-[#4F46E5] shrink-0" />
                        <a
                          href={shortUrl}
                          target="_blank"
                          className="text-sm font-bold text-[#111111] hover:text-[#4F46E5] truncate transition-colors font-mono"
                        >
                          {origin ? `${window.location.host}/${link.slug}` : link.slug}
                        </a>
                      </div>
                      <p className="text-xs font-mono text-[#71717A] truncate mb-2">{link.longUrl}</p>

                      <div className="flex items-center gap-3 text-xs text-[#71717A]">
                        <span className="flex items-center gap-1 font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                          ◉ {link._count.clicks} click{link._count.clicks !== 1 ? 's' : ''}
                        </span>
                        <span>·</span>
                        <span>Created {dateStr}</span>
                      </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#DCD8CF]">
                      <button
                        onClick={() => handleCopy(link.slug)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                          isCopied
                            ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                            : 'border-[#DCD8CF] text-[#111111] bg-[#F8F7F4] hover:bg-[#F0EEE8]'
                        }`}
                      >
                        {isCopied ? <Icons.check className="w-3.5 h-3.5" /> : <Icons.copy className="w-3.5 h-3.5" />}
                        {isCopied ? 'Copied' : 'Copy'}
                      </button>

                      <Link
                        href={`/dashboard/${link.slug}`}
                        className="text-xs font-medium text-[#111111] bg-[#F8F7F4] hover:bg-[#F0EEE8] border border-[#DCD8CF] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Icons.barChart className="w-3.5 h-3.5 text-[#4F46E5]" />
                        Analytics
                      </Link>

                      <button
                        onClick={() => setQrState({ isOpen: true, shortUrl, slug: link.slug })}
                        className="text-xs font-medium text-[#111111] bg-[#F8F7F4] hover:bg-[#F0EEE8] border border-[#DCD8CF] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Icons.qrCode className="w-3.5 h-3.5 text-purple-600" />
                        QR
                      </button>

                      <button
                        onClick={() => confirmDelete(link.slug)}
                        className="text-xs font-medium text-[#71717A] hover:text-red-600 hover:border-red-300 bg-[#F8F7F4] border border-[#DCD8CF] px-2.5 py-1.5 rounded-lg transition-colors"
                        title="Delete link"
                      >
                        <Icons.trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* New Link Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
          onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false) }}
        >
          <div className="w-full max-w-md rounded-xl border border-[#DCD8CF] bg-[#FFFFFF] p-6 shadow-[0_16px_40px_rgba(17,17,17,0.16)] relative animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[#111111]">Create New Link</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#71717A] hover:text-[#111111]">
                <Icons.x className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLink} className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] font-mono text-[#71717A] block mb-1.5 uppercase font-medium">Destination URL</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  placeholder="https://example.com/long-page"
                  required
                  autoFocus
                  className="w-full bg-[#F8F7F4] border border-[#DCD8CF] rounded-lg py-2.5 px-3 text-sm text-[#111111] placeholder-[#71717A] focus:outline-none focus:border-[#4F46E5] transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#71717A] block mb-1.5 uppercase font-medium">
                  Custom Slug <span className="text-[#71717A] normal-case">(optional)</span>
                </label>
                <div className="flex items-center rounded-lg border border-[#DCD8CF] bg-[#F8F7F4] overflow-hidden">
                  <span className="px-3 py-2.5 text-xs font-mono text-[#71717A] border-r border-[#DCD8CF]">
                    {origin ? `${window.location.host}/` : 'snapurl.dev/'}
                  </span>
                  <input
                    type="text"
                    value={newSlug}
                    onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="my-link"
                    className="flex-1 bg-transparent px-3 py-2.5 text-xs font-mono text-[#111111] focus:outline-none"
                  />
                </div>
              </div>

              {addError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg">
                  {addError}
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 text-xs font-medium text-[#111111] bg-[#F8F7F4] hover:bg-[#F0EEE8] border border-[#DCD8CF] py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 text-xs font-semibold text-white bg-[#111111] hover:bg-[#222222] py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {addLoading ? 'Creating...' : 'Create Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <QRModal
        isOpen={qrState.isOpen}
        onClose={() => setQrState(prev => ({ ...prev, isOpen: false }))}
        shortUrl={qrState.shortUrl}
        slug={qrState.slug}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteState.isOpen}
        title="Delete this link?"
        description="This action cannot be undone. Redirects to this link will immediately stop working."
        confirmText="Delete"
        loading={deleteState.loading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteState({ isOpen: false, slug: null, loading: false })}
      />
    </div>
  )
}