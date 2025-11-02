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

  async function toggle(asset: { id: string; isFavorite?: boolean }) {
    const path = useRoute().fullPath
    if (!(await ensureLogin(path))) return

    const optimistic = !asset.isFavorite
    asset.isFavorite = optimistic
    try {
      if (optimistic) {
        await $api(`/assets/${asset.id}/favorite`, { method: 'POST' })
      } else {
        await $api(`/assets/${asset.id}/favorite`, { method: 'DELETE' })
      }
    } catch (e) {
      // revert on error
      asset.isFavorite = !optimistic
      throw e
    }
  }

  return { toggle }
}
