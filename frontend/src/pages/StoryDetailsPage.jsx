import React, { useEffect, useState, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { buildStoryCoverAlt, buildStoryCoverUrl, buildStoryFallbackUrl } from '../utils/storyCover'
import { formatCommentDate } from '../utils/formatDate'
import { getSampleStory } from '../data/sampleStories'
import BackButton from '../components/BackButton'
import { FiBookOpen, FiHeart, FiMessageCircle, FiEdit2, FiTrash2, FiUserPlus } from 'react-icons/fi'

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

  if (loading) return <div className="flex items-center justify-center min-h-screen text-slate-600"><p>Loading story details...</p></div>
  
  if (error) return <div className="flex items-center justify-center min-h-screen"><div className="text-center"><p className="text-red-600">{error}</p></div></div>

  if (!story) return <div className="flex items-center justify-center min-h-screen text-slate-600"><p>Story not found</p></div>

  const isLocalSample = Boolean(getSampleStory(id))
  const authorName = story.author?.username || story.username || 'Unknown author'
  const bookStatus = story.is_completed ? 'Completed' : 'Ongoing'
  const startReadingHref = story.chapters?.[0]?._id ? `/read/${story.chapters[0]._id}` : null
  const coverSrc = isLocalSample ? story.cover_image_url : buildStoryCoverUrl(story)
  const coverAlt = buildStoryCoverAlt(story)

  return (
    <div className="space-y-8 pb-10">
      <div>
        <BackButton />
      </div>
      <section className="story-hero surface relative overflow-hidden border border-[#e8d8d0] bg-[#fffaf5] p-4 shadow-[0_28px_80px_rgba(92,58,39,0.14)] md:p-8">
        <div className="relative grid grid-cols-1 items-start gap-7 md:grid-cols-[250px_1fr] md:gap-10">
          <div className="story-cover-frame">
            <img
              src={coverSrc}
              alt={coverAlt}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = buildStoryFallbackUrl(story) }}
              className="relative h-72 w-full rounded-[1.4rem] border border-white/80 object-cover shadow-[0_22px_45px_rgba(77,52,28,0.24)] sm:h-80"
            />
          </div>
          <div className="min-w-0 pt-1 md:pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="story-chip story-chip-genre">{story.genre}</span>
              <span className="story-chip story-chip-status"><span className="story-status-dot" />{bookStatus}</span>
              {story.tags?.length > 0 && <span className="story-tags">{story.tags.join('  /  ')}</span>}
            </div>
            <p className="story-kicker">A story to wander into</p>
            <h1 className="story-title">{story.title}</h1>
            <p className="story-description">{story.description}</p>
            <p className="mt-4 flex items-center gap-2 text-sm text-[#766b70]">
              <span className="story-author-mark">{authorName.charAt(0).toUpperCase()}</span>
              By{' '}
              {story.author?._id || story.user_id ? (
                <Link to={`/profile/${story.author?._id || story.user_id}`} className="font-semibold text-[#b95e4f] hover:text-[#8f3e36] hover:underline">
                  {authorName}
                </Link>
              ) : (
                authorName
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {startReadingHref ? (
                <Link to={startReadingHref} className="story-action story-action-primary">
                  <FiBookOpen size={17} />
                  Start reading
                </Link>
              ) : (
                <span className="story-action story-action-primary cursor-not-allowed opacity-50"><FiBookOpen size={17} />Start reading</span>
              )}
              {isOwner && (
                <Link to={`/stories/${id}/edit`} className="story-action story-action-soft">
                  <FiEdit2 size={16} />
                  Edit details
                </Link>
              )}
              {user && (
                <button
                  onClick={toggleLike}
                  className={`story-action story-action-soft ${isLiked ? 'story-action-liked' : ''}`}
                >
                  <FiHeart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                  <span>{isLiked ? 'Liked' : 'Like'}</span>
                  <span className="story-action-count">{likeCount}</span>
                </button>
              )}
              {user && story?.author?._id && String(user._id) !== String(story.author._id) && (
                <button onClick={toggleFollow} disabled={savingFollow} className="story-action story-action-soft disabled:opacity-60">
                  <FiUserPlus size={16} />
                  {isFollowing ? 'Unfollow' : 'Follow author'}
                </button>
              )}
              {user && (
                <button onClick={toggleVote} disabled={savingVote} className="story-action story-action-vote disabled:opacity-60">
                  <span>{savingVote ? 'Voting...' : 'Vote'}</span>
                  {!savingVote && <span className="story-action-count">{voteCount}</span>}
                </button>
              )}
            </div>
            <div className="story-stat-rail mt-6">
              <div className="story-stat story-stat-votes">
                <div className="story-stat-label">Votes</div>
                <div className="story-stat-value">{voteCount}</div>
              </div>
              <div className="story-stat story-stat-reads">
                <div className="story-stat-label">Reads</div>
                <div className="story-stat-value">{readCount}</div>
              </div>
              <div className="story-stat story-stat-parts">
                <div className="story-stat-label">Parts</div>
                <div className="story-stat-value">{story.chapters?.length || 0}</div>
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
              <div key={comment._id} className="comment-card rounded-xl border border-[#eadfd5] p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="comment-avatar" aria-hidden="true">{(comment.username || 'U')[0].toUpperCase()}</span>
                    <span className="truncate font-semibold text-[#243042]">{comment.username || 'Reader'}</span>
                  </div>
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
                    <button onClick={() => startEditComment(comment)} aria-label="Edit comment" title="Edit comment" className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8b7764] hover:bg-[#fff0e9] hover:text-[#E87B5D] transition">
                      <FiEdit2 size={14} />
                    </button>
                    <button onClick={() => deleteComment(comment._id)} aria-label="Delete comment" title="Delete comment" className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8b7764] hover:bg-red-50 hover:text-red-500 transition">
                      <FiTrash2 size={14} />
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
        <Link
          to={`/stories/${id}/chapters`}
          className="inline-flex items-center justify-center rounded-xl bg-[#df818f] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(223,129,143,0.24)] transition hover:-translate-y-0.5 hover:bg-[#d47080] hover:shadow-[0_16px_28px_rgba(223,129,143,0.3)]"
        >
          Add a chapter
        </Link>
      )}

    </div>
  )
}
