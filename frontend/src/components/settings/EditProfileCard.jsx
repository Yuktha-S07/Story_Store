import React, { useEffect, useRef, useState } from 'react'
import api from '../../services/api'
import { Card, Field, inputClass } from '../SettingsUI'
import { buildAvatarUrl } from '../../utils/avatar'

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
  const [avatarPreview, setAvatarPreview] = useState(buildAvatarUrl(user?.avatar_url || ''))
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
    if (!avatarFile) setAvatarPreview(buildAvatarUrl(user?.avatar_url || ''))
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
      setAvatarPreview(buildAvatarUrl(res.data.avatar_url || ''))
      notify('Profile updated successfully.', 'success')
    } catch (err) {
      const detail = err?.response?.data?.detail
      const status = err?.response?.status
      let message = ''
      if (typeof detail === 'string') {
        message = detail
      } else if (Array.isArray(detail)) {
        message = detail.map((item) => item?.msg || item?.message || '').filter(Boolean).join(', ')
      } else if (err?.response) {
        message = `Request failed (HTTP ${status})`
      } else if (err?.message) {
        message = err.message
      }
      notify(message || 'Error updating profile.', 'error')
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
    <Card tone="default">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left cursor-pointer"
        aria-expanded={open}
      >
        <div>
          <p className="font-semibold text-sm text-[#26231f] dark:text-gray-200">Edit profile</p>
          <p className="text-xs text-[#5d584f] dark:text-gray-400 mt-0.5">
            Username, email, profile picture and password.
          </p>
        </div>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="mt-5 space-y-5">
          {/* Profile picture */}
          <div className="rounded-xl border border-[#efe8dd] dark:border-gray-700 bg-white/70 dark:bg-gray-900/40 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#8b6b52] dark:text-gray-400">Profile picture</p>
            <div className="flex items-center gap-4">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile picture preview"
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow-md"
                />
              ) : (
                <div className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold shadow-md ring-2 ring-white ${avatarColorClass}`}>
                  {avatarLetter}
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full border border-[#d9c7b4] bg-white dark:bg-gray-800 px-4 py-2 text-xs font-semibold text-[#8b6b52] dark:text-gray-300 transition hover:bg-[#fffaf4] hover:shadow-sm"
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
                <p className="text-[10px] text-[#5d584f]/70 dark:text-gray-500 mt-1.5">JPG, PNG or WEBP - max 5MB</p>
              </div>
            </div>
          </div>

          {/* Username / Email / Member since */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Username">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass}
                  placeholder="Username"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Member since">
                  <input
                    type="text"
                    value={memberSince}
                    readOnly
                    disabled
                    className={`${inputClass} bg-[#f4efe7] dark:bg-gray-800/60 cursor-not-allowed`}
                  />
                </Field>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#BDA6CE] to-[#b8a1c8] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-[#b397bf] hover:to-[#ad92b9] hover:shadow-md disabled:opacity-60 disabled:hover:shadow-sm"
            >
              {savingProfile ? 'Saving...' : 'Save changes'}
            </button>
          </form>

          <div className="border-t border-[#e8e0d5] dark:border-gray-700" />

          {/* Change password sub-option */}
          <div className="rounded-xl border border-[#efe8dd] dark:border-gray-700 bg-white/70 dark:bg-gray-900/40 p-4">
            <button
              type="button"
              onClick={() => setPwOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-3 text-left cursor-pointer"
              aria-expanded={pwOpen}
            >
              <div>
                <p className="font-semibold text-sm text-[#26231f] dark:text-gray-200">Change password</p>
                <p className="text-xs text-[#5d584f] dark:text-gray-400 mt-0.5">Verify your current password to set a new one</p>
              </div>
              <ChevronIcon open={pwOpen} />
            </button>

            {pwOpen && (
              <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                <Field label="Current password">
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
                  <Field label="New password">
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
                  <Field label="Confirm new password">
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
                  className="inline-flex items-center justify-center rounded-full border border-[#c9b8dd]/60 bg-[linear-gradient(135deg,#F3EDFA_0%,#E4D9F0_100%)] dark:bg-[linear-gradient(135deg,#3a3047_0%,#2d2438_100%)] px-6 py-2.5 text-sm font-semibold text-[#6b4f8c] dark:text-[#cbb7e8] transition hover:shadow-md disabled:opacity-60 disabled:hover:shadow-none"
                >
                  {savingPassword ? 'Updating...' : 'Update password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
