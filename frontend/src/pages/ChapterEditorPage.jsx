import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import BackButton from '../components/BackButton'
import RichTextEditor from '../components/RichTextEditor'

export default function ChapterEditorPage() {
  const { id, chapterId } = useParams()
  const { user } = useContext(AuthContext)
  const { notify } = useNotification()
  const navigate = useNavigate()

  const isEditing = Boolean(chapterId)

  const [loading, setLoading] = useState(isEditing)
  const [storyTitle, setStoryTitle] = useState('')
  const [chapterTitle, setChapterTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [chapterStatus, setChapterStatus] = useState('draft')

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const storyRes = await api.get(`/api/stories/${id}`)
        setStoryTitle(storyRes.data?.title || '')
      } catch (err) {
        console.error(err)
      }

      if (isEditing) {
        try {
          const res = await api.get(`/api/chapters/${chapterId}`)
          setChapterTitle(res.data?.title || '')
          setContent(res.data?.content || '')
          setChapterStatus(res.data?.status === 'published' ? 'published' : 'draft')
        } catch (err) {
          notify('Failed to load chapter.', 'error')
        }
      }
      setLoading(false)
    }
    load()
  }, [id, chapterId, isEditing])

  const isPublished = chapterStatus === 'published'

  const goBackToChapters = () => navigate(`/stories/${id}/chapters`)

  const save = async (status) => {
    if (!chapterTitle.trim()) {
      notify('Please add a chapter title.', 'info')
      return
    }
    const plainText = (content || '').replace(/<[^>]*>/g, '')
    if (!plainText.trim()) {
      notify('Please add some chapter content.', 'info')
      return
    }

    const payload = { title: chapterTitle.trim(), content }

    try {
      setSaving(true)
      if (isEditing) {
        await api.put(`/api/chapters/${chapterId}`, { ...payload, status })
      } else {
        await api.post(`/api/stories/${id}/chapters`, { ...payload, status })
      }
      notify(status === 'published' ? 'Chapter published.' : 'Chapter saved as draft.', 'success')
      window.dispatchEvent(new CustomEvent('story-store:story-updated', { detail: { storyId: id } }))
      goBackToChapters()
    } catch (err) {
      const detail = err?.response?.data?.detail
      notify(typeof detail === 'string' ? detail : 'Failed to save chapter.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return <div>Please login to write.</div>

  return (
    <div className="chapter-editor-page mx-auto w-full max-w-4xl space-y-7 pb-10 font-sans">
      <div className="flex items-center justify-between gap-4">
        <BackButton fallback={`/stories/${id}/chapters`} />
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${isPublished ? 'bg-[#e1f2e8] text-[#397356] dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-[#fff0d8] text-[#9b6728] dark:bg-amber-900/50 dark:text-amber-300'}`}>
            {isPublished ? 'Published' : 'Draft'}
          </span>
          <span className="rounded-full border border-[#d9c7b4] bg-[#fffaf4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b6b52]">
            {isEditing ? 'Edit chapter' : 'New chapter'}
          </span>
        </div>
      </div>

      <section className="chapter-canvas w-full">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#e8d8c8] pb-6">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b06f7f]">Story Store</p>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#28343a] md:text-3xl">
              {isEditing ? 'Edit Chapter' : 'Add a Chapter'}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#6d6863]">
              {storyTitle ? (
                <>Write your next chapter for <span className="font-semibold text-[#28343a]">{storyTitle}</span>.</>
              ) : (
                'Write your next chapter.'
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#81709b]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e7def2]">1</span>
            <span className="hidden sm:inline">Draft your scene</span>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">Chapter title</label>
            <input
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="Give this chapter a title"
              className="w-full rounded-xl border border-[#d9d2c9] bg-[#fffdf9] px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">Chapter content</label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e8d8c8] pt-4">
            <button type="button" onClick={goBackToChapters} className="btn-ghost">
              Cancel
            </button>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => save(isPublished ? 'published' : 'draft')}
                className="btn-ghost disabled:opacity-60"
              >
                {saving ? 'Saving...' : isEditing ? (isPublished ? 'Update chapter' : 'Update draft') : 'Save as draft'}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => save(isPublished ? 'draft' : 'published')}
                className={`disabled:opacity-60 ${isPublished ? 'btn-ghost border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50' : 'btn-primary px-7'}`}
              >
                {saving ? 'Saving...' : isPublished ? 'Unpublish' : 'Publish chapter'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
