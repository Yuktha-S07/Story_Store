import React, { useEffect, useRef, useState } from 'react'
import { FiBold, FiItalic, FiUnderline } from 'react-icons/fi'

const FONTS = [
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", "Chalkboard SE", cursive' },
]

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null)
  const [boldActive, setBoldActive] = useState(false)
  const [italicActive, setItalicActive] = useState(false)
  const [underlineActive, setUnderlineActive] = useState(false)

  useEffect(() => {
    const el = editorRef.current
    if (!el) return undefined
    if (document.activeElement !== el) {
      el.innerHTML = value || ''
    }
  }, [value])

  const emitChange = () => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const exec = (command, arg = null) => {
    editorRef.current?.focus()
    document.execCommand(command, false, arg)
    emitChange()
    updateActiveStates()
  }

  const applyFont = (e) => {
    const fontValue = e.target.value
    exec('fontName', fontValue)
    e.target.value = ''
  }

  const updateActiveStates = () => {
    setBoldActive(document.queryCommandState('bold'))
    setItalicActive(document.queryCommandState('italic'))
    setUnderlineActive(document.queryCommandState('underline'))
  }

  const toolbarButton =
    'flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition focus:outline-none'
  const activeButton = 'border-[#E87B5D] bg-[#FFF1EC] text-[#E87B5D]'
  const idleButton = 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/50 focus-within:border-[#E87B5D] focus-within:ring-2 focus-within:ring-[#E87B5D]/20">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-[#fffdf9] px-3 py-2.5">
        <button
          type="button"
          title="Bold"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('bold')}
          className={`${toolbarButton} ${boldActive ? activeButton : idleButton}`}
        >
          <FiBold />
        </button>
        <button
          type="button"
          title="Italic"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('italic')}
          className={`${toolbarButton} ${italicActive ? activeButton : idleButton}`}
        >
          <FiItalic />
        </button>
        <button
          type="button"
          title="Underline"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('underline')}
          className={`${toolbarButton} ${underlineActive ? activeButton : idleButton}`}
        >
          <FiUnderline />
        </button>
        <div className="mx-1 h-6 w-px bg-slate-200" />
        <select
          aria-label="Font family"
          onMouseDown={(e) => e.stopPropagation()}
          onChange={applyFont}
          value=""
          className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-[#E87B5D]"
        >
          <option value="" disabled>
            Font
          </option>
          {FONTS.map((f) => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onKeyUp={updateActiveStates}
        onMouseUp={updateActiveStates}
        className="rich-editor min-h-[24rem] w-full px-5 py-4 text-base leading-7 text-slate-800 outline-none [&_b]:font-bold [&_i]:italic [&_u]:underline"
        data-placeholder="Chapter content..."
      />
    </div>
  )
}
