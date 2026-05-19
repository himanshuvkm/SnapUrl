'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/icons'
import { use } from 'react'

interface Analytics {
  slug: string
  longUrl: string
  totalClicks: number
  deviceBreakdown: { desktop: number; mobile: number; tablet: number }
  last7Days: { date: string; clicks: number }[]
  createdAt: string
}

export default function AnalyticsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const slug = resolvedParams.slug
  
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetch(`/api/url/${slug}/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json().then(d => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || 'Failed to load analytics')
        setData(data)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug, router])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Icons.activity className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="border border-red-500/20 bg-red-500/10 text-red-500 p-4 rounded-none max-w-md w-full">
          <p className="font-mono text-sm">{error || 'Something went wrong'}</p>
        </div>
        <Link href="/dashboard" className="mt-4 text-sm font-mono text-zinc-400 hover:text-white transition-colors">
          &larr; Back to Dashboard
        </Link>
      </div>
    )
  }

  const shortUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${data.slug}`
  const maxClicks = Math.max(...data.last7Days.map(d => d.clicks), 1)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-[var(--card-border)] bg-black">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
            <Icons.arrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3 text-white">
            <Icons.SnapLink className="w-6 h-6" />
            <span className="font-mono font-bold text-lg tracking-widest uppercase">SnapURL</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm font-mono px-3 py-1.5 rounded-none border transition-colors"
            style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}
          >
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm font-mono text-[var(--muted)] mb-2">
            <Icons.api className="w-4 h-4 text-[var(--primary)]" />
            <a href={shortUrl} target="_blank" className="hover:underline text-[var(--primary)] font-semibold truncate">
              {shortUrl}
            </a>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2 truncate">
            {data.longUrl}
          </h1>
          <p className="text-xs font-mono text-zinc-500">
            Created on {new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 border bg-[var(--card-bg)] rounded-none" style={{ borderColor: 'var(--card-border)' }}>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Total Clicks</p>
            <p className="text-4xl font-bold text-white">{data.totalClicks}</p>
          </div>
          <div className="p-6 border bg-[var(--card-bg)] rounded-none md:col-span-2" style={{ borderColor: 'var(--card-border)' }}>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Device Breakdown</p>
            <div className="flex gap-8">
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-sm text-zinc-300"><Icons.monitor className="w-4 h-4 text-blue-400"/> Desktop</span>
                <span className="text-xl font-bold text-white">{data.deviceBreakdown.desktop}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-sm text-zinc-300"><Icons.smartphone className="w-4 h-4 text-green-400"/> Mobile</span>
                <span className="text-xl font-bold text-white">{data.deviceBreakdown.mobile}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-sm text-zinc-300"><Icons.tablet className="w-4 h-4 text-purple-400"/> Tablet</span>
                <span className="text-xl font-bold text-white">{data.deviceBreakdown.tablet}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="border bg-[var(--card-bg)] rounded-none p-6" style={{ borderColor: 'var(--card-border)' }}>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-8">Clicks (Last 7 Days)</p>
          
          <div className="h-48 flex items-end justify-between gap-2">
            {data.last7Days.map((day, i) => {
              const heightPct = (day.clicks / maxClicks) * 100
              const dateLabel = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="relative w-full flex justify-center items-end h-full">
                    {/* Tooltip */}
                    <div className="absolute -top-8 bg-[var(--card-border)] text-white text-xs font-mono px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {day.clicks} clicks
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-full max-w-[40px] bg-[var(--primary)] transition-all duration-500 hover:bg-[var(--primary-hover)]"
                      style={{ height: `${heightPct}%`, minHeight: day.clicks > 0 ? '4px' : '1px' }}
                    />
                  </div>
                  <span className="text-xs font-mono text-zinc-500">{dateLabel}</span>
                </div>
              )
            })}
          </div>
        </div>

      </main>
    </div>
  )
}
