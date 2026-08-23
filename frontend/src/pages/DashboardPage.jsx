import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiEdit3, FiList, FiUploadCloud } from 'react-icons/fi'
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
        <span className="rounded-full border border-[#d9c7b4] bg-[#fffaf4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b6b52]">Your studio</span>
      </div>
      <section className="rounded-[28px] border border-[#e8d8c8] bg-[linear-gradient(135deg,#fffaf4_0%,#f5e9dd_100%)] p-6 shadow-[0_18px_50px_rgba(91,61,34,0.08)] md:p-9">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#b06f7f]">Writer dashboard</p>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-[#28343a] md:text-3xl">Welcome, {user.username}</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#6d6863] md:text-base">A quiet place to shape your next story and keep every draft moving.</p>
          </div>
          <Link to="/write" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#d96f52] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(178,83,58,0.2)] transition hover:bg-[#c85f45] hover:shadow-[0_14px_24px_rgba(178,83,58,0.25)]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Create new story
          </Link>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#d9ebe4] bg-[#f2faf6] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#628477]">Total stories</p>
          <p className="mt-2 font-serif text-4xl font-semibold text-[#29463d]">{stories.length}</p>
        </div>
        <div className="rounded-2xl border border-[#f1dcc9] bg-[#fff7ed] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a56c43]">Published</p>
          <p className="mt-2 font-serif text-4xl font-semibold text-[#8c4f2d]">{published.length}</p>
        </div>
        <div className="rounded-2xl border border-[#ddd8ec] bg-[#f7f5fc] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#776d9a]">Drafts</p>
          <p className="mt-2 font-serif text-4xl font-semibold text-[#514970]">{drafts}</p>
        </div>
      </div>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b06f7f]">Your collection</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-[#28343a] md:text-3xl">My Stories</h2>
          </div>
          <span className="rounded-full border border-[#d9c7b4] bg-[#fffaf4] px-3 py-1 text-xs font-semibold text-[#8b6b52]">{stories.length} {stories.length === 1 ? 'story' : 'stories'}</span>
        </div>
        {stories.length === 0 ? (
          <div className="border-y border-dashed border-slate-300 py-12 text-center">
            <p className="text-slate-500 mb-4">No stories yet. Start your creative journey!</p>
            <Link to="/write" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#BDA6CE] to-[#b8a1c8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-[#b397bf] hover:to-[#ad92b9] hover:shadow-md">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Create your first story
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-6">
            {stories.map(s => (
              <div key={s._id} className="group flex flex-col overflow-hidden rounded-[22px] border border-[#dfd6cc] bg-[#fffdf9] shadow-[0_10px_30px_rgba(83,59,38,0.06)] transition-all hover:-translate-y-1 hover:border-[#d5a28d] hover:shadow-[0_18px_38px_rgba(83,59,38,0.12)]">
                <div className="aspect-[4/3] overflow-hidden bg-[#eee6dd]">
                  <img
                    src={buildStoryCoverUrl(s)}
                    alt={buildStoryCoverAlt(s)}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = buildStoryFallbackUrl(s) }}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="truncate font-serif text-lg font-semibold text-[#28343a]">{s.title}</h3>
                  <p className="mt-1 truncate text-sm text-[#77716b]">{s.description}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.status === 'published' ? 'bg-[#e1f2e8] text-[#397356]' : 'bg-[#fff0d8] text-[#9b6728]'}`}>
                      {s.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    <span className="rounded-md bg-[#f0ece7] px-2 py-0.5 text-xs text-[#706b67]">{s.genre}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 sm:gap-2">
                    <button onClick={() => setEditingStory(s)} className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-center text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 sm:px-3 sm:text-sm">Edit</button>
                    {s.status !== 'published' && (
                      <button onClick={() => publishStory(s._id)} className="rounded-md bg-gradient-to-r from-green-500 to-green-600 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-white transition hover:from-green-600 hover:to-green-700 shadow-sm">Publish</button>
                    )}
                    <button onClick={() => deleteStory(s._id)} className="rounded-md bg-gradient-to-r from-red-500 to-red-600 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-white transition hover:from-red-600 hover:to-red-700 shadow-sm">Delete</button>
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
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.25)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b06f7f]">Edit story</p>
                <h3 className="mt-1 truncate font-serif text-xl font-semibold text-slate-900">{editingStory.title}</h3>
                <p className="mt-1 text-sm text-slate-500">What would you like to edit?</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingStory(null)}
                aria-label="Close"
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <Link
                to={`/stories/${editingStory._id}/edit`}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-[#E87B5D]/50 hover:bg-[#FFF7F4] hover:shadow-md"
                onClick={() => setEditingStory(null)}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#BDA6CE] to-[#b8a1c8] text-white shadow-sm">
                  <FiEdit3 className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-base font-semibold text-slate-900">Edit story details</span>
                  <span className="block text-xs text-slate-500">Title, description, genre, tags &amp; cover</span>
                </span>
              </Link>

              <Link
                to={`/stories/${editingStory._id}/chapters`}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-[#E87B5D]/50 hover:bg-[#FFF7F4] hover:shadow-md"
                onClick={() => setEditingStory(null)}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E87B5D] to-[#e59a7d] text-white shadow-sm">
                  <FiList className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-base font-semibold text-slate-900">Edit chapters</span>
                  <span className="block text-xs text-slate-500">Add, edit or delete chapters</span>
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
                  className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-green-500/50 hover:bg-green-50 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-sm">
                    <FiUploadCloud className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block font-serif text-base font-semibold text-slate-900">Publish story</span>
                    <span className="block text-xs text-slate-500">Make this draft visible to everyone</span>
                  </span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setEditingStory(null)}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
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
