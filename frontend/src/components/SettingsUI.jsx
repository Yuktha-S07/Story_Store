export const inputClass =
  'w-full rounded-xl border border-[#e4d9cd] dark:border-gray-600 bg-[#fffdf9] dark:bg-gray-900/60 px-4 py-2.5 text-sm text-[#26231f] dark:text-gray-100 placeholder:text-[#a89f92] focus:border-[#b8a1c8] focus:outline-none focus:ring-2 focus:ring-[#BDA6CE]/30 transition disabled:opacity-60 disabled:cursor-not-allowed'

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#8b6b52] dark:text-gray-400">
        {label}
      </span>
      {children}
    </label>
  )
}

export function Card({ title, subtitle, tone = 'default', actions, children }) {
  const tones = {
    default: 'border-[#e6dcd2] dark:border-gray-700 bg-[#fffaf5]/80 dark:bg-gray-800/50 shadow-[0_6px_18px_rgba(91,61,34,0.04)]',
    danger: 'border-[#eccdc8] dark:border-red-900/40 bg-[#fff6f4] dark:bg-red-950/20',
  }
  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${tones[tone]}`}>
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            {title && <p className="font-semibold text-sm text-[#26231f] dark:text-gray-200">{title}</p>}
            {subtitle && <p className="mt-0.5 text-xs text-[#5d584f] dark:text-gray-400">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {title || subtitle || actions ? <div className="mt-4">{children}</div> : children}
    </div>
  )
}
