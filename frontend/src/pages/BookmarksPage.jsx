import React, { useEffect, useState } from 'react'
import api from '../services/api'
import StoryCard from '../components/StoryCard'

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
    <div className="space-y-6">
      <section className="surface p-6 md:p-8">
        <h1 className="text-3xl font-bold">Bookmarks</h1>
        <p className="text-slate-600 mt-2">Your saved chapters and stories, ready anytime.</p>
      </section>
      {loading && <div>Loading...</div>}
      {!loading && stories.length === 0 && (
        <div className="surface p-6">No bookmarks yet.</div>
      )}
      <div className="grid grid-cols-1 gap-6 items-stretch md:grid-cols-2 xl:grid-cols-3 pb-32">
        {stories.map(s => <StoryCard key={s._id} story={s} compact={true} />)}
      </div>
    </div>
  )
}
