import React, { useState } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'
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
      <div className="rounded-2xl border border-l-4 border-l-[#e07a5f] border-[#eccdc8] dark:border-red-900/40 bg-gradient-to-r from-[#fff6f4] to-[#fef0ed] dark:from-red-950/20 dark:to-red-950/10 p-5 shadow-[0_10px_28px_rgba(153,77,70,0.05)] transition-shadow hover:shadow-[0_14px_36px_rgba(153,77,70,0.1)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fce4e4] text-[#b45f69] dark:bg-[#4a2430] dark:text-[#e8949c]">
              <FiAlertTriangle size={20} />
            </span>
            <div>
              <p className="font-semibold text-sm text-[#8C3838] dark:text-red-300">Delete account</p>
              <p className="text-xs text-[#8C3838]/70 dark:text-red-400/70 mt-0.5">
                Permanently remove your account and all data
              </p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="rounded-full bg-gradient-to-r from-[#c97870] to-[#b96861] px-5 py-2 text-sm font-semibold text-white transition hover:from-[#b96861] hover:to-[#a85c55] shadow-sm hover:shadow-md dark:from-[#b06b66] dark:to-[#9f5e59] dark:hover:from-[#a5615b] dark:hover:to-[#8e544f]"
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
            className="w-full max-w-md overflow-hidden rounded-[28px] border border-red-100 dark:border-red-900/50 bg-white shadow-[0_28px_80px_rgba(0,0,0,0.2)] dark:bg-[#1f1b22]"
          >
            <div className="relative bg-gradient-to-br from-[#fff0ed] to-[#fce4e4] px-6 pt-6 pb-8 dark:from-[#3a1a1a] dark:to-[#2d1520]">
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#e07a5f]/15 blur-xl" />
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fce4e4] text-[#b45f69] shadow-sm dark:bg-[#4a2430] dark:text-[#e8949c]">
                  <FiAlertTriangle size={20} />
                </span>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#26231f] dark:text-[#f0eaf3]">Delete account</h3>
                  <p className="text-xs text-[#8b6b52] dark:text-[#c8b8d2]">This action is permanent</p>
                </div>
              </div>
            </div>

            <div className="px-6 pt-5 pb-6">
              <p className="text-sm leading-6 text-[#5d584f] dark:text-[#c8bfcf]">
                This will permanently delete <span className="font-bold text-[#26231f] dark:text-white">{user?.username}</span>, all stories,
                chapters and activity. This action cannot be undone.
              </p>

              <div className="mt-5 rounded-xl border border-[#eccdc8] dark:border-red-900/40 bg-[#fff8f7] dark:bg-red-950/15 p-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#8b6b52] dark:text-gray-400">Confirm with password</span>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#a89f92] dark:text-gray-500">
                      <FiAlertTriangle size={14} />
                    </span>
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
                      className={`${inputClass} !pl-9`}
                    />
                  </div>
                </label>
              </div>

              {error && (
                <p className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-[#b91c1c] dark:border-red-800/60 dark:bg-red-950/30 dark:text-red-300">
                  <FiAlertTriangle size={14} className="shrink-0" />
                  {error}
                </p>
              )}

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full bg-[#e6ebdf] px-5 py-2.5 text-sm font-semibold text-[#3a3a3a] transition-all duration-200 hover:bg-[#d9e1cf] hover:-translate-y-0.5 dark:bg-[#36313e] dark:text-[#e2d7e8] dark:hover:bg-[#433d4d]"
                >
                  Keep my account
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#c97870] to-[#b96861] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(201,120,112,0.3)] transition-all duration-300 hover:from-[#b96861] hover:to-[#a85c55] hover:shadow-[0_4px_14px_rgba(201,120,112,0.4)] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none dark:from-[#b06b66] dark:to-[#9f5e59] dark:hover:from-[#a5615b] dark:hover:to-[#8e544f]"
                >
                  {deleting ? (
                    <><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Deleting...</>
                  ) : (
                    <><FiAlertTriangle size={14} /> Delete my account</>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
