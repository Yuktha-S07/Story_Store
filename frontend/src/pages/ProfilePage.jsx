import React, { useContext, useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiMessageCircle, FiEdit3 } from 'react-icons/fi'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { useNotification } from '../context/NotificationContext'
import { buildStoryCoverAlt, buildStoryCoverUrl, buildStoryFallbackUrl } from '../utils/storyCover'
import { buildAvatarUrl } from '../utils/avatar'
import BackButton from '../components/BackButton'

export default function ProfilePage() {
  const { userId } = useParams()
  const { user: authUser } = useContext(AuthContext)
  const { notify } = useNotification()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [savingFollow, setSavingFollow] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const [coverPreview, setCoverPreview] = useState(null)

  const isOwnProfile = Boolean(authUser && String(authUser._id) === String(userId))

  useEffect(() => {
    setAvatarFailed(false)
  }, [userId])

  useEffect(() => {
    if (!coverPreview) return undefined
    const handleEscape = (event) => {
      if (event.key === 'Escape') setCoverPreview(null)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [coverPreview])

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
    const fetchStories = async () => {
      try {
        const res = await api.get(`/api/stories?author_id=${encodeURIComponent(userId)}`)
        setStories(res.data || [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchStories()
  }, [userId, isOwnProfile])

  useEffect(() => {
    const checkFollowing = async () => {
      if (!authUser || isOwnProfile) return
      try {
        const res = await api.get('/api/following')
        const following = Array.isArray(res.data) ? res.data : []
        setIsFollowing(following.some(item => String(item.following_id) === String(userId)))
      } catch (err) {
        console.error(err)
        setIsFollowing(false)
      }
    }
    checkFollowing()
  }, [userId, authUser, isOwnProfile])

  const toggleFollow = async () => {
    if (!authUser) return
    try {
      setSavingFollow(true)
      if (isFollowing) {
        await api.delete(`/api/users/${profile._id}/follow`)
        setIsFollowing(false)
        setProfile(prev => prev ? { ...prev, followers_count: Math.max(0, (prev.followers_count ?? 0) - 1) } : prev)
        notify('Unfollowed.', 'info')
      } else {
        await api.post(`/api/users/${profile._id}/follow`)
        setIsFollowing(true)
        setProfile(prev => prev ? { ...prev, followers_count: (prev.followers_count ?? 0) + 1 } : prev)
        notify('Following.', 'success')
      }
    } catch (err) {
      console.error(err)
      notify('Failed to update follow state.', 'error')
    } finally {
      setSavingFollow(false)
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

  const renderAvatar = (sizeClass, letterClass) => (
    profile.avatar_url && !avatarFailed ? (
      <img
        src={buildAvatarUrl(profile.avatar_url)}
        alt={`${profile.username}'s profile picture`}
        onError={() => setAvatarFailed(true)}
        className={`${sizeClass} shrink-0 rounded-full object-cover shadow-md ring-8 ring-white/40`}
      />
    ) : (
      <div className={`${sizeClass} ${letterClass} ${avatarColorClass} flex shrink-0 items-center justify-center rounded-full font-bold shadow-md ring-8 ring-white/40`}>
        {avatarLetter}
      </div>
    )
  )

  const joinedText = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : '...'

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-0 pb-10 font-sans md:space-y-10">
      <div className="flex items-center justify-between">
        <BackButton />
        <span className="rounded-full border border-[#d9c7b4] bg-[#fffaf4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b6b52] dark:border-[#4b3b5d] dark:bg-[#211a29] dark:text-[#d3c2df]">Profile</span>
      </div>

      <section className="pb-2">
        <div className="flex flex-col items-start gap-7 sm:flex-row sm:items-center">
          {renderAvatar('h-28 w-28 md:h-32 md:w-32', 'text-4xl md:text-5xl')}
          <div className="flex-1 min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b06f7f]">Story Store member</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="break-words font-serif text-3xl font-semibold tracking-tight text-[#26231f] dark:text-gray-100 md:text-4xl">
                {profile.username}
              </h1>
              {authUser && !isOwnProfile && (
                <>
                  <button
                    onClick={toggleFollow}
                    disabled={savingFollow}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${isFollowing ? 'border-[#d9c7b4] bg-[#fffaf4] text-[#5d584f] hover:border-[#E87B5D] hover:text-[#c45e43] dark:border-[#4b3b5d] dark:bg-[#211a29] dark:text-[#d3c2df]' : 'bg-gradient-to-r from-[#BDA6CE] to-[#b8a1c8] text-white shadow-sm hover:shadow-md'}`}
                  >
                    {savingFollow ? 'Updating...' : isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                  <button
                    onClick={() => navigate(`/messages/${profile._id}`)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#BDA6CE] bg-white px-4 py-2.5 text-sm font-semibold text-[#7a5a9a] transition hover:bg-[#f7f1fb] hover:border-[#a98cc4] dark:border-[#6a4b85] dark:bg-[#1d1824] dark:text-[#cbb9d9] dark:hover:bg-[#261e30] dark:hover:border-[#8a5f9e]"
                  >
                    <FiMessageCircle />
                    Message
                  </button>
                </>
              )}
              {authUser && isOwnProfile && (
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-2 rounded-full border border-[#BDA6CE] bg-white px-4 py-2.5 text-sm font-semibold text-[#7a5a9a] transition hover:bg-[#f7f1fb] hover:border-[#a98cc4] dark:border-[#6a4b85] dark:bg-[#1d1824] dark:text-[#cbb9d9] dark:hover:bg-[#261e30] dark:hover:border-[#8a5f9e]"
                >
                  <FiEdit3 />
                  Edit Profile
                </Link>
              )}
            </div>
            {!isOwnProfile && (
              <p className="mt-2 text-sm text-[#5d584f] dark:text-gray-400">
                {profile.followers_count ?? 0} followers
              </p>
            )}
            {profile.bio && (
              <p className="text-[#5d584f] dark:text-gray-400 mt-2 text-sm leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            )}
            <p className="text-xs text-[#5d584f] dark:text-gray-500 mt-2">
              Member since {joinedText}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#d9ebe4] bg-[#f2faf6] px-4 py-3 text-center dark:border-[#3b3047] dark:bg-[#1d1824]">
            <p className="font-serif text-3xl font-semibold text-[#29463d] dark:text-[#9fd7c1]">{profile.story_count ?? 0}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#628477] dark:text-[#8fb9a5]">Stories</p>
          </div>
          <div className="rounded-2xl border border-[#f1dcc9] bg-[#fff7ed] px-4 py-3 text-center dark:border-[#4b3b5d] dark:bg-[#211a29]">
            <p className="font-serif text-3xl font-semibold text-[#8c4f2d] dark:text-[#e8b98e]">{profile.followers_count ?? 0}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#a56c43] dark:text-[#cf9d6e]">Followers</p>
          </div>
          <div className="rounded-2xl border border-[#ddd8ec] bg-[#f7f5fc] px-4 py-3 text-center dark:border-[#6a4b85] dark:bg-[#261e30]">
            <p className="font-serif text-3xl font-semibold text-[#514970] dark:text-[#c4b5fd]">{profile.following_count ?? 0}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#776d9a] dark:text-[#a99bc9]">Following</p>
          </div>
        </div>
      </section>

      <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b06f7f]">{isOwnProfile ? 'Your collection' : "Stories"}</p>
              <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-[#26231f] dark:text-gray-100">
                {isOwnProfile ? 'My Stories' : `${profile.username}'s Stories`}
              </h2>
            </div>
            <span className="rounded-full border border-[#d9c7b4] bg-[#fffaf4] px-3 py-1.5 text-xs font-semibold text-[#8b6b52] dark:border-[#4b3b5d] dark:bg-[#211a29] dark:text-[#d3c2df]">
              {stories.length} {stories.length === 1 ? 'story' : 'stories'}
            </span>
          </div>

          {stories.length === 0 ? (
            <div className="border-y border-dashed border-[#d9d2c6] py-10 text-center md:py-14 dark:border-[#3b3047]">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#f0ece4] dark:bg-gray-700 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-[#5d584f] dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              {isOwnProfile ? (
                <>
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
                </>
              ) : (
                <p className="text-[#5d584f] dark:text-gray-400 mb-5 text-sm">No stories published yet.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {isOwnProfile && (
                <Link
                  to="/write"
                  className="group flex min-h-[250px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d9c7b4] bg-[#fffaf4] p-6 text-center transition hover:-translate-y-1 hover:border-[#E87B5D] hover:bg-[#fff7f1] hover:shadow-[0_16px_35px_rgba(73,48,20,0.1)] dark:border-[#4b3b5d] dark:bg-[#211a29] dark:hover:border-[#8a5f9e] dark:hover:bg-[#261e30]"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#d9c7b4] text-3xl font-light text-[#9b8877] transition group-hover:border-[#E87B5D] group-hover:text-[#c45e43] dark:border-[#5a4a6e] dark:text-[#b6a3c4] dark:group-hover:border-[#8a5f9e] dark:group-hover:text-[#cbb9d9]">
                    +
                  </span>
                  <span className="mt-4 font-serif text-base font-semibold text-[#4b4a48] dark:text-[#eadff1]">Create a new story</span>
                  <span className="mt-1 text-xs text-[#817970] dark:text-[#9f8caf]">Start writing something memorable</span>
                </Link>
              )}
              {stories.map((s) => (
                <article
                  key={s._id}
                  className="profile-story-card group flex h-full flex-col overflow-hidden rounded-[24px] border border-[#dfd2c7] bg-[#fffdfa] shadow-[0_12px_30px_rgba(73,48,20,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#d3b4a3] hover:shadow-[0_18px_38px_rgba(73,48,20,0.14)] dark:border-[#3b3047] dark:bg-[#1d1824] dark:hover:border-[#6d587d]"
                >
                  <button
                    type="button"
                    onClick={() => setCoverPreview({ src: buildStoryCoverUrl(s), alt: buildStoryCoverAlt(s), title: s.title })}
                    className="group/cover relative block aspect-[16/9] w-full overflow-hidden bg-[#f0ece4] text-left dark:bg-gray-700"
                    aria-label={`View cover for ${s.title}`}
                  >
                    <img
                      src={buildStoryCoverUrl(s)}
                      alt={buildStoryCoverAlt(s)}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = buildStoryFallbackUrl(s) }}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover/cover:scale-105"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-[#211a29]/0 text-sm font-semibold text-white opacity-0 transition group-hover/cover:bg-[#211a29]/45 group-hover/cover:opacity-100">
                      View Cover
                    </span>
                  </button>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-full border border-[#b8ddd5] bg-[#B4E4D6] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#287568] dark:border-[#34776d] dark:bg-[#1d3d39] dark:text-[#9bd8ca]">
                        {s.genre || 'Story'}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                        s.status === 'published'
                          ? 'bg-[#e1f2e8] text-[#397356] dark:bg-[#1d3830] dark:text-[#9bd4bb]'
                          : 'bg-[#fff0d8] text-[#9b6728] dark:bg-[#3a2f1d] dark:text-[#f2cf9b]'
                      }`}>
                        {s.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <Link to={`/stories/${s._id}`} className="font-serif text-xl font-semibold leading-tight text-[#292535] transition-colors hover:text-[#9a514b] dark:text-gray-100 dark:hover:text-[#f2b9ab]">
                      {s.title}
                    </Link>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#756765] dark:text-[#c8b8d2]">
                      {s.description || 'A new story waiting to be discovered.'}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#eee3dd] pt-4 dark:border-white/10">
                      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#a08a7b] dark:text-[#cba99c]">
                        {s.chapters?.length || 0} {s.chapters?.length === 1 ? 'chapter' : 'chapters'}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-[#B4E4D6] px-3 py-1.5 text-xs font-bold text-[#287568] transition group-hover:bg-[#8fd1bf] dark:bg-[#1d3d39] dark:text-[#9bd8ca]">
                        Read story
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
      </section>
      {coverPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#211a29]/80 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setCoverPreview(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cover-preview-title"
            className="relative max-h-[92vh] max-w-[min(92vw,42rem)] overflow-hidden rounded-[24px] border border-white/20 bg-[#fffdfa] p-3 shadow-2xl dark:bg-[#1d1824]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between gap-4 px-2">
              <h2 id="cover-preview-title" className="font-serif text-lg font-semibold text-[#292535] dark:text-gray-100">
                View Cover
              </h2>
              <button
                type="button"
                onClick={() => setCoverPreview(null)}
                className="rounded-full px-3 py-1 text-sm font-semibold text-[#756765] transition hover:bg-[#f1e8e2] hover:text-[#292535] dark:text-[#c8b8d2] dark:hover:bg-[#302745] dark:hover:text-white"
                aria-label="Close cover preview"
              >
                Close
              </button>
            </div>
            <img
              src={coverPreview.src}
              alt={coverPreview.alt}
              className="max-h-[calc(92vh-4.5rem)] w-full rounded-[16px] object-contain"
            />
            <p className="px-2 pt-2 text-center text-sm font-semibold text-[#756765] dark:text-[#c8b8d2]">{coverPreview.title}</p>
          </div>
        </div>
      )}
    </div>
  )
}
