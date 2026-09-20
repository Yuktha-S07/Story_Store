import React, { useEffect, useState, useContext } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { getSampleChapter, getSampleStory } from '../data/sampleStories'
import { FiArrowLeft, FiArrowRight, FiBookOpen, FiCheck, FiChevronDown, FiHeart, FiRotateCcw, FiThumbsUp, FiType } from 'react-icons/fi'
import BackButton from '../components/BackButton'

const FONT_MIN = 14
const FONT_MAX = 26
const TEXT_COLORS = [
  { name: 'Charcoal', value: '#302b32' },
  { name: 'Slate blue', value: '#334155' },
  { name: 'Ink blue', value: '#1e3a5f' },
  { name: 'Forest green', value: '#1f3d34' },
  { name: 'Wine red', value: '#5c2e3a' },
]
const FONT_STYLES = [
  { name: 'Editorial', value: "'Fraunces', serif" },
  { name: 'Clean', value: "'Lora', serif" },
  { name: 'Classic', value: 'Georgia, serif' },
  { name: 'Modern', value: "'Segoe UI', sans-serif" },
  { name: 'Mono', value: 'ui-monospace, Consolas, monospace' },
]
const READING_PREFERENCES_KEY = 'reading_preferences'
const READING_PREFERENCES_SAVED_KEY = 'reading_preferences_saved'
const DEFAULT_FONT_SIZE = 17
const DEFAULT_TEXT_COLOR = TEXT_COLORS[0].value
const DEFAULT_LINE_HEIGHT = 1.85
const DEFAULT_FONT_STYLE = FONT_STYLES[0].value
const LINE_HEIGHT_OPTIONS = [
  { value: 1.6, name: 'Tight' },
  { value: 1.85, name: 'Comfort' },
  { value: 2.1, name: 'Airy' },
  { value: 2.35, name: 'Wide' },
]

