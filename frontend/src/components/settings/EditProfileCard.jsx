import React, { useEffect, useRef, useState } from 'react'
import { FiUser, FiMail, FiCalendar, FiLock, FiSave } from 'react-icons/fi'
import api from '../../services/api'
import { Card, Field, inputClass } from '../SettingsUI'

function ChevronIcon({ open }) {
  return (
    <svg
      className={`w-4 h-4 text-[#8b6b52] dark:text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function EditProfileCard({ user, onUpdated, notify }) {
  const [open, setOpen] = useState(false)

  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const fileInputRef = useRef(null)

  const [pwOpen, setPwOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    setUsername(user?.username || '')
    setEmail(user?.email || '')
    if (!avatarFile) setAvatarPreview(user?.avatar_url || '')
  }, [user])

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown'

  const avatarLetter = (user?.username || 'U')[0].toUpperCase()
  const avatarColors = [
    'bg-[#FFD5D5] text-[#8C3838]',
    'bg-[#D5E8D5] text-[#2D6B3F]',
    'bg-[#D5E0FF] text-[#2A4B8C]',
    'bg-[#F5E0D5] text-[#8C5A38]',
    'bg-[#E0D5F5] text-[#5A388C]',
    'bg-[#FFE0D5] text-[#8C5038]',
  ]
  const avatarColorClass = avatarColors[(user?.username || 'U').length % avatarColors.length]

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      notify('Use a jpg, png or webp image for your profile picture.', 'error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      notify('Profile picture must be smaller than 5MB.', 'error')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (username.trim().length < 3) {
      notify('Username must be at least 3 characters.', 'error')
      return
    }
    setSavingProfile(true)
    try {
      const formData = new FormData()
      formData.append('username', username.trim())
      formData.append('email', email.trim())
      if (avatarFile) formData.append('avatar', avatarFile)
      const res = await api.put(`/api/users/${user._id}`, formData)
      onUpdated(res.data)
      setAvatarFile(null)
      setAvatarPreview(res.data.avatar_url || '')
      notify('Profile updated successfully.', 'success')
    } catch (err) {
      const detail = err?.response?.data?.detail
      notify(typeof detail === 'string' ? detail : 'Error updating profile.', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      notify('New password must be at least 6 characters.', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      notify('New passwords do not match.', 'error')
      return
    }
    setSavingPassword(true)
    try {
      await api.put(`/api/users/${user._id}/password`, {
        current_password: currentPassword,
        new_password: newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      notify('Password updated successfully.', 'success')
    } catch (err) {
      const detail = err?.response?.data?.detail
      notify(typeof detail === 'string' ? detail : 'Error changing password.', 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <Card
      title="Edit profile"
      subtitle="Username, email, profile picture and password."
      icon={FiUser}
      iconColor="warm"
      accent="rose"
      onHeaderClick={() => setOpen((v) => !v)}
      actions={
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
          className="shrink-0 cursor-pointer"
          aria-expanded={open}
        >
          <ChevronIcon open={open} />
        </button>
      }
    >
      {open && (
        <div className="mt-5 space-y-5">
          {/* Profile picture */}
          <div className="rounded-xl border border-[#efe8dd] dark:border-gray-700 bg-gradient-to-br from-white to-[#fdf9f5] dark:from-gray-900/40 dark:to-gray-900/20 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#8b6b52] dark:text-gray-400">Profile picture</p>
            <div className="flex items-center gap-5">
              {avatarPreview ? (
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#e07a5f] via-[#b891cc] to-[#9c78b9] opacity-70 blur-[2px]" />
                  <img
                    src={avatarPreview}
                    alt="Profile picture preview"
                    className="relative h-16 w-16 rounded-full object-cover ring-2 ring-white"
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#e07a5f] via-[#b891cc] to-[#9c78b9] opacity-60 blur-[2px]" />
                  <div className={`relative flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold ring-2 ring-white ${avatarColorClass}`}>
                    {avatarLetter}
                  </div>
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full bg-gradient-to-r from-[#b891cc] to-[#9c78b9] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:from-[#a780bc] hover:to-[#8d69aa] hover:shadow-md"
                >
                  {avatarPreview ? 'Replace picture' : 'Upload picture'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <p className="mt-1.5 flex items-center gap-1 text-[10px] text-[#5d584f]/70 dark:text-gray-500">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  JPG, PNG or WEBP - max 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Username / Email / Member since */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Username" icon={FiUser}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass}
                  placeholder="Username"
                />
              </Field>
              <Field label="Email" icon={FiMail}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Member since" icon={FiCalendar}>
                  <input
                    type="text"
                    value={memberSince}
                    readOnly
                    disabled
                    className={`${inputClass} bg-gradient-to-r from-[#f4efe7] to-[#f0ebe3] dark:from-gray-800/60 dark:to-gray-800/40 cursor-not-allowed`}
                  />
                </Field>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#9c78b9] via-[#b891cc] to-[#c9a8d8] px-7 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(156,120,185,0.35)] transition-all duration-300 hover:from-[#8d69aa] hover:via-[#a780bc] hover:to-[#b891cc] hover:shadow-[0_6px_20px_rgba(156,120,185,0.45)] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {savingProfile ? (
                <><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Saving...</>
              ) : (
                <><FiSave size={15} /> Save changes</>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="h-px bg-gradient-to-r from-transparent via-[#d8c9e8] to-transparent dark:via-[#4b3b5d]" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] text-[#a89f92] dark:bg-gray-800/50 dark:text-gray-500">or</span>
          </div>

          {/* Change password sub-option */}
          <div className="rounded-xl border border-[#efe8dd] dark:border-gray-700 bg-gradient-to-br from-white to-[#fdf9f5] dark:from-gray-900/40 dark:to-gray-900/20 p-5">
            <button
              type="button"
              onClick={() => setPwOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-3 text-left cursor-pointer"
              aria-expanded={pwOpen}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1eafa] text-[#755b8b] dark:bg-[#3b2d4b] dark:text-[#d9c5eb]">
                  <FiLock size={15} />
                </span>
                <div>
                  <p className="font-semibold text-sm text-[#26231f] dark:text-gray-200">Change password</p>
                  <p className="text-xs text-[#5d584f] dark:text-gray-400 mt-0.5">Verify your current password to set a new one</p>
                </div>
              </div>
              <ChevronIcon open={pwOpen} />
            </button>

            {pwOpen && (
              <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                <Field label="Current password" icon={FiLock}>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                    required
                  />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="New password" icon={FiLock}>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputClass}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      required
                    />
                  </Field>
                  <Field label="Confirm new password" icon={FiLock}>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClass}
                      placeholder="Repeat new password"
                      autoComplete="new-password"
                      required
                    />
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="inline-flex items-center gap-2 rounded-full border border-[#c9b8dd]/60 bg-gradient-to-r from-[#F3EDFA] to-[#E4D9F0] dark:from-[#3a3047] dark:to-[#2d2438] px-6 py-2.5 text-sm font-semibold text-[#6b4f8c] dark:text-[#cbb7e8] transition-all duration-300 hover:shadow-[0_4px_14px_rgba(107,79,140,0.2)] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {savingPassword ? (
                    <><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Updating...</>
                  ) : (
                    <><FiLock size={14} /> Update password</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
