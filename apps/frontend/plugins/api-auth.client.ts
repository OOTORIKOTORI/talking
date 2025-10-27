export default defineNuxtPlugin((nuxtApp) => {
  const baseURL = useRuntimeConfig().public.apiBase

  const api = $fetch.create({
    baseURL,
    async onRequest({ options }) {
      // 常に Headers として扱う（型の差異で落ちないように）
      const h = new Headers((options.headers as HeadersInit) || {})
      
      // Supabase クライアントをリクエストごとに取得
      const supabase = useSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (token) h.set('Authorization', `Bearer ${token}`)
      options.headers = h
    },
    async onResponseError({ response }) {
      if (response.status !== 401) return
      
      // 401 はトークン期限切れの可能性が高い → リフレッシュを試みる
      const supabase = useSupabaseClient()
      try { 
        await supabase.auth.refreshSession() 
      } catch {
        // リフレッシュ失敗時はログインページへ
        await navigateTo('/login')
      }
    },
  })

  return { provide: { api } }
})
