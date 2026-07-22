import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { Link } from 'react-router-dom'
import { useNotification } from '../context/NotificationContext'
import { buildStoryCoverAlt, buildStoryCoverUrl, buildStoryFallbackUrl } from '../utils/storyCover'

export default function DashboardPage() {
  const { user } = useContext(AuthContext)
  const { notify, confirmAction } = useNotification()
  const [stories, setStories] = useState([])

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

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-7 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">Welcome, {user.username}</h1>
        <p className="text-slate-500 mt-1">Create and manage your stories.</p>
        <Link to="/write" className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#BDA6CE] to-[#b8a1c8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-[#b397bf] hover:to-[#ad92b9] hover:shadow-md">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Create new story
        </Link>
      </section>

      <div className="grid grid-cols-2 gap-4 md:gap-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total stories</p>
          <p className="text-3xl font-bold mt-1.5 text-slate-800">{stories.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Published</p>
          <p className="text-3xl font-bold mt-1.5 text-slate-800">{published.length}</p>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-slate-900">My Stories</h2>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-500 rounded-full">{stories.length} {stories.length === 1 ? 'story' : 'stories'}</span>
        </div>
        {stories.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500 mb-4">No stories yet. Start your creative journey!</p>
            <Link to="/write" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#BDA6CE] to-[#b8a1c8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-[#b397bf] hover:to-[#ad92b9] hover:shadow-md">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Create your first story
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
            {stories.map(s => (
              <div key={s._id} className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all">
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={buildStoryCoverUrl(s)}
                    alt={buildStoryCoverAlt(s)}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = buildStoryFallbackUrl(s) }}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col flex-1 p-4">
                  <h3 className="font-semibold text-base text-slate-900 truncate">{s.title}</h3>
                  <p className="text-sm text-slate-500 mt-0.5 truncate">{s.description}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${s.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {s.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{s.genre}</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-slate-100">
                    <Link to={`/stories/${s._id}/edit`} className="flex-1 text-center rounded-md border border-slate-300 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-400">Edit</Link>
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

    </div>
  )
}
