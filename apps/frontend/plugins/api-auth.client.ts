import { defineNuxtPlugin } from '#app'
import type { FetchOptions } from 'ofetch'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    credentials: 'include',
    onRequest: async ({ options }) => {
      try {
        const supabaseClient = useSupabaseClient?.()
        if (!supabaseClient) {
          console.warn('[API Auth] Supabase client not ready')
          return
        }
        console.log('[API Auth] Getting session...')
        const { data: { session } } = await supabaseClient.auth.getSession()
        console.log('[API Auth] Session:', session ? 'OK' : 'MISSING')
        const token = session?.access_token
        if (token) {
          console.log('[API Auth] Token found:', token.substring(0, 20) + '...')
          if (options.headers instanceof Headers) {
            options.headers.set('Authorization', `Bearer ${token}`)
          } else if (typeof options.headers === 'object' && options.headers !== null) {
            (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
          }
          console.log('[API Auth] Authorization header set')
        } else {
          console.warn('[API Auth] No token available!')
        }
      } catch (e) {
        console.error('[API Auth] Error:', e)
      }
    },
    onResponseError: async (ctx) => {
      if (ctx.response.status !== 401) return
      try {
        const supabaseClient = useSupabaseClient?.()
        if (!supabaseClient) {
          console.warn('[API Auth] Supabase client not ready on 401')
          return
        }
        console.log('[API Auth] 401 detected, refreshing session...')
        await supabaseClient.auth.refreshSession()
        const { data: { session } } = await supabaseClient.auth.getSession()
        const token = session?.access_token
        if (!token) {
          console.warn('[API Auth] Refresh failed, no token')
          return
        }
        console.log('[API Auth] Refresh successful, retrying request')
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
      } catch (e) {
        console.error('[API Auth] Refresh error:', e)
      }
    },
  })

  return { provide: { api } }
})

