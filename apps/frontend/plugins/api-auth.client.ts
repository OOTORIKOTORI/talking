export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient()
  const baseURL = useRuntimeConfig().public.apiBase

  const api = $fetch.create({
    baseURL,
    async onRequest({ options }) {
      // 常に Headers として扱う（型の差異で落ちないように）
      const h = new Headers((options.headers as HeadersInit) || {})
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (token) h.set('Authorization', `Bearer ${token}`)
      options.headers = h
    },
    async onResponseError({ response }) {
      if (response.status !== 401) return
      
      // 401 はトークン期限切れの可能性が高い → リフレッシュを試みる
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
