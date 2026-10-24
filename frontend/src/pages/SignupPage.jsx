import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { FiLock, FiMail, FiUser } from 'react-icons/fi'

const toErrorMessage = (detail, fallback) => {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || item?.message || item?.detail || '')
      .filter(Boolean)
      .join(', ') || fallback
  }
  if (detail && typeof detail === 'object') {
    return detail.message || detail.detail || fallback
  }
  return fallback
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const { register } = useContext(AuthContext)
  const { notify } = useNotification()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register({ email, password, username })
      notify('Account created. Please login.', 'success')
      navigate('/login')
    } catch (err) {
      const message = toErrorMessage(err?.response?.data?.detail || err?.response?.data, 'Registration failed')
      setError(message)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center px-4 bg-[#fbf8f2] [color-scheme:light]">
      <div className="relative w-full max-w-md -translate-y-6 rounded-[28px] border border-black/8 bg-white/65 p-8">
        <h2 className="text-center font-serif text-3xl text-[#26231f]">Create account</h2>
        <p className="mt-3 text-center text-sm leading-6 text-[#6d6a63]">Set up your profile and start saving stories in one place.</p>

          {error && (
            <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
              {error}
            </p>
          )}

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <label htmlFor="signup-username" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7b7167]"><FiUser size={14} /> Username</label>
              <input
                id="signup-username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Your display name"
                className="w-full rounded-full border border-black/8 bg-[#fbfaf7] px-5 py-3 text-[#3a3a3a] outline-none transition-shadow duration-200 placeholder:text-[#a7a29a] focus:border-transparent focus:ring-2 focus:ring-[#C2D099]/35 focus:shadow-[0_8px_30px_rgba(194,208,153,0.16)]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-email" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7b7167]"><FiMail size={14} /> Email</label>
              <input
                id="signup-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                className="w-full rounded-full border border-black/8 bg-[#fbfaf7] px-5 py-3 text-[#3a3a3a] outline-none transition-shadow duration-200 placeholder:text-[#a7a29a] focus:border-transparent focus:ring-2 focus:ring-[#E06B80]/30 focus:shadow-[0_8px_30px_rgba(224,107,128,0.12)]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-password" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7b7167]"><FiLock size={14} /> Password</label>
              <input
                id="signup-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a password"
                type="password"
                className="w-full rounded-full border border-black/8 bg-[#fbfaf7] px-5 py-3 text-[#3a3a3a] outline-none transition-shadow duration-200 placeholder:text-[#a7a29a] focus:border-transparent focus:ring-2 focus:ring-[#E06B80]/30 focus:shadow-[0_8px_30px_rgba(224,107,128,0.12)]"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-[#E06B80] to-[#C2D099] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_30px_rgba(192,107,118,0.14)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(192,107,118,0.18)]"
            >
              Create account
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#6d6a63]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#3a3a3a] underline underline-offset-4">
              Log in
            </Link>
          </p>
          </div>
    </div>
  )
}
