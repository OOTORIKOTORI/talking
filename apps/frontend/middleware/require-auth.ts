// apps/frontend/middleware/require-auth.ts
export default defineNuxtRouteMiddleware(async () => {
  // SSR では判定スキップ（初回リダイレクト暴発防止）
  if (process.server) return

  const supabase = useSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return navigateTo('/login')
})
