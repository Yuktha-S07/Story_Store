import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import BackButton from '../components/BackButton'

export default function StoryChaptersPage() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const { notify, confirmAction } = useNotification()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [storyTitle, setStoryTitle] = useState('')
  const [chapters, setChapters] = useState([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showEmptyPrompt, setShowEmptyPrompt] = useState(() => {
    if (!id) return true
    try {
      return sessionStorage.getItem(`story-store:empty-story:${id}`) !== 'kept'
    } catch {
      return true
    }
  })

  useEffect(() => {
    if (!id) return
    const fetchStory = async () => {
      try {
        const res = await api.get(`/api/stories/${id}`)
        setStoryTitle(res.data?.title || '')
        setChapters(res.data?.chapters || [])
        setIsCompleted(Boolean(res.data?.is_completed))
      } catch (err) {
        console.error(err)
        notify('Failed to load chapters.', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchStory()
  }, [id])

  const publishChapter = async (ch) => {
    try {
      const res = await api.post(`/api/chapters/${ch._id}/publish`)
      setChapters(prev => prev.map(c => c._id === ch._id ? res.data : c))
      notify('Chapter published.', 'success')
      window.dispatchEvent(new CustomEvent('story-store:story-updated', { detail: { storyId: id } }))
    } catch (err) {
      notify('Failed to publish chapter.', 'error')
    }
  }

  const markCompleted = async () => {
    try {
      const res = await api.put(`/api/stories/${id}`, { is_completed: true })
      setIsCompleted(Boolean(res.data?.is_completed))
      notify('Story marked as completed.', 'success')
      window.dispatchEvent(new CustomEvent('story-store:story-updated', { detail: { storyId: id } }))
    } catch (err) {
      const detail = err?.response?.data?.detail
      notify(typeof detail === 'string' ? detail : 'Failed to mark story as completed.', 'error')
    }
  }

  const markOngoing = async () => {
    try {
      const res = await api.put(`/api/stories/${id}`, { is_completed: false })
      setIsCompleted(Boolean(res.data?.is_completed))
      notify('Story marked as ongoing.', 'info')
      window.dispatchEvent(new CustomEvent('story-store:story-updated', { detail: { storyId: id } }))
    } catch (err) {
      notify('Failed to update story status.', 'error')
    }
  }

  const deleteChapter = async (ch) => {
    const confirmed = await confirmAction({
      title: 'Delete chapter',
      message: `Delete "${ch.title}"? This cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    })
    if (!confirmed) return
    try {
      await api.delete(`/api/chapters/${ch._id}`)
      setChapters(prev => prev.filter(c => c._id !== ch._id))
      notify('Chapter deleted.', 'info')
      window.dispatchEvent(new CustomEvent('story-store:story-updated', { detail: { storyId: id } }))
    } catch (err) {
      notify('Failed to delete chapter.', 'error')
    }
  }

  const keepStoryEmpty = () => {
    setShowEmptyPrompt(false)
    try {
      sessionStorage.setItem(`story-store:empty-story:${id}`, 'kept')
    } catch { /* ignore storage errors */ }
  }

  const deleteEmptyStory = async () => {
    const shouldDelete = await confirmAction({
      title: 'Delete story',
      message: `"${storyTitle}" has no chapters yet. Are you sure you want to delete it? This cannot be undone.`,
      confirmText: 'Delete story',
      cancelText: 'Keep it empty',
    })
    if (!shouldDelete) return
    setDeleting(true)
    try {
      await api.delete(`/api/stories/${id}`)
      notify('Story deleted.', 'success')
      window.dispatchEvent(new CustomEvent('story-store:story-updated', { detail: { storyId: id } }))
      navigate('/dashboard')
    } catch (err) {
      const detail = err?.response?.data?.detail
      notify(typeof detail === 'string' ? detail : 'Error deleting story.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (!user) return <div>Please login to edit.</div>

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-10 font-sans">
      <div className="flex items-center justify-between gap-4">
        <BackButton />
        <Link to={`/stories/${id}/edit`} className="btn-ghost text-sm">
          Edit story details
        </Link>
      </div>

      <section className="w-full border-b border-slate-200/70 pb-10">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-10 bg-[#E87B5D]" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Story structure</p>
            </div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Edit Chapters</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 md:text-base">
              Add, edit, or delete chapters{storyTitle ? <> for <span className="font-semibold text-slate-800">{storyTitle}</span></> : null}.
            </p>
            <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${isCompleted ? 'bg-[#e1f2e8] text-[#397356]' : 'bg-[#fff0d8] text-[#9b6728]'}`}>
              {isCompleted ? 'Completed' : 'Ongoing'}
            </span>
          </div>
          <span className="pill">Writer tools</span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-600">Loading chapters...</div>
        ) : chapters.length > 0 ? (
          <div className="space-y-3">
            {chapters.map((ch) => (
              <div key={ch._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/60 p-4 transition hover:border-slate-300 dark:border-[#3b3047] dark:bg-[#211a29] dark:hover:border-[#4b3b5d]">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-sm font-semibold text-slate-900 dark:text-gray-100">{ch.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 dark:text-gray-400">
                    Ch. {ch.chapter_number} &middot; {ch.status === 'published' ? 'Published' : 'Draft'}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 ml-3">
                  {ch.status !== 'published' && (
                    <button
                      type="button"
                      onClick={() => publishChapter(ch)}
                      className="rounded-md bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-800/60"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(`/stories/${id}/chapters/${ch._id}`)}
                    className="rounded-md bg-slate-200 px-3 py-1.5 text-xs font-semibold transition hover:bg-slate-300 dark:bg-slate-700 dark:text-gray-100 dark:hover:bg-slate-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteChapter(ch)}
                    className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-800/60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : chapters.length === 0 && showEmptyPrompt ? (
          <div className="rounded-2xl border border-[#f0c990] bg-[#fff8ec] p-6 text-center dark:border-[#6b5533] dark:bg-[#2b2518]">
            <p className="text-sm font-semibold text-slate-800 dark:text-gray-100">
              {storyTitle ? `"${storyTitle}" has no chapters yet.` : 'This story has no chapters yet.'}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
              Would you like to delete this story or keep it empty while you write?
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={deleteEmptyStory}
                disabled={deleting}
                className="rounded-md bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200 disabled:opacity-60 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-800/60"
              >
                {deleting ? 'Deleting...' : 'Delete story'}
              </button>
              <button
                type="button"
                onClick={keepStoryEmpty}
                className="rounded-md bg-slate-200 px-4 py-2 text-xs font-semibold transition hover:bg-slate-300 dark:bg-slate-700 dark:text-gray-100 dark:hover:bg-slate-600"
              >
                Keep it empty
              </button>
            </div>
          </div>
        ) : (
          <div className="border-y border-dashed border-slate-300 py-10 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-gray-400">
            No chapters yet. Add your first chapter below.
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          {chapters.length > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              {isCompleted ? (
                <button
                  type="button"
                  onClick={markOngoing}
                  className="rounded-xl bg-[#df818f] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(223,129,143,0.22)] transition hover:-translate-y-0.5 hover:bg-[#d47080] hover:shadow-[0_12px_22px_rgba(223,129,143,0.3)]"
                >
                  Mark as ongoing
                </button>
              ) : (
                <button
                  type="button"
                  onClick={markCompleted}
                  className="rounded-xl bg-[#df818f] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(223,129,143,0.22)] transition hover:-translate-y-0.5 hover:bg-[#d47080] hover:shadow-[0_12px_22px_rgba(223,129,143,0.3)]"
                >
                  Mark as completed
                </button>
              )}
              <p className="text-xs text-slate-500 dark:text-gray-400">
                {isCompleted
                  ? 'Readers will see this story as completed.'
                  : 'Readers still see this story as ongoing until you mark it completed.'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-gray-500">
              You can mark this story as completed once it has at least one chapter.
            </p>
          )}
          <button
            type="button"
            onClick={() => navigate(`/stories/${id}/chapters/new`)}
            className="rounded-xl bg-[#df818f] px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(223,129,143,0.22)] transition hover:-translate-y-0.5 hover:bg-[#d47080] hover:shadow-[0_14px_26px_rgba(223,129,143,0.3)]"
          >
            Add a Chapter
          </button>
        </div>
      </section>
    </div>
  )
}
