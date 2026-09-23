'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/icons'
import { QRModal } from '@/components/qr-modal'
import { useToast } from '@/components/toast'

export default function Home() {
  const [url, setUrl] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [showAlias, setShowAlias] = useState(false)
  const [result, setResult] = useState<{ shortUrl: string; slug: string; longUrl: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const router = useRouter()
  const { addToast } = useToast()

  async function handleShorten(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setError('')

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

      const res = await fetch('/api/url/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ longUrl: url, customSlug: customSlug || undefined }),
      })

      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401 && !token) {
          router.push('/login')
          return
        }
        throw new Error(data.error || 'Failed to shorten URL')
      }

      const generatedShortUrl = data.shortUrl || `${window.location.origin}/${data.slug}`
      setResult({
        shortUrl: generatedShortUrl,
        slug: data.slug,
        longUrl: url,
      })
      addToast('URL shortened successfully', 'success')
      setUrl('')
      setCustomSlug('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      addToast(err instanceof Error ? err.message : 'Something went wrong', 'error')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!result) return
    navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    addToast('Link copied to clipboard', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const faqItems = [
    {
      q: 'How fast are SnapURL redirects?',
      a: 'Link redirects are cached in-memory with sub-10ms response times globally before logging click analytics asynchronously.'
    },
    {
      q: 'Can I generate QR codes for any short link?',
      a: 'Yes! Every shortened URL instantly generates scannable vector SVG and high-res PNG QR codes accessible with one click.'
    },
    {
      q: 'Are custom alias slugs available?',
      a: 'Absolutely. You can specify a memorable custom slug (e.g. snapurl.dev/launch) when creating your link.'
    },
    {
      q: 'What analytics are tracked for each click?',
      a: 'SnapURL records real-time click volume, 7-day performance trends, and device breakdowns (Desktop, Mobile, Tablet).'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#111111] bg-grid-pattern">

      {/* 1. Navbar */}
      <header className="sticky top-0 z-40 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-[#DCD8CF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[70px] flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#111111] flex items-center justify-center text-white transition-transform group-hover:scale-105">
                <Icons.SnapLink className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="font-bold text-lg text-[#111111]">SnapURL</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#555555]">
              <a href="#features" className="hover:text-[#111111] transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-[#111111] transition-colors">How It Works</a>
              <a href="#faq" className="hover:text-[#111111] transition-colors">FAQ</a>
              <Link href="/dashboard" className="hover:text-[#111111] transition-colors">Dashboard</Link>
            </nav>
          </div>

          {/* Right section: System Status & Auth */}
          <div className="flex items-center gap-4">
            
            {/* Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-md border border-[#DCD8CF] bg-[#FFFFFF] text-[11px] font-mono text-[#555555]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ALL SYSTEMS OPERATIONAL</span>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-[#555555] hover:text-[#111111] px-3 py-1.5 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold text-white bg-[#111111] hover:bg-[#222222] px-4 py-2 rounded-lg transition-all shadow-[0_1px_0_rgba(17,17,17,0.04)]"
              >
                Get Started →
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[#555555] hover:text-[#111111] p-2"
              aria-label="Toggle menu"
            >
              <Icons.menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#DCD8CF] bg-[#FFFFFF] px-5 py-4 flex flex-col gap-3 text-sm animate-in fade-in duration-150">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-[#555555] hover:text-[#111111] py-1 font-medium">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-[#555555] hover:text-[#111111] py-1 font-medium">How It Works</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-[#555555] hover:text-[#111111] py-1 font-medium">FAQ</a>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-[#555555] hover:text-[#111111] py-1 font-medium">Dashboard</Link>
            <div className="flex items-center gap-3 pt-3 border-t border-[#DCD8CF]">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 text-sm text-[#111111] bg-[#F8F7F4] border border-[#DCD8CF] rounded-lg font-medium">Login</Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 text-sm text-white bg-[#111111] rounded-lg font-semibold">Get Started</Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">

        {/* 2. Hero Section (2-Column Editorial Desktop) */}
        <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column (~45%) */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              
              {/* Technical Monospace Badge */}
              <div className="badge-mono mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
                <span>FAST • SECURE • BUILT FOR EVERYONE</span>
              </div>

              {/* Main Editorial Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-bold text-[#111111] leading-[1.02] mb-6">
                Turn boring URLs into <br className="hidden sm:inline" />
                <span className="text-[#4F46E5]">something worth sharing.</span>
              </h1>

              {/* Paragraph Description */}
              <p className="text-lg sm:text-xl text-[#71717A] max-w-xl leading-relaxed mb-8">
                Shorten, customize, track, and share your links with SnapURL. <span className="text-[#111111] font-medium block mt-1">Clean links for a more open internet.</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <a
                  href="#shortener"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#111111] hover:bg-[#222222] px-6 py-3 rounded-lg transition-all shadow-[0_1px_0_rgba(17,17,17,0.04)]"
                >
                  Get started for free →
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#111111] bg-transparent border border-[#111111] hover:bg-[#111111]/5 px-5 py-3 rounded-lg transition-all"
                >
                  How it works →
                </a>
              </div>

              {/* Capabilities Bar */}
              <div className="pt-6 border-t border-[#DCD8CF] w-full flex flex-wrap items-center gap-6 text-xs text-[#555555] font-mono">
                <div className="flex items-center gap-1.5">
                  <Icons.zap className="w-3.5 h-3.5 text-[#4F46E5]" /> Fast redirects
                </div>
                <div className="flex items-center gap-1.5">
                  <Icons.activity className="w-3.5 h-3.5 text-emerald-600" /> Real-time analytics
                </div>
                <div className="flex items-center gap-1.5">
                  <Icons.link className="w-3.5 h-3.5 text-[#111111]" /> Custom slugs
                </div>
                <div className="flex items-center gap-1.5">
                  <Icons.qrCode className="w-3.5 h-3.5 text-purple-600" /> QR-ready
                </div>
              </div>
            </div>

            {/* Right Column (~55%): Interactive Shortener & Developer Terminal Showcase */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              
              {/* Shortener Card */}
              <div id="shortener" className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-5 sm:p-6 shadow-[0_1px_0_rgba(17,17,17,0.05)] hover:border-[#C9C4B8] transition-all relative">
                
                {/* Hand-drawn SVG annotation arrow */}
                <div className="hidden xl:block absolute -top-12 -left-12 text-[#71717A] pointer-events-none">
                  <Icons.annotationArrow className="w-16 h-12 text-[#71717A]" />
                  <span className="font-mono text-[10px] text-[#71717A] -mt-2 block pl-2">Try it live</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="badge-mono text-[10px]">
                    [ 01 / URL ENGINE ]
                  </span>
                  <span className="text-xs text-[#71717A] font-mono">Sub-10ms Redirects</span>
                </div>

                <form onSubmit={handleShorten} className="flex flex-col gap-3">
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-[#71717A] pointer-events-none">
                      <Icons.link className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      placeholder="Paste your long URL here..."
                      required
                      className="w-full bg-[#F8F7F4] border border-[#DCD8CF] rounded-lg py-3 pl-10 pr-28 text-sm text-[#111111] placeholder-[#71717A] focus:outline-none focus:border-[#4F46E5] transition-colors font-sans"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="absolute right-1.5 font-semibold text-xs sm:text-sm text-white bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 px-4 py-2 rounded-md transition-colors flex items-center gap-1.5"
                    >
                      {loading ? 'Shortening...' : 'Shorten →'}
                    </button>
                  </div>

                  {/* Custom alias toggle */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowAlias(!showAlias)}
                      className="text-[#71717A] hover:text-[#111111] flex items-center gap-1 font-mono transition-colors"
                    >
                      <Icons.chevronDown className={`w-3.5 h-3.5 transition-transform ${showAlias ? 'rotate-180' : ''}`} />
                      Custom alias <span className="text-[#555555] font-sans ml-1">(optional)</span>
                    </button>
                  </div>

                  {/* Custom Alias Drawer */}
                  {showAlias && (
                    <div className="flex items-center rounded-lg border border-[#DCD8CF] bg-[#F8F7F4] overflow-hidden mt-1 animate-in fade-in duration-150">
                      <span className="px-3 py-2 text-xs font-mono text-[#71717A] border-r border-[#DCD8CF]">
                        snapurl.dev/
                      </span>
                      <input
                        type="text"
                        value={customSlug}
                        onChange={e => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        placeholder="product-launch"
                        className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-[#111111] focus:outline-none"
                      />
                    </div>
                  )}

                  {error && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg">
                      {error}
                    </div>
                  )}
                </form>

                {/* Result Card Output */}
                {result && (
                  <div className="mt-4 pt-4 border-t border-[#DCD8CF] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <Icons.check className="w-3.5 h-3.5" /> Your link is ready
                      </span>
                    </div>
                    <div className="bg-[#F8F7F4] border border-[#DCD8CF] rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <a
                          href={result.shortUrl}
                          target="_blank"
                          className="text-sm font-semibold text-[#4F46E5] hover:underline truncate block font-mono"
                        >
                          {result.shortUrl}
                        </a>
                        <p className="text-xs font-mono text-[#71717A] truncate mt-0.5">{result.longUrl}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={handleCopy}
                          className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-colors flex items-center gap-1 ${
                            copied
                              ? 'border-emerald-500/50 text-emerald-700 bg-emerald-50'
                              : 'border-[#DCD8CF] text-[#111111] bg-white hover:bg-[#F0EEE8]'
                          }`}
                        >
                          {copied ? <Icons.check className="w-3.5 h-3.5" /> : <Icons.copy className="w-3.5 h-3.5" />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          onClick={() => setQrOpen(true)}
                          className="text-xs font-medium px-3 py-1.5 rounded-md border border-[#DCD8CF] text-[#111111] bg-white hover:bg-[#F0EEE8] transition-colors flex items-center gap-1"
                        >
                          <Icons.qrCode className="w-3.5 h-3.5 text-[#4F46E5]" />
                          QR
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dark Product Terminal Workbench Preview */}
              <div className="bg-[#111111] text-white border border-[#222222] rounded-xl p-5 shadow-[0_12px_32px_rgba(17,17,17,0.14)] overflow-hidden font-mono text-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                    <span className="ml-2 text-zinc-400">snapurl-sdk.js</span>
                  </div>
                  <span className="text-[#4F46E5] font-semibold">JS • LIVE ENGINE</span>
                </div>
                <div className="space-y-1.5 text-zinc-300">
                  <p className="text-zinc-500">// Shorten long URL with custom slug</p>
                  <p><span className="text-purple-400">await</span> snapurl.<span className="text-blue-400">shorten</span>({`{`}</p>
                  <p className="pl-4">url: <span className="text-emerald-400">&quot;https://example.com/long-product-launch&quot;</span>,</p>
                  <p className="pl-4">slug: <span className="text-emerald-400">&quot;launch&quot;</span></p>
                  <p>{`}`})</p>
                  <p className="text-zinc-500 pt-1">// → https://snapurl.dev/launch [Sub-10ms]</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. Feature Strip */}
        <section className="border-t border-b border-[#DCD8CF] bg-[#FFFFFF] py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-left">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
                  <Icons.zap className="w-3.5 h-3.5 text-[#4F46E5]" /> Fast redirects
                </span>
                <span className="text-[11px] text-[#71717A] mt-0.5">In-memory caching</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
                  <Icons.activity className="w-3.5 h-3.5 text-emerald-600" /> Real-time analytics
                </span>
                <span className="text-[11px] text-[#71717A] mt-0.5">Track every click</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
                  <Icons.qrCode className="w-3.5 h-3.5 text-purple-600" /> Vector QR codes
                </span>
                <span className="text-[11px] text-[#71717A] mt-0.5">SVG & PNG output</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
                  <Icons.link className="w-3.5 h-3.5 text-[#111111]" /> Custom slugs
                </span>
                <span className="text-[11px] text-[#71717A] mt-0.5">Branded aliases</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
                  <Icons.shield className="w-3.5 h-3.5 text-amber-600" /> Secure auth
                </span>
                <span className="text-[11px] text-[#71717A] mt-0.5">JWT token protection</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
                  <span className="text-[#4F46E5]">~/</span> Developer API
                </span>
                <span className="text-[11px] text-[#71717A] mt-0.5">RESTful endpoints</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Feature Grid Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="max-w-3xl mb-14">
            <div className="badge-mono mb-3">
              [ 02 / CAPABILITIES ]
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-[#111111] mb-3">
              Everything you need to make links better.
            </h2>
            <p className="text-base sm:text-lg text-[#71717A]">
              Simple on the surface. Powerful underneath.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 - Large card */}
            <div className="md:col-span-2 bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-8 hover:border-[#C9C4B8] transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 text-[#4F46E5] flex items-center justify-center mb-6">
                  <Icons.activity className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-[#111111] mb-2">High-speed redirect engine</h3>
                <p className="text-sm text-[#71717A] leading-relaxed max-w-lg">
                  Built for zero-delay navigation. SnapURL caches link routes in Redis for global sub-10ms response times before logging analytics asynchronously.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-[#DCD8CF] flex items-center justify-between text-xs font-mono text-[#71717A]">
                <span>ARCHITECTURE</span>
                <span className="text-[#4F46E5] font-bold">REDIS CACHING + NEXT.JS EDGE</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-7 hover:border-[#C9C4B8] transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-6">
                  <Icons.barChart className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#111111] mb-2">Click Analytics</h3>
                <p className="text-sm text-[#71717A] leading-relaxed">
                  Track total click counts, 7-day performance trends, and breakdown by devices (Desktop, Mobile, Tablet).
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#DCD8CF] text-xs font-mono text-[#71717A]">
                REAL-TIME TELEMETRY
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-7 hover:border-[#C9C4B8] transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mb-6">
                  <Icons.qrCode className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#111111] mb-2">Vector QR Codes</h3>
                <p className="text-sm text-[#71717A] leading-relaxed">
                  Instantly generate scannable vector SVG and high-res PNG QR codes for print, packaging, and offline sharing.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#DCD8CF] text-xs font-mono text-[#71717A]">
                SVG & PNG EXPORT
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-7 hover:border-[#C9C4B8] transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-6">
                  <Icons.link className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#111111] mb-2">Custom Slugs</h3>
                <p className="text-sm text-[#71717A] leading-relaxed">
                  Craft memorable branded short links like <code className="text-[#111111] font-mono">snapurl.dev/launch</code> instead of random characters.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#DCD8CF] text-xs font-mono text-[#71717A]">
                BRANDED ALIASES
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-7 hover:border-[#C9C4B8] transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-6">
                  <Icons.shield className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#111111] mb-2">Secure Link Management</h3>
                <p className="text-sm text-[#71717A] leading-relaxed">
                  Manage your short link catalog with JWT token security, password protection, and one-click deletion.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#DCD8CF] text-xs font-mono text-[#71717A]">
                SECURE STORAGE
              </div>
            </div>

          </div>
        </section>

        {/* 5. How It Works Pipeline */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DCD8CF]">
          <div className="max-w-3xl mb-14">
            <div className="badge-mono mb-3">
              [ 03 / PIPELINE ]
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-[#111111] mb-2">
              How SnapURL works
            </h2>
            <p className="text-base sm:text-lg text-[#71717A]">Three simple steps from long URL to actionable insights.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-8 relative">
              <span className="text-4xl font-bold text-[#111111] font-mono block mb-4">01</span>
              <h3 className="text-lg font-bold text-[#111111] uppercase mb-2">PASTE</h3>
              <p className="text-sm text-[#71717A] leading-relaxed">
                Paste your long destination URL into the SnapURL shortening input box.
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-8 relative">
              <span className="text-4xl font-bold text-[#4F46E5] font-mono block mb-4">02</span>
              <h3 className="text-lg font-bold text-[#111111] uppercase mb-2">CUSTOMIZE</h3>
              <p className="text-sm text-[#71717A] leading-relaxed">
                Choose a memorable custom slug alias or let SnapURL assign a clean unique string.
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-8 relative">
              <span className="text-4xl font-bold text-[#111111] font-mono block mb-4">03</span>
              <h3 className="text-lg font-bold text-[#111111] uppercase mb-2">TRACK</h3>
              <p className="text-sm text-[#71717A] leading-relaxed">
                Share your short link, download QR codes, and monitor click analytics in real-time.
              </p>
            </div>

          </div>
        </section>

        {/* 6. FAQ Accordion */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-[#DCD8CF]">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="badge-mono mb-3">
              [ 04 / FAQ ]
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-[#71717A]">Everything you need to know about link shortening with SnapURL.</p>
          </div>

          <div className="flex flex-col gap-3">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 text-base font-semibold text-[#111111] hover:text-[#4F46E5] transition-colors"
                >
                  <span>{item.q}</span>
                  <Icons.chevronDown
                    className={`w-4 h-4 text-[#71717A] shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-[#4F46E5]' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-sm text-[#71717A] leading-relaxed border-t border-[#DCD8CF] pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 7. CTA Banner */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-[#DCD8CF]">
          <div className="bg-[#111111] text-white rounded-xl p-10 sm:p-14 text-center flex flex-col items-center shadow-[0_16px_40px_rgba(17,17,17,0.16)]">
            <span className="text-xs font-mono text-indigo-400 uppercase mb-3">BUILD BETTER LINKS</span>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 max-w-xl">
              Ready to ship cleaner links?
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mb-8 max-w-md">
              Start shortening, customizing, and tracking your links in seconds with SnapURL.
            </p>
            <Link
              href="/signup"
              className="text-sm font-semibold text-[#111111] bg-white hover:bg-zinc-100 px-7 py-3.5 rounded-lg transition-all shadow-[0_1px_0_rgba(17,17,17,0.05)]"
            >
              Get Started for Free →
            </Link>
          </div>
        </section>

      </main>

      {/* 8. Footer */}
      <footer className="border-t border-[#DCD8CF] bg-[#FFFFFF] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2.5 text-[#111111] font-bold text-lg mb-2">
              <div className="w-7 h-7 rounded bg-[#111111] flex items-center justify-center text-white">
                <Icons.SnapLink className="w-4 h-4 text-indigo-400" />
              </div>
              <span>SnapURL</span>
            </div>
            <p className="text-xs text-[#71717A] max-w-xs leading-relaxed">
              Modern link shortening, custom slug aliases, vector QR code generation, and click analytics.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-10 text-xs">
            <div className="flex flex-col gap-2.5">
              <span className="font-mono text-[#111111] uppercase font-semibold">Product</span>
              <a href="#features" className="text-[#71717A] hover:text-[#111111] transition-colors">Features</a>
              <Link href="/dashboard" className="text-[#71717A] hover:text-[#111111] transition-colors">Dashboard</Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="font-mono text-[#111111] uppercase font-semibold">Resources</span>
              <a href="#how-it-works" className="text-[#71717A] hover:text-[#111111] transition-colors">How It Works</a>
              <a href="#faq" className="text-[#71717A] hover:text-[#111111] transition-colors">FAQ</a>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="font-mono text-[#111111] uppercase font-semibold">Account</span>
              <Link href="/login" className="text-[#71717A] hover:text-[#111111] transition-colors">Login</Link>
              <Link href="/signup" className="text-[#71717A] hover:text-[#111111] transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-[#DCD8CF] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A]">
          <span>© {new Date().getFullYear()} SnapURL. All rights reserved.</span>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      </footer>

      {/* QR Code Modal if triggered */}
      {result && (
        <QRModal
          isOpen={qrOpen}
          onClose={() => setQrOpen(false)}
          shortUrl={result.shortUrl}
          slug={result.slug}
        />
      )}
    </div>
  )
}
