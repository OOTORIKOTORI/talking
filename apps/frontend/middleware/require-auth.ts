import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useSupabaseClient } from '#imports'

export default defineNuxtRouteMiddleware(async (to) => {
  // SSRでは Supabase composable を使わない
  if (import.meta.server) return

  // 認証が必要なパスだけチェック（/my/* と /upload）
  if (!(to.path.startsWith('/my') || to.path === '/upload')) return

  const supabase = useSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return navigateTo('/login?next=' + encodeURIComponent(to.fullPath))
  }
})
