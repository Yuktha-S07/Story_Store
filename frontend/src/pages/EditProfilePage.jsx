import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import BackButton from '../components/BackButton'
import EditProfileCard from '../components/settings/EditProfileCard'

export default function EditProfilePage() {
  const { user, updateUser } = useContext(AuthContext)
  const { notify } = useNotification()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Edit profile | Story Store'
    return () => {
      document.title = 'Story Store'
    }
  }, [])

  return (
    <div className="settings-page mx-auto w-full max-w-3xl space-y-7 pb-12 text-[15px]">
      <div className="flex items-center justify-between">
        <BackButton />
        <span className="rounded-full border border-[#cfc2e8] bg-[#f1eafa] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#755b8b] dark:border-[#604b73] dark:bg-[#3b2d4b] dark:text-[#d9c5eb]">Profile</span>
      </div>

      <header className="settings-header rounded-3xl border border-[#d8e4df] bg-[linear-gradient(135deg,#f7fcfa,#fffaf5)] p-6 shadow-[0_12px_28px_rgba(47,86,76,0.06)] dark:border-[#3d4d4a] dark:bg-[#211d29]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8b6b52] dark:text-[#cba99c]">Account details</p>
          <h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight text-[#28343a] dark:text-[#f0e8f6]">Edit profile</h1>
        </div>
      </header>

      <EditProfileCard user={user} onUpdated={updateUser} notify={notify} standalone />

      <button
        type="button"
        onClick={() => navigate('/settings')}
        className="text-sm font-semibold text-[#755b8b] underline-offset-4 hover:underline dark:text-[#cbb9d9]"
      >
        Back to settings
      </button>
    </div>
  )
}
