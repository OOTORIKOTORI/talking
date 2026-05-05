export function useProfilesApi() {
  const api = useApi()

  return {
    getMyProfile: () => api('/my/profile'),
    updateMyProfile: (body: { displayName: string; bio?: string | null }) =>
      api('/my/profile', { method: 'PATCH', body }),
    getPublicProfile: (userId: string) => api(`/profiles/${userId}`),
  }
}
