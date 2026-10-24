import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import NotificationPreferences from '../components/settings/NotificationPreferences'

export default function NotificationsPage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Notifications | Story Store'
    return () => {
      document.title = 'Story Store'
    }
  }, [])

  return (
    <div className="settings-page mx-auto w-full max-w-3xl space-y-7 pb-12 text-[15px]">
      <div className="flex items-center justify-between">
        <BackButton />
        <span className="rounded-full border border-[#b8ddd5] bg-[#eaf8f3] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#287568] dark:border-[#31594f] dark:bg-[#1d3830] dark:text-[#a8d8c5]">Preferences</span>
      </div>

      <header className="settings-header rounded-3xl border border-[#d8e4df] bg-[linear-gradient(135deg,#f7fcfa,#fffaf5)] p-6 shadow-[0_12px_28px_rgba(47,86,76,0.06)] dark:border-[#3d4d4a] dark:bg-[#211d29]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6d9587] dark:text-[#a8d8c5]">Stay informed</p>
          <h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight text-[#28343a] dark:text-[#f0e8f6]">Notifications</h1>
        </div>
      </header>

      <NotificationPreferences standalone />

      <button
        type="button"
        onClick={() => navigate('/settings')}
        className="text-sm font-semibold text-[#287568] underline-offset-4 hover:underline dark:text-[#9bd8ca]"
      >
        Back to settings
      </button>
    </div>
  )
}
