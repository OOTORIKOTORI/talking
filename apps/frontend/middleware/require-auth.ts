import { defineNuxtRouteMiddleware, navigateTo, useNuxtApp } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
  // SSRでは Supabase composable を使わない
  if (import.meta.server) return

  // 認証が必要なパスだけチェック（/my/* と /upload）
  if (!(to.path.startsWith('/my') || to.path === '/upload')) return

  const { $supabase } = useNuxtApp() as any
  const supabase = $supabase as any
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return navigateTo('/login?next=' + encodeURIComponent(to.fullPath))
  }
})
