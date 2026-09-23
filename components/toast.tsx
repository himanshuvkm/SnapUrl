'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Icons } from '@/components/icons'

export interface ToastItem {
  id: string
  type?: 'success' | 'error' | 'info'
  message: string
}

interface ToastContextType {
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, type, message }])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container bottom-right */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-[#DCD8CF] bg-[#FFFFFF] text-sm text-[#111111] shadow-[0_12px_32px_rgba(17,17,17,0.14)] transition-all animate-in slide-in-from-bottom-3 duration-200"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {toast.type === 'success' && (
                <div className="w-5 h-5 rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Icons.check className="w-3.5 h-3.5" />
                </div>
              )}
              {toast.type === 'error' && (
                <div className="w-5 h-5 rounded-sm bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                  <Icons.x className="w-3.5 h-3.5" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-5 h-5 rounded-sm bg-indigo-50 text-[#4F46E5] border border-indigo-200 flex items-center justify-center shrink-0">
                  <Icons.sparkles className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="truncate text-xs sm:text-sm font-medium text-[#111111]">{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-[#71717A] hover:text-[#111111] transition-colors shrink-0"
            >
              <Icons.x className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    // Fallback if rendered outside provider
    return {
      addToast: (message: string) => {
        if (typeof window !== 'undefined') console.log('[Toast]:', message)
      }
    }
  }
  return context
}
