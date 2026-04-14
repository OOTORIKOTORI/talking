export function useGamesApi() {
  const api = useApi()
  return {
    my: () => api('/games/my'),
    create: (b: { title: string; summary?: string }) => api('/games', { method: 'POST', body: b }),
    get: (id: string) => api(`/games/${id}`),
    update: (id: string, b: any) => api(`/games/${id}`, { method: 'PATCH', body: b }),
    del: (id: string) => api(`/games/${id}`, { method: 'DELETE' }),
    listScenes: (id: string) => api(`/games/${id}/scenes`),
    upsertScene: (id: string, b: any) => api(`/games/${id}/scenes`, { method: 'POST', body: b }),
    listNodes: (sceneId: string) => api(`/games/scenes/${sceneId}/nodes`),
    upsertNode: (sceneId: string, b: any) => api(`/games/scenes/${sceneId}/nodes`, { method: 'POST', body: b }),
    delNode: (nodeId: string) => api(`/games/nodes/${nodeId}`, { method: 'DELETE' }),
    listSaves: (id: string) => api(`/games/${id}/saves`),
    getSave: (id: string, slotType: string, slotIndex: number) =>
      api(`/games/${id}/saves/${slotType}/${slotIndex}`),
    upsertSave: (id: string, b: any) => api(`/games/${id}/saves`, { method: 'POST', body: b }),
    autoSave: (id: string, b: any) => api(`/games/${id}/saves/auto`, { method: 'POST', body: b }),
    deleteSave: (id: string, slotType: string, slotIndex: number) =>
      api(`/games/${id}/saves/${slotType}/${slotIndex}`, { method: 'DELETE' }),
  }
}
