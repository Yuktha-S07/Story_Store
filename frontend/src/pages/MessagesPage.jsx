import React, { useContext, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight, FiMessageCircle, FiSend, FiUser, FiUsers } from 'react-icons/fi'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { useNotification } from '../context/NotificationContext'
import { formatCommentDate } from '../utils/formatDate'
import BackButton from '../components/BackButton'

export default function MessagesPage() {
  const { userId } = useParams()
  const { user } = useContext(AuthContext)
  const { notify } = useNotification()
  const navigate = useNavigate()

  const [direction, setDirection] = useState('all')
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeUserId, setActiveUserId] = useState(null)
  const [activeUser, setActiveUser] = useState(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const threadScrollRef = useRef(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    const fetchConversations = async () => {
      try {
        const res = await api.get(`/api/messages/conversations?direction=${direction}`)
        setConversations(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchConversations()
    const interval = window.setInterval(fetchConversations, 8000)
    return () => window.clearInterval(interval)
  }, [user, direction])

  useEffect(() => {
    if (!userId) {
      setActiveUserId(null)
      setActiveUser(null)
      setMessages([])
      return
    }
    setActiveUserId(userId)
    const fetchThread = async () => {
      try {
        const [threadRes, profileRes] = await Promise.all([
          api.get(`/api/messages/with/${userId}`),
          api.get(`/api/users/${userId}`),
        ])
        setMessages(Array.isArray(threadRes.data) ? threadRes.data : [])
        setActiveUser(profileRes.data)
      } catch (err) {
        console.error(err)
        notify('Failed to load conversation.', 'error')
      }
    }
    fetchThread()
    const interval = window.setInterval(fetchThread, 5000)
    return () => window.clearInterval(interval)
  }, [userId, user])

  useEffect(() => {
    const el = bottomRef.current
    if (!el) return
    const container = el.closest('.message-thread')?.querySelector('.overflow-y-auto') || threadScrollRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !activeUserId) return
    const content = input.trim()
    setSending(true)
    let sent = false
    try {
      await api.post('/api/messages', { recipient_id: activeUserId, content })
      sent = true
      setInput('')
    } catch (err) {
      console.error(err)
      notify('Failed to send message.', 'error')
    } finally {
      setSending(false)
    }
    if (!sent) return
    refreshConversations()
    try {
      const res = await api.get(`/api/messages/with/${activeUserId}`)
      setMessages(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
    }
  }

  const refreshConversations = async () => {
    try {
      const res = await api.get(`/api/messages/conversations?direction=${direction}`)
      setConversations(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
    }
  }

  const selectConversation = (otherId) => {
    navigate(`/messages/${otherId}`)
  }

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'received', label: 'Received' },
    { key: 'sent', label: 'Sent' },
  ]

  return (
    <div className="messages-page w-full space-y-5 px-0 pb-10 font-sans">
      <div className="message-page-header flex flex-wrap items-end justify-between gap-4">
        <BackButton />
          <div className="flex items-center gap-3">
            <span className="message-count px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">Messages</span>
          </div>
      </div>

      <div className="message-shell message-workspace overflow-hidden">
        <div className="grid h-full grid-cols-1 md:grid-cols-[360px_1fr]">
          {/* Side bar */}
            <div className={`message-sidebar border-b md:border-b-0 md:border-r border-[#E8C4C4] ${userId ? 'hidden md:block' : ''}`}>
            <div className="border-b border-[#E8C4C4] px-4 pb-4 pt-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8C4C4] text-[#315D5E] shadow-sm">
                <FiMessageCircle size={20} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#315D5E]">Your inbox</p>
              <h1 className="message-sidebar-title mt-1 font-serif text-2xl font-semibold">Personal messages</h1>
            </div>
            <div className="flex gap-1 border-b border-[#E8C4C4] p-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setDirection(t.key)}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${direction === t.key ? 'bg-[#E8C4C4] text-[#315D5E] shadow-sm' : 'text-[#315D5E] hover:bg-[#EEEEEE]'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 pb-2 pt-4">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#315D5E]"><FiUsers size={14} /> Conversations</span>
              <span className="text-xs font-semibold text-[#315D5E]">{conversations.length}</span>
            </div>
            <div className="max-h-[calc(100vh-18rem)] overflow-y-auto">
              {loading ? (
                <p className="p-4 text-sm text-[#315D5E] italic">Loading...</p>
              ) : conversations.length === 0 ? (
                <p className="p-4 text-sm text-[#315D5E] italic">
                  No {direction === 'sent' ? 'sent' : direction === 'received' ? 'received' : ''} messages yet.
                </p>
              ) : (
                conversations.map((c) => {
                  const count =
                    direction === 'sent'
                      ? c.sent_count
                      : direction === 'received'
                        ? c.received_count
                        : (c.sent_count || 0) + (c.received_count || 0)
                  return (
                    <button
                      key={c.user_id}
                      onClick={() => selectConversation(c.user_id)}
                      className="message-conversation w-full border-l-2 border-transparent px-4 py-4 text-left transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-2 truncate text-sm font-semibold text-[#315D5E]"><span className="comment-avatar h-7 w-7 bg-[#E8C4C4] text-[#315D5E]">{(c.username || 'U')[0].toUpperCase()}</span>{c.username}</span>
                        {c.unread_count > 0 && (
                          <span className="inline-flex items-center justify-center rounded-full bg-[#F7A5A5] px-2 py-0.5 text-[10px] font-bold text-[#5F9598]">
                            {c.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-[#315D5E]">{c.last_message}</span>
                        {count > 0 && (
                            <span className="shrink-0 text-[10px] font-semibold text-[#315D5E]">
                            {count} {count === 1 ? 'message' : 'messages'}
                          </span>
                        )}
                        <FiChevronRight className="shrink-0 text-[#315D5E]" size={15} />
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Chat thread */}
          <div className={`message-thread flex flex-col ${userId ? 'min-h-0 md:min-h-[520px]' : 'hidden md:flex md:min-h-[520px]'}`}>
            {activeUser ? (
              <>
                <div className="message-thread-header flex items-center justify-between gap-3 border-b border-[#95CCDD] bg-[#EEEEEE] px-5 py-4">
                  <div className="flex min-w-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/messages')}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5CBCB] text-[#5F9598] transition hover:bg-[#EEEEEE] md:hidden"
                  >
                    <FiChevronLeft size={18} />
                  </button>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#95CCDD] text-sm font-bold text-[#5F9598] shadow-sm">
                    {(activeUser.username || 'U')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <Link to={`/profile/${activeUser._id}`} className="block truncate text-sm font-semibold text-[#5F9598] hover:text-[#F7A5A5]">
                      {activeUser.username}
                    </Link>
                    <span className="text-xs text-[#5F9598]">{activeUser.followers_count ?? 0} followers · private conversation</span>
                  </div>
                  </div>
                  <Link to={`/profile/${activeUser._id}`} aria-label="View profile" title="View profile" className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#95CCDD] text-[#5F9598] transition hover:bg-[#EEEEEE] sm:flex">
                    <FiUser size={16} />
                  </Link>
                </div>

                <div ref={threadScrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
                  {messages.length === 0 ? (
                    <p className="py-10 text-center text-sm text-[#5F9598] italic">Say hello to {activeUser.username}!</p>
                  ) : (
                    messages.map((m) => (
                      <div key={m._id} className={`flex ${m.is_mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`message-bubble max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${m.is_mine ? 'rounded-br-md bg-[#5F9598] text-[#F4F2F2]' : 'rounded-bl-md border border-[#95CCDD] bg-[#D6F4ED] text-[#315D5E]'}`}>
                          <p className="whitespace-pre-line">{m.content}</p>
                          {m.created_at && (
                            <p className={`mt-1 text-[10px] ${m.is_mine ? 'text-[#D6F4ED]' : 'text-[#315D5E]'}`}>{formatCommentDate(m.created_at)}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>

                <div className="border-t border-[#95CCDD] bg-[#EEEEEE] p-4">
                  <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage() }}
                    className="flex items-end gap-3"
                  >
                    <span className="hidden pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#5F9598] sm:block">Reply</span>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Write a message..."
                      rows={1}
                      className="flex-1 resize-none rounded-2xl border border-[#95CCDD] bg-[#F4F2F2] px-4 py-3 text-sm text-[#5F9598] outline-none transition focus:border-[#5F9598] focus:ring-2 focus:ring-[#95CCDD]/30"
                    />
                    <button type="submit" disabled={sending || !input.trim()} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7A5A5] text-[#5F9598] shadow-sm transition hover:bg-[#EEEEEE] disabled:opacity-50">
                      <FiSend />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="message-empty flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F5CBCB]">
                  <FiMessageCircle className="h-7 w-7 text-[#5F9598]" />
                </div>
                <p className="text-sm text-[#5d584f]">Select a conversation to view your messages.</p>
                <p className="mt-1 text-xs text-[#5F9598]">Click the Message button on a profile to start a new one.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
