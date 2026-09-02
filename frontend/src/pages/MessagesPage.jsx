import React, { useContext, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiMessageCircle, FiSend } from 'react-icons/fi'
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
  const bottomRef = useRef(null)

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
  }, [userId, user])

  useEffect(() => {
    const el = bottomRef.current
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !activeUserId) return
    try {
      setSending(true)
      await api.post('/api/messages', { recipient_id: activeUserId, content: input.trim() })
      const res = await api.get(`/api/messages/with/${activeUserId}`)
      setMessages(Array.isArray(res.data) ? res.data : [])
      setInput('')
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
  }

  const tabs = [
    { key: 'received', label: 'Received' },
    { key: 'sent', label: 'Sent' },
  ]

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-0 pb-10 font-sans">
      <div className="flex items-center justify-between gap-3">
        <BackButton />
        <span className="rounded-full border border-[#d9c7b4] bg-[#fffaf4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b6b52]">Messages</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e8e0d5] bg-[#FBF9F1] shadow-[0_14px_40px_rgba(73,48,20,0.08)]">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
          {/* Side bar */}
          <div className="border-b md:border-b-0 md:border-r border-[#e8e0d5] bg-[#fffaf4]">
            <div className="flex gap-1 border-b border-[#eadfd5] p-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setDirection(t.key)}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${direction === t.key ? 'bg-[#BDA6CE] text-white shadow-sm' : 'text-[#7a5a9a] hover:bg-[#f7f1fb]'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="max-h-[520px] overflow-y-auto">
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
                      className={`w-full text-left px-4 py-3.5 transition hover:bg-white ${String(activeUserId) === String(c.user_id) ? 'bg-white' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-[#26231f]">{c.username}</span>
                        {direction === 'received' && c.unread_count > 0 && (
                          <span className="inline-flex items-center justify-center rounded-full bg-[#E87B5D] px-2 py-0.5 text-[10px] font-bold text-white">
                            {c.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-[#8b7764]">{c.last_message}</span>
                        {count > 0 && (
                          <span className="shrink-0 text-[10px] font-semibold text-[#7a5a9a]">
                            {count} {count === 1 ? 'message' : 'messages'}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Chat thread */}
          <div className="flex min-h-[520px] flex-col">
            {activeUser ? (
              <>
                <div className="flex items-center gap-3 border-b border-[#e8e0d5] bg-[#fffaf4] px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E0D5F5] text-sm font-bold text-[#5A388C]">
                    {(activeUser.username || 'U')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <Link to={`/profile/${activeUser._id}`} className="block truncate text-sm font-semibold text-[#26231f] hover:text-[#7a5a9a]">
                      {activeUser.username}
                    </Link>
                    <span className="text-xs text-[#8b7764]">{activeUser.followers_count ?? 0} followers</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: '420px' }}>
                  {messages.length === 0 ? (
                    <p className="py-10 text-center text-sm text-[#8b7764] italic">Say hello to {activeUser.username}!</p>
                  ) : (
                    messages.map((m) => (
                      <div key={m._id} className={`flex ${m.is_mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${m.is_mine ? 'rounded-br-md bg-[#BDA6CE] text-white' : 'rounded-bl-md border border-[#e8e0d5] bg-white text-[#26231f]'}`}>
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

                <div className="border-t border-[#e8e0d5] bg-[#fffaf4] p-3">
                  <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage() }}
                    className="flex items-end gap-2"
                  >
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Write a message..."
                      rows={1}
                      className="flex-1 resize-none border border-[#eadfd5] bg-white px-3 py-2.5 rounded-xl text-sm outline-none transition focus:border-[#BDA6CE] focus:ring-2 focus:ring-[#BDA6CE]/20"
                    />
                    <button type="submit" disabled={sending || !input.trim()} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#BDA6CE] text-white shadow-sm transition hover:bg-[#a98cc4] disabled:opacity-50">
                      <FiSend />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
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
