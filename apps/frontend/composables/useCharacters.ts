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
    update: (id: string, payload: Partial<Pick<Character,'name'|'displayName'|'description'|'isPublic'>>) =>
      $api<Character>(`/my/characters/${id}`, { method: 'PATCH', body: payload }),
    remove: (id: string) => $api<{success:true}>(`/my/characters/${id}`, { method: 'DELETE' }),

    // 画像メタ
    addImage: (id: string, payload: Partial<CharacterImage> & { key: string; contentType: string }) =>
      $api<CharacterImage>(`/my/characters/${id}/images`, { method: 'POST', body: payload }),
    updateImage: (id: string, imageId: string, payload: Partial<CharacterImage>) =>
      $api<CharacterImage>(`/my/characters/${id}/images/${imageId}`, { method: 'PATCH', body: payload }),
    removeImage: (id: string, imageId: string) =>
      $api<{success:true}>(`/my/characters/${id}/images/${imageId}`, { method: 'DELETE' }),
  }
}
