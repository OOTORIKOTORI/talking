export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()

  // Check if the route requires auth
  if (to.meta.requiresAuth && !user.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
})
