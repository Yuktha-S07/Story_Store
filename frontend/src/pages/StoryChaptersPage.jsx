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

  useEffect(() => {
    if (!id) return
    const fetchStory = async () => {
      try {
        const res = await api.get(`/api/stories/${id}`)
        setStoryTitle(res.data?.title || '')
        setChapters(res.data?.chapters || [])
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
        ) : (
          <div className="border-y border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
            No chapters yet. Add your first chapter below.
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => navigate(`/stories/${id}/chapters/new`)}
            className="btn-primary px-7"
          >
            + Add a Chapter
          </button>
        </div>
      </section>
    </div>
  )
}
