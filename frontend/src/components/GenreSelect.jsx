import { useEffect, useRef, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import { EXISTING_GENRES } from '../utils/genres'

const CUSTOM_GENRE = '__custom__'

export default function GenreSelect({ value, onChange, className = '' }) {
  const [open, setOpen] = useState(false)
  const [customMode, setCustomMode] = useState(
    Boolean(value) && !EXISTING_GENRES.includes(value)
  )
  const containerRef = useRef(null)

  useEffect(() => {
    if (value && !EXISTING_GENRES.includes(value)) {
      setCustomMode(true)
    }
  }, [value])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleSelect = (nextValue) => {
    if (nextValue === CUSTOM_GENRE) {
      setCustomMode(true)
      onChange('')
      setOpen(false)
      return
    }
    setCustomMode(false)
    onChange(nextValue)
    setOpen(false)
  }

  const fieldClass = `w-full rounded-2xl border border-slate-200/90 bg-white/50 px-4 py-3.5 outline-none transition focus:border-[#E87B5D] focus:ring-2 focus:ring-[#E87B5D]/20 ${className}`
  const selectedLabel = value || 'Choose a genre'

  return (
    <div ref={containerRef} className="relative">
      {customMode ? (
        <input
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder="Create a new genre"
          className={fieldClass}
          autoFocus
        />
      ) : (
        <>
          <button
            type="button"
            onClick={() => setOpen(current => !current)}
            className={`${fieldClass} flex items-center justify-between text-left`}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span className={!value ? 'text-slate-400' : ''}>{selectedLabel}</span>
            <span className="ml-3 text-xs text-slate-500">▾</span>
          </button>
          {open && (
            <div
              role="listbox"
              className="absolute left-0 top-full z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 text-left shadow-lg dark:border-slate-700 dark:bg-[#1d1824]"
            >
              {EXISTING_GENRES.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  role="option"
                  aria-selected={value === genre}
                  onClick={() => handleSelect(genre)}
                  className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-[#fff1eb] dark:text-gray-200 dark:hover:bg-[#332740]"
                >
                  {genre}
                </button>
              ))}
              <button
                type="button"
                role="option"
                onClick={() => handleSelect(CUSTOM_GENRE)}
                className="mx-2 mt-2 flex w-[calc(100%-1rem)] items-center gap-2 border-t border-[#f0d5ca] px-3 py-3 text-left text-sm font-semibold text-[#9a514b] transition hover:bg-[#fff5f0] dark:border-[#59445f] dark:text-[#f2b9ab] dark:hover:bg-[#332740]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d97862] text-white shadow-sm dark:bg-[#c98ba0] dark:text-[#2a2132]">
                  <FiPlus className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block">Create a new genre</span>
                  <span className="mt-0.5 block text-[11px] font-normal text-[#b87862] dark:text-[#d9a9b8]">Use your own category</span>
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
