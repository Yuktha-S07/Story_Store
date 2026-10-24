import React, { useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { FiBell, FiChevronRight, FiMoon, FiShield, FiUser } from 'react-icons/fi'
import BackButton from '../components/BackButton'
import ThemeCard from '../components/settings/ThemeCard'
import LogoutCard from '../components/settings/LogoutCard'
import DeleteAccountCard from '../components/settings/DeleteAccountCard'
import NotificationPreferences from '../components/settings/NotificationPreferences'

export default function SettingsPage() {
  const { user, logout } = useContext(AuthContext)
  const { notify } = useNotification()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Settings | Story Store'
    return () => {
      document.title = 'Story Store'
    }
  }, [])

  const handleDeleted = () => {
    logout()
    navigate('/')
    notify('Your account has been deleted.', 'info')
  }

  return (
    <div className="settings-page mx-auto w-full max-w-4xl space-y-7 pb-12 text-[15px]">
      <div className="flex items-center justify-between">
        <BackButton />
        <span className="inline-flex items-center gap-2 rounded-full border border-[#b8ddd5] bg-[#eaf8f3] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#287568] dark:border-[#31594f] dark:bg-[#1d3830] dark:text-[#a8d8c5]">
          <FiShield size={13} />
          Settings
        </span>
      </div>

      <header className="settings-header rounded-3xl border border-[#d8e4df] bg-[linear-gradient(135deg,#f7fcfa,#fffaf5)] p-6 shadow-[0_12px_28px_rgba(47,86,76,0.06)] dark:border-[#3d4d4a] dark:bg-[#211d29] sm:p-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6d9587] dark:text-[#a8d8c5]">Account</p>
          <h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight text-[#28343a] dark:text-[#f0e8f6]">Settings</h1>
        </div>
      </header>

      <main className="space-y-3">
        <Link
          to="/settings/profile"
          className="settings-panel group flex items-center gap-4 rounded-2xl border border-[#d8e4df] border-l-4 border-l-[#b8a1c8] bg-white p-5 shadow-[0_8px_22px_rgba(47,86,76,0.05)] transition hover:-translate-y-0.5 hover:border-[#b8a1c8] hover:shadow-md dark:border-[#3d4d4a] dark:border-l-[#8d72a8] dark:bg-[#211d29]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1eafa] text-[#755b8b] dark:bg-[#3b2d4b] dark:text-[#d9c5eb]"><FiUser size={19} /></span>
          <span>
            <span className="block text-sm font-semibold text-[#263a38] dark:text-gray-200">Edit profile</span>
            <span className="settings-subtext mt-1 block">Picture, username, email, and password</span>
          </span>
          <FiChevronRight className="ml-auto text-[#a08a7b] transition group-hover:translate-x-1 dark:text-[#cbb9d9]" aria-hidden="true" />
        </Link>
        <Link
          to="/settings/notifications"
          className="settings-panel group flex items-center gap-4 rounded-2xl border border-[#d8e4df] border-l-4 border-l-[#5fa996] bg-white p-5 shadow-[0_8px_22px_rgba(47,86,76,0.05)] transition hover:-translate-y-0.5 hover:border-[#8fcfbe] hover:shadow-md dark:border-[#3d4d4a] dark:border-l-[#5fa996] dark:bg-[#211d29]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e5f6f1] text-[#287568] dark:bg-[#1d3d39] dark:text-[#9bd8ca]"><FiBell size={19} /></span>
          <span>
            <span className="block text-sm font-semibold text-[#263a38] dark:text-gray-200">Notifications</span>
            <span className="settings-subtext mt-1 block">Activity alerts, device notifications, and sound</span>
          </span>
          <FiChevronRight className="ml-auto text-[#5fa996] transition group-hover:translate-x-1 dark:text-[#9bd8ca]" aria-hidden="true" />
        </Link>
        <ThemeCard />
        <LogoutCard
          onLogout={() => {
            logout()
            navigate('/')
            notify('Logged out successfully.', 'info')
          }}
        />
        <section className="border-t border-[#eccdc8] pt-5 dark:border-red-900/40">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#a45145] dark:text-[#d7a1a1]">Danger zone</p>
          <DeleteAccountCard user={user} onDeleted={handleDeleted} onError={notify} />
        </section>
      </main>
    </div>
  )
}
