import React, { useEffect, useState, useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { getSampleChapter, getSampleStory } from '../data/sampleStories'
import { FiArrowLeft, FiArrowRight, FiBookOpen, FiCheck } from 'react-icons/fi'

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
    <main className="reading-page">
      <article className="reading-shell">
        <header className="reading-header">
          <div className="reading-heading">
            <div className="reading-eyebrow"><FiBookOpen size={15} /> Reading</div>
            <h1>{chapter.title}</h1>
            {isOwner && (
              <span className={`reading-status ${chapter.status === 'published' ? 'reading-status-published' : 'reading-status-draft'}`}>
                {chapter.status === 'published' ? 'Published' : 'Draft'}
              </span>
            )}
          </div>
          <div className="reading-actions">
            {isOwner && (
              <button
                type="button"
                onClick={toggleChapterStatus}
                disabled={savingStatus}
                className={`reading-action reading-status-button disabled:opacity-60 ${chapter.status === 'published' ? 'reading-unpublish' : 'reading-publish'}`}
              >
                {savingStatus ? 'Saving...' : chapter.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
            )}
            <Link to="/dashboard" className="reading-action reading-done">
              <FiCheck size={15} /> Done
            </Link>
          </div>
        </header>
        <div className="reading-divider" />
        <div className="reading-content prose" dangerouslySetInnerHTML={{ __html: chapter.content }} />
        <nav className="reading-navigation" aria-label="Chapter navigation">
          {previousChapterHref ? (
            <Link to={previousChapterHref} className="reading-nav-button reading-nav-previous">
              <FiArrowLeft size={17} /> Previous chapter
            </Link>
          ) : (
            <span className="reading-nav-button reading-nav-previous is-disabled"><FiArrowLeft size={17} /> Previous chapter</span>
          )}
          {nextChapterHref ? (
            <Link to={nextChapterHref} className="reading-nav-button reading-nav-next">
              Next chapter <FiArrowRight size={17} />
            </Link>
          ) : (
            <span className="reading-nav-button reading-nav-next is-disabled">Next chapter <FiArrowRight size={17} /></span>
          )}
        </nav>
      </article>
    </main>
  )
}
