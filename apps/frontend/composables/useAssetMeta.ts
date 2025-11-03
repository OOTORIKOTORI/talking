import { getSignedGetUrl } from '@/composables/useSignedUrl'

type AssetMeta = { id: string; title?: string; key: string; thumbKey?: string; contentType: string }

export function useAssetMeta() {
  const baseURL = useRuntimeConfig().public.apiBase
  const cache = useState<Record<string, AssetMeta>>('assetMetaCache', () => ({}))
  
  async function get(id: string): Promise<AssetMeta|null> {
    if (!id) return null
    if (!cache.value[id]) {
      try {
        cache.value[id] = await $fetch<AssetMeta>(`/assets/${id}`, { baseURL })
      } catch (e) {
        console.error('Failed to fetch asset meta:', e)
        return null
      }
    }
    return cache.value[id]
  }
  
  async function signedFromId(id: string, preferThumb = true): Promise<string|null> {
    const meta = await get(id)
    if (!meta) return null
    const key = (preferThumb && (meta.thumbKey || '')) || meta.key
    return key ? await getSignedGetUrl(key) : null
  }
  
  return { get, signedFromId }
}
