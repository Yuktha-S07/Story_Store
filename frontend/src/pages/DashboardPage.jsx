import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiBookOpen, FiClock, FiEdit3, FiEye, FiList, FiTrash2, FiUploadCloud } from 'react-icons/fi'
import { useNotification } from '../context/NotificationContext'
import BackButton from '../components/BackButton'
import { buildStoryCoverAlt, buildStoryCoverUrl, buildStoryFallbackUrl } from '../utils/storyCover'
import CoverPreview from '../components/CoverPreview'

const formatStoryDate = (value) => {
  if (!value) return 'Recently updated'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently updated'
  return `Updated ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
}

export default function DashboardPage() {
  const { user } = useContext(AuthContext)
  const { notify, confirmAction } = useNotification()
  const [stories, setStories] = useState([])
  const [editingStory, setEditingStory] = useState(null)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      try {
        const res = await api.get('/api/stories?mine=true')
        setStories(res.data || [])
      } catch (err) {
        console.error(err)
      }
    }
    fetch()
  }, [user])

  const publishStory = async (storyId) => {
    try {
      const res = await api.post(`/api/stories/${storyId}/publish`)
      setStories(prev => prev.map(s => (s._id === storyId ? res.data : s)))
      notify('Story published.', 'success')
      window.dispatchEvent(new CustomEvent('story-store:story-updated', { detail: { storyId } }))
    } catch (err) {
      notify('Error publishing story.', 'error')
    }
  }

  const deleteStory = async (storyId) => {
    const shouldDelete = await confirmAction({
      title: 'Delete story',
      message: 'Are you sure you want to delete this story? This action cannot be undone.',
      confirmText: 'Delete story',
      cancelText: 'Keep story',
    })
    if (!shouldDelete) return
    try {
      await api.delete(`/api/stories/${storyId}`)
      setStories(prev => prev.filter(s => s._id !== storyId))
      notify('Story deleted.', 'success')
    } catch (err) {
      const detail = err?.response?.data?.detail
      notify(typeof detail === 'string' ? detail : 'Error deleting story.', 'error')
    }
  }

  if (!user) return <div className="text-center py-16 text-slate-600">Please login.</div>

  const published = stories.filter(s => s.status === 'published')
  const drafts = stories.length - published.length

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-10 font-sans md:space-y-10">
      <div className="flex items-center justify-between">
        <BackButton />
        <span className="rounded-full border border-[#d9c7b4] bg-[#fffaf4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b6b52] dark:border-[#4b3b5d] dark:bg-[#2b2235] dark:text-gray-300">Your studio</span>
      </div>
      <section className="rounded-[24px] border border-[#898481] bg-[linear-gradient(135deg,#fffaf4_0%,#f5e9dd_100%)] p-5 shadow-[0_18px_50px_rgba(91,61,34,0.08)] sm:p-6 md:rounded-[28px] md:p-9 dark:border-[#898481] dark:bg-[linear-gradient(135deg,#211a29_0%,#2b2235_100%)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#b06f7f] dark:text-[#e8917f]">Writer dashboard</p>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-[#28343a] md:text-3xl dark:text-gray-100">Welcome, {user.username}</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#6d6863] md:text-base dark:text-gray-400">A quiet place to shape your next story and keep every draft moving.</p>
          </div>
          <Link to="/write" className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#c99084] px-5 py-3 text-sm font-semibold text-[#6e342e] shadow-[0_10px_20px_rgba(224,111,84,0.16)] transition hover:bg-[#bc8377] hover:shadow-[0_14px_24px_rgba(224,111,84,0.22)] sm:w-auto md:mt-4">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Create new story
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-2xl border border-[#d9ebe4] bg-[#f2faf6] px-2 py-3.5 sm:px-5 sm:py-4 dark:border-[#26524a] dark:bg-[#1d2b27]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#628477] sm:text-xs sm:tracking-[0.16em] dark:text-emerald-300">Total stories</p>
          <p className="mt-1.5 font-serif text-3xl font-semibold text-[#29463d] sm:mt-2 sm:text-4xl dark:text-emerald-100">{stories.length}</p>
        </div>
        <div className="rounded-2xl border border-[#f1dcc9] bg-[#fff7ed] px-2 py-3.5 sm:px-5 sm:py-4 dark:border-[#5a3d23] dark:bg-[#33281f]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#a56c43] sm:text-xs sm:tracking-[0.16em] dark:text-amber-300">Published</p>
          <p className="mt-1.5 font-serif text-3xl font-semibold text-[#8c4f2d] sm:mt-2 sm:text-4xl dark:text-amber-100">{published.length}</p>
        </div>
        <div className="rounded-2xl border border-[#ddd8ec] bg-[#f7f5fc] px-2 py-3.5 sm:px-5 sm:py-4 dark:border-[#4b3b6b] dark:bg-[#2b2538]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#776d9a] sm:text-xs sm:tracking-[0.16em] dark:text-purple-300">Drafts</p>
          <p className="mt-1.5 font-serif text-3xl font-semibold text-[#514970] sm:mt-2 sm:text-4xl dark:text-purple-100">{drafts}</p>
        </div>
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-5 sm:gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b06f7f] dark:text-[#e8917f]">Your collection</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-[#28343a] md:text-3xl dark:text-gray-100">My Stories</h2>
          </div>
          <span className="rounded-full border border-[#d9c7b4] bg-[#fffaf4] px-3 py-1 text-xs font-semibold text-[#8b6b52] dark:border-[#4b3b5d] dark:bg-[#2b2235] dark:text-gray-300">{stories.length} {stories.length === 1 ? 'story' : 'stories'}</span>
        </div>
        {stories.length === 0 ? (
          <div className="border-y border-dashed border-slate-300 py-12 text-center dark:border-slate-600">
            <p className="text-slate-500 mb-4 dark:text-gray-400">No stories yet. Start your creative journey!</p>
            <Link to="/write" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#BDA6CE] to-[#b8a1c8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-[#b397bf] hover:to-[#ad92b9] hover:shadow-md">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Create your first story
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),460px))] justify-start gap-4 sm:gap-6">
            {stories.map(s => (
              <article key={s._id} className="story-card-surface group flex h-full flex-col overflow-hidden rounded-[22px] shadow-[0_10px_30px_rgba(83,59,38,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(83,59,38,0.12)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_18px_38px_rgba(0,0,0,0.4)]">
                <CoverPreview
                  src={buildStoryCoverUrl(s)}
                  fallbackSrc={buildStoryFallbackUrl(s)}
                  alt={buildStoryCoverAlt(s)}
                  title={s.title}
                  className="aspect-[5/3] bg-[#eee6dd] dark:bg-gray-700"
                  imageClassName="transition-transform duration-500 group-hover:scale-105"
                />
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <h3 className="truncate font-serif text-xl font-semibold text-[#28343a] dark:text-gray-100">{s.title}</h3>
                  <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-[#8b7a70] dark:text-gray-400">
                    <FiClock size={12} />
                    <span>{formatStoryDate(s.updated_at || s.created_at)}</span>
                  </div>
                  <p className="mt-2.5 min-h-[4rem] text-sm leading-5 text-[#77716b] dark:text-gray-400" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {s.description || 'No description yet. Add one to help readers discover your story.'}
                  </p>
                  <div className="mt-2.5 flex min-h-7 items-center gap-2 flex-wrap">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.status === 'published' ? 'bg-[#e1f2e8] text-[#397356] dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-[#fff0d8] text-[#9b6728] dark:bg-amber-900/50 dark:text-amber-300'}`}>
                      {s.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    <span className="rounded-md bg-[#f0ece7] px-2 py-0.5 text-xs text-[#706b67] dark:bg-[#2f2835] dark:text-gray-300">{s.genre}</span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#f0ece7] px-2 py-0.5 text-xs text-[#706b67] dark:bg-[#2f2835] dark:text-gray-300"><FiBookOpen size={12} /> {s.chapter_count || 0} {s.chapter_count === 1 ? 'chapter' : 'chapters'}</span>
                  </div>
                  <div className={`mt-auto grid gap-2 border-t border-[#898481] pt-3 dark:border-[#898481] ${s.status !== 'published' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    <Link to={`/stories/${s._id}`} className="flex min-h-10 items-center justify-center gap-1 rounded-md bg-[#4e4c5000] px-2 py-2 text-center text-xs font-semibold text-[#287568] transition hover:bg-[#d5ebe3] sm:text-sm dark:bg-[#4e4c5000] dark:text-[#9bd8ca] dark:hover:bg-[#275047]">
                      <FiEye className="h-3.5 w-3.5" /> View
                    </Link>
                    <button onClick={() => setEditingStory(s)} className="flex min-h-10 items-center justify-center gap-1 rounded-md border border-[#898481] bg-[#4e4c5000] px-2 py-2 text-center text-xs font-semibold text-[#397356] transition hover:border-[#8fbaa7] hover:bg-[#e8f5ed] sm:text-sm dark:border-[#898481] dark:bg-[#4e4c5000] dark:text-[#9bd4bb] dark:hover:bg-[#25473d]" aria-label={`Edit ${s.title}`}>
                      <FiEdit3 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    {s.status !== 'published' && (
                      <button onClick={() => publishStory(s._id)} className="flex min-h-10 items-center justify-center rounded-md bg-[#4e4c5000] px-2 py-2 text-xs font-medium text-[#3a7c5a] shadow-sm transition hover:bg-[#e4f2eb] sm:text-sm dark:bg-[#4e4c5000] dark:text-[#9bd8ca] dark:hover:bg-[#275047]">Publish</button>
                    )}
                    <button onClick={() => deleteStory(s._id)} className="flex min-h-10 items-center justify-center gap-1 rounded-md border border-[#898481] bg-[#4e4c5000] px-2 py-2 text-xs font-semibold text-[#b34f4f] shadow-sm transition hover:border-[#d98787] hover:bg-[#ffe5e2] sm:text-sm dark:border-[#898481] dark:bg-[#4e4c5000] dark:text-[#ffaaa3] dark:hover:bg-[#4a2933]" aria-label={`Delete ${s.title}`}>
                      <FiTrash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {editingStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setEditingStory(null)}
        >
          <div
            className="w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.25)] dark:border-slate-700 dark:bg-[#1f1b22]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            style={{ maxHeight: 'calc(100dvh - 2rem)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b06f7f] dark:text-[#e8917f]">Edit story</p>
                <h3 className="mt-1 truncate font-serif text-xl font-semibold text-slate-900 dark:text-gray-100">{editingStory.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">What would you like to edit?</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingStory(null)}
                aria-label="Close"
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <Link
                to={`/stories/${editingStory._id}/chapters`}
                className="group flex items-center gap-4 rounded-2xl bg-[#F7D6D0] px-5 py-5 shadow-[0_12px_28px_rgba(224,111,84,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(224,111,84,0.3)] dark:bg-[#EEEEEE] dark:shadow-[0_12px_28px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_16px_34px_rgba(0,0,0,0.35)]"
                onClick={() => setEditingStory(null)}
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/30">
                  <FiList className="h-7 w-7" />
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-xl font-bold leading-tight text-[#3f2a2a]">Edit chapters</span>
                  <span className="block text-sm text-[#5c3a3a]">Add, edit or delete chapters</span>
                </span>
              </Link>

              <Link
                to={`/stories/${editingStory._id}/edit`}
                className="flex items-center gap-4 rounded-2xl bg-[#F7D6D0] px-5 py-5 shadow-[0_12px_28px_rgba(224,111,84,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(224,111,84,0.3)] dark:bg-[#EEEEEE] dark:shadow-[0_12px_28px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_16px_34px_rgba(0,0,0,0.35)]"
                onClick={() => setEditingStory(null)}
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#BDA6CE] to-[#b8a1c8] text-white shadow-sm">
                  <FiEdit3 className="h-7 w-7" />
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-xl font-bold leading-tight text-[#3f2a2a]">Edit story details</span>
                  <span className="block text-sm text-[#5c3a3a]">Title, description, genre, tags &amp; cover</span>
                </span>
              </Link>

              {editingStory.status !== 'published' && editingStory.chapter_count > 0 && (
                <button
                  type="button"
                  onClick={async () => {
                    const storyId = editingStory._id
                    setEditingStory(null)
                    await publishStory(storyId)
                  }}
                  className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-green-500/50 hover:bg-green-50 hover:shadow-md dark:border-slate-700 dark:bg-[#1f1b22] dark:hover:border-green-500/50 dark:hover:bg-[#22301f]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-sm">
                    <FiUploadCloud className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block font-serif text-base font-semibold text-slate-900 dark:text-gray-100">Publish story</span>
                    <span className="block text-xs text-slate-500 dark:text-gray-400">Make this draft visible to everyone</span>
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={async () => {
                  const storyId = editingStory._id
                  setEditingStory(null)
                  await deleteStory(storyId)
                }}
                className="flex w-full items-center gap-4 rounded-xl border border-[#f0caca] bg-[#fff3f1] px-4 py-3.5 text-left transition hover:-translate-y-0.5 hover:border-[#d98787] hover:bg-[#ffe5e2] hover:shadow-md dark:border-[#633c45] dark:bg-[#3a222b] dark:text-[#ffaaa3] dark:hover:bg-[#4a2933]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7d6d0] text-[#b34f4f] dark:bg-[#5a3038] dark:text-[#ffaaa3]">
                  <FiTrash2 className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-base font-semibold text-[#8f3d3d] dark:text-[#ffaaa3]">Delete story</span>
                  <span className="block text-xs text-[#a65f5f] dark:text-[#e69a94]">Remove this story and all of its chapters</span>
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setEditingStory(null)}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <FiArrowLeft className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
