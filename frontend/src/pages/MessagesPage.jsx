import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiChevronRight, FiMessageCircle, FiSend, FiUser, FiUsers, FiArrowLeft } from 'react-icons/fi'
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

  const [direction, setDirection] = useState('received')
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeUserId, setActiveUserId] = useState(null)
  const [activeUser, setActiveUser] = useState(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const bottomRef = useRef(null)
  const shouldAutoScroll = useRef(false)
  const prevUserIdRef = useRef(null)

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
      shouldAutoScroll.current = false
      prevUserIdRef.current = null
      return
    }

    const isNewConversation = prevUserIdRef.current !== userId
    prevUserIdRef.current = userId
    if (isNewConversation) {
      shouldAutoScroll.current = true
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
    if (!shouldAutoScroll.current) return
    const el = bottomRef.current
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      shouldAutoScroll.current = false
    }
  }, [messages])

  const scrollToBottom = useCallback(() => {
    const el = bottomRef.current
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || !activeUserId) return
    try {
      setSending(true)
      await api.post('/api/messages', { recipient_id: activeUserId, content: input.trim() })
      const res = await api.get(`/api/messages/with/${activeUserId}`)
      setMessages(Array.isArray(res.data) ? res.data : [])
      setInput('')
      shouldAutoScroll.current = true
      refreshConversations()
    } catch (err) {
      console.error(err)
      notify('Failed to send message.', 'error')
    } finally {
      setSending(false)
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
    setSidebarOpen(false)
  }

  const tabs = [
    { key: 'received', label: 'Received' },
    { key: 'sent', label: 'Sent' },
  ]

  return (
    <div className="messages-page w-full space-y-4 px-4 pb-10 font-sans">
      <div className="message-page-header flex items-center gap-3">
        <BackButton />
        {activeUser && (
          <button
            type="button"
            onClick={() => { navigate('/messages'); setSidebarOpen(true) }}
            className="md:hidden inline-flex items-center gap-1.5 rounded-full bg-[#f1eafa] px-3 py-1.5 text-xs font-semibold text-[#755b8b] transition active:scale-95"
          >
            <FiArrowLeft size={13} /> Inbox
          </button>
        )}
        {!activeUser && (
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="md:hidden inline-flex items-center gap-1.5 rounded-full bg-[#f1eafa] px-3 py-1.5 text-xs font-semibold text-[#755b8b] transition active:scale-95"
          >
            <FiUsers size={13} /> Conversations
          </button>
        )}
      </div>

      <div className="message-shell message-workspace overflow-hidden">
        <div className="grid h-full grid-cols-1 md:grid-cols-[360px_1fr]">
          {/* Side bar */}
          <div className={`message-sidebar border-b md:border-b-0 md:border-r border-[#cfe1d9] ${activeUserId && !sidebarOpen ? 'hidden md:block' : ''} ${sidebarOpen ? 'block' : ''} max-md:absolute max-md:inset-0 max-md:z-10 max-md:h-full`}>
            <div className="border-b border-[#ded2eb] px-4 pb-4 pt-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d9c9e8] text-[#6d4e88] shadow-sm">
                <FiMessageCircle size={20} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#876da0]">Your inbox</p>
              <h1 className="message-sidebar-title mt-1 font-serif text-2xl font-semibold">Personal messages</h1>
            </div>
            <div className="flex gap-1 border-b border-[#ded2eb] p-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setDirection(t.key)}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${direction === t.key ? 'bg-[#a17cbd] text-white shadow-sm' : 'text-[#755b8b] hover:bg-[#e8def2] dark:text-[#d8c9e4] dark:hover:bg-[#40324e]'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 pb-2 pt-4">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#876da0]"><FiUsers size={14} /> Conversations</span>
              <span className="text-xs font-semibold text-[#a17cbd]">{conversations.length}</span>
            </div>
            <div className="max-h-[calc(100vh-18rem)] overflow-y-auto">
              {loading ? (
                <p className="p-4 text-sm text-[#8b7764] italic">Loading...</p>
              ) : conversations.length === 0 ? (
                <p className="p-4 text-sm text-[#8b7764] italic">
                  No {direction === 'sent' ? 'sent' : 'received'} messages yet.
                </p>
              ) : (
                conversations.map((c) => {
                  const count = direction === 'sent' ? c.sent_count : c.received_count
                  return (
                    <button
                      key={c.user_id}
                      onClick={() => selectConversation(c.user_id)}
                      className={`message-conversation w-full border-l-2 px-4 py-4 text-left transition hover:bg-[#e8def2] dark:hover:bg-[#40324e] ${String(activeUserId) === String(c.user_id) ? 'border-[#9c78b9] bg-[#f7f1fb] shadow-[inset_0_0_0_1px_#eee5f7] dark:bg-[#30263d] dark:shadow-[inset_0_0_0_1px_#4b3b5d]' : 'border-transparent'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-2 truncate text-sm font-semibold text-[#604579]"><span className="comment-avatar h-7 w-7 bg-[#e3d8ef] text-[#6d4e88]">{(c.username || 'U')[0].toUpperCase()}</span>{c.username}</span>
                        {direction === 'received' && c.unread_count > 0 && (
                          <span className="inline-flex items-center justify-center rounded-full bg-[#E87B5D] px-2 py-0.5 text-[10px] font-bold text-white">
                            {c.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-[#8b7764]">{c.last_message}</span>
                        {count > 0 && (
                            <span className="shrink-0 text-[10px] font-semibold text-[#876da0]">
                            {count} {count === 1 ? 'message' : 'messages'}
                          </span>
                        )}
                        <FiChevronRight className="shrink-0 text-[#b49ac6]" size={15} />
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Chat thread */}
          <div className={`message-thread flex min-h-[520px] flex-col ${!activeUserId && !sidebarOpen ? '' : activeUserId ? '' : ''} max-md:${activeUserId ? 'block' : 'hidden'}`}>
            {activeUser ? (
              <>
                <div className="message-thread-header flex items-center justify-between gap-3 border-b border-[#ded2eb] bg-white/80 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#d9c9e8] text-sm font-bold text-[#6d4e88] shadow-sm">
                    {(activeUser.username || 'U')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <Link to={`/profile/${activeUser._id}`} className="block truncate text-sm font-semibold text-[#604579] hover:text-[#8f70aa]">
                      {activeUser.username}
                    </Link>
                    <span className="text-xs text-[#876da0]">{activeUser.followers_count ?? 0} followers · private conversation</span>
                  </div>
                  </div>
                  <Link to={`/profile/${activeUser._id}`} aria-label="View profile" title="View profile" className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1eafa] text-[#755b8b] transition hover:bg-[#e3d8ef] sm:flex">
                    <FiUser size={16} />
                  </Link>
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
                  {messages.length === 0 ? (
                    <p className="py-10 text-center text-sm text-[#8b7764] italic">Say hello to {activeUser.username}!</p>
                  ) : (
                    messages.map((m) => (
                      <div key={m._id} className={`flex ${m.is_mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${m.is_mine ? 'rounded-br-md bg-[#8f70aa] text-white' : 'rounded-bl-md border border-[#ded2eb] bg-[#f1eafa] text-[#4d3c5c]'}`}>
                          <p className="whitespace-pre-line">{m.content}</p>
                          {m.created_at && (
                            <p className={`mt-1 text-[10px] ${m.is_mine ? 'text-white/70' : 'text-[#a99a8a]'}`}>{formatCommentDate(m.created_at)}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>

                <div className="border-t border-[#ded2eb] bg-white/80 p-4">
                  <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage() }}
                    className="flex items-end gap-3"
                  >
                    <span className="hidden pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9a82ad] sm:block">Reply</span>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Write a message..."
                      rows={1}
                      className="flex-1 resize-none rounded-2xl border border-[#ded2eb] bg-[#fbf9fd] px-4 py-3 text-sm outline-none transition focus:border-[#9c78b9] focus:ring-2 focus:ring-[#9c78b9]/20"
                    />
                    <button type="submit" disabled={sending || !input.trim()} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#785894] text-white shadow-sm transition hover:bg-[#604579] disabled:opacity-50">
                      <FiSend />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="message-empty flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0ece4]">
                  <FiMessageCircle className="h-7 w-7 text-[#8b7764]" />
                </div>
                <p className="text-sm text-[#5d584f]">Select a conversation to view your messages.</p>
                <p className="mt-1 text-xs text-[#8b7764]">Click the Message button on a profile to start a new one.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
