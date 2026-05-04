export function useGamesApi() {
  const api = useApi()

  type MyGamesSort = 'updated' | 'created' | 'title' | 'public'
  type MyGamesStatus = 'all' | 'public' | 'private'

  return {
    listPublic: (q?: { limit?: number; offset?: number; q?: string; sort?: 'new' | 'updated' | 'title' }) =>
      api('/games', { query: q }),
    getPublic: (id: string) => api(`/games/${id}`),
    countView: (id: string) => api(`/games/${id}/view`, { method: 'POST' }),
    countPlay: (id: string) => api(`/games/${id}/play`, { method: 'POST' }),
    getCredits: (id: string) => api(`/games/${id}/credits`),
    getEdit: (id: string) => api(`/games/${id}/edit`),
    getReferenceDiagnostics: (id: string) => api(`/games/${id}/reference-diagnostics`),
    my: (q?: { q?: string; sort?: MyGamesSort; status?: MyGamesStatus }) => api('/games/my', { query: q }),
    create: (b: { title: string; summary?: string }) => api('/games', { method: 'POST', body: b }),
    duplicate: (id: string) => api(`/games/${id}/duplicate`, { method: 'POST' }),
    get: (id: string) => api(`/games/${id}`),
    update: (id: string, b: any) => api(`/games/${id}`, { method: 'PATCH', body: b }),
    del: (id: string) => api(`/games/${id}`, { method: 'DELETE' }),
    listScenes: (id: string) => api(`/games/${id}/scenes`),
    upsertScene: (id: string, b: any) => api(`/games/${id}/scenes`, { method: 'POST', body: b }),
    listNodes: (sceneId: string) => api(`/games/scenes/${sceneId}/nodes`),
    upsertNode: (sceneId: string, b: any) => api(`/games/scenes/${sceneId}/nodes`, { method: 'POST', body: b }),
    delNode: (nodeId: string) => api(`/games/nodes/${nodeId}`, { method: 'DELETE' }),
    getNodeDeleteSummary: (nodeId: string) => api(`/games/nodes/${nodeId}/delete-summary`),
    delScene: (sceneId: string) => api(`/games/scenes/${sceneId}`, { method: 'DELETE' }),
    getSceneDeleteSummary: (sceneId: string) => api(`/games/scenes/${sceneId}/delete-summary`),
    listSaves: (id: string) => api(`/games/${id}/saves`),
    getSave: (id: string, slotType: string, slotIndex: number) =>
      api(`/games/${id}/saves/${slotType}/${slotIndex}`),
    upsertSave: (id: string, b: any) => api(`/games/${id}/saves`, { method: 'POST', body: b }),
    autoSave: (id: string, b: any) => api(`/games/${id}/saves/auto`, { method: 'POST', body: b }),
    deleteSave: (id: string, slotType: string, slotIndex: number) =>
      api(`/games/${id}/saves/${slotType}/${slotIndex}`, { method: 'DELETE' }),
  }
}
