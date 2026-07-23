import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'

export default function StoryEditorPage() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const { notify, confirmAction } = useNotification()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState('')
  const [tags, setTags] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')

  const [chapters, setChapters] = useState([])
  const [chapterTitle, setChapterTitle] = useState('')
  const [chapterContent, setChapterContent] = useState('')
  const [savingChapter, setSavingChapter] = useState(false)
  const [editingChapterId, setEditingChapterId] = useState(null)

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
        setChapters(story.chapters || [])
      } catch (err) {
        console.error(err)
      }
    }

    fetchStory()
  }, [id])

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
              className="group mr-auto flex h-40 sm:h-56 md:h-64 w-full max-w-[160px] sm:max-w-[220px] md:max-w-[240px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-[#E87B5D] hover:bg-[#FFF7F4]"
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

      {id && (
        <section className="surface w-full p-6 md:p-8 border border-slate-200 shadow-sm rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold">Chapters</h2>
              <p className="text-slate-600">Manage and add chapters to your story.</p>
            </div>
            <span className="pill">Writer tools</span>
          </div>

          {chapters.length > 0 && (
            <div className="mb-6 space-y-3">
              {chapters.map((ch) => (
                <div key={ch._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-[#fbfaf7] p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{ch.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ch. {ch.chapter_number} &middot; {ch.status === 'published' ? 'Published' : 'Draft'}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingChapterId(ch._id)
                        setChapterTitle(ch.title)
                        setChapterContent(ch.content)
                      }}
                      className="rounded-md bg-slate-200 px-3 py-1.5 text-xs font-semibold transition hover:bg-slate-300"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
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
                        } catch (err) {
                          notify('Failed to delete chapter.', 'error')
                        }
                      }}
                      className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold text-base">{editingChapterId ? 'Edit Chapter' : 'Add a chapter'}</h3>
            <input
              value={chapterTitle}
              onChange={e => setChapterTitle(e.target.value)}
              placeholder="Chapter title"
              className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20 outline-none transition"
            />
            <textarea
              value={chapterContent}
              onChange={e => setChapterContent(e.target.value)}
              placeholder="Chapter content"
              className="w-full border border-slate-200 px-4 py-3 rounded-xl h-40 focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20 outline-none transition"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={savingChapter}
                onClick={async () => {
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
                      setEditingChapterId(null)
                      notify('Chapter updated.', 'success')
                    } else {
                      const res = await api.post(`/api/stories/${id}/chapters`, {
                        title: chapterTitle.trim(),
                        content: chapterContent.trim(),
                        status: 'draft',
                      })
                      setChapters(prev => [...prev, res.data])
                      notify('Chapter saved as draft.', 'success')
                    }
                    setChapterTitle('')
                    setChapterContent('')
                  } catch (err) {
                    const detail = err?.response?.data?.detail
                    notify(typeof detail === 'string' ? detail : 'Failed to save chapter.', 'error')
                  } finally {
                    setSavingChapter(false)
                  }
                }}
                className="btn-ghost disabled:opacity-60"
              >
                {editingChapterId ? 'Update chapter' : 'Save as draft'}
              </button>
              {!editingChapterId && (
                <button
                  type="button"
                  disabled={savingChapter}
                  onClick={async () => {
                    if (!chapterTitle.trim() || !chapterContent.trim()) {
                      notify('Please add both a chapter title and chapter content.', 'info')
                      return
                    }
                    try {
                      setSavingChapter(true)
                      const res = await api.post(`/api/stories/${id}/chapters`, {
                        title: chapterTitle.trim(),
                        content: chapterContent.trim(),
                        status: 'published',
                      })
                      setChapters(prev => [...prev, res.data])
                      setChapterTitle('')
                      setChapterContent('')
                      notify('Chapter published.', 'success')
                    } catch (err) {
                      const detail = err?.response?.data?.detail
                      notify(typeof detail === 'string' ? detail : 'Failed to publish chapter.', 'error')
                    } finally {
                      setSavingChapter(false)
                    }
                  }}
                  className="btn-primary disabled:opacity-60"
                >
                  Publish chapter
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
