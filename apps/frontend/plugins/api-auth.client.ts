import { defineNuxtPlugin, useNuxtApp } from '#app'
// useRuntimeConfig は Nuxt コアの自動インポートに任せる
import type { FetchOptions } from 'ofetch'

export default defineNuxtPlugin(() => {
  const { $supabase } = useNuxtApp() as any
  const supabase = $supabase as any
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    credentials: 'include',
    onRequest: async ({ options }) => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (token) {
        if (options.headers instanceof Headers) {
          options.headers.set('Authorization', `Bearer ${token}`)
        } else if (typeof options.headers === 'object' && options.headers !== null) {
          (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
        }
      }
    },
    onResponseError: async (ctx) => {
      if (ctx.response.status !== 401) return
      try {
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

