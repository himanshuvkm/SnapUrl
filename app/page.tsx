'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/icons'

export default function Home() {
  const [url, setUrl] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [result, setResult] = useState<{ shortUrl: string; slug: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  async function handleShorten(e: React.FormEvent) {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/url/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ longUrl: url, customSlug: customSlug || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setResult(data)
      setUrl('')
      setCustomSlug('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!result) return
    navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center gap-2 text-white font-semibold tracking-tight">
          <Icons.SnapLink className="w-6 h-6" />
          <span>SnapURL</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard"
            className="text-sm font-mono px-3 py-1.5 rounded-md transition-colors"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            Dashboard
          </Link>
          <Link href="/login"
            className="text-sm font-semibold px-4 py-1.5 rounded-md transition-colors"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">

        {/* Badge */}
        <div className="flex items-center gap-2 mb-6 px-3 py-1 rounded-full border text-xs font-mono"
          style={{ borderColor: 'var(--card-border)', color: 'var(--muted)', background: 'var(--card-bg)' }}>
          <Icons.activity className="w-3 h-3" style={{ color: 'var(--primary)' }} />
          <span>Redis-cached · Sub-10ms redirects · Analytics</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white text-center tracking-tight mb-4" style={{ letterSpacing: '-1.5px' }}>
          Shorten. Track.<br />
          <span style={{ color: 'var(--primary)' }}>Understand.</span>
        </h1>
        <p className="text-center text-sm font-mono mb-10 max-w-md" style={{ color: 'var(--muted)' }}>
          Enterprise-grade URL shortener with real-time click analytics,
          device breakdown, and Redis-powered redirects.
        </p>

        {/* Card */}
        <div className="w-full max-w-lg rounded-xl border p-6 shadow-2xl"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>

          <form onSubmit={handleShorten} className="flex flex-col gap-4">

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
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://your-long-url.com/with/a/very/long/path"
                  required
                  className="w-full text-sm rounded-md py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 transition-colors"
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'white',
                    // @ts-ignore
                    '--tw-ring-color': 'var(--primary)',
                  }}
                />
              </div>
            </div>

            {/* Custom Slug */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                Custom Slug <span className="normal-case" style={{ color: '#3f3f46' }}>(optional)</span>
              </label>
              <div className="flex items-center rounded-md border overflow-hidden"
                style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)' }}>
                <span className="px-3 py-2.5 text-sm border-r font-mono" style={{ color: '#3f3f46', borderColor: 'var(--input-border)' }}>
                  snapurl.dev/
                </span>
                <input
                  type="text"
                  value={customSlug}
                  onChange={e => setCustomSlug(e.target.value)}
                  placeholder="my-link"
                  className="flex-1 bg-transparent text-sm py-2.5 px-3 focus:outline-none"
                  style={{ color: 'white' }}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm p-3 rounded-md border"
                style={{ background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.2)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {loading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className="mt-4 p-4 rounded-lg border" style={{ background: '#0d1117', borderColor: 'var(--card-border)' }}>
              <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
                Your short URL
              </p>
              <div className="flex items-center justify-between gap-3">
                <a href={result.shortUrl} target="_blank"
                  className="text-sm font-semibold truncate hover:underline"
                  style={{ color: 'var(--primary)' }}>
                  {result.shortUrl}
                </a>
                <button
                  onClick={handleCopy}
                  className="shrink-0 text-xs font-mono px-3 py-1.5 rounded border transition-colors"
                  style={{
                    borderColor: copied ? 'var(--primary)' : 'var(--card-border)',
                    color: copied ? 'var(--primary)' : 'var(--muted)',
                  }}
                >
                  {copied ? 'copied!' : 'copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-8 mt-12">
          {[
            { icon: <Icons.activity className="w-4 h-4" />, label: 'Real-time analytics' },
            { icon: <Icons.checkShield className="w-4 h-4" />, label: 'JWT secured' },
            { icon: <Icons.api className="w-4 h-4" />, label: 'Redis cached' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--muted)' }}>
              <span style={{ color: 'var(--primary)' }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--muted)' }}>
          <Icons.checkShield className="w-3.5 h-3.5" />
          AES-256 ENCRYPTION
        </div>
        <div className="flex gap-4 text-xs font-mono" style={{ color: 'var(--muted)' }}>
          <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-white transition-colors">Status</Link>
        </div>
      </footer>
    </div>
  )
}