export default function ReadingPage() {
  const { chapterId } = useParams()
  const [chapter, setChapter] = useState(null)
  const [previousChapterHref, setPreviousChapterHref] = useState('')
  const [nextChapterHref, setNextChapterHref] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE)
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR)
  const [lineHeight, setLineHeight] = useState(DEFAULT_LINE_HEIGHT)
  const [fontStyle, setFontStyle] = useState(DEFAULT_FONT_STYLE)
  const [savePreferences, setSavePreferences] = useState(() => window.localStorage.getItem(READING_PREFERENCES_SAVED_KEY) === 'true')
  const [loadedPreferencesFor, setLoadedPreferencesFor] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isVoted, setIsVoted] = useState(false)
  const [voteCount, setVoteCount] = useState(0)
  const [savingLike, setSavingLike] = useState(false)
  const [savingVote, setSavingVote] = useState(false)
  const { user } = useContext(AuthContext)
  const { notify } = useNotification()

  useEffect(() => {
    const storyId = chapter?.story_id ? String(chapter.story_id) : ''
    if (!storyId || loadedPreferencesFor === storyId) return

    if (savePreferences) {
      try {
        const stored = JSON.parse(window.localStorage.getItem(READING_PREFERENCES_KEY) || '{}')
        setFontSize(Number.isFinite(stored.fontSize) && stored.fontSize >= FONT_MIN && stored.fontSize <= FONT_MAX ? stored.fontSize : DEFAULT_FONT_SIZE)
        setTextColor(typeof stored.textColor === 'string' ? stored.textColor : DEFAULT_TEXT_COLOR)
        setLineHeight(LINE_HEIGHT_OPTIONS.some((spacing) => spacing.value === stored.lineHeight) ? stored.lineHeight : DEFAULT_LINE_HEIGHT)
        setFontStyle(FONT_STYLES.some((font) => font.value === stored.fontStyle) ? stored.fontStyle : DEFAULT_FONT_STYLE)
      } catch {
        resetReadingSettings()
      }
    } else {
      resetReadingSettings()
    }
    setLoadedPreferencesFor(storyId)
  }, [chapter?.story_id, savePreferences, loadedPreferencesFor])

  useEffect(() => {
    if (!savePreferences || !chapter?.story_id || loadedPreferencesFor !== String(chapter.story_id)) return
    window.localStorage.setItem(READING_PREFERENCES_KEY, JSON.stringify({ fontSize, textColor, lineHeight, fontStyle }))
  }, [fontSize, textColor, lineHeight, fontStyle, savePreferences, chapter?.story_id, loadedPreferencesFor])

  useEffect(() => {
    window.localStorage.setItem(READING_PREFERENCES_SAVED_KEY, String(savePreferences))
    if (!savePreferences) window.localStorage.removeItem(READING_PREFERENCES_KEY)
  }, [savePreferences])

  const resetReadingSettings = () => {
    setFontSize(DEFAULT_FONT_SIZE)
    setTextColor(DEFAULT_TEXT_COLOR)
    setLineHeight(DEFAULT_LINE_HEIGHT)
    setFontStyle(DEFAULT_FONT_STYLE)
  }

  const handleSavePreferencesChange = (event) => {
    const shouldSave = event.target.checked
    setSavePreferences(shouldSave)
    if (shouldSave) {
      window.localStorage.setItem(READING_PREFERENCES_KEY, JSON.stringify({ fontSize, textColor, lineHeight, fontStyle }))
    }
  }

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const res = await api.get(`/api/chapters/${chapterId}`)
        setChapter(res.data)
        if (res.data?.story_id) {
          try {
            const storyRes = await api.get(`/api/stories/${res.data.story_id}`)
            const chapters = Array.isArray(storyRes.data?.chapters) ? storyRes.data.chapters : []
            const currentIndex = chapters.findIndex((item) => String(item._id) === String(chapterId))
            const previousChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null
            const nextChapter = currentIndex >= 0 ? chapters[currentIndex + 1] : null
            setPreviousChapterHref(previousChapter?._id ? `/read/${previousChapter._id}` : '')
            setNextChapterHref(nextChapter?._id ? `/read/${nextChapter._id}` : '')
          } catch (storyErr) {
            console.error(storyErr)
          }
        }
        if (user && res.data?.story_id) {
          await api.post(`/api/stories/${res.data.story_id}/chapters/${chapterId}/history`)
          localStorage.setItem('latest_reading', JSON.stringify({
            story_id: res.data.story_id,
            chapter_id: chapterId,
            chapter_title: res.data.title,
          }))
        }
      } catch (err) {
        const fallbackChapter = getSampleChapter(chapterId)
        if (fallbackChapter) {
          const storyId = String(fallbackChapter._id).split('-ch')[0]
          const sampleStory = getSampleStory(storyId)
          const sampleChapters = Array.isArray(sampleStory?.chapters) ? sampleStory.chapters : []
          const currentIndex = sampleChapters.findIndex((item) => String(item._id) === String(chapterId))
          const previousChapter = currentIndex > 0 ? sampleChapters[currentIndex - 1] : null
          const nextChapter = currentIndex >= 0 ? sampleChapters[currentIndex + 1] : null

          setChapter({ ...fallbackChapter, story_id: storyId })
          setPreviousChapterHref(previousChapter?._id ? `/read/${previousChapter._id}` : '')
          setNextChapterHref(nextChapter?._id ? `/read/${nextChapter._id}` : '')
          return
        }
        console.error(err)
      }
    }
    fetchChapter()
  }, [chapterId, user])

  const isOwner = Boolean(user && chapter && String(user._id) === String(chapter.user_id))

  const rawStoryId = chapter?.story_id ? String(chapter.story_id) : ''
  const isSampleStory = rawStoryId.startsWith('sample-') || rawStoryId.startsWith('featured-')

  useEffect(() => {
    if (!rawStoryId || isSampleStory) return
    const fetchStats = async () => {
      try {
        const [votesRes, storyRes] = await Promise.all([
          api.get(`/api/stories/${rawStoryId}/votes`),
          api.get(`/api/stories/${rawStoryId}`),
        ])
        setVoteCount(votesRes.data?.votes_count || 0)
        setLikeCount(storyRes.data?.likes_count || 0)
      } catch (err) {
        console.error(err)
      }
      if (!user) return
      try {
        const [likesRes, votedRes] = await Promise.all([
          api.get('/api/likes'),
          api.get(`/api/stories/${rawStoryId}/voted`),
        ])
        setIsLiked((likesRes.data || []).some((like) => String(like.story_id) === rawStoryId))
        setIsVoted(Boolean(votedRes.data?.voted))
      } catch (err) {
        console.error(err)
      }
    }
    fetchStats()
  }, [rawStoryId, user])

  const toggleLike = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!rawStoryId || isSampleStory) return
    try {
      setSavingLike(true)
      if (isLiked) {
        await api.delete(`/api/stories/${rawStoryId}/like`)
        setIsLiked(false)
        setLikeCount((count) => Math.max(0, count - 1))
      } else {
        await api.post(`/api/stories/${rawStoryId}/like`)
        setIsLiked(true)
        setLikeCount((count) => count + 1)
      }
    } catch (err) {
      console.error(err)
      notify('Failed to update like.', 'error')
    } finally {
      setSavingLike(false)
    }
  }

  const toggleVote = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!rawStoryId || isSampleStory) return
    if (isVoted) {
      notify('You already voted for this story.', 'info')
      return
    }
    try {
      setSavingVote(true)
      await api.post(`/api/stories/${rawStoryId}/vote`)
      setIsVoted(true)
      setVoteCount((count) => count + 1)
      notify('Vote saved.', 'success')
    } catch (err) {
      console.error(err)
      notify('Failed to save vote.', 'error')
    } finally {
      setSavingVote(false)
    }
  }

  const toggleChapterStatus = async () => {
    if (!isOwner) return

    const nextStatus = chapter.status === 'published' ? 'draft' : 'published'

    try {
      setSavingStatus(true)
      const res = await api.put(`/api/chapters/${chapterId}`, { status: nextStatus })
      setChapter(res.data)
      notify(nextStatus === 'published' ? 'Chapter published.' : 'Chapter moved to draft.', 'success')
      const storyId = res?.data?.story_id
      window.dispatchEvent(new CustomEvent('story-store:story-updated', { detail: { chapterId, storyId } }))
    } catch (err) {
      console.error(err)
      const detail = err?.response?.data?.detail
      const message = typeof detail === 'string' ? detail : 'Failed to update chapter status.'
      notify(message, 'error')
    } finally {
      setSavingStatus(false)
    }
  }

  if (!chapter) return <div>Loading...</div>

  return (
    <main className="reading-page">
      <div className="mx-auto w-full px-5 pb-4 pt-6" style={{ maxWidth: '60rem' }}>
        <BackButton fallback={`/stories/${chapter.story_id || ''}`} label="Back to story" />
      </div>
      <article className="reading-shell">
        <header className="reading-header">
          <div className="reading-heading">
            <div className="reading-eyebrow"><FiBookOpen size={15} /> Reading</div>
            <h1>{chapter.title}</h1>
            {isOwner && (
              <span className={`reading-status ${chapter.status === 'published' ? 'reading-status-published' : 'reading-status-draft'}`}>
                {chapter.status === 'published' ? 'Published' : 'Draft'}
              </span>
            )}
          </div>
          <div className="reading-actions">
            {isOwner && (
              <button
                type="button"
                onClick={toggleChapterStatus}
                disabled={savingStatus}
                className={`reading-action reading-status-button disabled:opacity-60 ${chapter.status === 'published' ? 'reading-unpublish' : 'reading-publish'}`}
              >
                {savingStatus ? 'Saving...' : chapter.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
            )}
            {!isSampleStory && (
              <>
                <button
                  type="button"
                  onClick={toggleLike}
                  disabled={savingLike}
                  aria-pressed={isLiked}
                  className={`reading-action reading-like-btn ${isLiked ? 'is-liked' : ''}`}
                >
                  <FiHeart size={15} fill={isLiked ? 'currentColor' : 'none'} />
                  {savingLike ? 'Saving...' : isLiked ? 'Liked' : 'Like'}
                  {likeCount > 0 && <span className="reading-action-count">{likeCount}</span>}
                </button>
                <button
                  type="button"
                  onClick={toggleVote}
                  disabled={savingVote}
                  aria-pressed={isVoted}
                  className={`reading-action reading-vote-btn ${isVoted ? 'is-voted' : ''}`}
                >
                  <FiThumbsUp size={15} />
                  {savingVote ? 'Voting...' : isVoted ? 'Voted' : 'Vote'}
                  {voteCount > 0 && <span className="reading-action-count">{voteCount}</span>}
                </button>
              </>
            )}
            <div className="reading-options-menu">
              <button
                type="button"
                onClick={() => setShowOptions(v => !v)}
                aria-label="Reading options"
                aria-expanded={showOptions}
                title="Reading options"
                className={`reading-action reading-font-options ${showOptions ? 'reading-options-active' : ''}`}
              >
                <FiType size={16} /> <FiChevronDown size={14} />
              </button>
              {showOptions && (
                <div className="reading-options-panel" aria-label="Reading settings">
                  <div className="reading-options-title">Reading settings</div>
                  <div className="reading-option-group">
                    <span className="reading-options-label">Text size</span>
                    <div className="reading-segmented-control">
                      <button type="button" onClick={() => setFontSize(f => Math.max(FONT_MIN, f - 1))} disabled={fontSize <= FONT_MIN} className="reading-size-btn" aria-label="Decrease text size">A−</button>
                      <span className="reading-size-value">{fontSize}px</span>
                      <button type="button" onClick={() => setFontSize(f => Math.min(FONT_MAX, f + 1))} disabled={fontSize >= FONT_MAX} className="reading-size-btn" aria-label="Increase text size">A+</button>
                    </div>
                  </div>
                  <div className="reading-option-group">
                    <span className="reading-options-label">Font style</span>
                    <div className="reading-font-styles">
                      {FONT_STYLES.map((font) => (
                        <button
                          key={font.value}
                          type="button"
                          onClick={() => setFontStyle(font.value)}
                          className={`reading-font-style ${fontStyle === font.value ? 'is-selected' : ''}`}
                          style={{ fontFamily: font.value }}
                          aria-pressed={fontStyle === font.value}
                        >
                          {font.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="reading-option-group">
                    <span className="reading-options-label">Spacing</span>
                    <div className="reading-segmented-control">
                      {LINE_HEIGHT_OPTIONS.map((spacing) => (
                        <button key={spacing.value} type="button" onClick={() => setLineHeight(spacing.value)} className={`reading-spacing-btn ${lineHeight === spacing.value ? 'is-selected' : ''}`} aria-pressed={lineHeight === spacing.value}>
                          {spacing.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="reading-option-group reading-color-group">
                    <span className="reading-options-label">Color</span>
                    <div className="reading-color-swatches">
                      {TEXT_COLORS.map((color) => (
                        <button key={color.value} type="button" onClick={() => setTextColor(color.value)} title={color.name} aria-label={`Text color ${color.name}`} aria-pressed={textColor === color.value} className={`reading-color-swatch ${textColor === color.value ? 'is-selected' : ''}`} style={{ backgroundColor: color.value }} />
                      ))}
                    </div>
                  </div>
                  <label className="reading-save-preferences">
                    <input type="checkbox" checked={savePreferences} onChange={handleSavePreferencesChange} />
                    <span>
                      <strong>Save for all stories</strong>
                      <small>{savePreferences ? 'These settings will follow you.' : 'Used only for this story.'}</small>
                    </span>
                  </label>
                  <button type="button" onClick={resetReadingSettings} className="reading-reset-button" title="Reset reading settings">
                    <FiRotateCcw size={14} /> Reset
                  </button>
                </div>
              )}
            </div>
            <Link to={`/stories/${chapter.story_id}`} className="reading-action reading-done">
              <FiCheck size={15} /> Done
            </Link>
          </div>
        </header>

        <div className="reading-divider" />
        <div className="reading-content prose" style={{ fontFamily: fontStyle, fontSize: `${fontSize}px`, lineHeight, color: textColor }} dangerouslySetInnerHTML={{ __html: chapter.content }} />
        <nav className="reading-navigation" aria-label="Chapter navigation">
          {previousChapterHref ? (
            <Link to={previousChapterHref} className="reading-nav-button reading-nav-previous">
              <FiArrowLeft size={17} /> Previous chapter
            </Link>
          ) : (
            <span className="reading-nav-button reading-nav-previous is-disabled"><FiArrowLeft size={17} /> Previous chapter</span>
          )}
          {nextChapterHref ? (
            <Link to={nextChapterHref} className="reading-nav-button reading-nav-next">
              Next chapter <FiArrowRight size={17} />
            </Link>
          ) : (
            <span className="reading-nav-button reading-nav-next is-disabled">Next chapter <FiArrowRight size={17} /></span>
          )}
        </nav>
      </article>
    </main>
  )
}
