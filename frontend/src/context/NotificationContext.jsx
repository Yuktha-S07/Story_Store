import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { FiAlertCircle, FiBell, FiCheck, FiInfo, FiX } from 'react-icons/fi'
import api from '../services/api'
import { getSelectedSound, playSound } from '../utils/notificationSound'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [message, setMessage] = useState('')
  const [type, setType] = useState('info')
  const [confirmState, setConfirmState] = useState(null)
  const seenNotificationIds = useRef(null)

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

  useEffect(() => {
    const pollNotifications = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) return
      try {
        const response = await api.get('/api/notifications')
        const items = Array.isArray(response.data?.notifications) ? response.data.notifications : []
        const ids = new Set(items.map((item) => item._id))
        if (seenNotificationIds.current === null) {
          seenNotificationIds.current = ids
          return
        }
        const newItems = items.filter((item) => !seenNotificationIds.current.has(item._id))
        seenNotificationIds.current = ids
        if (!newItems.length) return
        const latest = newItems[0]
        notify(latest.message, latest.type === 'messages' ? 'info' : 'success')
        playSound(getSelectedSound())
        await api.post('/api/notifications/read')
      } catch (err) {
        console.error(err)
      }
    }

    pollNotifications()
    const interval = window.setInterval(pollNotifications, 8000)
    return () => window.clearInterval(interval)
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

  const notificationStyles = {
    success: {
      icon: FiCheck,
      iconClass: 'bg-[#e1f2e8] text-[#4d8b68]',
      background: 'bg-[#f5fbf7] dark:bg-[#1d2a23]',
    },
    error: {
      icon: FiAlertCircle,
      iconClass: 'bg-[#f9e5e3] text-[#b36c68]',
      background: 'bg-[#fff8f7] dark:bg-[#2c1f23]',
    },
    warning: {
      icon: FiBell,
      iconClass: 'bg-[#fff0d8] text-[#b17a3c]',
      background: 'bg-[#fffaf2] dark:bg-[#2b241d]',
    },
    info: {
      icon: FiInfo,
      iconClass: 'bg-[#eee8f7] text-[#7f6a9d]',
      background: 'bg-[#faf8fd] dark:bg-[#221f2d]',
    },
  }
  const notificationStyle = notificationStyles[type] || notificationStyles.info
  const NotificationIcon = notificationStyle.icon

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {message && (
        <div className={`fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl px-4 py-3.5 text-sm text-[#6f6863] shadow-[0_16px_38px_rgba(91,61,34,0.12)] dark:text-[#c9c1d1] dark:shadow-[0_16px_38px_rgba(0,0,0,0.45)] ${notificationStyle.background}`}>
          <div className="flex items-start gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notificationStyle.iconClass}`}>
              <NotificationIcon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="font-serif text-sm font-semibold text-[#514b48] dark:text-[#e7dfed]">Story Store</p>
              <p className="mt-1 leading-5 text-[#7b7470] dark:text-[#b8adbf]">{message}</p>
            </div>
            <button
              type="button"
              onClick={clearNotification}
              className="rounded-full p-1 text-[#a69b93] transition hover:bg-black/5 hover:text-[#645a53] dark:text-[#9f93ac] dark:hover:bg-white/10 dark:hover:text-[#dfd6e6]"
              aria-label="Dismiss notification"
            >
              <FiX className="h-4 w-4" aria-hidden="true" />
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