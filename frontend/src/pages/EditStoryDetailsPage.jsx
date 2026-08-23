import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import BackButton from '../components/BackButton'

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
  const [status, setStatus] = useState('draft')
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [saving, setSaving] = useState(false)

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
        setStatus(data.status === 'published' ? 'published' : 'draft')
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
      status,
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

  if (!user) return <div>Please login to edit.</div>

  if (loading) return <div className="py-16 text-center text-slate-600">Loading story...</div>

  if (!story) return <div className="py-16 text-center text-slate-600">Story not found.</div>

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-10 font-sans">
      <div className="flex items-center justify-between gap-4">
        <BackButton />
        {story && (
          <Link to={`/stories/${story._id}/chapters`} className="btn-ghost text-sm">
            Edit chapters
          </Link>
        )}
      </div>

      <section className="w-full border-b border-slate-200/70 pb-12">
        <div className="mb-9 flex items-start justify-between gap-6">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-10 bg-[#E87B5D]" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Story studio</p>
            </div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Edit Story Details</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 md:text-base">Update the cover, genre, and summary for your readers.</p>
          </div>
          <span className="pill">Story</span>
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
          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">Genre</label>
              <input
                value={genre}
                onChange={e => setGenre(e.target.value)}
                placeholder="Choose a genre"
                className="w-full rounded-2xl border border-slate-200/90 bg-white/50 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20"
              />
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
            <div className="space-y-2">
              <label htmlFor="story-status" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">Story status</label>
              <select
                id="story-status"
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full rounded-2xl border border-slate-200/90 bg-white/50 px-4 py-3.5 outline-none transition focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20"
              >
                <option value="published">Ongoing</option>
                <option value="draft">Completed</option>
              </select>
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
