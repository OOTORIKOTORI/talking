// ファイル名を .client.ts に（SSR側で Supabase composable 未定義エラーを避ける）
import { defineNuxtRouteMiddleware, navigateTo } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
  // 認証必須ページだけで動く前提（例：/my/*）
  if (!to.path.startsWith('/my')) return

  const supabase = useSupabaseClient() as any
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      // ここはアプリの仕様に合わせて。未ログインならトップへ等
      return navigateTo('/login?next=' + encodeURIComponent(to.fullPath))
    }
  } catch {
    // 失敗時は一旦ログインへ
    return navigateTo('/login?next=' + encodeURIComponent(to.fullPath))
  }
})
