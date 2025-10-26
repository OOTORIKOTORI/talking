export default defineNuxtPlugin((_nuxtApp) => {
  const supabase = useSupabaseClient()
  const baseURL = useRuntimeConfig().public.apiBase

  const api = $fetch.create({
    baseURL,
    onRequest: async ({ options }) => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (token) {
        options.headers = { ...(options.headers as any ?? {}), Authorization: `Bearer ${token}` }
      }
    },
    onResponseError: async ({ response }) => {
      // 401 の場合はログインページへリダイレクト
      if (response.status === 401) {
        await navigateTo('/login')
      }
    },
  })

  return { provide: { api } } // use via: const { $api } = useNuxtApp()
})
