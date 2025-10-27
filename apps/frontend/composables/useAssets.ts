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

  const searchAssets = async (q: string, limit = 20, offset = 0) => {
    const result = await api<AssetSearchResponse>('/search/assets', {
      query: {
        q,
        limit,
        offset,
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

  return {
    listAssets,
    getAsset,
    searchAssets,
    updateAsset,
    deleteAsset,
  }
}
