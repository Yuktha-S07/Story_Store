import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useNotification } from '../context/NotificationContext'
import StoryCard from '../components/StoryCard'
import BackButton from '../components/BackButton'
import { FiBookmark, FiCompass, FiFeather } from 'react-icons/fi'

export default function BookmarksPage() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const { notify } = useNotification()

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/api/bookmarks')
        const bookmarks = res.data || []
        const storyIds = Array.from(new Set(bookmarks.map(b => String(b.story_id))))
        if (storyIds.length === 0) {
          setStories([])
          return
        }
        const storyRes = await api.get('/api/stories', { params: { ids: storyIds.join(',') } })
        const byId = {}
        ;(Array.isArray(storyRes.data) ? storyRes.data : []).forEach(s => { byId[s._id] = s })
        const ordered = bookmarks
          .map(b => byId[String(b.story_id)])
          .filter(Boolean)
        setStories(ordered)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const handleUnsave = async (storyId) => {
    try {
      await api.delete(`/api/stories/${storyId}/bookmark`)
      setStories(prev => prev.filter(s => (s._id || s.id) !== storyId))
      notify('Bookmark removed.', 'info')
    } catch (err) {
      console.error(err)
      if (err?.response?.status === 401 || err?.response?.status === 403) return
      notify('Failed to remove bookmark.', 'error')
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl pb-12">
      <div className="mb-7 flex items-center justify-between">
        <BackButton label="Library" />
        <div className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8b6b52] sm:flex">
          <FiBookmark className="h-4 w-4" aria-hidden="true" />
          Saved library
        </div>
      </div>

      <section className="relative isolate overflow-hidden rounded-[24px] border border-[#ead8ca] bg-[#f8eee7] shadow-[0_16px_40px_rgba(111,68,80,0.08)] dark:border-[#4b3b5d] dark:bg-[#2a2132] dark:shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
        <div className="absolute -right-20 -top-24 -z-10 h-64 w-64 rounded-full border-[24px] border-[#f1d8cb]/80 dark:border-[#493856]/70" />
        <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-end md:p-9">
          <div>
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8b6a5] text-[#6a3440] shadow-sm dark:bg-[#6a3f51] dark:text-[#ffd4c8]">
              <FiBookmark className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6655] dark:text-[#e6b7a1]">Your reading list</p>
            <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-[#3d2930] dark:text-[#f1e8f5] md:text-3xl">Bookmarks</h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-[#765f59] dark:text-gray-300">Stories you saved for later.</p>
          </div>
          <div className="flex items-end gap-4 border-t border-[#e5cfc2] pt-4 dark:border-white/10 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6655] dark:text-gray-400">Saved</p>
              <p className="mt-1 font-serif text-3xl font-semibold leading-none text-[#6a3440] dark:text-[#ffd4c8]">{stories.length}</p>
            </div>
            <FiFeather className="mb-0.5 h-6 w-6 text-[#b87862] dark:text-[#e3a6a6]" aria-hidden="true" />
          </div>
        </div>
      </section>

      <div className="mb-5 mt-9 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a6655] dark:text-[#e6b7a1]">Collection</p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-[#3d2930] dark:text-gray-100">Saved stories</h2>
        </div>
        {!loading && stories.length > 0 && <span className="text-sm text-[#687b78] dark:text-gray-400">{stories.length === 1 ? '1 story' : `${stories.length} stories`}</span>}
      </div>

      {loading && <div className="rounded-2xl border border-[#d7e6e2] bg-[#f7fcfa] px-5 py-10 text-center text-sm text-[#687b78] dark:border-[#4b3b5d] dark:bg-[#211a29] dark:text-gray-300">Loading your shelf...</div>}
      {!loading && stories.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-[#c9d9d5] bg-[#f7fcfa] px-6 py-14 text-center dark:border-[#4b3b5d] dark:bg-[#211a29]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e3f0e7] text-[#397356] dark:bg-[#3c5a4c] dark:text-[#b8e4c8]"><FiBookmark className="h-6 w-6" aria-hidden="true" /></div>
          <h3 className="mt-5 font-serif text-xl font-semibold text-[#283d3c] dark:text-gray-100">Your shelf is waiting</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#687b78] dark:text-gray-400">Find a story that catches your attention and save it here for your next reading session.</p>
          <Link to="/stories" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#397356] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d5d45] dark:bg-[#6b9f82] dark:text-[#17251d] dark:hover:bg-[#84b798]"><FiCompass className="h-4 w-4" aria-hidden="true" /> Discover stories</Link>
        </div>
      )}
      <div className="grid grid-cols-1 items-stretch gap-5 pb-16 md:grid-cols-2 xl:grid-cols-3">
        {stories.map(s => <StoryCard key={s._id} story={s} compact={true} bookmarkStyle={true} bookmarked={true} onUnsave={handleUnsave} />)}
      </div>
    </div>
  )
}
