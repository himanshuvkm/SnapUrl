"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Link as LinkIcon, Zap, BarChart3, ShieldCheck, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-lg">
              <LinkIcon className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">SnapURL</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium text-muted hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted hover:text-foreground transition-colors">How it works</Link>
            <Link href="#pricing" className="text-sm font-medium text-muted hover:text-foreground transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted hover:text-foreground transition-colors hidden sm:block">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary-hover transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />
          
          <div className="container mx-auto max-w-5xl text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium mb-6">
                ✨ The ultimate link management platform
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Simplify Your Links,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                Amplify Your Reach
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-muted max-w-2xl mx-auto mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Create short links, custom domains, and track performance with advanced analytics. Build your digital presence with SnapURL.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground text-lg font-medium px-8 py-4 rounded-full hover:bg-primary-hover transition-transform hover:scale-105">
                Start for free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#features" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 text-foreground border border-white/10 text-lg font-medium px-8 py-4 rounded-full hover:bg-white/10 transition-colors">
                View Features
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-card-bg/30 relative">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to manage links</h2>
              <p className="text-muted text-lg max-w-2xl mx-auto">Powerful features designed for creators, marketers, and businesses.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <motion.div 
                className="bg-card-bg border border-card-border p-8 rounded-2xl hover:border-primary/50 transition-colors group"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
                <p className="text-muted">Generate short links in milliseconds. Our global CDN ensures your links redirect instantly anywhere in the world.</p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div 
                className="bg-card-bg border border-card-border p-8 rounded-2xl hover:border-primary/50 transition-colors group"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Detailed Analytics</h3>
                <p className="text-muted">Track clicks, geographic data, and referrers in real-time. Make data-driven decisions for your campaigns.</p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div 
                className="bg-card-bg border border-card-border p-8 rounded-2xl hover:border-primary/50 transition-colors group"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Secure & Reliable</h3>
                <p className="text-muted">Enterprise-grade security with HTTPS for all links. Custom domains are automatically secured with SSL certificates.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-16">How SnapURL works</h2>
            
            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 -z-10" />
              
              <div className="relative">
                <div className="w-16 h-16 mx-auto bg-background border-2 border-primary text-primary font-bold text-2xl flex items-center justify-center rounded-full mb-6 z-10 shadow-[0_0_15px_rgba(161,194,255,0.3)]">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Paste your link</h3>
                <p className="text-muted text-sm">Drop in your long, unwieldy URL into our dashboard.</p>
              </div>
              
              <div className="relative">
                <div className="w-16 h-16 mx-auto bg-background border-2 border-primary text-primary font-bold text-2xl flex items-center justify-center rounded-full mb-6 z-10 shadow-[0_0_15px_rgba(161,194,255,0.3)]">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Customize it</h3>
                <p className="text-muted text-sm">Add a custom alias or use your own branded domain name.</p>
              </div>
              
              <div className="relative">
                <div className="w-16 h-16 mx-auto bg-background border-2 border-primary text-primary font-bold text-2xl flex items-center justify-center rounded-full mb-6 z-10 shadow-[0_0_15px_rgba(161,194,255,0.3)]">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Share & Track</h3>
                <p className="text-muted text-sm">Share your short link and watch the clicks roll in via real-time analytics.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 border-y border-white/5" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to supercharge your links?</h2>
            <p className="text-xl text-muted mb-10">Join thousands of creators and businesses using SnapURL today.</p>
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-lg font-bold px-10 py-5 rounded-full hover:bg-primary-hover transition-transform hover:scale-105 shadow-[0_0_30px_rgba(161,194,255,0.4)]">
              Create your free account
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-background pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary/20 p-1.5 rounded-md">
                  <LinkIcon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xl font-bold">SnapURL</span>
              </div>
              <p className="text-muted text-sm mb-6">
                The modern link management platform for the digital age.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-muted hover:text-foreground transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted">Product</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-muted hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#" className="text-sm text-muted hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-sm text-muted hover:text-primary transition-colors">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted">Resources</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-muted hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="#" className="text-sm text-muted hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-sm text-muted hover:text-primary transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-muted hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-sm text-muted hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted">
              &copy; {new Date().getFullYear()} SnapURL. All rights reserved.
            </p>
            <div className="flex gap-6">
              <span className="text-sm text-muted flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                System Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
