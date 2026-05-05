export const formatShortOwnerId = (ownerId?: string | null): string => {
  if (!ownerId) return 'unknown'
  if (ownerId.length <= 12) return ownerId
  return `${ownerId.slice(0, 4)}...${ownerId.slice(-4)}`
}

export const formatCreatorLabel = (displayName?: string | null, ownerId?: string | null): string => {
  const name = typeof displayName === 'string' ? displayName.trim() : ''
  return name || formatShortOwnerId(ownerId)
}
