import { defineNuxtPlugin } from '#app'
// useRuntimeConfig / useSupabaseClient は Nuxt の自動インポートに任せる（明示 import 不要）
import type { FetchOptions } from 'ofetch'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    credentials: 'include',
    onRequest: async ({ options }) => {
      try {
        const supabase = useSupabaseClient() as any
        const { data: { session } } = await supabase?.auth?.getSession()
        const token = session?.access_token
        if (token) {
          if (options.headers instanceof Headers) {
            options.headers.set('Authorization', `Bearer ${token}`)
          } else if (typeof options.headers === 'object' && options.headers !== null) {
            (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
          }
        }
      } catch {
        // Supabase 未初期化などの場合はスキップ
      }
    },
    onResponseError: async (ctx) => {
      if (ctx.response.status !== 401) return
      try {
        const supabase = useSupabaseClient() as any
        if (!supabase?.auth) return
        await supabase.auth.refreshSession()
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) return
        if (ctx.options.headers instanceof Headers) {
          ctx.options.headers.set('Authorization', `Bearer ${token}`)
        } else if (typeof ctx.options.headers === 'object' && ctx.options.headers !== null) {
          (ctx.options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
        }
        if (typeof ctx.options.method === 'string') {
          const allowed = [
            'GET','HEAD','PATCH','POST','PUT','DELETE','CONNECT','OPTIONS','TRACE',
            'get','head','patch','post','put','delete','connect','options','trace'
          ];
          if (!allowed.includes(ctx.options.method)) return;
        }
        await $fetch.raw(ctx.request as any, ctx.options as any)
      } catch { /* no-op */ }
    },
  })

  return { provide: { api } }
})

