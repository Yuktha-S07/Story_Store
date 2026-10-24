export const inputClass =
  'w-full rounded-xl border border-[#d8e4df] dark:border-[#4b5d59] bg-white dark:bg-[#191621] px-4 py-2.5 text-sm text-[#263a38] dark:text-gray-100 placeholder:text-[#9aa9a4] focus:border-[#5fa996] focus:outline-none focus:ring-2 focus:ring-[#8fcfbe]/30 transition disabled:cursor-not-allowed disabled:bg-[#f1f4f1] disabled:text-[#9aa9a4] dark:disabled:bg-[#25212c]'

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

export function Card({ title, subtitle, tone = 'default', icon, actions, children }) {
  const tones = {
    default: 'border-[#d8e4df] dark:border-[#3d4d4a] bg-white dark:bg-[#211d29] shadow-[0_10px_26px_rgba(47,86,76,0.07)]',
    logout: 'border-[#ead9df] dark:border-[#5a3d48] bg-white dark:bg-[#211d29] shadow-[0_10px_26px_rgba(122,72,91,0.07)]',
    danger: 'border-[#eccdc8] dark:border-red-900/40 bg-[#fff6f4] dark:bg-red-950/20',
  }
  return (
    <div className={`settings-panel rounded-2xl border p-4 sm:p-5 ${tones[tone]}`}>
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {icon && <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e5f6f1] text-[#287568] dark:bg-[#1d3d39] dark:text-[#9bd8ca]">{icon}</span>}
            <div className="min-w-0">
              {title && <p className="font-semibold text-sm text-[#263a38] dark:text-gray-200">{title}</p>}
              {subtitle && <p className="settings-subtext mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {actions}
        </div>
      )}
      {title || subtitle || actions ? <div className="mt-4">{children}</div> : children}
    </div>
  )
}
