import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'

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
    <div className="relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center overflow-hidden px-4 py-8">
      {/* decorative circles removed for cleaner auth pages */}

      <div className="relative w-full max-w-md">
        <div className="rounded-[28px] border border-black/6 bg-white/95 p-8 shadow-[0_30px_80px_rgba(62,46,26,0.08)] backdrop-blur-lg md:p-10">
          <div className="mb-6 text-center">
            <span className="mx-auto inline-flex rounded-full border border-[#e7d3c3] bg-[#fff4ee] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#a15a22]">
              Join Story Store
            </span>
            <h2 className="mt-4 text-3xl text-[#26231f]">Create account</h2>
            <p className="mt-3 text-sm leading-6 text-[#6d6a63]">Set up your profile and start saving stories in one place.</p>
          </div>

          {error && (
            <p className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
              {error}
            </p>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7b7167]">Username</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Your display name"
                className="w-full rounded-full border border-black/8 bg-[#fbfaf7] px-5 py-3 text-[#3a3a3a] outline-none transition-shadow duration-200 placeholder:text-[#a7a29a] focus:border-transparent focus:ring-2 focus:ring-[#C2D099]/35 focus:shadow-[0_8px_30px_rgba(194,208,153,0.16)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7b7167]">Email</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                className="w-full rounded-full border border-black/8 bg-[#fbfaf7] px-5 py-3 text-[#3a3a3a] outline-none transition-shadow duration-200 placeholder:text-[#a7a29a] focus:border-transparent focus:ring-2 focus:ring-[#E06B80]/30 focus:shadow-[0_8px_30px_rgba(224,107,128,0.12)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7b7167]">Password</label>
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a password"
                type="password"
                className="w-full rounded-full border border-black/8 bg-[#fbfaf7] px-5 py-3 text-[#3a3a3a] outline-none transition-shadow duration-200 placeholder:text-[#a7a29a] focus:border-transparent focus:ring-2 focus:ring-[#E06B80]/30 focus:shadow-[0_8px_30px_rgba(224,107,128,0.12)]"
              />
            </div>

            <button
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
    </div>
  )
}
