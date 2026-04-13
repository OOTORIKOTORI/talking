import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const supabaseClient = (nuxtApp.$supabase?.client || nuxtApp.$supabase) as any

  if (!supabaseClient?.auth) {
    console.error('[API Auth] Supabase client is not available')
  }

  // トークンキャッシュ
  let cachedToken: string | null = null

  // 初期セッション取得
  supabaseClient?.auth?.getSession().then(({ data: { session } }: any) => {
    cachedToken = session?.access_token || null
    console.log('[API Auth] Initial session loaded:', cachedToken ? 'YES' : 'NO')
  })

  // セッション変化を監視
  supabaseClient?.auth?.onAuthStateChange((event: any, session: any) => {
    console.log('[API Auth] Auth state changed:', event)
    cachedToken = session?.access_token || null
  })

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    credentials: 'include',
    async onRequest({ options }) {
      // キャッシュがない場合は最新のセッションを取得
      if (!cachedToken) {
        const { data: { session } } = await supabaseClient.auth.getSession()
        cachedToken = session?.access_token || null
      }

      if (cachedToken) {
        const headers = options.headers instanceof Headers 
          ? options.headers 
          : new Headers(options.headers as Record<string, string> || {})
        
        headers.set('Authorization', `Bearer ${cachedToken}`)
        options.headers = headers
      }
    },
    async onResponseError({ response, options, request }) {
      // 401エラー時はトークンをリフレッシュしてリトライ
      if (response.status === 401) {
        console.log('[API Auth] 401 error, refreshing token...')
        
        const { data, error } = await supabaseClient.auth.refreshSession()
        if (!error && data.session) {
          cachedToken = data.session.access_token
          console.log('[API Auth] Token refreshed, retrying...')
          
          // リトライ（ヘッダー更新）
          const headers = options.headers instanceof Headers 
            ? options.headers 
            : new Headers(options.headers as Record<string, string> || {})
          
          headers.set('Authorization', `Bearer ${cachedToken}`)
          options.headers = headers
          
          // 再リクエスト
          return $fetch(request as string, options)
        } else {
          console.error('[API Auth] Token refresh failed:', error)
          // リフレッシュ失敗時はログイン画面へ
          if (process.client) {
            window.location.href = '/login'
          }
        }
      }
    }
  })

  return { provide: { api } }
})

