import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const supabase = (nuxtApp as any).$supabase
  const supabaseClient = (supabase?.client || supabase) as any

  if (!supabaseClient?.auth) {
    console.error('[API Auth] Supabase client is not available')
  }

  // トークンキャッシュ
  let cachedToken: string | null = null

  // 初期セッション取得
  supabaseClient?.auth?.getSession().then(({ data: { session } }: any) => {
    cachedToken = session?.access_token || null
  })

  // セッション変化を監視
  supabaseClient?.auth?.onAuthStateChange((_event: any, session: any) => {
    cachedToken = session?.access_token || null
  })

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    credentials: 'include',
    async onRequest({ options }) {
      // キャッシュがない場合は最新のセッションを取得
      if (!cachedToken && supabaseClient?.auth) {
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
      if (response.status === 401 && supabaseClient?.auth) {
        const { data, error } = await supabaseClient.auth.refreshSession()
        if (!error && data.session) {
          cachedToken = data.session.access_token
          
          // リトライ（ヘッダー更新）
          const headers = options.headers instanceof Headers 
            ? options.headers 
            : new Headers(options.headers as Record<string, string> || {})
          
          headers.set('Authorization', `Bearer ${cachedToken}`)
          options.headers = headers
          
          // 再リクエスト
          return $fetch(request as string, options as any)
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

