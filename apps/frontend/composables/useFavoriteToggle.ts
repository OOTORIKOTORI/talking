export function useFavoriteToggle() {
  const supabase = useSupabaseClient() as any
  const { $api } = useNuxtApp()

  async function ensureLogin(nextPath: string) {
    const { data:{ session } } = await supabase.auth.getSession()
    if (!session) {
      await navigateTo('/login?next=' + encodeURIComponent(nextPath))
      return false
    }
    return true
  }

  async function toggle(asset: { id: string; isFavorite?: boolean; isFavorited?: boolean; favoriteCount?: number }) {
    const path = useRoute().fullPath
    if (!(await ensureLogin(path))) return

    const prevIsFavorite = asset.isFavorite ?? asset.isFavorited ?? false
    const prevFavoriteCount = Number(asset.favoriteCount ?? 0)
    const optimistic = !prevIsFavorite

    asset.isFavorite = optimistic
    asset.isFavorited = optimistic
    asset.favoriteCount = optimistic
      ? prevFavoriteCount + 1
      : Math.max(0, prevFavoriteCount - 1)

    try {
      if (optimistic) {
        await $api(`/assets/${asset.id}/favorite`, { method: 'POST' })
      } else {
        await $api(`/assets/${asset.id}/favorite`, { method: 'DELETE' })
      }
    } catch (e) {
      // revert on error
      asset.isFavorite = prevIsFavorite
      asset.isFavorited = prevIsFavorite
      asset.favoriteCount = prevFavoriteCount
      throw e
    }
  }

  return { toggle }
}
