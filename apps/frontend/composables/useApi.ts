export const useApi = () => {
  const { $api } = useNuxtApp()
  return $api as typeof $fetch
}
