export function formatCommentDate(value) {
  if (!value) return ''
  let date
  const raw = String(value)
  const parsedLocal = new Date(raw)
  if (Number.isNaN(parsedLocal.getTime())) {
    return ''
  }
  const hasTimezone = /(Z|[+-]\d{2}:?\d{2})$/.test(raw.trim())
  if (hasTimezone) {
    date = parsedLocal
  } else {
    date = new Date(raw.endsWith('Z') ? raw : `${raw}Z`)
  }
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  let hours = date.getHours()
  const meridiem = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12
  const hoursStr = String(hours).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hoursStr}:${minutes} ${meridiem}`
}
