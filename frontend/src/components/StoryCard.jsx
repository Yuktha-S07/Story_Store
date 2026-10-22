import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { useNotification } from '../context/NotificationContext'
import { buildStoryCoverAlt, buildStoryCoverUrl, buildStoryFallbackUrl } from '../utils/storyCover'
import { buildAvatarUrl } from '../utils/avatar'
import { FiBookOpen, FiHeart, FiTrash2 } from 'react-icons/fi'
import CoverPreview from './CoverPreview'

export default function StoryCard({ story, compact = false, bookmarkStyle = false, bookmarked = false, onUnsave }) {
  const { user } = useContext(AuthContext)
  const { notify } = useNotification()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [liked, setLiked] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)
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
  const avatarUrl = buildAvatarUrl(story.author?.avatar_url || story.avatar_url)
  const isCompleted = Boolean(story.is_completed)

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
      className={`surface story-card-surface group overflow-hidden p-0 transition duration-300 ${bookmarkStyle ? 'rounded-[18px] border-[#eaded7] shadow-[0_8px_24px_rgba(79,53,46,0.08)] hover:-translate-y-1 hover:border-[#d8b7a8] hover:shadow-[0_16px_30px_rgba(79,53,46,0.13)] dark:border-[#4b3b5d] dark:hover:border-[#8a5f73]' : 'rounded-[24px] border-[#d9e6e2] shadow-[0_10px_28px_rgba(51,88,80,0.07)] hover:-translate-y-1 hover:shadow-2xl dark:border-[#3b3047] dark:shadow-[0_10px_28px_rgba(0,0,0,0.3)]'} ${compact ? 'h-full' : 'h-full'}`}
    >
      <div className="flex h-full flex-col">
        <CoverPreview
          src={coverSrc}
          fallbackSrc={buildStoryFallbackUrl(story)}
          alt={coverAlt}
          title={story.title}
          className={`flex-shrink-0 bg-[#f0ece4] dark:bg-gray-700 ${bookmarkStyle ? 'aspect-video rounded-t-[18px]' : 'h-48 rounded-t-[24px]'}`}
          imageClassName="object-center"
        />

        <div className={`flex flex-1 flex-col justify-between ${bookmarkStyle ? 'p-4' : 'p-4'}`}>
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="story-card-genre inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm">
                <FiBookOpen className="h-3.5 w-3.5" />
                {genreText}
              </span>
              <span className={`story-card-status ${isCompleted ? 'is-completed' : 'is-ongoing'} inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm`}>
                <span className="story-card-status-dot h-1.5 w-1.5 rounded-full" aria-hidden="true" />
                {isCompleted ? 'Completed' : 'Ongoing'}
              </span>
            </div>

            <div className="mt-4 flex-1 space-y-3">
              <Link to={`/stories/${storyId}`} className={`${compact ? 'block text-base' : 'block text-xl'} font-semibold text-[#332a2b] transition group-hover:text-[#9a514b] dark:text-gray-100 dark:group-hover:text-[#f2b9ab]`}>
                {story.title}
              </Link>

              <p className="font-serif text-sm italic leading-6 text-[#756765] dark:text-[#d8cedc]" style={{ display: '-webkit-box', WebkitLineClamp: compact ? 2 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {story.description}
              </p>

              <div className="flex min-w-0 max-w-full items-center gap-2.5 text-sm text-[#8b6b52] dark:text-[#e6b7a1]">
                {avatarUrl && !avatarFailed ? (
                  <img
                    src={avatarUrl}
                    alt={`${authorText}'s profile picture`}
                    onError={() => setAvatarFailed(true)}
                    className="h-9 w-9 shrink-0 rounded-full border-2 border-white object-cover shadow-[0_3px_8px_rgba(217,111,82,0.22)] dark:border-[#211a29]"
                  />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#f3b39f] to-[#d96f52] text-xs font-bold text-white shadow-[0_3px_8px_rgba(217,111,82,0.22)] dark:border-[#211a29] dark:from-[#d98472] dark:to-[#a94f62]" aria-hidden="true">
                    {authorInitials}
                  </span>
                )}
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

          <div className={`${compact ? 'mt-4' : 'mt-3 sm:mt-5'} flex flex-wrap items-center gap-2 border-t border-[#eee3dd] pt-3 dark:border-white/10`}>
            <Link
              to={`/stories/${storyId}`}
              className={`story-action story-action-read inline-flex min-h-10 items-center rounded-lg px-3 py-2 text-xs font-semibold sm:text-sm ${bookmarkStyle ? 'story-action-read-warm' : ''}`}
            >
              Read
            </Link>

            {bookmarked && onUnsave ? (
              <button
                onClick={() => onUnsave(storyId)}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${bookmarkStyle ? 'border border-[#e2bbb0] bg-transparent text-[#8d4e4b] hover:bg-[#fff1eb] dark:border-[#8a5f73] dark:text-[#f2b9ab] dark:hover:bg-[#3a2733]' : 'bg-[#D88484] text-[#3a2626] hover:bg-[#c68585]'}`}
              >
                {bookmarkStyle && <FiTrash2 className="h-4 w-4" aria-hidden="true" />}
                Unsave
              </button>
            ) : (
              <button
                onClick={handleSave}
                className={`story-action story-action-save inline-flex min-h-10 items-center rounded-md px-2.5 py-2 text-xs font-semibold sm:px-3 sm:text-sm ${saved ? 'is-saved' : ''}`}
              >
                {saved ? 'Saved' : 'Save'}
              </button>
            )}

            <button
              onClick={async () => {
                if (!user) {
                  navigate('/login')
                  return
                }
                if (typeof storyId === 'string' && (storyId.startsWith('sample-') || storyId.startsWith('featured-'))) {
                  notify('Sample stories cannot be liked. Create your own story to like it!', 'info')
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
              className={`ml-auto inline-flex min-h-10 min-w-10 items-center justify-center rounded-full p-2 transition ${liked ? 'bg-[#AF3E3E] text-white' : 'border border-[#AF3E3E] text-[#AF3E3E] hover:bg-[#fff1f1]'}`}
            >
              {liked ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.657 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.657l-6.828-6.828a4 4 0 010-5.657z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
