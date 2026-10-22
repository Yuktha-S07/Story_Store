import React, { useEffect, useState } from 'react'

export default function CoverPreview({ src, fallbackSrc, alt, title, className = '', imageClassName = '' }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return undefined
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleImageError = (event) => {
    if (fallbackSrc && event.currentTarget.src !== fallbackSrc) {
      event.currentTarget.src = fallbackSrc
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`group/cover relative block w-full overflow-hidden text-left ${className}`}
        aria-label={`View cover for ${title}`}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={handleImageError}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover/cover:scale-105 ${imageClassName}`}
        />
        <span className="absolute inset-0 flex items-center justify-center bg-[#211a29]/0 text-sm font-semibold text-white opacity-0 transition group-hover/cover:bg-[#211a29]/45 group-hover/cover:opacity-100">
          View Cover
        </span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#211a29]/80 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cover-preview-title"
            className="relative max-h-[92vh] max-w-[min(92vw,42rem)] overflow-hidden rounded-[24px] border border-white/20 bg-[#fffdfa] p-3 shadow-2xl dark:bg-[#1d1824]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between gap-4 px-2">
              <h2 id="cover-preview-title" className="font-serif text-lg font-semibold text-[#292535] dark:text-gray-100">
                View Cover
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full px-3 py-1 text-sm font-semibold text-[#756765] transition hover:bg-[#f1e8e2] hover:text-[#292535] dark:text-[#c8b8d2] dark:hover:bg-[#302745] dark:hover:text-white"
                aria-label="Close cover preview"
              >
                Close
              </button>
            </div>
            <img
              src={src}
              alt={alt}
              onError={handleImageError}
              className="max-h-[calc(92vh-4.5rem)] w-full rounded-[16px] object-contain"
            />
            <p className="px-2 pt-2 text-center text-sm font-semibold text-[#756765] dark:text-[#c8b8d2]">{title}</p>
          </div>
        </div>
      )}
    </>
  )
}
