import { useSupabaseClient, useRuntimeConfig } from '#imports'
// ...existing code...
import { defineNuxtPlugin } from '#app'
import type { FetchContext, FetchOptions } from 'ofetch'

type RetryContext = FetchContext & { response: any }

export default defineNuxtPlugin(() => {
  // useSupabaseClient, useRuntimeConfigは自動インポート
  const supabase = useSupabaseClient()
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase, // NUXT_PUBLIC_API_BASE
    credentials: 'include',
    onRequest: async ({ options }: FetchContext) => {
      // セッション取得して Bearer 付与
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      if (options.headers instanceof Headers) {
        if (token) options.headers.set('Authorization', `Bearer ${token}`)
      } else {
        options.headers = new Headers()
        if (token) options.headers.set('Authorization', `Bearer ${token}`)
      }
    },
    onResponseError: async (ctx: RetryContext) => {
      if (ctx.response.status !== 401) return
      try {
        await supabase.auth.refreshSession()
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) return
        if (ctx.options.headers instanceof Headers) {
          ctx.options.headers.set('Authorization', `Bearer ${token}`)
        } else {
          ctx.options.headers = new Headers()
          ctx.options.headers.set('Authorization', `Bearer ${token}`)
        }
  await ($fetch.raw as any)(ctx.request, ctx.options)
      } catch { /* no-op */ }
    },
  })

  return { provide: { api } }
})

