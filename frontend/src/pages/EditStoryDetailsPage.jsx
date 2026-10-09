import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiEye, FiEyeOff, FiLoader } from 'react-icons/fi'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import BackButton from '../components/BackButton'
import GenreSelect from '../components/GenreSelect'

export default function EditStoryDetailsPage() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const { notify } = useNotification()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [story, setStory] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState('')
  const [tags, setTags] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [bookToggling, setBookToggling] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || ''
  const resolveImage = (img) => {
    if (!img) return '/Hero_Image.png'
    if (/^https?:\/\//.test(img)) return img
    if (img.startsWith('/')) return `${API_URL}${img}`
    return img
  }

  useEffect(() => {
    if (!coverFile) return undefined

    const objectUrl = URL.createObjectURL(coverFile)
    setCoverPreview(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [coverFile])

  useEffect(() => {
    if (!id) return
    const fetchStory = async () => {
      try {
        const res = await api.get(`/api/stories/${id}`)
        const data = res.data
        setStory(data)
        setTitle(data.title || '')
        setDescription(data.description || '')
        setGenre(data.genre || '')
        setTags(data.tags?.join(', ') || '')
        setCoverPreview(resolveImage(data.cover_image_url))
      } catch (err) {
        console.error(err)
        notify('Failed to load story details.', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchStory()
  }, [id])

  const submit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !genre.trim()) {
      notify('Title and genre are required.', 'info')
      return
    }

    const payload = {
      title: title.trim(),
      description,
      genre: genre.trim(),
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
    }

    try {
      setSaving(true)
      await api.put(`/api/stories/${id}`, payload)

      if (coverFile) {
        try {
          const formData = new FormData()
          formData.append('cover_image', coverFile)
          await api.post(`/api/stories/${id}/cover`, formData)
        } catch (coverErr) {
          console.error(coverErr)
          notify('Story saved, but cover upload failed.', 'warning')
        }
      }

      notify('Story details updated.', 'success')
      window.dispatchEvent(new CustomEvent('story-store:story-updated', { detail: { storyId: id } }))
      navigate(`/stories/${id}`)
    } catch (err) {
      const detail = err?.response?.data?.detail
      notify(typeof detail === 'string' ? detail : 'Save failed.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const publishBook = async () => {
    try {
      setBookToggling(true)
      const res = await api.post(`/api/stories/${id}/publish`)
      const now = new Date().toISOString()
      setStory(prev => (prev ? {
        ...prev,
        ...res.data,
        status: res.data?.status || 'published',
        published_at: res.data?.published_at || now,
        chapters: (prev.chapters || []).map(ch => ({ ...ch, status: 'published', published_at: ch.published_at || now })),
      } : prev))
      notify('Book published. All chapters are now live.', 'success')
      window.dispatchEvent(new CustomEvent('story-store:story-updated', { detail: { storyId: id } }))
    } catch (err) {
      const detail = err?.response?.data?.detail
      notify(typeof detail === 'string' ? detail : 'Failed to publish book.', 'error')
    } finally {
      setBookToggling(false)
    }
  }

  const unpublishBook = async () => {
    try {
      setBookToggling(true)
      const res = await api.post(`/api/stories/${id}/unpublish`)
      setStory(prev => (prev ? {
        ...prev,
        ...res.data,
        status: res.data?.status || 'draft',
        chapters: (prev.chapters || []).map(ch => ({ ...ch, status: 'draft' })),
      } : prev))
      notify('Book unpublished. Only you can see it now.', 'info')
      window.dispatchEvent(new CustomEvent('story-store:story-updated', { detail: { storyId: id } }))
    } catch (err) {
      const detail = err?.response?.data?.detail
      notify(typeof detail === 'string' ? detail : 'Failed to unpublish book.', 'error')
    } finally {
      setBookToggling(false)
    }
  }

  if (!user) return <div>Please login to edit.</div>

  if (loading) return <div className="py-16 text-center text-slate-600">Loading story...</div>

  if (!story) return <div className="py-16 text-center text-slate-600">Story not found.</div>

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-10 font-sans">
      <div className="flex items-center justify-between gap-4">
        <BackButton />
        {story && (
          <div className="flex flex-col items-end gap-2">
            <Link to={`/stories/${story._id}/chapters`} className="btn-ghost text-sm">
              Edit chapters
            </Link>
            {(story.chapters || []).length > 0 && (story.status === 'published' || (story.chapters || []).some(ch => ch.status === 'published')) && (
              <button
                type="button"
                onClick={unpublishBook}
                disabled={bookToggling}
                className="group inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-[linear-gradient(135deg,#fff7ed_0%,#ffe8c7_100%)] px-4 py-2 text-xs font-semibold text-amber-800 shadow-[0_6px_16px_rgba(180,120,40,0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-[0_10px_22px_rgba(180,120,40,0.22)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-700/50 dark:bg-[linear-gradient(135deg,#3a2b16_0%,#4a3418_100%)] dark:text-amber-200 dark:shadow-[0_6px_16px_rgba(0,0,0,0.35)] dark:hover:border-amber-500/70"
              >
                {bookToggling ? (
                  <FiLoader className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FiEyeOff className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-rotate-6" />
                )}
                <span>{bookToggling ? 'Unpublishing…' : 'Unpublish book'}</span>
              </button>
            )}
            {(story.chapters || []).length > 0 && story.status !== 'published' && !(story.chapters || []).some(ch => ch.status === 'published') && (
              <button
                type="button"
                onClick={publishBook}
                disabled={bookToggling}
                className="group inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-[linear-gradient(135deg,#ecfdf5_0%,#c9f2dd_100%)] px-4 py-2 text-xs font-semibold text-emerald-800 shadow-[0_6px_16px_rgba(30,120,80,0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-[0_10px_22px_rgba(30,120,80,0.22)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-700/50 dark:bg-[linear-gradient(135deg,#0f2b20_0%,#123a29_100%)] dark:text-emerald-200 dark:shadow-[0_6px_16px_rgba(0,0,0,0.35)] dark:hover:border-emerald-500/70"
              >
                {bookToggling ? (
                  <FiLoader className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FiEye className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" />
                )}
                <span>{bookToggling ? 'Publishing…' : 'Publish book'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      <section className="w-full border-b border-slate-200/70 pb-12">
        <div className="mb-9 flex items-start justify-between gap-6">
          <div className="min-w-0 pr-2">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-10 bg-[#E87B5D]" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Story studio</p>
            </div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Edit Story Details</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 md:text-base">Update the cover, genre, and summary for your readers.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="pill">Story</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${story.status === 'published' ? 'bg-[#e1f2e8] text-[#397356] dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-[#fff0d8] text-[#9b6728] dark:bg-amber-900/50 dark:text-amber-300'}`}>
              {story.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-7">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">Story title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Give your story a memorable title"
              className="w-full rounded-2xl border border-slate-200/90 bg-white/50 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20"
            />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">Genre</label>
              <GenreSelect value={genre} onChange={setGenre} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">Tags</label>
              <input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="friendships, tragedy, emotional"
                className="w-full rounded-2xl border border-slate-200/90 bg-white/50 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">Short description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Give readers a glimpse of what awaits them"
              className="h-40 w-full rounded-2xl border border-slate-200/90 bg-white/50 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20"
            />
          </div>

          <div className="flex justify-end">
            <input
              id="cover-upload"
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <label
              htmlFor="cover-upload"
              className="group mr-auto flex h-40 w-full max-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-[#E87B5D] hover:bg-[#FFF7F4] sm:h-56 sm:max-w-[220px] md:h-64 md:max-w-[240px]"
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-300 text-3xl font-light text-slate-400 transition group-hover:border-[#E87B5D] group-hover:text-[#E87B5D]">
                  +
                </span>
              )}
            </label>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-slate-200/70 pt-6">
            <button type="button" onClick={() => navigate(-1)} className="btn-ghost">Cancel</button>
            <button disabled={saving} className="btn-primary px-7 disabled:opacity-60">{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
