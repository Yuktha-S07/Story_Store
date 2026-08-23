import React, { useEffect, useState } from 'react'
import api from '../services/api'
import StoryCard from '../components/StoryCard'
import BackButton from '../components/BackButton'

export default function BookmarksPage() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/api/bookmarks')
        const bookmarks = res.data || []
        const storyIds = Array.from(new Set(bookmarks.map(b => String(b.story_id))))
        const storyResponses = await Promise.all(
          storyIds.map(storyId => api.get(`/api/stories/${storyId}`).catch(() => null))
        )
        const loadedStories = storyResponses
          .filter(r => r && r.data)
          .map(r => r.data)
        setStories(loadedStories)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <BackButton />
        <span className="rounded-full border border-[#d9c7b4] bg-[#fffaf4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b6b52]">Saved library</span>
      </div>
      <section className="rounded-[28px] border border-[#d7e6e2] bg-[linear-gradient(135deg,#f4fbf8_0%,#e8f2f0_100%)] p-6 shadow-[0_18px_50px_rgba(51,88,80,0.08)] md:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5d8c80]">Your reading shelf</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-[#283d3c] md:text-3xl">Bookmarks</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#687b78] md:text-base">Keep the stories that stayed with you close at hand.</p>
          </div>
          <span className="font-serif text-3xl font-semibold text-[#5d8c80]">{stories.length}</span>
        </div>
      </section>
      {loading && <div className="rounded-2xl border border-[#d7e6e2] bg-[#f7fcfa] px-5 py-8 text-center text-sm text-[#687b78]">Loading your shelf...</div>}
      {!loading && stories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#c9d9d5] bg-[#f7fcfa] px-6 py-12 text-center text-sm text-[#687b78]">No bookmarks yet. Stories you save will appear here.</div>
      )}
      <div className="grid grid-cols-1 items-stretch gap-6 pb-16 md:grid-cols-2 xl:grid-cols-3">
        {stories.map(s => <StoryCard key={s._id} story={s} compact={true} />)}
      </div>
    </div>
  )
}
