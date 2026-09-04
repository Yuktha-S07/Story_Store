import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { useNotification } from '../context/NotificationContext'
import { buildStoryCoverAlt, buildStoryCoverUrl, buildStoryFallbackUrl } from '../utils/storyCover'
import { FiBookOpen, FiHeart, FiUser } from 'react-icons/fi'

export default function StoryCard({ story, compact = false }) {
  const { user } = useContext(AuthContext)
  const { notify } = useNotification()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [liked, setLiked] = useState(false)
  const genreText = story.genre || 'Unknown'
  const authorText = story.author?.username || story.username || 'Unknown author'
  const authorInitials = authorText
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(name => name[0].toUpperCase())
    .join('') || '?'
  const storyId = story._id || story.id
  const coverSrc = buildStoryCoverUrl(story)
  const coverAlt = buildStoryCoverAlt(story)

  const handleSave = async () => {
    if (!user) {
      navigate('/login')
      return;
    }
    if (typeof storyId === 'string' && (storyId.startsWith('sample-') || storyId.startsWith('featured-'))) {
      notify('Sample stories cannot be bookmarked. Create your own story to save it!', 'info')
      return
    }
    try {
      const res = await api.get(`/api/stories/${storyId}`)
      const storyDetail = res.data
      const chapterId = storyDetail?.chapters?.[0]?._id || storyDetail?.chapters?.[0]?.id
      if (!chapterId) {
        notify('No chapter is available to bookmark yet.', 'error')
        return
      }
      await api.post(`/api/stories/${storyId}/chapters/${chapterId}/bookmark`)
      setSaved(true)
      notify('Bookmark saved.', 'success')
    } catch (err) {
      console.error(err)
      if (err?.response?.status === 401 || err?.response?.status === 403) return
      const detail = err?.response?.data?.detail
      notify(typeof detail === 'string' ? detail : 'Failed to save bookmark.', 'error')
    }
  }

  return (
    <div
      className={`surface group overflow-hidden rounded-[24px] border border-[#d9e6e2] p-0 shadow-[0_10px_28px_rgba(51,88,80,0.07)] transition duration-300 bg-[#FBF9F1]! dark:border-[#3b3047] dark:bg-[#211a29]! dark:shadow-[0_10px_28px_rgba(0,0,0,0.3)] ${compact ? 'h-full hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(51,88,80,0.13)]' : 'h-full hover:-translate-y-1 hover:shadow-2xl'}`}
    >
      <div className="flex h-full flex-col">
        <div className="flex-shrink-0 h-48 w-full overflow-hidden rounded-t-[24px] bg-[#f0ece4] dark:bg-gray-700">
          <img
            src={coverSrc}
            alt={coverAlt}
            loading="lazy"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = buildStoryFallbackUrl(story) }}
            className="w-full h-full object-cover object-center transition duration-300 group-hover:scale-[1.02]"
          />
        </div>

        <div className={`flex flex-1 flex-col justify-between ${compact ? 'p-4' : 'p-4'}`}>
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#d7e8df] bg-[#eff8f3] px-3 py-1 text-xs font-semibold text-[#397356] shadow-sm dark:border-[#31594f] dark:bg-[#1d3830] dark:text-[#9bd4bb]">
                <FiBookOpen className="h-3.5 w-3.5" />
                {genreText}
              </span>
            </div>

            <div className="mt-4 flex-1 space-y-3">
              <Link to={`/stories/${storyId}`} className={`${compact ? 'block text-xs' : 'block text-xl'} font-semibold text-slate-900 transition group-hover:text-[#4f766f] dark:text-gray-100 dark:group-hover:text-[#8fc4b0]`}>
                {story.title}
              </Link>

              <p className="text-sm leading-6 text-slate-600 dark:text-gray-300" style={{ display: '-webkit-box', WebkitLineClamp: compact ? 1 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {story.description}
              </p>

              <div className="flex min-w-0 max-w-full items-center gap-2 text-xs text-[#8b6b52] dark:text-[#e6b7a1]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#f3b39f] to-[#d96f52] text-[10px] font-bold text-white shadow-[0_3px_8px_rgba(217,111,82,0.22)] dark:border-[#211a29] dark:from-[#d98472] dark:to-[#a94f62]" aria-hidden="true">
                  {authorInitials}
                </span>
                <span className="min-w-0 truncate">
                  <span className="mr-1 font-medium text-[#a08a7b] dark:text-[#cba99c]">By</span>
                {story.author?._id || story.user_id ? (
                  <Link to={`/profile/${story.author?._id || story.user_id}`} className="font-semibold text-[#b45f4d] decoration-[#f0b19d] decoration-2 underline-offset-2 transition hover:text-[#E87B5D] hover:underline dark:text-[#ffb19b] dark:decoration-[#a95f5f] dark:hover:text-[#ffd0bf]">
                    {authorText}
                  </Link>
                ) : (
                  <span className="font-semibold text-[#b45f4d] dark:text-[#ffb19b]">{authorText}</span>
                )}
                </span>
              </div>
            </div>
          </div>

          <div className={`${compact ? 'mt-0' : 'mt-3 sm:mt-5'} flex flex-wrap items-center gap-1.5 sm:gap-2 border-t border-black/5 pt-1 dark:border-white/10`}>
            <Link
              to={`/stories/${storyId}`}
              className={`rounded-md bg-[#BDA6CE] px-1.5 sm:px-2 ${compact ? 'py-0.5 text-[10px] sm:text-xs' : 'py-1.5 sm:py-2 text-xs sm:text-sm'} font-semibold text-[#072935] transition hover:bg-[#aa93b6] dark:bg-[#6a4b85] dark:text-white dark:hover:bg-[#7c5a99]`}
            >
              Read
            </Link>

            <button
              onClick={handleSave}
              className={`rounded-md bg-[#DC9B9B] px-1.5 sm:px-2 ${compact ? 'py-0.5 text-[10px] sm:text-xs' : 'py-1.5 sm:py-2 text-xs sm:text-sm'} font-semibold text-[#3a2626] transition hover:bg-[#c68585]`}
            >
              {saved ? 'Saved' : 'Save'}
            </button>

            <button
              onClick={async () => {
                if (!user) {
                  navigate('/login')
                  return
                }
                setLiked(prev => !prev)
                try {
                  if (!liked) {
                    await api.post(`/api/stories/${storyId}/like`)
                    notify('Story liked.', 'success')
                  } else {
                    await api.delete(`/api/stories/${storyId}/like`)
                    notify('Like removed.', 'info')
                  }
                } catch (err) {
                  setLiked(prev => !prev)
                  console.error(err)
                  notify('Failed to update like.', 'error')
                }
              }}
              aria-label={liked ? 'Unlike' : 'Like'}
              className={`ml-auto inline-flex items-center justify-center rounded-full p-1.5 sm:p-2 transition ${liked ? 'bg-[#AF3E3E] text-white' : 'border border-[#AF3E3E] text-[#AF3E3E] hover:bg-[#fff1f1]'}`}
            >
              {liked ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.657 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.657l-6.828-6.828a4 4 0 010-5.657z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.8 7.6a5.5 5.5 0 00-7.8 0L12 8.6l-1-1a5.5 5.5 0 10-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 000-7.8z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
