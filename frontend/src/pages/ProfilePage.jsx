import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { useNotification } from '../context/NotificationContext'
import { buildStoryCoverAlt, buildStoryCoverUrl, buildStoryFallbackUrl } from '../utils/storyCover'

export default function ProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user: authUser, logout } = useContext(AuthContext)
  const { notify, confirmAction } = useNotification()

  const [profile, setProfile] = useState(null)
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  })

  const isOwnProfile = authUser && authUser._id === userId

  useEffect(() => {
    if (!userId) return
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/api/users/${userId}`)
        setProfile(res.data)
      } catch (err) {
        console.error(err)
        notify('Failed to load profile.', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [userId])

  useEffect(() => {
    if (!isOwnProfile) return
    const fetchStories = async () => {
      try {
        const res = await api.get('/api/stories?mine=true')
        setStories(res.data || [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchStories()
  }, [isOwnProfile])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('story-store-theme', next)
  }

  useEffect(() => {
    const saved = localStorage.getItem('story-store-theme')
    if (saved === 'dark') {
      document.documentElement.classList.add('dark')
      setTheme('dark')
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    notify('Logged out successfully.', 'info')
  }

  const handleDeleteAccount = async () => {
    const confirmed = await confirmAction({
      title: 'Delete account',
      message: 'This will permanently delete your account, all your stories, chapters, and activity. This action cannot be undone.',
      confirmText: 'Delete my account',
      cancelText: 'Keep my account',
    })
    if (!confirmed) return
    try {
      await api.delete(`/api/users/${userId}`)
      logout()
      navigate('/')
      notify('Account deleted.', 'info')
    } catch (err) {
      const detail = err?.response?.data?.detail
      notify(typeof detail === 'string' ? detail : 'Error deleting account.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-[#5d584f]">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="surface p-8 md:p-12 text-center max-w-lg mx-auto mt-12">
        <p className="text-[#5d584f] mb-4">User not found.</p>
        <Link to="/" className="btn-primary inline-block">Back to home</Link>
      </div>
    )
  }

  const avatarLetter = (profile.username || 'U')[0].toUpperCase()
  const avatarColors = [
    'bg-[#FFD5D5] text-[#8C3838]',
    'bg-[#D5E8D5] text-[#2D6B3F]',
    'bg-[#D5E0FF] text-[#2A4B8C]',
    'bg-[#F5E0D5] text-[#8C5A38]',
    'bg-[#E0D5F5] text-[#5A388C]',
    'bg-[#FFE0D5] text-[#8C5038]',
  ]
  const avatarColorClass = avatarColors[profile.username ? profile.username.length % avatarColors.length : 0]

  return (
    <div className="space-y-8 md:space-y-10 max-w-6xl mx-auto px-0">

      <section className="surface p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center font-bold text-2xl md:text-3xl shrink-0 shadow-md ${avatarColorClass}`}>
            {avatarLetter}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-[#26231f] dark:text-gray-100 break-words">
              {profile.username}
            </h1>
            <p className="text-[#5d584f] dark:text-gray-400 mt-1 text-sm md:text-base break-words">
              {profile.email}
            </p>
            {profile.bio && (
              <p className="text-[#5d584f] dark:text-gray-400 mt-2 text-sm leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            )}
            <p className="text-xs text-[#5d584f] dark:text-gray-500 mt-2">
              Member since {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '...'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mt-6 md:mt-8">
          <div className="rounded-xl border border-[#e8e0d5] bg-[#fbfaf7] dark:bg-gray-800 dark:border-gray-700 p-4 text-center">
            <p className="text-2xl md:text-3xl font-bold text-[#26231f] dark:text-gray-100">{profile.story_count ?? 0}</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5d584f] dark:text-gray-400 mt-1">Stories</p>
          </div>
          <div className="rounded-xl border border-[#e8e0d5] bg-[#fbfaf7] dark:bg-gray-800 dark:border-gray-700 p-4 text-center">
            <p className="text-2xl md:text-3xl font-bold text-[#26231f] dark:text-gray-100">{profile.followers_count ?? 0}</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5d584f] dark:text-gray-400 mt-1">Followers</p>
          </div>
          <div className="rounded-xl border border-[#e8e0d5] bg-[#fbfaf7] dark:bg-gray-800 dark:border-gray-700 p-4 text-center">
            <p className="text-2xl md:text-3xl font-bold text-[#26231f] dark:text-gray-100">{profile.following_count ?? 0}</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5d584f] dark:text-gray-400 mt-1">Following</p>
          </div>
        </div>
      </section>

      {isOwnProfile && (
        <section className="surface p-6 md:p-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl md:text-2xl font-bold text-[#26231f] dark:text-gray-100">My Stories</h2>
            <span className="text-xs font-semibold px-3 py-1.5 bg-[#f0ece4] dark:bg-gray-700 text-[#5d584f] dark:text-gray-300 rounded-full">
              {stories.length} {stories.length === 1 ? 'story' : 'stories'}
            </span>
          </div>

          {stories.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-[#d9d2c6] dark:border-gray-600 bg-[#fbfaf7] dark:bg-gray-800/50 p-10 md:p-14 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#f0ece4] dark:bg-gray-700 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-[#5d584f] dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-[#5d584f] dark:text-gray-400 mb-5 text-sm">No stories yet. Start your creative journey!</p>
              <Link
                to="/write"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#BDA6CE] to-[#b8a1c8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-[#b397bf] hover:to-[#ad92b9] hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Write your first story
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 md:gap-5">
              {stories.map((s) => (
                <Link
                  key={s._id}
                  to={`/stories/${s._id}`}
                  className="group block rounded-xl border border-[#e8e0d5] dark:border-gray-700 bg-[#FBF9F1] dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <div className="aspect-[3/2] overflow-hidden bg-[#f0ece4] dark:bg-gray-700">
                    <img
                      src={buildStoryCoverUrl(s)}
                      alt={buildStoryCoverAlt(s)}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = buildStoryFallbackUrl(s) }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm text-[#26231f] dark:text-gray-100 truncate flex-1">{s.title}</h3>
                      <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        s.status === 'published'
                          ? 'bg-[#d5e8d5] text-[#2D6B3F] dark:bg-green-900/40 dark:text-green-300'
                          : 'bg-[#f5e0b0] text-[#7a6200] dark:bg-amber-900/40 dark:text-amber-300'
                      }`}>
                        {s.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-[10px] font-medium text-[#5d584f] dark:text-gray-400 mt-1.5 uppercase tracking-wide">{s.genre || 'Uncategorized'}</p>
                    <p className="text-xs text-[#5d584f] dark:text-gray-400 mt-1.5 line-clamp-2">{s.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {isOwnProfile && (
        <section className="surface p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-[#26231f] dark:text-gray-100 mb-5">Settings</h2>

          <div className="space-y-4">
            <div className="rounded-xl border border-[#e8e0d5] dark:border-gray-700 bg-[#fbfaf7] dark:bg-gray-800/50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-[#26231f] dark:text-gray-200">Theme</p>
                  <p className="text-xs text-[#5d584f] dark:text-gray-400 mt-0.5">Switch between light and dark mode</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-colors ${
                    theme === 'dark'
                      ? 'border-[#3d405b] bg-[#3d405b]'
                      : 'border-[#e0d5c8] bg-[#e8e0d5]'
                  }`}
                  role="switch"
                  aria-checked={theme === 'dark'}
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${
                      theme === 'dark' ? 'translate-x-[1.35rem]' : 'translate-x-[0.2rem]'
                    }`}
                  >
                    {theme === 'dark' ? (
                      <svg className="w-3 h-3 text-[#3d405b]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-[#e07a5f]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    )}
                  </span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#e8e0d5] dark:border-gray-700 bg-[#fbfaf7] dark:bg-gray-800/50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-[#26231f] dark:text-gray-200">Logout</p>
                  <p className="text-xs text-[#5d584f] dark:text-gray-400 mt-0.5">Sign out of your account</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-[#E5A6AF]/50 bg-[linear-gradient(135deg,#FFF2F4_0%,#F8D7DD_100%)] dark:bg-[linear-gradient(135deg,#4a2d33_0%,#3d2026_100%)] px-5 py-2 text-sm font-semibold text-[#8C3838] dark:text-[#e8a0a0] transition hover:shadow-md"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#f0c8c0] dark:border-red-900/40 bg-[#fff5f3] dark:bg-red-950/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-[#8C3838] dark:text-red-300">Delete account</p>
                  <p className="text-xs text-[#8C3838]/70 dark:text-red-400/70 mt-0.5">Permanently remove your account and all data</p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="rounded-full bg-gradient-to-r from-red-500 to-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:from-red-600 hover:to-red-700 shadow-sm hover:shadow-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
