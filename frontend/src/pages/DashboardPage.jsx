import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { Link, useNavigate } from 'react-router-dom'
import { useNotification } from '../context/NotificationContext'
import { buildStoryCoverAlt, buildStoryCoverUrl, buildStoryFallbackUrl } from '../utils/storyCover'

export default function DashboardPage() {
  const { user } = useContext(AuthContext)
  const { notify, confirmAction } = useNotification()
  const navigate = useNavigate()
  const [stories, setStories] = useState([])
  const [latestReading, setLatestReading] = useState(null)
  const [drafts, setDrafts] = useState([])
  const [draftChapters, setDraftChapters] = useState([])

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      try {
        const res = await api.get('/api/stories?mine=true')
        setStories(res.data || [])
        setDrafts((res.data || []).filter(s => s.status !== 'published'))
      } catch (err) {
        console.error(err)
      }
    }
    fetch()
  }, [user])

  useEffect(() => {
    if (!user) return
    const fetchHistory = async () => {
      try {
        const res = await api.get('/api/history')
        const history = res.data || []
        if (history.length === 0) return
        const latest = history[0]
        const storyRes = await api.get(`/api/stories/${latest.story_id}`)
        const chapterRes = await api.get(`/api/chapters/${latest.chapter_id}`)
        setLatestReading({
          story: storyRes.data,
          chapter: chapterRes.data,
        })
      } catch (err) {
        console.error(err)
      }
    }
    fetchHistory()
  }, [user])

  useEffect(() => {
    if (!user) return
    const fetchDraftChapters = async () => {
      try {
        const res = await api.get('/api/chapters?mine=true')
        const allChapters = res.data || []
        setDraftChapters(allChapters.filter(c => c.status !== 'published'))
      } catch (err) {
        console.error(err)
      }
    }
    fetchDraftChapters()
  }, [user])

  const publishStory = async (storyId) => {
    try {
      const res = await api.post(`/api/stories/${storyId}/publish`)
      setStories(prev => prev.map(s => (s._id === storyId ? res.data : s)))
      notify('Story published successfully.', 'success')
      // Notify other tabs/pages that a story changed status
      window.dispatchEvent(new CustomEvent('story-store:story-updated', { detail: { storyId } }))
    } catch (err) {
      console.error(err)
      notify('Error publishing story.', 'error')
    }
  }

  const publishChapter = async (chapterId) => {
    try {
      const res = await api.post(`/api/chapters/${chapterId}/publish`)
      setDraftChapters(prev => prev.filter(c => c._id !== chapterId))
      notify('Chapter published successfully.', 'success')
      // Notify other pages that a chapter (and possibly its story) changed
      const storyId = res?.data?.story_id
      window.dispatchEvent(new CustomEvent('story-store:story-updated', { detail: { chapterId, storyId } }))
    } catch (err) {
      console.error(err)
      notify('Error publishing chapter.', 'error')
    }
  }

  const deleteStory = async (storyId) => {
    const shouldDelete = await confirmAction({
      title: 'Delete story',
      message: 'Are you sure you want to delete this story? This action cannot be undone.',
      confirmText: 'Delete story',
      cancelText: 'Keep story',
    })
    if (!shouldDelete) {
      return
    }
    try {
      await api.delete(`/api/stories/${storyId}`)
      setStories(prev => prev.filter(s => s._id !== storyId))
      setDrafts(prev => prev.filter(s => s._id !== storyId))
      setLatestReading(prev => (prev?.story?._id === storyId ? null : prev))
      notify('Story deleted successfully.', 'success')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error(err)
      const detail = err?.response?.data?.detail
      const message = typeof detail === 'string' ? detail : 'Error deleting story.'
      notify(message, 'error')
    }
  }

  if (!user) return <div>Please login.</div>

  const API_URL = import.meta.env.VITE_API_URL || ''
  const resolveImage = (img) => {
    if (!img) return '/Hero_Image.png'
    if (/^https?:\/\//.test(img)) return img
    if (img.startsWith('/')) return `${API_URL}${img}`
    return img
  }

  return (
    <div className="space-y-6">
      <section className="surface p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold">Welcome, {user.username}</h1>
          <p className="text-slate-600 mt-1 text-sm max-w-xl">Create and manage your stories.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/write" className="btn-primary">Create new story</Link>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="surface p-4 flex flex-col border border-blue-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition-all bg-gradient-to-br from-blue-50 to-white">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total stories</div>
          <div className="text-3xl font-bold mt-2 text-blue-700">{stories.length}</div>
        </div>
        <div className="surface p-4 flex flex-col border border-green-200 rounded-lg shadow-sm hover:shadow-md hover:border-green-300 transition-all bg-gradient-to-br from-green-50 to-white">
          <div className="text-xs font-semibold text-green-600 uppercase tracking-wide">Published</div>
          <div className="text-3xl font-bold mt-2 text-green-700">{stories.filter(s => s.status === 'published').length}</div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2"><span className="inline-block w-1 h-6 bg-slate-600 rounded"></span>My Stories</h2>
          <div className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">{stories.length} {stories.length === 1 ? 'story' : 'stories'}</div>
        </div>
        {stories.length === 0 ? (
          <div className="surface p-8 text-center border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition">
            <div className="text-5xl mb-3">📖</div>
            <p className="text-slate-600 mb-3">No stories yet. Start your creative journey!</p>
            <Link to="/write" className="inline-block px-6 py-2 bg-gradient-to-r from-[#BDA6CE] to-[#b8a1c8] hover:from-[#b397bf] hover:to-[#ad92b9] text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md">Create your first story</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.map(s => (
              <div key={s._id} className="surface p-4 rounded-lg overflow-hidden flex flex-col h-full border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all">
                <div className="aspect-[4/3] overflow-hidden rounded-md mb-3 bg-gradient-to-br from-gray-200 to-gray-100 border border-slate-200">
                  <img
                    src={buildStoryCoverUrl(s)}
                    alt={buildStoryCoverAlt(s)}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = buildStoryFallbackUrl(s) }}
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mb-3 flex-1">
                  <h3 className="font-semibold text-lg truncate text-slate-800">{s.title}</h3>
                  <p className="text-sm text-slate-600 mt-1 truncate">{s.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${s.status === 'published' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                      {s.status === 'published' ? '✓ Published' : '○ Draft'}
                    </span>
                    <span className="text-xs text-slate-500 truncate bg-slate-100 px-2 py-1 rounded">{s.genre}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <Link 
                    to={`/stories/${s._id}/edit`} 
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 hover:bg-slate-100 hover:border-slate-400 text-slate-700 text-sm font-medium rounded-md transition text-center"
                  >
                    ✎ Edit
                  </Link>
                  {s.status !== 'published' && (
                    <button 
                      onClick={() => publishStory(s._id)} 
                      className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium rounded-md transition-all shadow-sm hover:shadow-md"
                    >
                      Publish
                    </button>
                  )}
                  <button 
                    onClick={() => deleteStory(s._id)} 
                    className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-md transition-all shadow-sm hover:shadow-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Drafts section removed as requested */}
    </div>
  )
}
