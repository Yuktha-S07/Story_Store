import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiEdit3, FiList, FiTrash2, FiUploadCloud } from 'react-icons/fi'
import { useNotification } from '../context/NotificationContext'
import BackButton from '../components/BackButton'
import { buildStoryCoverAlt, buildStoryCoverUrl, buildStoryFallbackUrl } from '../utils/storyCover'

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
      <section className="rounded-[28px] border border-[#e8d8c8] bg-[linear-gradient(135deg,#fffaf4_0%,#f5e9dd_100%)] p-6 shadow-[0_18px_50px_rgba(91,61,34,0.08)] md:p-9 dark:border-[#3b3047] dark:bg-[linear-gradient(135deg,#211a29_0%,#2b2235_100%)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#b06f7f] dark:text-[#e8917f]">Writer dashboard</p>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-[#28343a] md:text-3xl dark:text-gray-100">Welcome, {user.username}</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#6d6863] md:text-base dark:text-gray-400">A quiet place to shape your next story and keep every draft moving.</p>
          </div>
          <Link to="/write" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#d96f52] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(178,83,58,0.2)] transition hover:bg-[#c85f45] hover:shadow-[0_14px_24px_rgba(178,83,58,0.25)]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Create new story
          </Link>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#d9ebe4] bg-[#f2faf6] px-5 py-4 dark:border-[#26524a] dark:bg-[#1d2b27]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#628477] dark:text-emerald-300">Total stories</p>
          <p className="mt-2 font-serif text-4xl font-semibold text-[#29463d] dark:text-emerald-100">{stories.length}</p>
        </div>
        <div className="rounded-2xl border border-[#f1dcc9] bg-[#fff7ed] px-5 py-4 dark:border-[#5a3d23] dark:bg-[#33281f]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a56c43] dark:text-amber-300">Published</p>
          <p className="mt-2 font-serif text-4xl font-semibold text-[#8c4f2d] dark:text-amber-100">{published.length}</p>
        </div>
        <div className="rounded-2xl border border-[#ddd8ec] bg-[#f7f5fc] px-5 py-4 dark:border-[#4b3b6b] dark:bg-[#2b2538]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#776d9a] dark:text-purple-300">Drafts</p>
          <p className="mt-2 font-serif text-4xl font-semibold text-[#514970] dark:text-purple-100">{drafts}</p>
        </div>
      </div>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
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
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-6">
            {stories.map(s => (
              <div key={s._id} className="group flex flex-col overflow-hidden rounded-[22px] border border-[#dfd6cc] bg-[#fffdf9] shadow-[0_10px_30px_rgba(83,59,38,0.06)] transition-all hover:-translate-y-1 hover:border-[#d5a28d] hover:shadow-[0_18px_38px_rgba(83,59,38,0.12)] dark:border-[#3b3047] dark:bg-[#211a29] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] dark:hover:border-[#4b3b5d]">
                <div className="aspect-[4/3] overflow-hidden bg-[#eee6dd] dark:bg-gray-700">
                  <img
                    src={buildStoryCoverUrl(s)}
                    alt={buildStoryCoverAlt(s)}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = buildStoryFallbackUrl(s) }}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="truncate font-serif text-lg font-semibold text-[#28343a] dark:text-gray-100">{s.title}</h3>
                  <p className="mt-1 truncate text-sm text-[#77716b] dark:text-gray-400">{s.description}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.status === 'published' ? 'bg-[#e1f2e8] text-[#397356] dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-[#fff0d8] text-[#9b6728] dark:bg-amber-900/50 dark:text-amber-300'}`}>
                      {s.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    <span className="rounded-md bg-[#f0ece7] px-2 py-0.5 text-xs text-[#706b67] dark:bg-[#2f2835] dark:text-gray-300">{s.genre}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 sm:gap-2 dark:border-white/10">
                    <button onClick={() => setEditingStory(s)} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[#c9d9d2] bg-[#f5faf7] px-2 py-1.5 text-center text-xs font-semibold text-[#397356] transition hover:border-[#8fbaa7] hover:bg-[#e8f5ed] sm:px-3 sm:text-sm dark:border-[#31594f] dark:bg-[#1d3830] dark:text-[#9bd4bb] dark:hover:bg-[#25473d]" aria-label={`Edit ${s.title}`}>
                      <FiEdit3 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    {s.status !== 'published' && (
                      <button onClick={() => publishStory(s._id)} className="rounded-md bg-gradient-to-r from-green-500 to-green-600 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-white transition hover:from-green-600 hover:to-green-700 shadow-sm">Publish</button>
                    )}
                    <button onClick={() => deleteStory(s._id)} className="flex items-center justify-center gap-1.5 rounded-md border border-[#f0caca] bg-[#fff3f1] px-2 py-1.5 text-xs font-semibold text-[#b34f4f] shadow-sm transition hover:border-[#d98787] hover:bg-[#ffe5e2] sm:px-3 sm:text-sm dark:border-[#633c45] dark:bg-[#3a222b] dark:text-[#ffaaa3] dark:hover:bg-[#4a2933]" aria-label={`Delete ${s.title}`}>
                      <FiTrash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
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
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.25)] dark:border-slate-700 dark:bg-[#1f1b22]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
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
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-100"
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

              {editingStory.status !== 'published' && (
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
