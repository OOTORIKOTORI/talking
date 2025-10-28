import { ref, watch } from 'vue'

export function useSignedUrl(initialKey?: string | null) {
  const baseURL = useRuntimeConfig().public.apiBase
  const key = ref<string | null>(initialKey ?? null)
  const url = ref<string | null>(null)
  const loading = ref(false)
  const err = ref<unknown>(null)

  const fetchUrl = async () => {
    if (!key.value) {
      url.value = null
      return
    }
    loading.value = true
    try {
      const res = await $fetch<{ url: string }>('/uploads/signed-get', {
        baseURL,
        query: { key: key.value },
      })
      url.value = res.url
      err.value = null
    } catch (e) {
      err.value = e
      console.error('Failed to fetch signed URL:', e)
    } finally {
      loading.value = false
    }
  }

  watch(key, fetchUrl, { immediate: true })
  
  return {
    key,
    url,
    loading,
    err,
    setKey: (k: string | null) => (key.value = k),
    refresh: fetchUrl,
  }
}

// Legacy export for backward compatibility
export async function getSignedGetUrl(key: string, ttlSec = 600): Promise<string> {
  const baseURL = useRuntimeConfig().public.apiBase
  const url = `/uploads/signed-get?key=${encodeURIComponent(key)}&ttl=${ttlSec}`
  const res = await $fetch<{ url: string }>(url, { baseURL })
  return res.url
}
