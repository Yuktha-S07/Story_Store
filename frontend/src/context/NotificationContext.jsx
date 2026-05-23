import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [message, setMessage] = useState('')
  const [type, setType] = useState('info')
  const [confirmState, setConfirmState] = useState(null)

  const notify = useCallback((nextMessage, nextType = 'info') => {
    setMessage(nextMessage)
    setType(nextType)
    window.clearTimeout(window.__storyStoreToastTimer)
    window.__storyStoreToastTimer = window.setTimeout(() => {
      setMessage('')
      setType('info')
    }, 2800)
  }, [])

  const clearNotification = useCallback(() => {
    window.clearTimeout(window.__storyStoreToastTimer)
    setMessage('')
    setType('info')
  }, [])

  useEffect(() => {
    const handleToast = (event) => {
      const nextMessage = event?.detail?.message
      const nextType = event?.detail?.type || 'info'
      if (!nextMessage) return
      notify(nextMessage, nextType)
    }

    window.addEventListener('story-store:toast', handleToast)
    return () => window.removeEventListener('story-store:toast', handleToast)
  }, [notify])

  const confirmAction = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        title: options?.title || 'Confirm action',
        message: options?.message || 'Are you sure you want to continue?',
        confirmText: options?.confirmText || 'Confirm',
        cancelText: options?.cancelText || 'Cancel',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      })
    })
  }, [])

  const closeConfirm = useCallback((accepted) => {
    setConfirmState((current) => {
      if (!current) return null
      const handler = accepted ? current.onConfirm : current.onCancel
      window.setTimeout(() => handler(), 0)
      return null
    })
  }, [])

  const value = useMemo(() => ({ notify, clearNotification, confirmAction }), [notify, clearNotification, confirmAction])

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {message && (
        <div className="fixed right-4 top-4 z-50 max-w-sm rounded-2xl border border-[#e8d7c2] bg-[#fff8ef] px-4 py-3 text-sm text-[#4b4136] shadow-[0_18px_40px_rgba(143,113,70,0.14)]">
          <div className="flex items-start gap-3">
            <div className={`mt-1 h-2.5 w-2.5 rounded-full ${type === 'error' ? 'bg-rose-400' : type === 'success' ? 'bg-emerald-400' : 'bg-[#d8b37a]'}`} />
            <div className="flex-1">
              <p className="font-semibold text-[#2f281f]">Story Store</p>
              <p className="mt-1 text-[#5d5243]">{message}</p>
            </div>
            <button
              type="button"
              onClick={clearNotification}
              className="rounded-full px-2 py-1 text-[#7b6a52] transition hover:bg-black/5 hover:text-[#2f281f]"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_28px_80px_rgba(0,0,0,0.2)]">
            <h3 className="font-serif text-2xl text-[#26231f]">{confirmState.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#5d584f]">{confirmState.message}</p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                className="rounded-full bg-[#e6ebdf] px-5 py-2.5 text-sm font-semibold text-[#3a3a3a] transition hover:bg-[#d9e1cf]"
              >
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                onClick={() => closeConfirm(true)}
                className="rounded-full bg-[#3a3a3a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#26231f]"
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}