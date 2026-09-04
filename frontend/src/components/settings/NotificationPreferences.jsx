import React, { useEffect, useState } from 'react'
import { FiBell, FiCheck, FiChevronDown, FiMessageCircle, FiPlay, FiThumbsUp, FiVolume2 } from 'react-icons/fi'
import { Card } from '../SettingsUI'
import api from '../../services/api'

const DEFAULTS = { comments: true, messages: true, likes: true, votes: true }
const EVENT_OPTIONS = [
  { key: 'comments', label: 'Comments', description: 'When someone comments on your story.', icon: FiMessageCircle, color: 'bg-[#fff0e9] text-[#c45e43]' },
  { key: 'messages', label: 'Personal messages', description: 'When someone sends you a private message.', icon: FiBell, color: 'bg-[#eee5f7] text-[#755b8b]' },
  { key: 'likes', label: 'Story likes', description: 'When someone likes one of your stories.', icon: FiThumbsUp, color: 'bg-[#fce8e8] text-[#b45f69]' },
  { key: 'votes', label: 'Story votes', description: 'When someone votes for one of your stories.', icon: FiCheck, color: 'bg-[#e4f1eb] text-[#4d8069]' },
]

const SOUND_OPTIONS = [
  { value: 'chime', label: 'Lavender chime' },
  { value: 'pop', label: 'Soft pop' },
  { value: 'sparkle', label: 'Story sparkle' },
  { value: 'pulse', label: 'Warm pulse' },
  { value: 'whistle', label: 'Bright whistle' },
]

export default function NotificationPreferences() {
  const [expanded, setExpanded] = useState(false)
  const [preferences, setPreferences] = useState(DEFAULTS)
  const [sound, setSound] = useState(() => localStorage.getItem('story-store:notification-sound') || 'chime')
  const [saving, setSaving] = useState(false)

  const playSound = (soundName = sound) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const audio = new AudioContext()
    const patterns = {
      chime: [[523, 0], [659, 0.12]],
      pop: [[440, 0]],
      sparkle: [[659, 0], [784, 0.1], [988, 0.2]],
      pulse: [[220, 0], [330, 0.18]],
      whistle: [[880, 0], [1175, 0.12]],
    }
    ;(patterns[soundName] || patterns.chime).forEach(([frequency, delay]) => {
      const oscillator = audio.createOscillator()
      const gain = audio.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, audio.currentTime + delay)
      gain.gain.exponentialRampToValueAtTime(0.08, audio.currentTime + delay + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + delay + 0.28)
      oscillator.connect(gain)
      gain.connect(audio.destination)
      oscillator.start(audio.currentTime + delay)
      oscillator.stop(audio.currentTime + delay + 0.3)
    })
  }

  useEffect(() => {
    api.get('/api/notifications/preferences')
      .then((res) => setPreferences({ ...DEFAULTS, ...res.data }))
      .catch((err) => console.error(err))
  }, [])

  const updatePreferences = async (key) => {
    const next = { ...preferences, [key]: !preferences[key] }
    setPreferences(next)
    setSaving(true)
    try {
      await api.put('/api/notifications/preferences', next)
    } catch (err) {
      console.error(err)
      setPreferences(preferences)
    } finally {
      setSaving(false)
    }
  }

  const updateSound = (event) => {
    const next = event.target.value
    setSound(next)
    localStorage.setItem('story-store:notification-sound', next)
    window.dispatchEvent(new CustomEvent('story-store:notification-settings', { detail: { sound: next } }))
  }

  return (
    <Card>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eee5f7] text-[#755b8b] dark:bg-[#3b2d4b] dark:text-[#d9c5eb]"><FiBell size={18} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-[#26231f] dark:text-[#f0e8f6]">Notifications</span>
          <span className="mt-0.5 block text-xs text-[#5d584f] dark:text-[#c8b8d2]">Choose which activity reaches you and how it sounds.</span>
        </span>
        <FiChevronDown className={`shrink-0 text-[#876da0] dark:text-[#d3bce4] transition-transform ${expanded ? 'rotate-180' : ''}`} size={19} />
      </button>
      {expanded && <div className="mt-4 border-t border-[#e6dcd2] pt-4 dark:border-[#4b3b5d]">
      <div className="grid gap-2 sm:grid-cols-2">
        {EVENT_OPTIONS.map(({ key, label, description, icon: Icon, color }) => (
          <button
            key={key}
            type="button"
            role="switch"
            aria-checked={preferences[key]}
            onClick={() => updatePreferences(key)}
            disabled={saving}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm dark:text-[#f0e8f6] ${preferences[key] ? 'border-[#d8c9e8] bg-[#fbf9fd] dark:border-[#604b73] dark:bg-[#2d2438]' : 'border-[#e6dcd2] bg-[#fffaf5] opacity-65 dark:border-[#4b3b5d] dark:bg-[#241e2d]'}`}
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}><Icon size={17} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[#453253] dark:text-[#f0e8f6]">{label}</span>
              <span className="mt-0.5 block text-xs leading-4 text-[#7b7470] dark:text-[#c8b8d2]">{description}</span>
            </span>
            <span className={`h-5 w-9 shrink-0 rounded-full p-0.5 transition ${preferences[key] ? 'bg-[#9c78b9]' : 'bg-[#d8d1d9]'}`}>
              <span className={`block h-4 w-4 rounded-full bg-white shadow-sm transition ${preferences[key] ? 'translate-x-4' : ''}`} />
            </span>
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#ded2eb] bg-[#f8f3fc] p-3 dark:border-[#4b3b5d] dark:bg-[#2d2438]">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e3d8ef] text-[#755b8b] dark:bg-[#49375b] dark:text-[#d9c5eb]"><FiVolume2 size={17} /></span>
        <label htmlFor="notification-sound" className="text-sm font-semibold text-[#604579] dark:text-[#eadff1]">Notification sound</label>
        <select id="notification-sound" value={sound} onChange={updateSound} className="rounded-lg border border-[#d8c9e8] bg-white px-3 py-2 text-sm text-[#604579] outline-none focus:border-[#9c78b9] dark:border-[#604b73] dark:bg-[#1d1824] dark:text-[#f0e8f6]">
          {SOUND_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <button type="button" onClick={() => playSound()} className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[#785894] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#604579]">
          <FiPlay size={13} /> Listen
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {SOUND_OPTIONS.map((option) => (
          <button key={option.value} type="button" onClick={() => playSound(option.value)} className="inline-flex items-center gap-1.5 rounded-full border border-[#d8c9e8] bg-white px-3 py-1.5 text-xs font-medium text-[#755b8b] transition hover:-translate-y-0.5 hover:bg-[#f1eafa] dark:border-[#604b73] dark:bg-[#2d2438] dark:text-[#d9c5eb] dark:hover:bg-[#423351]">
            <FiPlay size={11} /> {option.label}
          </button>
        ))}
      </div>
      </div>}
    </Card>
  )
}
