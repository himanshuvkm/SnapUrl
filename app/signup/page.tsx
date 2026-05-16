"use client";

import React, { useState } from "react";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      localStorage.setItem("token", data.token);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex w-full">
        {/* Left Column - Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-[500px]">
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-8 shadow-2xl">
              <h1 className="text-3xl font-semibold text-white mb-2">Create an account</h1>
              <p className="text-zinc-400 text-sm mb-8">Start optimizing your link performance today.</p>

              {/* Form */}
              <form onSubmit={handleSignup} className="flex flex-col gap-5">
                {error && (
                  <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-md border border-red-400/20">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Rivera"
                    required
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-sm rounded-md py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-transparent text-white placeholder-zinc-600 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wide">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    required
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-sm rounded-md py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-transparent text-white placeholder-zinc-600 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono text-zinc-400 uppercase tracking-wide">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-sm rounded-md py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-transparent text-white placeholder-zinc-600 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono text-zinc-400 uppercase tracking-wide">Confirm</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-sm rounded-md py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-transparent text-white placeholder-zinc-600 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-semibold py-3 rounded-md transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing up..." : "Sign up"}
                </button>
              </form>

              <div className="relative flex items-center py-6">
                <div className="flex-grow border-t border-[var(--card-border)]"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">
                  OR CONTINUE WITH
                </span>
                <div className="flex-grow border-t border-[var(--card-border)]"></div>
              </div>

              {/* Social Logins */}
              <div className="flex gap-4 mb-6">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md border border-[var(--card-border)] hover:bg-zinc-800/50 transition-colors text-sm text-zinc-300 font-medium">
                  <Icons.google className="w-5 h-5" />
                  Google
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md border border-[var(--card-border)] hover:bg-zinc-800/50 transition-colors text-sm text-zinc-300 font-medium">
                  <Icons.github className="w-5 h-5" />
                  GitHub
                </button>
              </div>

              <div className="text-center text-sm text-zinc-400 mt-2">
                Already have an account?{" "}
                <Link href="/login" className="text-white font-semibold hover:underline">
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Marketing */}
        <div className="hidden lg:flex w-1/2 flex-col justify-center p-16 pl-8">
          <div className="max-w-[600px]">
            <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-4">
              THE ENTERPRISE STANDARD
            </p>
            <h2 className="text-5xl font-bold text-white leading-tight mb-6">
              Scale your links with Obsidian precision.
            </h2>
            <p className="text-lg text-zinc-400 mb-10 leading-relaxed">
              Join 10,000+ developers and marketing teams using SnapLink to drive real-time decision making with industrial-grade analytics.
            </p>

            <div className="flex flex-col gap-4">
              {/* Feature Cards */}
              <div className="flex items-start gap-4 p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-lg">
                <div className="bg-blue-500/20 p-2 rounded-lg shrink-0 mt-1">
                  <Icons.activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Instant Analytics</h3>
                  <p className="text-sm text-zinc-400">
                    Sub-second latency on click tracking and geographic data distribution.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-lg">
                <div className="bg-purple-500/20 p-2 rounded-lg shrink-0 mt-1">
                  <Icons.shield className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Enterprise Security</h3>
                  <p className="text-sm text-zinc-400">
                    256-bit encryption, role-based access control, and SSO integration for teams.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-lg">
                <div className="bg-zinc-700/50 p-2 rounded-lg shrink-0 mt-1">
                  <Icons.api className="w-5 h-5 text-zinc-300" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Developer First API</h3>
                  <p className="text-sm text-zinc-400">
                    GraphQL and REST endpoints designed for high-throughput automation.
                  </p>
                </div>
              </div>
            </div>
           
          </div>
        </div>
      </div>
    </div>
  );
}
