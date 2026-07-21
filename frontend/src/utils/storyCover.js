const allImages = [
  'Fantasy.jpg',
  'Romance.jpg',
  'Werewolf.jpg',
  'Comic.jpg',
  'Novels.jpg',
  'New%20Adult.jpg',
  'ShortStory.jpg',
  'Fanfiction.jpg',
  'download.jpg',
  'download (1).jpg',
  'download (2).jpg',
  'download (3).jpg',
  'download (4).jpg',
  'download (5).jpg',
  'download (6).jpg',
  'download (7).jpg',
  'download (8).jpg',
  'download (9).jpg',
  'download (10).jpg',
  'download (11).jpg',
  'download (12).jpg',
  'download (13).jpg',
  'download (14).jpg',
  'download (15).jpg',
  'download (16).jpg',
  'download (17).jpg',
  'download (18).jpg',
]

function hashId(str) {
  let h = 0
  for (let i = 0; i < (str || '').length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function pickImage(story) {
  const id = String(story?._id || story?.id || story?.title || 'story')
  return `/${allImages[hashId(id) % allImages.length]}`
}

export function buildStoryCoverUrl(story) {
  return pickImage(story)
}

export function buildStoryCoverAlt(story) {
  const title = story?.title || 'Untitled story'
  const genre = story?.genre || 'book'
  return `Cover for ${title} in ${genre} genre`
}

export function buildStoryFallbackUrl(story) {
  const id = String(story?._id || story?.id || story?.title || 'story')
  return `/${allImages[(hashId(id) + 1) % allImages.length]}`
}
