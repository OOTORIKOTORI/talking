// packages/types/src/favorites.ts
export type FavoritesQuery = {
  q?: string
  type?: 'image' | 'audio' | ''
  primary?: string | ''
  tags?: string | '' // カンマ区切り
  sort?: 'createdAt:desc' | 'createdAt:asc'
  limit?: number
  offset?: number
}
