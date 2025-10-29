// 先頭に明示インポート（auto-import環境でも #imports 経由が安全）
import { useSupabaseClient, useRuntimeConfig, navigateTo } from '#imports'
import { defineNuxtPlugin } from '#app'
import type { FetchContext, FetchOptions } from 'ofetch'

type RetryContext = FetchContext & { response: any }

export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient()
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase, // NUXT_PUBLIC_API_BASE
    credentials: 'include',
    onRequest: async ({ options }: FetchContext) => {
      // セッション取得して Bearer 付与
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      const headers = new Headers((options.headers as HeadersInit) || {})
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      options.headers = headers
    },
    onResponseError: async (ctx: RetryContext) => {
      if (!ctx.response || ctx.response.status !== 401) return
      
      // 401 → refresh → 1回だけ再試行
      try {
        await supabase.auth.refreshSession()
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) {
          await navigateTo('/login')
          return
        }
        
        const retryHeaders = new Headers((ctx.options.headers as HeadersInit) || {})
        retryHeaders.set('Authorization', `Bearer ${token}`)
        ctx.options.headers = retryHeaders
        
        // 再試行（ofetch の $fetch.raw を使用）
        return await ($fetch.raw as any)(ctx.request, ctx.options)
      } catch {
        await navigateTo('/login')
      }
    },
  })

  return { provide: { api } }
})

