import type { FetchContext, FetchOptions } from 'ofetch'

type RetriableFetchOptions = FetchOptions & { _tokenRefreshed?: boolean }

export default defineNuxtPlugin(() => {
  const baseURL = useRuntimeConfig().public.apiBase

  const api = $fetch.create({
    baseURL,
    async onRequest({ options }: FetchContext) {
      const supabase = useSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const opts = options as RetriableFetchOptions
      const headers = new Headers((opts.headers as HeadersInit) || {})
      if (token) headers.set('Authorization', `Bearer ${token}`)
      opts.headers = headers
    },
    async onResponseError({ response, request, options }: FetchContext) {
      if (!response || response.status !== 401) return

      const opts = options as RetriableFetchOptions
      if (opts._tokenRefreshed) {
        await navigateTo('/login')
        return
      }

      try {
        const supabase = useSupabaseClient()
        const { data } = await supabase.auth.refreshSession()
        const token = data.session?.access_token
        if (!token) {
          await navigateTo('/login')
          return
        }

        const retryHeaders = new Headers((opts.headers as HeadersInit) || {})
        retryHeaders.set('Authorization', `Bearer ${token}`)
        opts._tokenRefreshed = true

        const { _tokenRefreshed, ...rawOptions } = {
          ...opts,
          headers: retryHeaders,
        }

        return await ($fetch.raw as (typeof $fetch)['raw'])(
          request,
          rawOptions as any,
        ) as unknown as void
      } catch {
        await navigateTo('/login')
      }
    },
  })

  return { provide: { api } }
})
