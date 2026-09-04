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
    <div className="mx-auto w-full max-w-4xl space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <BackButton />
        <span className="rounded-full border border-[#e3cfd0] bg-[#fff4f3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#a45d60] dark:border-[#5d4b5f] dark:bg-[#2d2731] dark:text-[#d9bdd6]">Account</span>
      </div>
      <header className="relative overflow-hidden rounded-2xl border border-[#e6dcd2] bg-gradient-to-br from-[#fffaf5] via-[#fdf5f0] to-[#f5eefa] p-6 sm:p-8 dark:border-[#4b3b5d] dark:from-[#2d2438] dark:via-[#261e30] dark:to-[#1e1a26]">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#e07a5f]/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-[#b891cc]/15 blur-2xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#b891cc]/5 to-transparent" />
        <div className="relative">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#b891cc] to-[#9c78b9] text-white shadow-[0_2px_8px_rgba(184,145,204,0.35)]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </span>
            <span className="h-px w-12 bg-gradient-to-r from-[#e07a5f] via-[#c99ab7] to-[#b891cc]" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b06f7f] dark:text-[#c99ab7]">Story Store account</p>
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#28343a] dark:text-[#e6dde9] sm:text-4xl">Settings</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#6d6863] dark:text-[#b8adbf]">Shape your profile, reading experience, and account preferences.</p>
        </div>
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
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e07a5f]/40 to-transparent" />
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#a45145] dark:text-[#d7a1a1]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fce4e4] dark:bg-[#4a2430]"><svg className="h-3 w-3 text-[#b45f69] dark:text-[#e8949c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
              Danger zone
            </p>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e07a5f]/40 to-transparent" />
          </div>
          <DeleteAccountCard user={user} onDeleted={handleDeleted} onError={notify} />
        </section>
      </main>
    </div>
  )
}
