<template>
  <div class="w-full h-full bg-gray-100 flex items-center justify-center overflow-hidden">
    <img
      v-if="url && asset.contentType?.startsWith('image/')"
      :src="url"
      :alt="asset.title || 'Asset thumbnail'"
      class="w-full h-full object-cover"
      @error="handleError"
    />
    <div v-else-if="loading" class="flex items-center justify-center text-gray-400">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
    </div>
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

const props = defineProps<{
  asset: Asset
}>()

// Use thumbKey if available, otherwise fallback to key
const objectKey = computed(() => props.asset.thumbKey || props.asset.key)
const { url, loading, refresh } = useSignedUrl(objectKey.value)

// Watch for key changes
watch(objectKey, (newKey) => {
  if (newKey) {
    refresh()
  }
})

const handleError = () => {
  // When image fails to load (e.g., signature expired), refresh the URL
  refresh()
}

const getFileExtension = (contentType: string): string => {
  const parts = contentType.split('/')
  return parts[1]?.toUpperCase() || 'FILE'
}
</script>
