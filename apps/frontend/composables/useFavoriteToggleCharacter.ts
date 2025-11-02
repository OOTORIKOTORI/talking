export function useFavoriteToggleCharacter() {
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

  async function toggle(character: { id: string; isFavorite?: boolean }) {
    const path = useRoute().fullPath
    if (!(await ensureLogin(path))) return

    const optimistic = !character.isFavorite
    character.isFavorite = optimistic
    try {
      if (optimistic) {
        await $api(`/characters/${character.id}/favorite`, { method: 'POST' })
      } else {
        await $api(`/characters/${character.id}/favorite`, { method: 'DELETE' })
      }
    } catch (e) {
      // revert on error
      character.isFavorite = !optimistic
      throw e
    }
  }

  return { toggle }
}
