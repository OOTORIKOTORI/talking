<template>
  <div class="w-full h-full bg-gray-100 flex items-center justify-center overflow-hidden">
    <img
      v-if="isImage && url"
      :src="url"
      :alt="asset.title || 'Asset thumbnail'"
      class="w-full h-full object-cover"
      loading="lazy"
      decoding="async"
      @error="handleError"
    />
    <div v-else-if="isImage" class="flex items-center justify-center bg-gray-200 animate-pulse"></div>
    <div v-else class="flex flex-col items-center justify-center text-gray-400">
      <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span class="mt-2 text-xs">{{ getFileExtension(asset.contentType || '') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Asset } from '@talking/types'
import { useSignedUrl } from '@/composables/useSignedUrl'

const props = defineProps<{ asset: Asset }>()

// 画像判定とキー
const isImage = computed(() => props.asset.contentType?.startsWith('image/'))
const objectKey = computed(() => props.asset.thumbKey || props.asset.key || null)

// 即時フェッチ（キー監視で setKey -> refresh）。IO には依存しない。
const { url, loading, refresh, setKey } = useSignedUrl(objectKey.value)
const lastFetchedAt = ref(0)
watch(objectKey, (k) => { setKey(k); refresh() }, { immediate: true })

// （任意最適化）タブ復帰時の軽リフレッシュ
const onVis = () => {
  if (document.visibilityState === 'visible' && isImage.value) {
    refresh()
  }
}
onMounted(() => document.addEventListener('visibilitychange', onVis))
onUnmounted(() => document.removeEventListener('visibilitychange', onVis))
watch(url, () => { lastFetchedAt.value = Date.now() })

const handleError = () => {
  // When image fails to load (e.g., signature expired), refresh the URL
  refresh()
}

const getFileExtension = (contentType: string): string => {
  const parts = contentType.split('/')
  return parts[1]?.toUpperCase() || 'FILE'
}
</script>
