import React, { useEffect, useState, useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { getSampleChapter, getSampleStory } from '../data/sampleStories'

export default function ReadingPage() {
  const { chapterId } = useParams()
  const [chapter, setChapter] = useState(null)
  const [previousChapterHref, setPreviousChapterHref] = useState('')
  const [nextChapterHref, setNextChapterHref] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)
  const { user } = useContext(AuthContext)
  const { notify } = useNotification()

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const res = await api.get(`/api/chapters/${chapterId}`)
        setChapter(res.data)
        if (res.data?.story_id) {
          try {
            const storyRes = await api.get(`/api/stories/${res.data.story_id}`)
            const chapters = Array.isArray(storyRes.data?.chapters) ? storyRes.data.chapters : []
            const currentIndex = chapters.findIndex((item) => String(item._id) === String(chapterId))
            const previousChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null
            const nextChapter = currentIndex >= 0 ? chapters[currentIndex + 1] : null
            setPreviousChapterHref(previousChapter?._id ? `/read/${previousChapter._id}` : '')
            setNextChapterHref(nextChapter?._id ? `/read/${nextChapter._id}` : '')
          } catch (storyErr) {
            console.error(storyErr)
          }
        }
        if (user && res.data?.story_id) {
          await api.post(`/api/stories/${res.data.story_id}/chapters/${chapterId}/history`)
          localStorage.setItem('latest_reading', JSON.stringify({
            story_id: res.data.story_id,
            chapter_id: chapterId,
            chapter_title: res.data.title,
          }))
        }
      } catch (err) {
        const fallbackChapter = getSampleChapter(chapterId)
        if (fallbackChapter) {
          const storyId = String(fallbackChapter._id).split('-ch')[0]
          const sampleStory = getSampleStory(storyId)
          const sampleChapters = Array.isArray(sampleStory?.chapters) ? sampleStory.chapters : []
          const currentIndex = sampleChapters.findIndex((item) => String(item._id) === String(chapterId))
          const previousChapter = currentIndex > 0 ? sampleChapters[currentIndex - 1] : null
          const nextChapter = currentIndex >= 0 ? sampleChapters[currentIndex + 1] : null

          setChapter({ ...fallbackChapter, story_id: storyId })
          setPreviousChapterHref(previousChapter?._id ? `/read/${previousChapter._id}` : '')
          setNextChapterHref(nextChapter?._id ? `/read/${nextChapter._id}` : '')
          return
        }
        console.error(err)
      }
    }
    fetchChapter()
  }, [chapterId, user])

  const isOwner = Boolean(user && chapter && String(user._id) === String(chapter.user_id))

  const toggleChapterStatus = async () => {
    if (!isOwner) return

    const nextStatus = chapter.status === 'published' ? 'draft' : 'published'

    try {
      setSavingStatus(true)
      const res = await api.put(`/api/chapters/${chapterId}`, { status: nextStatus })
      setChapter(res.data)
      notify(nextStatus === 'published' ? 'Chapter published.' : 'Chapter moved to draft.', 'success')
      // Notify other pages that chapter/story status changed
      const storyId = res?.data?.story_id
      window.dispatchEvent(new CustomEvent('story-store:story-updated', { detail: { chapterId, storyId } }))
    } catch (err) {
      console.error(err)
      const detail = err?.response?.data?.detail
      const message = typeof detail === 'string' ? detail : 'Failed to update chapter status.'
      notify(message, 'error')
    } finally {
      setSavingStatus(false)
    }
  }

  if (!chapter) return <div>Loading...</div>

  return (
    <div className="surface relative p-8 md:p-10 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">Reading</div>
          <h1 className="text-3xl font-bold mt-2">{chapter.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {isOwner && (
            <button
              type="button"
              onClick={toggleChapterStatus}
              disabled={savingStatus}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${chapter.status === 'published' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
            >
              {savingStatus ? 'Saving...' : chapter.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
          )}
          <Link
            to="/dashboard"
            className="shrink-0 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Done
          </Link>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {isOwner && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${chapter.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {chapter.status === 'published' ? 'Published' : 'Draft'}
          </span>
        )}
      </div>
      <div className="prose mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: chapter.content }} />
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        {previousChapterHref ? (
          <Link to={previousChapterHref} className="btn-ghost">
            Previous chapter
          </Link>
        ) : (
          <span className="btn-ghost opacity-60 cursor-not-allowed">Previous chapter</span>
        )}
        {nextChapterHref ? (
          <Link to={nextChapterHref} className="btn-primary">
            Next chapter
          </Link>
        ) : (
          <span className="btn-primary opacity-60 cursor-not-allowed">Next chapter</span>
        )}
      </div>
    </div>
  )
}
