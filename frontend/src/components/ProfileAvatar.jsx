import { useState } from 'react'
import { buildAvatarUrl } from '../utils/avatar'

export default function ProfileAvatar({ url, name = 'User', className = '', fallbackClassName = '' }) {
  const [failed, setFailed] = useState(false)
  const imageUrl = buildAvatarUrl(url)
  const initial = name.trim().charAt(0).toUpperCase() || 'U'

  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt={`${name}'s profile picture`}
        onError={() => setFailed(true)}
        className={`${className} shrink-0 rounded-full object-cover`}
      />
    )
  }

  return (
    <span className={`${className} ${fallbackClassName} flex shrink-0 items-center justify-center rounded-full font-bold`}>
      {initial}
    </span>
  )
}
