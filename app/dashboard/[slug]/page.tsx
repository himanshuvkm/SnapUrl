'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/icons'
import { QRModal } from '@/components/qr-modal'
import { useToast } from '@/components/toast'

interface AnalyticsData {
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

  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [hoveredBar, setHoveredBar] = useState<{ day: string; clicks: number } | null>(null)

  const router = useRouter()
  const { addToast } = useToast()

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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F8F7F4]">
        <div className="flex flex-col items-center gap-3">
          <Icons.activity className="w-8 h-8 text-[#4F46E5] animate-spin" />
          <span className="text-xs font-mono text-[#71717A]">Loading link analytics...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F8F7F4]">
        <div className="border border-red-200 bg-red-50 text-red-700 p-4 rounded-xl max-w-md w-full text-center">
          <p className="text-sm font-medium">{error || 'Link analytics not found'}</p>
        </div>
        <Link
          href="/dashboard"
          className="mt-4 text-xs font-mono text-[#71717A] hover:text-[#111111] transition-colors flex items-center gap-1.5"
        >
          <Icons.arrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    )
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const shortUrl = `${origin}/${data.slug}`
  const maxClicks = Math.max(...data.last7Days.map(d => d.clicks), 1)

  // Calculate device breakdown percentages
  const totalDevices = (data.deviceBreakdown.desktop + data.deviceBreakdown.mobile + data.deviceBreakdown.tablet) || 1
  const desktopPct = Math.round((data.deviceBreakdown.desktop / totalDevices) * 100)
  const mobilePct = Math.round((data.deviceBreakdown.mobile / totalDevices) * 100)
  const tabletPct = Math.round((data.deviceBreakdown.tablet / totalDevices) * 100)

  function handleCopy() {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    addToast('Link copied to clipboard', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const createdDate = new Date(data.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#111111] bg-grid-pattern">
      
      {/* Nav Header */}
      <header className="sticky top-0 z-40 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-[#DCD8CF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xs sm:text-sm font-semibold text-[#71717A] hover:text-[#111111] flex items-center gap-1.5 transition-colors"
          >
            <Icons.arrowLeft className="w-4 h-4" />
            Links
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                copied
                  ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                  : 'border-[#DCD8CF] text-[#111111] bg-[#FFFFFF] hover:bg-[#F0EEE8]'
              }`}
            >
              {copied ? <Icons.check className="w-3.5 h-3.5" /> : <Icons.copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Link'}
            </button>
            <button
              onClick={() => setQrOpen(true)}
              className="text-xs font-medium text-[#111111] bg-[#FFFFFF] hover:bg-[#F0EEE8] border border-[#DCD8CF] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <Icons.qrCode className="w-3.5 h-3.5 text-purple-600" />
              QR Code
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-mono text-[10px]">
              /{data.slug}
            </span>
            <span className="text-xs text-[#71717A]">Created {createdDate}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] mb-3 font-mono">
            {origin ? `${window.location.host}/${data.slug}` : data.slug}
          </h1>

          <div className="flex items-center gap-2 text-xs font-mono text-[#555555] bg-[#FFFFFF] border border-[#DCD8CF] p-3 rounded-lg max-w-xl shadow-[0_1px_0_rgba(17,17,17,0.04)]">
            <Icons.externalLink className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
            <a href={data.longUrl} target="_blank" className="hover:underline truncate text-[#111111]">
              {data.longUrl}
            </a>
          </div>
        </div>

        {/* Overview Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-4 shadow-[0_1px_0_rgba(17,17,17,0.04)]">
            <span className="text-[11px] text-[#71717A] font-mono uppercase block mb-1">Total Clicks</span>
            <span className="text-2xl font-bold text-[#111111]">{data.totalClicks}</span>
          </div>
          <div className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-4 shadow-[0_1px_0_rgba(17,17,17,0.04)]">
            <span className="text-[11px] text-[#71717A] font-mono uppercase block mb-1">Desktop Share</span>
            <span className="text-2xl font-bold text-[#111111]">{desktopPct}%</span>
          </div>
          <div className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-4 shadow-[0_1px_0_rgba(17,17,17,0.04)]">
            <span className="text-[11px] text-[#71717A] font-mono uppercase block mb-1">Mobile Share</span>
            <span className="text-2xl font-bold text-[#111111]">{mobilePct}%</span>
          </div>
          <div className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-4 shadow-[0_1px_0_rgba(17,17,17,0.04)]">
            <span className="text-[11px] text-[#71717A] font-mono uppercase block mb-1">Tablet Share</span>
            <span className="text-2xl font-bold text-[#111111]">{tabletPct}%</span>
          </div>
        </div>

        {/* Click Trend Chart */}
        <div className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-6 mb-8 shadow-[0_1px_0_rgba(17,17,17,0.04)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-base font-bold text-[#111111]">Click Trend</h3>
              <p className="text-xs text-[#71717A]">Click activity across the last 7 days</p>
            </div>
            {hoveredBar && (
              <div className="text-xs font-mono text-[#4F46E5] bg-indigo-50 px-3 py-1 rounded-md border border-indigo-200">
                {hoveredBar.day}: {hoveredBar.clicks} clicks
              </div>
            )}
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-[#DCD8CF] relative">
            {data.last7Days.map((day, idx) => {
              const heightPct = Math.max((day.clicks / maxClicks) * 100, 5)
              const dateObj = new Date(day.date)
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
              const fullDayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' })

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredBar({ day: fullDayName, clicks: day.clicks })}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div className="w-full max-w-[48px] flex flex-col items-center justify-end h-full relative">
                    <div
                      className="w-full bg-[#4F46E5] group-hover:bg-[#4338CA] rounded-t transition-all duration-300 relative"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-[#71717A] group-hover:text-[#111111] transition-colors">
                    {dayName}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-6 shadow-[0_1px_0_rgba(17,17,17,0.04)]">
          <h3 className="text-base font-bold text-[#111111] mb-6">Device Breakdown</h3>

          <div className="flex flex-col gap-5">
            {/* Desktop */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="flex items-center gap-2 text-[#111111] font-semibold">
                  <Icons.monitor className="w-4 h-4 text-blue-600" /> Desktop
                </span>
                <span className="font-mono text-[#71717A]">{desktopPct}% ({data.deviceBreakdown.desktop})</span>
              </div>
              <div className="w-full bg-[#F8F7F4] rounded-sm h-2.5 overflow-hidden border border-[#DCD8CF]">
                <div
                  className="bg-blue-600 h-full rounded-sm transition-all duration-500"
                  style={{ width: `${desktopPct}%` }}
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="flex items-center gap-2 text-[#111111] font-semibold">
                  <Icons.smartphone className="w-4 h-4 text-emerald-600" /> Mobile
                </span>
                <span className="font-mono text-[#71717A]">{mobilePct}% ({data.deviceBreakdown.mobile})</span>
              </div>
              <div className="w-full bg-[#F8F7F4] rounded-sm h-2.5 overflow-hidden border border-[#DCD8CF]">
                <div
                  className="bg-emerald-600 h-full rounded-sm transition-all duration-500"
                  style={{ width: `${mobilePct}%` }}
                />
              </div>
            </div>

            {/* Tablet */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="flex items-center gap-2 text-[#111111] font-semibold">
                  <Icons.tablet className="w-4 h-4 text-purple-600" /> Tablet
                </span>
                <span className="font-mono text-[#71717A]">{tabletPct}% ({data.deviceBreakdown.tablet})</span>
              </div>
              <div className="w-full bg-[#F8F7F4] rounded-sm h-2.5 overflow-hidden border border-[#DCD8CF]">
                <div
                  className="bg-purple-600 h-full rounded-sm transition-all duration-500"
                  style={{ width: `${tabletPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* QR Modal */}
      <QRModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        shortUrl={shortUrl}
        slug={data.slug}
      />
    </div>
  )
}
