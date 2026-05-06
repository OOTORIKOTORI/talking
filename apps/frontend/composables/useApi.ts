export const useApi = () => {
  const nuxtApp = useNuxtApp()
  if (import.meta.server && !nuxtApp.$api) {
    const config = useRuntimeConfig()
    return $fetch.create({ baseURL: config.public.apiBase }) as typeof $fetch
  }
  return nuxtApp.$api as typeof $fetch
}
