
const normalizeAssetFavorite = (a:any)=>{
  const fav = a?.isFavorited ?? a?.isFavorite ?? a?.favorited ?? a?.favoritedByMe ?? a?.is_favorite
  return { ...a, isFavorited: !!fav }
}
export const useAssetsApi = () => {
  const $api = useApi()
  const listPublic = async (p:any)=>{
    const res:any = await $api('/assets', { query:p })
    if (Array.isArray(res?.items)) res.items = res.items.map(normalizeAssetFavorite)
    return res
  }
  const searchMine = async (p:any)=>{
    const res:any = await $api('/search/assets', { query:{...p, owner:'me'} })
    if (Array.isArray(res?.items)) res.items = res.items.map(normalizeAssetFavorite)
    return res
  }
  const listFavorites = async ()=>{
    try {
      const res:any = await $api('/my/favorites/assets')
      return Array.isArray(res?.items) ? res.items.map(normalizeAssetFavorite) : []
    } catch (e:any) {
      const res:any = await $api('/favorites') // 旧API互換
      return Array.isArray(res?.items) ? res.items.map(normalizeAssetFavorite) : []
    }
  }
  const favorite   = (id:string)=>$api(`/assets/${id}/favorite`, { method:'POST' })
  const unfavorite = (id:string)=>$api(`/assets/${id}/favorite`, { method:'DELETE' })
  return { normalizeAssetFavorite, listPublic, searchMine, listFavorites, favorite, unfavorite }
}

export const useAssets = () => {
  const api = useApi()
  const runtimeConfig = useRuntimeConfig()
  const fallbackBase =
    runtimeConfig.public.s3PublicBase ||
    (runtimeConfig.public as Record<string, string | undefined>).NUXT_PUBLIC_S3_PUBLIC_BASE

  const listAssets = async (params?: { limit?: number; cursor?: string }) => {
    const result = await api<AssetListResponse>('/assets', {
      query: {
        limit: params?.limit,
        cursor: params?.cursor,
      },
    })

    await applyAssetUrls(result.items, fallbackBase)

    return {
      items: result.items,
      nextCursor: result.nextCursor,
    }
  }

  const getAsset = async (id: string): Promise<Asset> => {
    const asset = await api<Asset>(`/assets/${id}`)
    return await applyAssetUrl(asset, fallbackBase)
  }

  const searchAssets = async (params?: {
    q?: string;
    limit?: number;
    offset?: number;
    contentType?: 'image' | 'audio';
    primaryTag?: string;
    tags?: string;
    sort?: 'createdAt:desc' | 'createdAt:asc';
  }) => {
    const result = await api<AssetSearchResponse>('/search/assets', {
      query: {
        q: params?.q,
        limit: params?.limit ?? 20,
        offset: params?.offset ?? 0,
        contentType: params?.contentType,
        primaryTag: params?.primaryTag,
        tags: params?.tags,
        sort: params?.sort,
      },
    })

// 旧API群を全て削除。useAssetsApiのみ残す。
