import React, { useEffect, useState, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { buildStoryCoverAlt, buildStoryCoverUrl, buildStoryFallbackUrl } from '../utils/storyCover'
import { getSampleStory } from '../data/sampleStories'

export default function StoryDetailsPage() {
  const { id } = useParams()
  const [story, setStory] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [voteCount, setVoteCount] = useState(0)
  const [readCount, setReadCount] = useState(0)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chapterTitle, setChapterTitle] = useState('')
  const [chapterContent, setChapterContent] = useState('')
  const [savingChapter, setSavingChapter] = useState(false)
  const [savingComment, setSavingComment] = useState(false)
  const [savingVote, setSavingVote] = useState(false)
  const [savingFollow, setSavingFollow] = useState(false)
  const { user } = useContext(AuthContext)
  const { notify } = useNotification()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStory = async () => {
      const localStory = getSampleStory(id)
      if (localStory) {
        setStory(localStory)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const res = await api.get(`/api/stories/${id}`)
        setStory(res.data)
      } catch (err) {
        console.error(err)
        setError('Failed to load story details')
      } finally {
        setLoading(false)
      }
    }
    const fetchLikes = async () => {
      if (getSampleStory(id)) return
      if (!user) return
      try {
        const res = await api.get('/api/likes')
        const liked = (res.data || []).some(l => String(l.story_id) === String(id))
        setIsLiked(liked)
      } catch (err) {
        console.error(err)
      }
    }
    const fetchVotes = async () => {
      if (getSampleStory(id)) return
      try {
        const res = await api.get(`/api/stories/${id}/votes`)
        setVoteCount(res.data?.votes_count || 0)
      } catch (err) {
        console.error(err)
      }
    }
    const fetchReads = async () => {
      if (getSampleStory(id)) return
      try {
        const res = await api.get(`/api/stories/${id}/reads`)
        setReadCount(res.data?.reads_count || 0)
      } catch (err) {
        console.error(err)
      }
    }
    const fetchComments = async () => {
      if (getSampleStory(id)) return
      try {
        const res = await api.get(`/api/stories/${id}/comments`)
        setComments(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error(err)
      }
    }
    const fetchFollowing = async () => {
      if (getSampleStory(id) || !user || !story?.author?._id || String(user._id) === String(story.author._id)) return
      try {
        const res = await api.get('/api/following')
        const following = Array.isArray(res.data) ? res.data : []
        setIsFollowing(following.some(item => String(item.following_id) === String(story.author._id)))
      } catch (err) {
        console.error(err)
      }
    }
    fetchStory()
    fetchLikes()
    fetchVotes()
    fetchReads()
    fetchComments()
  }, [id, user])

  useEffect(() => {
    const fetchFollowing = async () => {
      if (getSampleStory(id) || !user || !story?.author?._id || String(user._id) === String(story.author._id)) return
      try {
        const res = await api.get('/api/following')
        const following = Array.isArray(res.data) ? res.data : []
        setIsFollowing(following.some(item => String(item.following_id) === String(story.author._id)))
      } catch (err) {
        console.error(err)
      }
    }

    fetchFollowing()
  }, [id, story, user])

  const isOwner = Boolean(user && story && String(user._id) === String(story.user_id))

  const toggleLike = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      if (isLiked) {
        await api.delete(`/api/stories/${id}/like`)
        setIsLiked(false)
      } else {
        await api.post(`/api/stories/${id}/like`)
        setIsLiked(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const toggleVote = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      setSavingVote(true)
      await api.post(`/api/stories/${id}/vote`)
      setVoteCount(prev => prev + 1)
      notify('Vote saved.', 'success')
    } catch (err) {
      console.error(err)
      notify('Failed to save vote.', 'error')
    } finally {
      setSavingVote(false)
    }
  }

  const submitComment = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!commentText.trim()) {
      notify('Write a comment first.', 'info')
      return
    }
    try {
      setSavingComment(true)
      await api.post(`/api/stories/${id}/comments`, { content: commentText })
      const res = await api.get(`/api/stories/${id}/comments`)
      setComments(Array.isArray(res.data) ? res.data : [])
      setCommentText('')
      notify('Comment added.', 'success')
    } catch (err) {
      console.error(err)
      notify('Failed to add comment.', 'error')
    } finally {
      setSavingComment(false)
    }
  }

  const toggleFollow = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!story?.author?._id) return
    if (String(user._id) === String(story.author._id)) return
    try {
      setSavingFollow(true)
      if (isFollowing) {
        await api.delete(`/api/users/${story.author._id}/follow`)
        setIsFollowing(false)
        notify('Unfollowed author.', 'info')
      } else {
        await api.post(`/api/users/${story.author._id}/follow`)
        setIsFollowing(true)
        notify('Following author.', 'success')
      }
    } catch (err) {
      console.error(err)
      notify('Failed to update follow state.', 'error')
    } finally {
      setSavingFollow(false)
    }
  }

  const addChapter = async (status) => {
    if (!user || !isOwner) {
      navigate('/login')
      return
    }
    if (!chapterTitle.trim() || !chapterContent.trim()) {
      notify('Please add both a chapter title and chapter content.', 'info')
      return
    }

    try {
      setSavingChapter(true)
      const res = await api.post(`/api/stories/${id}/chapters`, {
        title: chapterTitle.trim(),
        content: chapterContent.trim(),
        status,
      })
      setStory(prev => prev ? {
        ...prev,
        chapters: [...(prev.chapters || []), res.data],
      } : prev)
      setChapterTitle('')
      setChapterContent('')
      notify(status === 'published' ? 'Chapter published.' : 'Chapter saved as draft.', 'success')
    } catch (err) {
      const detail = err?.response?.data?.detail
      const message = typeof detail === 'string' ? detail : 'Failed to add chapter.'
      notify(message, 'error')
    } finally {
      setSavingChapter(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen text-slate-600"><p>Loading story details...</p></div>
  
  if (error) return <div className="flex items-center justify-center min-h-screen"><div className="text-center"><p className="text-red-600">{error}</p></div></div>

  if (!story) return <div className="flex items-center justify-center min-h-screen text-slate-600"><p>Story not found</p></div>

  const isLocalSample = Boolean(getSampleStory(id))
  const authorName = story.author?.username || story.username || 'Unknown author'
  const hasVisibleParts = (story.chapters || []).length > 0
  const bookStatus = story.status === 'published' || hasVisibleParts ? 'Ongoing' : 'Completed'
  const startReadingHref = story.chapters?.[0]?._id ? `/read/${story.chapters[0]._id}` : null
  const coverSrc = isLocalSample ? story.cover_image_url : buildStoryCoverUrl(story)
  const coverAlt = buildStoryCoverAlt(story)

  const firstChapterId = story.chapters?.[0]?._id || null

  return (
    <div className="space-y-8 bg-[linear-gradient(180deg,#fffaf6_0%,#fff_45%,#f9f4ee_100%)] pb-10">
      <section className="surface overflow-hidden border border-[#eadfd5] bg-gradient-to-br from-white via-[#fffaf5] to-[#f8efe6] p-4 md:p-8 shadow-[0_22px_70px_rgba(73,48,20,0.08)]">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 md:gap-6 items-start">
          <img
            src={coverSrc}
            alt={coverAlt}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = buildStoryFallbackUrl(story) }}
            className="w-full h-56 sm:h-72 md:h-80 object-cover rounded-2xl shadow-[0_18px_40px_rgba(77,52,28,0.18)] border border-white/70"
          />
          <div>
            <div className="flex items-center gap-3">
              <span className="pill bg-[#f3e7de] text-[#7f4f38] border border-[#e7d3c3]">{story.genre}</span>
              <span className="pill bg-[#fff0dd] text-[#a15a22] border border-[#f0c990]">{bookStatus}</span>
              <span className="text-xs text-[#8b7764]">{story.tags?.join(', ')}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mt-3 text-[#1e2430]">{story.title}</h1>
            <p className="text-[#5e6675] mt-3 max-w-2xl leading-7">{story.description}</p>
            <p className="mt-3 text-sm text-[#7c8796]">By {authorName}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {startReadingHref ? (
                <Link to={startReadingHref} className="btn-primary shadow-[0_14px_30px_rgba(229,123,92,0.28)]">
                  Start reading
                </Link>
              ) : (
                <span className="btn-primary opacity-60 cursor-not-allowed">Start reading</span>
              )}
              {isOwner && (
                <Link to={`/stories/${id}/edit`} className="btn-ghost">
                  Edit story
                </Link>
              )}
              {user && (
                <button
                  onClick={toggleLike}
                  className={`btn-ghost inline-flex items-center gap-2 ${isLiked ? 'text-rose-600' : ''}`}
                >
                  <span aria-hidden="true">{isLiked ? '♥' : '♡'}</span>
                  {isLiked ? 'Liked' : 'Like'}
                </button>
              )}
              {user && story?.author?._id && String(user._id) !== String(story.author._id) && (
                <button onClick={toggleFollow} disabled={savingFollow} className="btn-ghost disabled:opacity-60">
                  {isFollowing ? 'Unfollow' : 'Follow author'}
                </button>
              )}
              {user && (
                <button onClick={toggleVote} disabled={savingVote} className="btn-ghost disabled:opacity-60">
                  {savingVote ? 'Voting...' : `Vote (${voteCount})`}
                </button>
              )}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 max-w-lg rounded-2xl border border-[#eadfd5] bg-white/80 p-3 shadow-sm sm:grid-cols-3">
              <div className="rounded-xl bg-[#fff6f0] px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-[#b56a43]">Votes</div>
                <div className="mt-1 text-2xl font-semibold text-[#22262f]">{voteCount}</div>
              </div>
              <div className="rounded-xl bg-[#f3f8ff] px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-[#5977a9]">Reads</div>
                <div className="mt-1 text-2xl font-semibold text-[#22262f]">{readCount}</div>
              </div>
              <div className="rounded-xl bg-[#f7f2ff] px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-[#7d66a6]">Parts</div>
                <div className="mt-1 text-2xl font-semibold text-[#22262f]">{story.chapters?.length || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="chapters" className="surface border border-[#eadfd5] bg-white/90 p-3 sm:p-4 md:p-6 shadow-[0_16px_45px_rgba(73,48,20,0.06)]">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            {isOwner && (
              <Link to={firstChapterId ? `/stories/${id}/chapters/${firstChapterId}/edit` : `/stories/${id}/edit`} className="text-sm text-amber-600 hover:text-amber-700">
                ✎ Edit part
              </Link>
            )}
            <div className="text-sm text-[#7c8796]">{story.chapters?.length || 0} parts</div>
          </div>
        </div>
        {story.chapters?.length > 0 ? (
          <div className="space-y-1.5">
            {story.chapters.map(ch => (
              <Link
                key={ch._id}
                to={`/read/${ch._id}`}
                className="block rounded-xl border border-[#eadfd5] bg-gradient-to-r from-white to-[#fff8f2] px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#E87B5D]/20"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold uppercase tracking-[0.12em] text-[#243042]">{ch.title}</div>
                  </div>
                  <div className="text-right">
                    {ch.created_at ? (
                      <div className="text-xs text-[#8b7764]">{new Date(ch.created_at).toLocaleDateString()}</div>
                    ) : (
                      <div className="text-xs text-[#8b7764]">&nbsp;</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-sm text-[#7c8796] italic">No parts yet. Add a part to get started.</div>
        )}

        <div className="mt-8 border-t border-[#eadfd5] pt-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Comments</h3>
            <span className="text-sm text-[#7c8796]">{comments.length} total</span>
          </div>
          {user && (
            <div className="space-y-3">
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full border border-[#eadfd5] bg-[#fffdfb] px-4 py-3 rounded-xl h-28 focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20 outline-none transition"
              />
              <button type="button" onClick={submitComment} disabled={savingComment} className="btn-primary disabled:opacity-60">
                {savingComment ? 'Posting...' : 'Post comment'}
              </button>
            </div>
          )}
          <div className="space-y-3">
            {comments.length > 0 ? comments.map((comment) => (
              <div key={comment._id} className="rounded-xl border border-[#eadfd5] bg-gradient-to-br from-white to-[#fff8f2] p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-[#243042]">{comment.username}</span>
                  {comment.created_at && <span className="text-[#8b7764]">{new Date(comment.created_at).toLocaleString()}</span>}
                </div>
                <p className="mt-2 text-sm text-[#5e6675] whitespace-pre-line">{comment.content}</p>
              </div>
            )) : (
              <div className="text-sm text-[#7c8796] italic">No comments yet.</div>
            )}
          </div>
        </div>
      </section>

      <section id="add-chapter">
        {isOwner && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Add a chapter</h3>
              <span className="pill">Writer tools</span>
            </div>
            <div className="space-y-4">
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
                <button type="button" disabled={savingChapter} onClick={() => addChapter('draft')} className="btn-ghost disabled:opacity-60">
                  Save as draft
                </button>
                <button type="button" disabled={savingChapter} onClick={() => addChapter('published')} className="btn-primary disabled:opacity-60">
                  Publish chapter
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

    </div>
  )
}
