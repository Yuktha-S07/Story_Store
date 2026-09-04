import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import BackButton from '../components/BackButton'
import ThemeCard from '../components/settings/ThemeCard'
import EditProfileCard from '../components/settings/EditProfileCard'
import LogoutCard from '../components/settings/LogoutCard'
import DeleteAccountCard from '../components/settings/DeleteAccountCard'
import NotificationPreferences from '../components/settings/NotificationPreferences'

export default function SettingsPage() {
  const { user, logout, updateUser } = useContext(AuthContext)
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
    <div className="mx-auto w-full max-w-3xl space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <BackButton />
        <span className="rounded-full border border-[#e3cfd0] bg-[#fff4f3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#a45d60] dark:border-[#5d4b5f] dark:bg-[#2d2731] dark:text-[#d9bdd6]">Account</span>
      </div>
      <header className="relative border-b border-[#e8d8c8] pb-6 dark:border-[#3b3240]">
        <div className="mb-3 flex items-center gap-2 text-[#b06f7f] dark:text-[#c99ab7]">
          <span className="h-px w-8 bg-[#e07a5f] dark:bg-[#c99ab7]" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em]">Story Store account</p>
        </div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#28343a] dark:text-[#e6dde9] md:text-3xl">Settings</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#6d6863] dark:text-[#b8adbf]">Shape your profile, reading experience, and account preferences.</p>
      </header>

      <main className="space-y-3">
        <ThemeCard />
        <NotificationPreferences />
        <EditProfileCard user={user} onUpdated={updateUser} notify={notify} />
        <LogoutCard
          onLogout={() => {
            logout()
            navigate('/')
            notify('Logged out successfully.', 'info')
          }}
        />
        <section className="pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#a45145] dark:text-[#d7a1a1]">Danger zone</p>
          <DeleteAccountCard user={user} onDeleted={handleDeleted} onError={notify} />
        </section>
      </main>
    </div>
  )
}
