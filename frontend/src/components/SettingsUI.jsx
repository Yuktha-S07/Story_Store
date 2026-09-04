export const inputClass =
  'w-full rounded-xl border border-[#e4d9cd] dark:border-gray-600 bg-[#fffdf9] dark:bg-gray-900/60 px-4 py-2.5 text-sm text-[#26231f] dark:text-gray-100 placeholder:text-[#a89f92] focus:border-[#b8a1c8] focus:outline-none focus:ring-2 focus:ring-[#BDA6CE]/30 transition disabled:opacity-60 disabled:cursor-not-allowed'

export function Field({ label, children, icon: FieldIcon }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#8b6b52] dark:text-gray-400">
        {label}
      </span>
      {FieldIcon ? (
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#a89f92] dark:text-gray-500">
            <FieldIcon size={15} />
          </span>
          {React.cloneElement(children, {
            className: `${children.props.className || ''} !pl-9`.trim(),
          })}
        </div>
      ) : (
        children
      )}
    </label>
  )
}

const iconBg = {
  purple: 'bg-gradient-to-br from-[#eee5f7] to-[#ddd0ef] text-[#755b8b] dark:from-[#3b2d4b] dark:to-[#2d2238] dark:text-[#d9c5eb]',
  warm: 'bg-gradient-to-br from-[#fff0e9] to-[#ffe3d8] text-[#c45e43] dark:from-[#4a2d22] dark:to-[#3a2218] dark:text-[#f0a990]',
  rose: 'bg-gradient-to-br from-[#fce4e4] to-[#f8d4d4] text-[#b45f69] dark:from-[#4a2430] dark:to-[#3d1c28] dark:text-[#e8949c]',
  green: 'bg-gradient-to-br from-[#e4f1eb] to-[#d4e8dc] text-[#4d8069] dark:from-[#1e3a2a] dark:to-[#162e20] dark:text-[#7cc9a0]',
  amber: 'bg-gradient-to-br from-[#fff4e0] to-[#ffeacc] text-[#a87c38] dark:from-[#3d3018] dark:to-[#2e2410] dark:text-[#e8c66a]',
  slate: 'bg-gradient-to-br from-[#eef0f4] to-[#e2e6ec] text-[#5b6370] dark:from-[#2a2d35] dark:to-[#22252c] dark:text-[#a0aab8]',
}

export function Card({ title, subtitle, tone = 'default', icon: Icon, iconColor = 'purple', accent, actions, onHeaderClick, children }) {
  const tones = {
    default: 'border-[#e6dcd2] dark:border-gray-700 bg-gradient-to-br from-[#fffaf5] to-[#fdf7f0] dark:from-gray-800/60 dark:to-gray-800/40 shadow-[0_6px_18px_rgba(91,61,34,0.04)]',
    danger: 'border-[#eccdc8] dark:border-red-900/40 bg-gradient-to-br from-[#fff6f4] to-[#fef0ed] dark:from-red-950/20 dark:to-red-950/10',
  }
  const accents = {
    purple: 'border-l-[3px] border-l-[#b891cc]',
    rose: 'border-l-[3px] border-l-[#e07a5f]',
    amber: 'border-l-[3px] border-l-[#d4a853]',
    green: 'border-l-[3px] border-l-[#6aab8e]',
    slate: 'border-l-[3px] border-l-[#8b95a3]',
  }
  return (
    <div className={`relative rounded-xl border overflow-hidden p-4 sm:p-5 transition-all duration-300 hover:shadow-[0_10px_28px_rgba(91,61,34,0.08)] dark:hover:shadow-[0_10px_28px_rgba(0,0,0,0.25)] ${accents[accent] || ''} ${tones[tone]}`}>
      {(title || subtitle || actions || Icon) && (
        <div
          className={`flex items-center gap-4 ${onHeaderClick ? 'cursor-pointer -m-4 sm:-m-5 p-4 sm:p-5' : ''}`}
          onClick={onHeaderClick}
          role={onHeaderClick ? 'button' : undefined}
          tabIndex={onHeaderClick ? 0 : undefined}
          onKeyDown={onHeaderClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onHeaderClick(e) } } : undefined}
        >
          {Icon && (
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${iconBg[iconColor] || iconBg.purple}`}>
              <Icon size={20} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            {title && <p className="font-semibold text-sm text-[#26231f] dark:text-gray-200">{title}</p>}
            {subtitle && <p className="mt-0.5 text-xs text-[#5d584f] dark:text-gray-400">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {title || subtitle || actions || Icon ? <div className="mt-4">{children}</div> : children}
    </div>
  )
}
