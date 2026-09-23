'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/icons'
import { useToast } from '@/components/toast'

export default function LoginPage() {
  const router = useRouter()
  const { addToast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in')
      }

      localStorage.setItem('token', data.token)
      addToast('Signed in successfully', 'success')
      router.push('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F8F7F4] text-[#111111] bg-grid-pattern">
      
      {/* Container */}
      <div className="w-full max-w-sm flex flex-col items-center">
        
        {/* Logo Header */}
        <Link href="/" className="flex items-center gap-2.5 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-[#111111] flex items-center justify-center text-white transition-transform group-hover:scale-105">
            <Icons.SnapLink className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="font-bold text-xl text-[#111111]">SnapURL</span>
        </Link>

        {/* Technical Monospace Tag */}
        <div className="badge-mono mb-4 text-[10px]">
          [ AUTHENTICATION ]
        </div>

        {/* Form Card */}
        <div className="w-full bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-6 sm:p-8 shadow-[0_1px_0_rgba(17,17,17,0.05)]">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#111111] mb-1">Welcome back</h1>
            <p className="text-xs text-[#71717A]">Sign in to manage your link dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <div>
              <label className="text-[11px] font-mono text-[#71717A] block mb-1.5 uppercase font-medium">Work Email</label>
              <div className="relative">
                <Icons.mail className="w-4 h-4 text-[#71717A] absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-[#F8F7F4] border border-[#DCD8CF] rounded-lg py-2.5 pl-10 pr-3 text-sm text-[#111111] placeholder-[#71717A] focus:outline-none focus:border-[#4F46E5] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-mono text-[#71717A] uppercase font-medium">Password</label>
                <a href="#" className="text-xs text-[#4F46E5] hover:underline font-medium">Forgot?</a>
              </div>
              <div className="relative">
                <Icons.lock className="w-4 h-4 text-[#71717A] absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#F8F7F4] border border-[#DCD8CF] rounded-lg py-2.5 pl-10 pr-10 text-sm text-[#111111] placeholder-[#71717A] focus:outline-none focus:border-[#4F46E5] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#71717A] hover:text-[#111111] transition-colors"
                >
                  {showPassword ? <Icons.eyeOff className="w-4 h-4" /> : <Icons.eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-sm font-semibold text-white bg-[#111111] hover:bg-[#222222] py-2.5 rounded-lg transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#DCD8CF]" />
            </div>
            <span className="relative bg-[#FFFFFF] px-3 text-xs text-[#71717A] font-mono">or</span>
          </div>

          {/* Social Sign-in */}
          <button
            type="button"
            onClick={() => addToast('Google OAuth placeholder', 'info')}
            className="w-full bg-[#F8F7F4] hover:bg-[#F0EEE8] border border-[#DCD8CF] text-xs font-semibold text-[#111111] py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google
          </button>

          <div className="mt-6 text-center text-xs text-[#71717A]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#111111] font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-8 text-center text-[11px] text-[#71717A] font-mono">
          <span>Protected by token authentication</span>
        </div>
      </div>
    </div>
  )
}