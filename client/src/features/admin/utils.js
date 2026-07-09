export function formatStorage(mb) {
  if (mb == null) return '—'
  const gb = mb / 1024
  return gb >= 1 ? `${gb.toFixed(gb % 1 === 0 ? 0 : 1)} GB` : `${mb} MB`
}

export function formatRelativeTime(isoString) {
  if (!isoString) return 'Never'

  const then = new Date(isoString).getTime()
  const now = Date.now()
  const diffMin = Math.round((now - then) / 60000)

  if (diffMin < 2) return 'Active now'
  if (diffMin < 60) return `${diffMin} minutes ago`

  const diffHours = Math.round(diffMin / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`

  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`

  const diffWeeks = Math.round(diffDays / 7)
  return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`
}
