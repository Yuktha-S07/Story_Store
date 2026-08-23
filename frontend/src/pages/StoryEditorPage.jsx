import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import BackButton from '../components/BackButton'

export default function StoryEditorPage() {
  const { user } = useContext(AuthContext)
  const { notify } = useNotification()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState('')
  const [tags, setTags] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!coverFile) return undefined

    const objectUrl = URL.createObjectURL(coverFile)
    setCoverPreview(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [coverFile])

  const submit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !genre.trim()) {
      notify('Title and genre are required to save a story.', 'info')
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
      const res = await api.post('/api/stories', payload)
      let storyId = res.data._id

      if (coverFile && storyId) {
        try {
          const formData = new FormData()
          formData.append('cover_image', coverFile)
          await api.post(`/api/stories/${storyId}/cover`, formData)
        } catch (coverErr) {
          console.error(coverErr)
          notify('Story created, but cover upload failed.', 'warning')
        }
      }

      notify('Story created. Add chapters next!', 'success')
      // Notify other pages that a story was created
      window.dispatchEvent(new CustomEvent('story-store:story-updated', { detail: { storyId } }))
      navigate(`/stories/${storyId}/chapters`)
    } catch (err) {
      const detail = err?.response?.data?.detail
      const message = typeof detail === 'string' ? detail : 'Save failed.'
      notify(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return <div>Please login to write.</div>

  return (
    <div className="mx-auto w-full max-w-4xl space-y-7 pb-10 font-sans">
      <div className="flex items-center justify-between">
        <BackButton />
        <span className="rounded-full border border-[#d9c7b4] bg-[#fffaf4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b6b52]">New story</span>
      </div>

      <section className="w-full pb-2">
        <div className="mb-7 flex items-end justify-between gap-6 border-b border-[#e8d8c8] pb-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b06f7f]">Story studio</p>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#28343a] md:text-3xl">Write a Story</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#6d6863]">Give your story a strong beginning with a title, mood, and cover.</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">Story title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Give your story a memorable title"
              className="w-full rounded-xl border border-[#d9d2c9] bg-[#fffdf9] px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">Genre</label>
              <input
                value={genre}
                onChange={e => setGenre(e.target.value)}
                placeholder="Choose a genre"
                className="w-full rounded-xl border border-[#d9d2c9] bg-[#fffdf9] px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">Tags</label>
              <input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="friendships, tragedy, emotional"
                className="w-full rounded-xl border border-[#d9d2c9] bg-[#fffdf9] px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">Short description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Give readers a glimpse of what awaits them"
              className="h-32 w-full resize-y rounded-xl border border-[#d9d2c9] bg-[#fffdf9] px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20"
            />
          </div>

          <div className="grid gap-4 rounded-2xl border border-[#e8d8c8] bg-[#fffaf4] p-4 sm:grid-cols-[150px_1fr] sm:items-center">
            <input
              id="cover-upload"
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <label
              htmlFor="cover-upload"
              className="group flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#d9c7b4] bg-[#fffdf9] transition hover:border-[#E87B5D] hover:bg-[#FFF7F4]"
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#d9c7b4] text-2xl font-light text-[#9b8877] transition group-hover:border-[#E87B5D] group-hover:text-[#E87B5D]">
                  +
                </span>
              )}
            </label>
            <div>
              <p className="text-sm font-semibold text-[#4b4a48]">Add a cover image</p>
              <p className="mt-1 text-xs leading-5 text-[#817970]">PNG or JPEG recommended. A cover helps your story stand out.</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-[#e8d8c8] pt-4">
            <button type="button" onClick={() => navigate(-1)} className="btn-ghost">Cancel</button>
            <button disabled={saving} className="btn-primary px-7 disabled:opacity-60">{saving ? 'Creating...' : 'Create Story'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
