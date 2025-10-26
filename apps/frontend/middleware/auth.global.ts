export default defineNuxtRouteMiddleware(async (to) => {
  // requiresAuth が付いているページだけログインを要求する
  if (!to.meta.requiresAuth) return

  const { data: { session } } = await useSupabaseClient().auth.getSession()
  if (!session) return navigateTo('/login')
})
