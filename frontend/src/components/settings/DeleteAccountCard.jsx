import React, { useState } from 'react'
import api from '../../services/api'
import { inputClass } from '../SettingsUI'

export default function DeleteAccountCard({ user, onDeleted, onError }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const openModal = () => {
    setPassword('')
    setError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    if (deleting) return
    setModalOpen(false)
  }

  const handleDeleteAccount = async (e) => {
    e.preventDefault()
    if (!password) {
      setError('Please enter your password.')
      return
    }
    setDeleting(true)
    setError('')
    try {
      await api.delete(`/api/users/${user._id}`, { data: { password } })
      setModalOpen(false)
      onDeleted()
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Error deleting account. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-[#eccdc8] dark:border-red-900/40 bg-[#fff6f4] dark:bg-red-950/20 p-5 shadow-[0_10px_28px_rgba(153,77,70,0.05)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm text-[#8C3838] dark:text-red-300">Delete account</p>
            <p className="text-xs text-[#8C3838]/70 dark:text-red-400/70 mt-0.5">
              Permanently remove your account and all data
            </p>
          </div>
          <button
            onClick={openModal}
            className="rounded-full bg-[#c97870] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#b96861] shadow-sm hover:shadow-md"
          >
            Delete
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4" onClick={closeModal}>
          <form
            onSubmit={handleDeleteAccount}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_28px_80px_rgba(0,0,0,0.2)]"
          >
            <h3 className="font-serif text-2xl text-[#26231f]">Delete account</h3>
            <p className="mt-3 text-sm leading-6 text-[#5d584f]">
              This will permanently delete <span className="font-semibold">{user?.username}</span>, all stories,
              chapters and activity. This action cannot be undone. Enter your password to confirm.
            </p>

            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="Your password"
              autoComplete="current-password"
              autoFocus
              className={`${inputClass} mt-5`}
            />

            {error && (
              <p className="mt-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-semibold text-[#b91c1c]">
                {error}
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full bg-[#e6ebdf] px-5 py-2.5 text-sm font-semibold text-[#3a3a3a] transition hover:bg-[#d9e1cf]"
              >
                Keep my account
              </button>
              <button
                type="submit"
                disabled={deleting}
                className="rounded-full bg-gradient-to-r from-red-500 to-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:from-red-600 hover:to-red-700 disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete my account'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
