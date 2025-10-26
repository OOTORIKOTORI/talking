// apps/frontend/middleware/require-auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  console.log('[require-auth] Checking:', to.path)
  
  // SSR では判定スキップ（初回リダイレクト暴発防止）
  if (process.server) {
    console.log('[require-auth] Skipping on server')
    return
  }

  const supabase = useSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  console.log('[require-auth] Session:', session ? 'exists' : 'null')
  
  if (!session) {
    console.log('[require-auth] Redirecting to /login')
    return navigateTo('/login')
  }
})
