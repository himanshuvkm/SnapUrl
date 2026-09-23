'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/icons'
import { useToast } from '@/components/toast'

export default function SignupPage() {
  const router = useRouter()
  const { addToast } = useToast()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      const errStr = 'Passwords do not match'
      setError(errStr)
      addToast(errStr, 'error')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      localStorage.setItem('token', data.token)
      addToast('Account created successfully', 'success')
      router.push('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create account'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F8F7F4] text-[#111111] bg-grid-pattern">
      
      <div className="w-full max-w-sm flex flex-col items-center">
        
        {/* Header */}
        <Link href="/" className="flex items-center gap-2.5 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-[#111111] flex items-center justify-center text-white transition-transform group-hover:scale-105">
            <Icons.SnapLink className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="font-bold text-xl text-[#111111]">SnapURL</span>
        </Link>

        {/* Technical Badge */}
        <div className="badge-mono mb-4 text-[10px]">
          [ NEW ACCOUNT ]
        </div>

        {/* Form Card */}
        <div className="w-full bg-[#FFFFFF] border border-[#DCD8CF] rounded-xl p-6 sm:p-8 shadow-[0_1px_0_rgba(17,17,17,0.05)]">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#111111] mb-1">Create an account</h1>
            <p className="text-xs text-[#71717A]">Start shortening & tracking links today.</p>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <div>
              <label className="text-[11px] font-mono text-[#71717A] block mb-1.5 uppercase font-medium">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Alex Rivera"
                required
                className="w-full bg-[#F8F7F4] border border-[#DCD8CF] rounded-lg py-2.5 px-3 text-sm text-[#111111] placeholder-[#71717A] focus:outline-none focus:border-[#4F46E5] transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#71717A] block mb-1.5 uppercase font-medium">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full bg-[#F8F7F4] border border-[#DCD8CF] rounded-lg py-2.5 px-3 text-sm text-[#111111] placeholder-[#71717A] focus:outline-none focus:border-[#4F46E5] transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-[#71717A] block mb-1.5 uppercase font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#F8F7F4] border border-[#DCD8CF] rounded-lg py-2.5 px-3 text-sm text-[#111111] placeholder-[#71717A] focus:outline-none focus:border-[#4F46E5] transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-[#71717A] block mb-1.5 uppercase font-medium">Confirm</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#F8F7F4] border border-[#DCD8CF] rounded-lg py-2.5 px-3 text-sm text-[#111111] placeholder-[#71717A] focus:outline-none focus:border-[#4F46E5] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-sm font-semibold text-white bg-[#111111] hover:bg-[#222222] py-2.5 rounded-lg transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign up →'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#71717A]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#111111] font-semibold hover:underline">
              Log in
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-[11px] text-[#71717A] font-mono">
          <span>Free plan includes unlimited short links & analytics</span>
        </div>
      </div>
    </div>
  )
}