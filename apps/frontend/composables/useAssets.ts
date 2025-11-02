import { useApi, useRuntimeConfig } from '#imports';
import type { Asset } from '@talking/types';
import { getSignedGetUrl } from './useSignedUrl';

type AssetListResponse = {
  items: Asset[]
  nextCursor: string | null
}

type AssetSearchResponse = {
  items: Asset[]
  total: number
  limit: number
  offset: number
}

const applyAssetUrls = async (assets: Asset[], fallbackBase?: string) => {
  for (const asset of assets) {
    if ((!asset.url || asset.url.startsWith('undefined')) && fallbackBase) {
      asset.url = `${fallbackBase}/${asset.key}`
    }

    const keyToUse = asset.thumbKey || asset.key
    if (!keyToUse) continue

    try {
      asset.url = await getSignedGetUrl(keyToUse)
    } catch (error) {
      console.warn('Failed to get signed URL, using fallback', error)
    }
  }
}

const applyAssetUrl = async (asset: Asset, fallbackBase?: string) => {
  await applyAssetUrls([asset], fallbackBase)
  return asset
}

const normalizeAssetFavorite = (a:any) => {
  const fav = a?.isFavorited ?? a?.isFavorite ?? a?.favorited ?? a?.favoritedByMe ?? a?.is_favorite;
  return { ...a, isFavorited: !!fav };
};

// シンプルなAPIアクセス用のComposable（正規化を一元化）
export const useAssetsApi = () => {
  const $api = useApi()

  const listPublic = async (p: any) => {
    const res: any = await $api('/assets', { query: p })
    if (Array.isArray(res?.items)) res.items = res.items.map(normalizeAssetFavorite)
    return res
  }

  const searchMine = async (p: any) => {
    const res: any = await $api('/search/assets', { query: { ...p, owner: 'me' } })
    if (Array.isArray(res?.items)) res.items = res.items.map(normalizeAssetFavorite)
    return res
  }

  const favorite = (id: string) => $api(`/assets/${id}/favorite`, { method: 'POST' })
  const unfavorite = (id: string) => $api(`/assets/${id}/favorite`, { method: 'DELETE' })

  return { listPublic, searchMine, favorite, unfavorite, normalizeAssetFavorite }
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

    await applyAssetUrls(result.items, fallbackBase)

    return {
      items: result.items,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    }
  }

  const updateAsset = async (id: string, data: { title?: string; description?: string; tags?: string[] }) => {
    return await api(`/assets/${id}`, {
      method: 'PATCH',
      body: data,
    })
  }

  const deleteAsset = async (id: string) => {
    return await api(`/assets/${id}`, {
      method: 'DELETE',
    })
  }

  const searchAssetsMine = async (params?: {
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
        ...params,
        owner: 'me',
      },
    })

    await applyAssetUrls(result.items, fallbackBase)

    return {
      items: result.items,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    }
  }

  const favorite = async (id: string) => {
    return await api(`/assets/${id}/favorite`, {
      method: 'POST',
    })
  }

  const unfavorite = async (id: string) => {
    return await api(`/assets/${id}/favorite`, {
      method: 'DELETE',
    })
  }

  // listPublic / searchMine は useAssetsApi() に集約

  return {
    listAssets,
    getAsset,
    searchAssets,
    updateAsset,
    deleteAsset,
    searchAssetsMine,
    favorite,
    unfavorite,
  }
}
