import React, { useEffect, useRef, useState } from 'react'
import { FiSmile, FiX } from 'react-icons/fi'

const EMOJIS = [
  '😀', '😄', '😁', '😊', '😍', '🥰', '😘', '😎',
  '🤩', '🥳', '😂', '🤣', '😅', '😉', '🙂', '🙃',
  '😌', '😇', '🤔', '🤨', '😮', '😲', '😱', '😢',
  '😭', '😤', '😡', '🤯', '😴', '🤗', '😬', '😐',
  '👍', '👎', '👏', '🙌', '🙏', '💪', '🤝', '✌️',
  '👌', '🤞', '❤️', '🧡', '💛', '💚', '💙', '💜',
  '🖤', '🤍', '💔', '💯', '🔥', '✨', '⭐', '🌟',
  '🎉', '🎊', '📚', '📖', '✍️', '💡', '🌈', '🌸',
]

export default function EmojiPicker({ onSelect, label = 'Add emoji' }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const handleOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false)
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const chooseEmoji = (emoji) => {
    onSelect?.(emoji)
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={label}
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition ${open ? 'border-[#E87B5D] bg-[#fff0e9] text-[#c45e43]' : 'border-[#eadfd5] bg-white/80 text-[#8b7764] hover:border-[#E87B5D] hover:text-[#c45e43]'} dark:border-[#4b3b5d] dark:bg-[#211a29] dark:text-[#d8c9d9] dark:hover:border-[#e8a08d] dark:hover:text-[#f2b9ab]`}
      >
        <FiSmile size={18} aria-hidden="true" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[65] bg-black/25 backdrop-blur-[1px] sm:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Choose an emoji"
          className="fixed inset-x-4 bottom-4 z-[70] rounded-2xl border border-[#eadfd5] bg-[#fffdfb] p-3 shadow-[0_18px_40px_rgba(73,48,20,0.2)] dark:border-[#4b3b5d] dark:bg-[#211a29] sm:absolute sm:inset-x-auto sm:bottom-full sm:left-1/2 sm:mb-2 sm:w-[min(18rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:p-2"
        >
          <div className="mb-2 flex items-center justify-between gap-2 px-1 sm:hidden">
            <span className="text-sm font-semibold text-[#4d4653] dark:text-[#f0e6fa]">Choose an emoji</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close emoji picker"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8b7764] transition hover:bg-[#fff0e9] hover:text-[#c45e43] dark:text-[#d8c9d9] dark:hover:bg-[#3a2733]"
            >
              <FiX size={16} aria-hidden="true" />
            </button>
          </div>
          <div className="emoji-picker-grid grid max-h-56 grid-cols-7 gap-0.5 overflow-y-auto overscroll-contain sm:grid-cols-8">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => chooseEmoji(emoji)}
                aria-label={`Insert ${emoji}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg leading-none transition hover:bg-[#fff0e9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87B5D]/40 dark:hover:bg-[#3a2733]"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
