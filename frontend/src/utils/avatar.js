const API_URL = import.meta.env.VITE_API_URL || ''

export function buildAvatarUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//.test(url)) return url
  if (/^blob:/.test(url)) return url
  if (url.startsWith('/uploads/') || url.startsWith('/api/')) return `${API_URL}${url}`
  return url
}