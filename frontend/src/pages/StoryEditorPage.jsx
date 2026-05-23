import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'

export default function StoryEditorPage() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const { notify } = useNotification()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState('')
  const [tags, setTags] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [stories, setStories] = useState([])

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
    if (!id) {
      setCoverPreview('')
      return
    }

    const fetchStory = async () => {
      try {
        const res = await api.get(`/api/stories/${id}`)
        const story = res.data
        setTitle(story.title || '')
        setDescription(story.description || '')
        setGenre(story.genre || '')
        setTags(story.tags?.join(', ') || '')
        setCoverPreview(resolveImage(story.cover_image_url))
      } catch (err) {
        console.error(err)
      }
    }

    fetchStory()
  }, [id])

  useEffect(() => {
    if (!user) return

    const fetchStories = async () => {
      try {
        const res = await api.get('/api/stories?mine=true')
        setStories(res.data || [])
      } catch (err) {
        console.error(err)
      }
    }

    fetchStories()
  }, [user])

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
      let storyId = id

      if (id) {
        await api.put(`/api/stories/${id}`, payload)
      } else {
        const res = await api.post('/api/stories', payload)
        storyId = res.data._id
      }

      if (coverFile && storyId) {
        try {
          const formData = new FormData()
          formData.append('cover_image', coverFile)
          await api.post(`/api/stories/${storyId}/cover`, formData)
        } catch (coverErr) {
          console.error(coverErr)
          notify('Story saved, but cover upload failed.', 'warning')
        }
      }

      notify('Story saved.', 'success')
      // Notify other pages that a story was created/updated
      window.dispatchEvent(new CustomEvent('story-store:story-updated', { detail: { storyId } }))
      navigate(`/stories/${storyId}`)
    } catch (err) {
      const detail = err?.response?.data?.detail
      const message = typeof detail === 'string' ? detail : 'Save failed.'
      notify(message, 'error')
    }
  }

  if (!user) return <div>Please login to write.</div>

  return (
    <div className="w-full space-y-6">
      <section className="surface w-full p-6 md:p-8 border border-slate-200 shadow-sm rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">{id ? 'Edit Story' : 'Write a Story'}</h2>
            <p className="text-slate-600">Craft the cover, genre, and summary for your readers.</p>
          </div>
          <span className="pill">Story</span>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20 outline-none transition"
          />
          <div className="grid md:grid-cols-2 gap-3">
            <input
              value={genre}
              onChange={e => setGenre(e.target.value)}
              placeholder="Genre"
              className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20 outline-none transition"
            />
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="Tags (comma separated)"
              className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20 outline-none transition"
            />
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Short description"
            className="w-full border border-slate-200 px-4 py-3 rounded-xl h-40 focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20 outline-none transition"
          />

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
              className="group mr-auto flex h-56 w-full max-w-[220px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-[#E87B5D] hover:bg-[#FFF7F4] sm:max-w-[240px] sm:h-60 md:h-64"
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

          <button className="btn-primary px-6">Save Story</button>
        </form>
      </section>

      <section className="surface w-full p-6 md:p-8 border border-slate-200 shadow-sm rounded-3xl">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-xl font-semibold">Your Stories</h3>
            <p className="text-sm text-slate-600">Quick access to the stories you already started.</p>
          </div>
          <span className="pill">{stories.length} total</span>
        </div>

        {stories.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-slate-500">
            No stories yet. Save your first story to see it here.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stories.map(story => (
              <article key={story._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                <img
                  src={resolveImage(story.cover_image_url)}
                  alt={story.title}
                  className="h-32 w-full object-cover"
                />
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="truncate font-semibold text-slate-900">{story.title}</h4>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{story.description || 'No description yet.'}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${story.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {story.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/stories/${story._id}/edit`}
                      className="rounded-full bg-[#BDA6CE] px-3 py-1.5 text-sm font-semibold text-[#072935] transition hover:bg-[#aa93b6]"
                    >
                      Edit
                    </Link>
                    <Link
                      to={`/stories/${story._id}`}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
