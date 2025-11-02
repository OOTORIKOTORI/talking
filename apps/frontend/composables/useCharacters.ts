import type { Character, CharacterImage } from '@talking/types'

export const useCharactersApi = () => {
  const { $api } = useNuxtApp()
  return {
    // 公開
    listPublic: (q?: string, limit=20, offset=0, extra?: Record<string, any>) =>
      $api<Character[]>('/characters', { query: { q, limit, offset, ...(extra || {}) } }),
    getPublic: (id: string) => $api<Character>(`/characters/${id}`),

    // マイ
    listMine: (q?: string, limit=20, offset=0) => $api<Character[]>('/characters', { query: { q, limit, offset, publicOnly: 'false' } }),
    create: (payload: Pick<Character, 'name'|'displayName'|'description'|'isPublic'>) => 
      $api<Character>('/my/characters', { method: 'POST', body: payload }),
    getMine: (id: string) => $api<Character>(`/my/characters/${id}`),
    update: (id: string, payload: Partial<Pick<Character,'name'|'displayName'|'description'|'isPublic'|'tags'>>) =>
      $api<Character>(`/my/characters/${id}`, { method: 'PATCH', body: payload }),
    remove: (id: string) => $api(`/my/characters/${id}`, { method: 'DELETE' }),

    // 画像メタ
    addImage: (id: string, payload: Partial<CharacterImage> & { key: string; contentType: string }) =>
      $api<CharacterImage>(`/my/characters/${id}/images`, { method: 'POST', body: payload }),
    updateImage: (id: string, imageId: string, payload: Partial<CharacterImage>) =>
      $api<CharacterImage>(`/my/characters/${id}/images/${imageId}`, { method: 'PATCH', body: payload }),
    removeImage: (id: string, imageId: string) =>
      $api<{success:true}>(`/my/characters/${id}/images/${imageId}`, { method: 'DELETE' }),

    // お気に入り
    favorite: (id: string) => $api<{success:true}>(`/characters/${id}/favorite`, { method: 'POST' }),
    unfavorite: (id: string) => $api<{success:true}>(`/characters/${id}/favorite`, { method: 'DELETE' }),
    listFavorites: () => $api<Character[]>('/my/favorites/characters'),
    listFavoriteCharacters: (query: any = {}) => {
      const params: any = { ...query }
      Object.keys(params).forEach(k => {
        if (params[k] === '' || params[k] == null) delete params[k]
      })
      return $api<Character[]>('/my/favorites/characters', { query: params })
    },
  }
}
