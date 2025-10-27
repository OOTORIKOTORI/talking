// apps/frontend/middleware/require-auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  console.log('[require-auth] Checking:', to.path)
  
  // SSR では判定スキップ（初回リダイレクト暴発防止）
  if (process.server) {
    console.log('[require-auth] Skipping on server')
    return
  }

  // クライアントサイドのみで実行
  if (process.client) {
    const supabase = useSupabaseClient()
    
    // セッションを直接取得
    const { data: { session }, error } = await supabase.auth.getSession()
    console.log('[require-auth] Session:', session ? 'exists' : 'null', 'Error:', error)
    
    if (error) {
      console.error('[require-auth] Error getting session:', error)
    }
    
    if (!session) {
      console.log('[require-auth] No session, redirecting to /login')
      return navigateTo('/login')
    }
    
    console.log('[require-auth] Session valid, user:', session.user.email)
  }
})
