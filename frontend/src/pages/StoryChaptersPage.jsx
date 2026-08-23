import React, { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import BackButton from '../components/BackButton'

export default function StoryChaptersPage() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const { notify, confirmAction } = useNotification()

  const [loading, setLoading] = useState(true)
  const [storyTitle, setStoryTitle] = useState('')
  const [chapters, setChapters] = useState([])
  const [chapterTitle, setChapterTitle] = useState('')
  const [chapterContent, setChapterContent] = useState('')
  const [savingChapter, setSavingChapter] = useState(false)
  const [editingChapterId, setEditingChapterId] = useState(null)

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

  const startEditChapter = (ch) => {
    setEditingChapterId(ch._id)
    setChapterTitle(ch.title)
    setChapterContent(ch.content)
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  const cancelEditChapter = () => {
    setEditingChapterId(null)
    setChapterTitle('')
    setChapterContent('')
  }

  const saveDraftOrPublish = async (status) => {
    if (!chapterTitle.trim() || !chapterContent.trim()) {
      notify('Please add both a chapter title and chapter content.', 'info')
      return
    }
    try {
      setSavingChapter(true)
      if (editingChapterId) {
        await api.put(`/api/chapters/${editingChapterId}`, {
          title: chapterTitle.trim(),
          content: chapterContent.trim(),
        })
        setChapters(prev => prev.map(c => c._id === editingChapterId ? { ...c, title: chapterTitle.trim(), content: chapterContent.trim() } : c))
        cancelEditChapter()
        notify('Chapter updated.', 'success')
      } else {
        await addChapter(status)
      }
    } catch (err) {
      const detail = err?.response?.data?.detail
      notify(typeof detail === 'string' ? detail : 'Failed to save chapter.', 'error')
    } finally {
      setSavingChapter(false)
    }
  }

  const addChapter = async (status) => {
    const res = await api.post(`/api/stories/${id}/chapters`, {
      title: chapterTitle.trim(),
      content: chapterContent.trim(),
      status,
    })
    setChapters(prev => [...prev, res.data])
    setChapterTitle('')
    setChapterContent('')
    notify(status === 'published' ? 'Chapter published.' : 'Chapter saved as draft.', 'success')
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
      if (editingChapterId === ch._id) cancelEditChapter()
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
              <div key={ch._id} className={`flex items-center justify-between rounded-xl border p-4 transition ${editingChapterId === ch._id ? 'border-[#E87B5D]/60 bg-[#FFF7F4]' : 'border-slate-200 bg-white/60'}`}>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-sm font-semibold">{ch.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ch. {ch.chapter_number} &middot; {ch.status === 'published' ? 'Published' : 'Draft'}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 ml-3">
                  <button
                    type="button"
                    onClick={() => startEditChapter(ch)}
                    className="rounded-md bg-slate-200 px-3 py-1.5 text-xs font-semibold transition hover:bg-slate-300"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteChapter(ch)}
                    className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200"
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
      </section>

      <section className="w-full pt-2">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h3 className="font-serif text-2xl font-semibold text-slate-900">{editingChapterId ? 'Edit Chapter' : 'Add a Chapter'}</h3>
          {editingChapterId && (
            <button type="button" onClick={cancelEditChapter} className="rounded-full border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
              Cancel editing
            </button>
          )}
        </div>
        <div className="space-y-4">
          <input
            value={chapterTitle}
            onChange={e => setChapterTitle(e.target.value)}
            placeholder="Chapter title"
            className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20"
          />
          <textarea
            value={chapterContent}
            onChange={e => setChapterContent(e.target.value)}
            placeholder="Chapter content"
            className="h-40 w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={savingChapter}
              onClick={() => saveDraftOrPublish('draft')}
              className="btn-ghost disabled:opacity-60"
            >
              {editingChapterId ? 'Update chapter' : 'Save as draft'}
            </button>
            {!editingChapterId && (
              <button
                type="button"
                disabled={savingChapter}
                onClick={() => saveDraftOrPublish('published')}
                className="btn-primary disabled:opacity-60"
              >
                Publish chapter
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
