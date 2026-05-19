"use client";

import React, { useState } from "react";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to log in");
      }

      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 text-white mb-3">
            <Icons.SnapLink className="w-8 h-8" />
            <span className="font-mono font-bold text-2xl tracking-widest uppercase">SnapURL</span>
          </div>
          <p className="text-zinc-400 text-sm font-mono uppercase tracking-widest">Enterprise Intelligence</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-none p-6">
          {/* Social Logins */}
          <div className="flex gap-4 mb-6">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-none border border-[var(--card-border)] hover:bg-zinc-800/50 transition-colors text-sm text-zinc-300 font-medium">
              <Icons.google className="w-5 h-5" />
              Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-none border border-[var(--card-border)] hover:bg-zinc-800/50 transition-colors text-sm text-zinc-300 font-medium">
              <Icons.github className="w-5 h-5" />
              GitHub
            </button>
          </div>

          <div className="relative flex items-center py-4 mb-2">
            <div className="flex-grow border-t border-[var(--card-border)]"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">
              OR CONTINUE WITH
            </span>
            <div className="flex-grow border-t border-[var(--card-border)]"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {error && (
              <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-none border border-red-400/20">
                {error}
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-zinc-400 uppercase">Work Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Icons.mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-sm rounded-none py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-transparent text-white placeholder-zinc-600 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-zinc-400 uppercase">Password</label>
                <Link href="#" className="text-xs font-mono text-[var(--primary)] hover:text-[var(--primary-hover)]">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Icons.lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-sm rounded-none py-2.5 pl-10 pr-10 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-transparent text-white placeholder-zinc-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <Icons.eyeOff className="h-4 w-4" /> : <Icons.eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-semibold py-2.5 rounded-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-white font-semibold hover:underline">
              Sign up for free
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 flex items-center justify-between text-xs font-mono text-zinc-500 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Icons.checkShield className="w-4 h-4" />
            <span>AES-256 ENCRYPTION</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Status</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}