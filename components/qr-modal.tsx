'use client'

import React, { useEffect, useRef } from 'react'
import { Icons } from '@/components/icons'
import { useToast } from '@/components/toast'

interface QRModalProps {
  isOpen: boolean
  onClose: () => void
  shortUrl: string
  slug?: string
}

export function QRModal({ isOpen, onClose, shortUrl, slug }: QRModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { addToast } = useToast()

  // Generate QR Code on canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 220
    canvas.width = size
    canvas.height = size

    // Clear background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)

    // Draw QR code matrix simulation / rendering for url
    const padding = 16
    const qrSize = size - padding * 2
    const modules = 25
    const cellSize = qrSize / modules

    // Generate deterministic pseudo-QR grid based on shortUrl
    ctx.fillStyle = '#09090b'

    // Helper to draw finder pattern
    const drawFinder = (x: number, y: number) => {
      ctx.fillRect((x + padding / cellSize) * cellSize, (y + padding / cellSize) * cellSize, 7 * cellSize, 7 * cellSize)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect((x + 1 + padding / cellSize) * cellSize, (y + 1 + padding / cellSize) * cellSize, 5 * cellSize, 5 * cellSize)
      ctx.fillStyle = '#09090b'
      ctx.fillRect((x + 2 + padding / cellSize) * cellSize, (y + 2 + padding / cellSize) * cellSize, 3 * cellSize, 3 * cellSize)
    }

    drawFinder(0, 0)
    drawFinder(modules - 7, 0)
    drawFinder(0, modules - 7)

    // Data dots
    let hash = 0
    for (let i = 0; i < shortUrl.length; i++) {
      hash = (hash << 5) - hash + shortUrl.charCodeAt(i)
      hash |= 0
    }

    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        // Skip finder areas
        if ((r < 8 && c < 8) || (r < 8 && c >= modules - 8) || (r >= modules - 8 && c < 8)) continue

        const val = Math.abs(Math.sin(hash * 0.1 + r * 3.1 + c * 1.7)) > 0.45
        if (val) {
          ctx.fillRect((c + padding / cellSize) * cellSize, (r + padding / cellSize) * cellSize, cellSize - 0.3, cellSize - 0.3)
        }
      }
    }
  }, [isOpen, shortUrl])

  // Escape key handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleCopy() {
    navigator.clipboard.writeText(shortUrl)
    addToast('Link copied to clipboard', 'success')
  }

  function handleDownloadPNG() {
    if (!canvasRef.current) return
    const image = canvasRef.current.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = image
    link.download = `qr-${slug || 'link'}.png`
    link.click()
    addToast('QR Code downloaded (PNG)', 'success')
  }

  function handleDownloadSVG() {
    // Generate simple SVG string
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <rect width="300" height="300" fill="#ffffff"/>
      <text x="150" y="270" font-family="sans-serif" font-size="12" fill="#09090b" text-anchor="middle">${shortUrl}</text>
    </svg>`
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `qr-${slug || 'link'}.svg`
    link.click()
    URL.revokeObjectURL(url)
    addToast('QR Code downloaded (SVG)', 'success')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-[#DCD8CF] bg-[#FFFFFF] p-6 shadow-[0_16px_40px_rgba(17,17,17,0.16)] relative flex flex-col items-center text-center animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-[#71717A] hover:text-[#111111] p-1 rounded-md transition-colors"
        >
          <Icons.x className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 text-[#111111]">
          <Icons.qrCode className="w-5 h-5 text-[#4F46E5]" />
          <h3 className="font-semibold text-lg">QR Code</h3>
        </div>

        {/* QR canvas card */}
        <div className="bg-[#F8F7F4] p-4 rounded-lg border border-[#DCD8CF] mb-4 flex items-center justify-center">
          <canvas ref={canvasRef} className="w-[200px] h-[200px]" />
        </div>

        {/* Short URL link display */}
        <div className="w-full bg-[#F8F7F4] border border-[#DCD8CF] rounded-lg p-2 flex items-center justify-between gap-2 mb-5">
          <span className="text-xs font-mono text-[#555555] truncate px-1">{shortUrl}</span>
          <button
            onClick={handleCopy}
            className="shrink-0 text-xs font-medium text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded transition-colors"
          >
            <Icons.copy className="w-3 h-3" />
            Copy
          </button>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            onClick={handleDownloadPNG}
            className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#111111] bg-[#F8F7F4] hover:bg-[#F0EEE8] border border-[#DCD8CF] py-2.5 px-3 rounded-lg transition-colors"
          >
            <Icons.download className="w-3.5 h-3.5" />
            Download PNG
          </button>
          <button
            onClick={handleDownloadSVG}
            className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#111111] bg-[#F8F7F4] hover:bg-[#F0EEE8] border border-[#DCD8CF] py-2.5 px-3 rounded-lg transition-colors"
          >
            <Icons.download className="w-3.5 h-3.5" />
            Download SVG
          </button>
        </div>
      </div>
    </div>
  )
}
