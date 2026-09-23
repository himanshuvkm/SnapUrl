import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SnapURL — Shorten, Customize & Track Links",
  description: "Enterprise-grade URL shortener with real-time analytics, custom slugs, sub-10ms redirects, and scannable QR codes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8F7F4] text-[#111111] selection:bg-indigo-500/15 selection:text-[#111111]">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
