import { FiArrowLeft } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'

export default function BackButton({ fallback = '/', className = '', label = 'Back' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const canGoBack = Number(window.history.state?.idx ?? 0) > 0

  if (!canGoBack) return null

  return (
    <button
      type="button"
      key={location.key}
      onClick={() => navigate(-1)}
      aria-label="Go back"
      className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white ${className}`}
    >
      <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  )
}
