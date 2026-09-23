'use client'

import React, { useEffect } from 'react'
import { Icons } from '@/components/icons'

interface ConfirmDialogProps {
  isOpen: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title = 'Delete this link?',
  description = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDestructive = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-[#DCD8CF] bg-[#FFFFFF] p-6 shadow-[0_16px_40px_rgba(17,17,17,0.16)] relative text-left animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
              isDestructive ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-indigo-50 text-[#4F46E5] border border-indigo-200'
            }`}
          >
            {isDestructive ? <Icons.trash className="w-4 h-4" /> : <Icons.sparkles className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="font-semibold text-base text-[#111111]">{title}</h3>
            <p className="text-xs text-[#71717A] mt-1">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="text-xs font-medium text-[#111111] bg-[#F8F7F4] hover:bg-[#F0EEE8] border border-[#DCD8CF] px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-[#111111] hover:bg-[#222222] text-white'
            }`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
