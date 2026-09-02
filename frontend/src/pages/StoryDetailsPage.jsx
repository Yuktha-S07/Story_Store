import React, { useEffect, useState, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { buildStoryCoverAlt, buildStoryCoverUrl, buildStoryFallbackUrl } from '../utils/storyCover'
import { formatCommentDate } from '../utils/formatDate'
import { getSampleStory } from '../data/sampleStories'
import BackButton from '../components/BackButton'
import { FiMessageCircle, FiEdit2, FiTrash2 } from 'react-icons/fi'

export default function StoryDetailsPage() {
  const { id } = useParams()
  const [story, setStory] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [voteCount, setVoteCount] = useState(0)
  const [readCount, setReadCount] = useState(0)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chapterTitle, setChapterTitle] = useState('')
  const [chapterContent, setChapterContent] = useState('')
  const [savingChapter, setSavingChapter] = useState(false)
  const [savingComment, setSavingComment] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const [savingVote, setSavingVote] = useState(false)
  const [savingFollow, setSavingFollow] = useState(false)
  const { user } = useContext(AuthContext)
  const { notify, confirmAction } = useNotification()
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
        setLikeCount(res.data?.likes_count || 0)
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

  useEffect(() => {
    if (story?.title) {
      document.title = `${story.title} | Story Store`
    }
    return () => {
      document.title = 'Story Store'
    }
  }, [story?.title])

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
        setLikeCount(prev => Math.max(0, prev - 1))
      } else {
        await api.post(`/api/stories/${id}/like`)
        setIsLiked(true)
        setLikeCount(prev => prev + 1)
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
      const res = await api.get(`/api/stories/${id}/votes`)
      setVoteCount(res.data?.votes_count || 0)
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

  const startEditComment = (comment) => {
    setEditingCommentId(comment._id)
    setEditingCommentText(comment.content)
  }

  const cancelEditComment = () => {
    setEditingCommentId(null)
    setEditingCommentText('')
  }

  const saveEditComment = async (commentId) => {
    if (!editingCommentText.trim()) {
      notify('Comment cannot be empty.', 'info')
      return
    }
    try {
      await api.put(`/api/stories/${id}/comments/${commentId}`, { content: editingCommentText })
      const res = await api.get(`/api/stories/${id}/comments`)
      setComments(Array.isArray(res.data) ? res.data : [])
      setEditingCommentId(null)
      setEditingCommentText('')
      notify('Comment updated.', 'success')
    } catch (err) {
      console.error(err)
      notify('Failed to update comment.', 'error')
    }
  }

  const deleteComment = async (commentId) => {
    const shouldDelete = await confirmAction({
      title: 'Delete comment',
      message: 'Are you sure you want to delete this comment? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    })
    if (!shouldDelete) return
    try {
      await api.delete(`/api/stories/${id}/comments/${commentId}`)
      setComments(prev => prev.filter(c => c._id !== commentId))
      notify('Comment deleted.', 'success')
    } catch (err) {
      console.error(err)
      notify('Failed to delete comment.', 'error')
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

  return (
    <div className="space-y-8 pb-10">
      <div>
        <BackButton />
      </div>
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
            <p className="mt-3 text-sm text-[#7c8796]">
              By{' '}
              {story.author?._id || story.user_id ? (
                <Link to={`/profile/${story.author?._id || story.user_id}`} className="font-medium text-[#E87B5D] hover:underline">
                  {authorName}
                </Link>
              ) : (
                authorName
              )}
            </p>
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
                  Edit details
                </Link>
              )}
              {user && (
                <button
                  onClick={toggleLike}
                  className={`btn-ghost inline-flex items-center gap-2 ${isLiked ? 'text-rose-600' : ''}`}
                >
                  <span aria-hidden="true">{isLiked ? '♥' : '♡'}</span>
                  {isLiked ? 'Liked' : 'Like'} ({likeCount})
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

      <section id="chapters" className="surface border-0 bg-[#fffaf5]/90 p-3 sm:p-4 md:p-6 shadow-[0_16px_45px_rgba(73,48,20,0.06)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isOwner && (
              <Link to={`/stories/${id}/chapters`} className="text-sm text-amber-600 hover:text-amber-700">
                ✎ Edit chapters
              </Link>
            )}
            <div className="text-sm text-[#7c8796]">{story.chapters?.length || 0} parts</div>
          </div>
          <button
            type="button"
            onClick={() => setShowComments(prev => !prev)}
            aria-label={showComments ? 'Hide comments' : 'Open comments'}
            title={showComments ? 'Hide comments' : 'Open comments'}
            className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition ${showComments ? 'border-[#E87B5D] bg-[#fff0e9] text-[#c45e43]' : 'border-[#eadfd5] bg-[#fffaf5] text-[#7c8796] hover:border-[#E87B5D] hover:text-[#c45e43]'}`}
          >
            <FiMessageCircle size={18} aria-hidden="true" />
            <span>Comment</span>
            {comments.length > 0 && <span className="sr-only">{comments.length} comments</span>}
          </button>
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

        {showComments && <div className="mt-8 space-y-4 border-t border-[#eadfd5] pt-6">
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
                className="w-full border border-[#eadfd5] bg-[#fffdfb] px-4 py-3 rounded-xl h-20 resize-y focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20 outline-none transition"
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
                  <div className="flex items-center gap-2">
                    {comment.updated_at && <span className="text-xs text-[#8b7764]">(edited)</span>}
                    {comment.created_at && <span className="text-[#8b7764]">{formatCommentDate(comment.created_at)}</span>}
                  </div>
                </div>
                {editingCommentId === comment._id ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={editingCommentText}
                      onChange={e => setEditingCommentText(e.target.value)}
                      className="w-full border border-[#eadfd5] bg-[#fffdfb] px-4 py-3 rounded-xl h-20 resize-y focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20 outline-none transition"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => saveEditComment(comment._id)} className="btn-primary text-xs px-3 py-1.5">Save</button>
                      <button onClick={cancelEditComment} className="btn-ghost text-xs px-3 py-1.5">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-[#5e6675] whitespace-pre-line">{comment.content}</p>
                )}
                {user && String(user._id) === String(comment.user_id) && editingCommentId !== comment._id && (
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => startEditComment(comment)} className="inline-flex items-center gap-1 text-xs text-[#8b7764] hover:text-[#E87B5D] transition">
                      <FiEdit2 size={12} /> Edit
                    </button>
                    <button onClick={() => deleteComment(comment._id)} className="inline-flex items-center gap-1 text-xs text-[#8b7764] hover:text-red-500 transition">
                      <FiTrash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )) : (
              <div className="text-sm text-[#7c8796] italic">No comments yet.</div>
            )}
          </div>
        </div>}
      </section>

      {isOwner && (
        <section id="add-chapter" className="surface border border-[#eadfd5] bg-[#fffaf5]/90 p-4 shadow-[0_16px_45px_rgba(73,48,20,0.06)] sm:p-5 md:p-6">
          <div>
            <div className="mb-5 flex items-center justify-between gap-4">
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
        </section>
      )}

    </div>
  )
}
