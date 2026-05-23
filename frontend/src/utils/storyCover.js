const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:8000' : '')

function resolveLocalUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return `${API_URL}${path}`
  return path
}

export function buildStoryCoverUrl(story) {
  const storedCover = resolveLocalUrl(story?.cover_image_url)
  if (storedCover) return storedCover

  const storyId = story?._id || story?.id || story?.title || 'story'
  const genre = story?.genre || 'book'
  const query = `${genre},book`
  return `https://source.unsplash.com/400x600/?${encodeURIComponent(query)}&sig=${encodeURIComponent(storyId)}`
}

export function buildStoryCoverAlt(story) {
  const title = story?.title || 'Untitled story'
  const genre = story?.genre || 'book'
  return `Cover for ${title} in ${genre} genre`
}

export function buildStoryFallbackUrl(story) {
  const storyId = story?._id || story?.id || story?.title || 'story'
  const genre = story?.genre || 'book'
  const seed = `${genre}-${storyId}`
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/600`
}