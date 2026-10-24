import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import BackButton from '../components/BackButton'
import { FiBookOpen, FiCheck, FiEdit3, FiFeather, FiList, FiChevronLeft, FiArrowRight } from 'react-icons/fi'
import { buildStoryCoverAlt, buildStoryCoverUrl, buildStoryFallbackUrl } from '../utils/storyCover'
import GenreSelect from '../components/GenreSelect'

export default function StoryEditorPage() {
  const { user } = useContext(AuthContext)
  const { notify } = useNotification()
  const navigate = useNavigate()

  const [mode, setMode] = useState('landing') // 'landing' | 'new' | 'edit'
  const [stories, setStories] = useState([])
  const [storiesLoading, setStoriesLoading] = useState(false)
  const [selectedStory, setSelectedStory] = useState(null) // story chosen for the details/chapters prompt

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

  const loadStories = async () => {
    setStoriesLoading(true)
    setSelectedStory(null)
    try {
      const res = await api.get('/api/stories?mine=true')
      setStories(res.data || [])
    } catch (err) {
      console.error(err)
      notify('Failed to load your stories.', 'error')
    } finally {
      setStoriesLoading(false)
    }
    setMode('edit')
  }

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

  // ---------- Landing hub ----------
  if (mode === 'landing') {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-7 pb-10 font-sans">
        <div className="flex items-center justify-between">
          <BackButton />
          <span className="rounded-full border border-[#d9c7b4] bg-[#fffaf4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b6b52] dark:border-[#4b3b5d] dark:bg-[#2b2235] dark:text-gray-300">Story studio</span>
        </div>

        <section className="w-full">
          <div className="mb-9 border-b border-[#e8d8c8] pb-6 dark:border-[#3b3047]">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b06f7f] dark:text-[#e8917f]">Create &amp; manage</p>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#28343a] md:text-3xl dark:text-gray-100">Write a Story</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#6d6863] dark:text-gray-400">Begin a new tale or continue your current story.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* ---- Start a new story ---- */}
            <button
              type="button"
              onClick={() => setMode('new')}
              className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-3xl border border-[#f0c7ba] bg-[linear-gradient(150deg,#fff7f2_0%,#ffe9df_55%,#ffd9c8_100%)] p-7 text-left shadow-[0_18px_40px_rgba(224,111,84,0.12)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#E87B5D] hover:shadow-[0_26px_50px_rgba(224,111,84,0.22)] dark:border-[#5c3a42] dark:bg-[linear-gradient(150deg,#2a1b26_0%,#3a2330_55%,#4a2836_100%)] dark:hover:border-[#E87B5D]/80 dark:hover:shadow-[0_26px_50px_rgba(0,0,0,0.5)]"
            >
              <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-[#E87B5D]/30 bg-white/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d96a52] backdrop-blur-sm dark:border-[#E87B5D]/40 dark:bg-black/20 dark:text-[#f0a98c]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E87B5D]" />
                New
              </span>

              <span className="mt-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E87B5D] to-[#f0a37f] text-white shadow-[0_12px_24px_rgba(224,111,84,0.35)] ring-4 ring-white/40 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 dark:ring-white/10">
                <FiFeather className="h-8 w-8" />
              </span>

              <span className="mt-6 block">
                <span className="block font-serif text-2xl font-semibold leading-tight text-[#3a2620] dark:text-[#fbe6de]">Start a new story</span>
                <span className="mt-2 block text-sm leading-6 text-[#7a4b3d] dark:text-[#e6b8a4]">Give a fresh idea a home — title, genre and cover, then write your first chapter.</span>
              </span>

              <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-[#E87B5D] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform duration-300 group-hover:gap-3 group-hover:shadow-md">
                Get started
                <FiArrowRight className="h-4 w-4" />
              </span>
            </button>

            {/* ---- Edit an existing story ---- */}
            <button
              type="button"
              onClick={loadStories}
              className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-3xl border border-[#d8c7ec] bg-[linear-gradient(150deg,#fbf8ff_0%,#f1e9fb_55%,#e4d6f5_100%)] p-7 text-left shadow-[0_18px_40px_rgba(130,95,155,0.12)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#BDA6CE] hover:shadow-[0_26px_50px_rgba(130,95,155,0.22)] dark:border-[#4b3b5d] dark:bg-[linear-gradient(150deg,#211a29_0%,#2c2238_55%,#372a47_100%)] dark:hover:border-[#BDA6CE] dark:hover:shadow-[0_26px_50px_rgba(0,0,0,0.5)]"
            >
              <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-[#BDA6CE]/40 bg-white/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a5a9a] backdrop-blur-sm dark:border-[#c4ade0]/30 dark:bg-black/20 dark:text-[#d9c5eb]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#BDA6CE]" />
                Continue
              </span>

              <span className="mt-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#BDA6CE] to-[#a98cc4] text-white shadow-[0_12px_24px_rgba(130,95,155,0.35)] ring-4 ring-white/40 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 dark:ring-white/10">
                <FiEdit3 className="h-8 w-8" />
              </span>

              <span className="mt-6 block">
                <span className="block font-serif text-2xl font-semibold leading-tight text-[#33294a] dark:text-[#eee3fb]">Edit an existing story</span>
                <span className="mt-2 block text-sm leading-6 text-[#6d5a8e] dark:text-[#cbb6e4]">Jump back into one of your stories to refresh its details or keep writing chapters.</span>
              </span>

              <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-[#BDA6CE] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform duration-300 group-hover:gap-3 group-hover:shadow-md">
                Choose a story
                <FiArrowRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        </section>
      </div>
    )
  }

  // ---------- Edit existing story ----------
  if (mode === 'edit') {
    // Once a story is chosen, ask: details or chapters?
    if (selectedStory) {
      return (
        <div className="mx-auto w-full max-w-3xl space-y-7 pb-10 font-sans">
          <div className="flex items-center justify-between">
            <BackButton />
            <span className="rounded-full border border-[#d9c7b4] bg-[#fffaf4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b6b52] dark:border-[#4b3b5d] dark:bg-[#2b2235] dark:text-gray-300">Edit existing</span>
          </div>

          <section className="w-full">
            <div className="mb-8 border-b border-[#e8d8c8] pb-6">
              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6d6863] transition hover:text-[#28343a]"
              >
                <FiChevronLeft className="h-4 w-4" />
                Back to all stories
              </button>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b06f7f] dark:text-[#e8917f]">Selected</p>
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#28343a] md:text-3xl dark:text-gray-100">{selectedStory.title}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#6d6863] dark:text-gray-400">What would you like to edit?</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate(`/stories/${selectedStory._id}/edit`)}
                className="story-card-surface group flex flex-col items-start gap-4 rounded-2xl p-7 text-left transition hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-none"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E87B5D] to-[#e59a7d] text-white shadow-sm">
                  <FiEdit3 className="h-6 w-6" />
                </span>
                <span>
                  <span className="block font-serif text-xl font-semibold text-[#28343a] dark:text-gray-100">Edit story details</span>
                  <span className="mt-1 block text-sm leading-6 text-[#6d6863] dark:text-gray-400">Title, description, genre, tags &amp; cover.</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/stories/${selectedStory._id}/chapters`)}
                className="story-card-surface group flex flex-col items-start gap-4 rounded-2xl p-7 text-left transition hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-none"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#BDA6CE] to-[#b8a1c8] text-white shadow-sm">
                  <FiList className="h-6 w-6" />
                </span>
                <span>
                  <span className="block font-serif text-xl font-semibold text-[#28343a] dark:text-gray-100">Edit chapters</span>
                  <span className="mt-1 block text-sm leading-6 text-[#6d6863] dark:text-gray-400">Add, edit, or delete chapters.</span>
                </span>
              </button>
            </div>
          </section>
        </div>
      )
    }

    // Otherwise show the list of the user's stories
    return (
      <div className="mx-auto w-full max-w-4xl space-y-7 pb-10 font-sans">
        <div className="flex items-center justify-between">
          <BackButton />
          <span className="rounded-full border border-[#d9c7b4] bg-[#fffaf4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b6b52] dark:border-[#4b3b5d] dark:bg-[#2b2235] dark:text-gray-300">Edit existing</span>
        </div>

        <section className="w-full">
          <div className="mb-8 border-b border-[#d8e2dd] pb-7 dark:border-[#3b3047]">
            <button
              type="button"
              onClick={() => setMode('landing')}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6d6863] transition hover:text-[#28343a] dark:text-gray-400 dark:hover:text-gray-100"
            >
              <FiChevronLeft className="h-4 w-4" />
              Back to options
            </button>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b06f7f] dark:text-[#e8917f]">Your collection</p>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#28343a] md:text-3xl dark:text-gray-100">Choose a Story to Edit</h2>
          </div>

          {storiesLoading ? (
            <div className="py-10 text-center text-sm text-slate-500 dark:text-gray-400">Loading your stories...</div>
          ) : stories.length === 0 ? (
            <div className="border-y border-dashed border-slate-300 py-12 text-center dark:border-slate-600">
              <p className="text-slate-500 dark:text-gray-400">You have no stories yet.</p>
              <button
                type="button"
                onClick={() => setMode('new')}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#d96f52] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c85f45]"
              >
                <FiFeather className="h-4 w-4" />
                Start a new story
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {stories.map(s => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => setSelectedStory(s)}
                  className="story-card-surface group relative flex min-h-[290px] flex-col overflow-hidden rounded-[24px] text-left shadow-[0_10px_26px_rgba(53,83,68,0.08)] outline outline-1 outline-transparent outline-offset-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(53,83,68,0.16)] focus:outline-2 focus:outline-[#cbd9d2] focus:outline-offset-2 dark:shadow-[0_10px_30px_rgba(0,0,0,0.28)] dark:focus:outline-[#3b5a4d]"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#dfece5] dark:bg-[#263d34]">
                    <img
                      src={buildStoryCoverUrl(s)}
                      alt={buildStoryCoverAlt(s)}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = buildStoryFallbackUrl(s) }}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent opacity-70" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-4 border-t border-[#e6eee9] bg-transparent p-5 dark:border-[#315044]">
                    <div className="min-w-0">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#729283] dark:text-[#9ac9b0]">Story</p>
                      <h3 className="truncate font-serif text-xl font-semibold tracking-tight text-[#263c34] dark:text-gray-100">{s.title}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] shadow-sm ${s.status === 'published' ? 'border-[#b9dec9] bg-[linear-gradient(135deg,#effbf3_0%,#dcefe4_100%)] text-[#287052] dark:border-[#39715a] dark:bg-[linear-gradient(135deg,#245440_0%,#1d4939_100%)] dark:text-[#a9e0bf]' : 'border-[#ead2a9] bg-[linear-gradient(135deg,#fff9eb_0%,#fff0d0_100%)] text-[#9b6728] dark:border-[#72552a] dark:bg-[linear-gradient(135deg,#59441f_0%,#49371d_100%)] dark:text-[#f2cf9b]'}`}>
                        <span className={`flex h-4 w-4 items-center justify-center rounded-full ${s.status === 'published' ? 'bg-[#78b894] text-white dark:bg-[#6fb58f]' : 'bg-[#d8a75f] text-white dark:bg-[#b88743]'}`}>
                          {s.status === 'published' ? <FiCheck className="h-2.5 w-2.5" strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                        {s.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#d6e2db] bg-[linear-gradient(135deg,#f8fcf9_0%,#edf5f0_100%)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#617d6e] shadow-sm dark:border-[#385247] dark:bg-[linear-gradient(135deg,#2c473b_0%,#263d34_100%)] dark:text-[#b6cec0]">
                        <FiBookOpen className="h-3.5 w-3.5 text-[#6b9b83] dark:text-[#91c4a6]" />
                        {s.chapter_count || 0} {s.chapter_count === 1 ? 'chapter' : 'chapters'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    )
  }

  // ---------- New story form ----------
  return (
    <div className="mx-auto w-full max-w-4xl space-y-7 pb-10 font-sans">
      <div className="flex items-center justify-between">
        <BackButton />
        <span className="rounded-full border border-[#d9c7b4] bg-[#fffaf4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b6b52] dark:border-[#4b3b5d] dark:bg-[#2b2235] dark:text-gray-300">New story</span>
      </div>

      <section className="w-full pb-2">
        <div className="mb-7 flex items-end justify-between gap-6 border-b border-[#e8d8c8] pb-6 dark:border-[#3b3047]">
          <div>
            <button
              type="button"
              onClick={() => setMode('landing')}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6d6863] transition hover:text-[#28343a] dark:text-gray-400 dark:hover:text-gray-100"
            >
              <FiChevronLeft className="h-4 w-4" />
              Back to options
            </button>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b06f7f] dark:text-[#e8917f]">Story studio</p>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#28343a] md:text-3xl dark:text-gray-100">Write a Story</h2>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 dark:text-gray-300">Story title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Give your story a memorable title"
              className="w-full rounded-xl border border-[#d9d2c9] bg-[#fffdf9] px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20 dark:border-slate-700 dark:bg-[#1d1824] dark:text-gray-200 dark:placeholder:text-gray-500"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 dark:text-gray-300">Genre</label>
              <GenreSelect
                value={genre}
                onChange={setGenre}
                className="rounded-xl border-[#d9d2c9] bg-[#fffdf9] dark:border-slate-700 dark:bg-[#1d1824] dark:text-gray-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 dark:text-gray-300">Tags</label>
              <input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="friendships, tragedy, emotional"
                className="w-full rounded-xl border border-[#d9d2c9] bg-[#fffdf9] px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20 dark:border-slate-700 dark:bg-[#1d1824] dark:text-gray-200 dark:placeholder:text-gray-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 dark:text-gray-300">Short description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Give readers a glimpse of what awaits them"
              className="h-32 w-full resize-y rounded-xl border border-[#d9d2c9] bg-[#fffdf9] px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20 dark:border-slate-700 dark:bg-[#1d1824] dark:text-gray-200 dark:placeholder:text-gray-500"
            />
          </div>

          <div className="grid gap-4 rounded-2xl border border-[#e8d8c8] bg-[#fffaf4] p-4 sm:grid-cols-[150px_1fr] sm:items-center dark:border-[#3b3047] dark:bg-[#211a29]">
            <input
              id="cover-upload"
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <label
              htmlFor="cover-upload"
              className="group flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#d9c7b4] bg-[#fffdf9] transition hover:border-[#E87B5D] hover:bg-[#FFF7F4] dark:border-[#4b3b5d] dark:bg-[#1d1824] dark:hover:border-[#E87B5D] dark:hover:bg-[#241d2c]"
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
              <p className="text-sm font-semibold text-[#4b4a48] dark:text-gray-200">Add a cover image</p>
              <p className="mt-1 text-xs leading-5 text-[#817970] dark:text-gray-400">PNG or JPEG recommended. A cover helps your story stand out.</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-[#e8d8c8] pt-4">
            <button type="button" onClick={() => setMode('landing')} className="btn-ghost">Cancel</button>
            <button disabled={saving} className="btn-primary px-7 disabled:opacity-60">{saving ? 'Creating...' : 'Create Story'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
