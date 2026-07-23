import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { useNotification } from '../context/NotificationContext'
import { buildStoryCoverAlt, buildStoryCoverUrl, buildStoryFallbackUrl } from '../utils/storyCover'

export default function StoryCard({ story, compact = false }) {
  const { user } = useContext(AuthContext)
  const { notify } = useNotification()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [liked, setLiked] = useState(false)
  const genreText = story.genre || 'Unknown'
  const authorText = story.author?.username || story.username || 'Unknown author'
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
      notify('Failed to save bookmark.', 'error')
    }
  }

  return (
    <div
      className={`surface group overflow-hidden rounded-[24px] border border-black/5 p-0 shadow-sm transition duration-300 ${compact ? 'h-full hover:shadow-md max-h-[260px]' : 'h-full hover:-translate-y-1 hover:shadow-2xl'}`}
      style={{ backgroundColor: '#FBF9F1' }}
    >
      <div className="flex h-full flex-col">
        <div className="flex-shrink-0 h-48 w-full overflow-hidden rounded-t-[24px] bg-[#f0ece4]">
          <img
            src={coverSrc}
            alt={coverAlt}
            loading="lazy"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = buildStoryFallbackUrl(story) }}
            className="w-full h-full object-cover object-center transition duration-300 group-hover:scale-[1.02]"
          />
        </div>

        <div className={`flex flex-1 flex-col justify-between ${compact ? 'p-1' : 'p-4'}`}>
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="pill shrink-0">{genreText}</span>
            </div>

            <div className={`${compact ? 'mt-0' : 'mt-4'} flex-1 space-y-3`}>
              <Link to={`/stories/${storyId}`} className={`${compact ? 'block text-xs' : 'block text-xl'} font-semibold text-slate-900 transition group-hover:text-[#4f766f]`}>
                {story.title}
              </Link>

              <p className="text-sm leading-6 text-slate-600" style={{ display: '-webkit-box', WebkitLineClamp: compact ? 1 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {story.description}
              </p>

              <p className="text-xs font-medium tracking-wide text-slate-500">By {authorText}</p>
            </div>
          </div>

          <div className={`${compact ? 'mt-0' : 'mt-3 sm:mt-5'} flex flex-wrap items-center gap-1.5 sm:gap-2 border-t border-black/5 pt-1`}>
            <Link
              to={`/stories/${storyId}`}
              className={`rounded-md bg-[#BDA6CE] px-1.5 sm:px-2 ${compact ? 'py-0.5 text-[10px] sm:text-xs' : 'py-1.5 sm:py-2 text-xs sm:text-sm'} font-semibold text-[#072935] transition hover:bg-[#aa93b6]`}
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
