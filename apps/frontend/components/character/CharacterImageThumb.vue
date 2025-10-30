<template>
  <div class="w-full h-full bg-gray-100 flex items-center justify-center overflow-hidden">
    <img v-if="url" :src="url" :alt="alt" class="w-full h-full object-contain" loading="lazy" decoding="async" @error="refresh" />
    <div v-else class="w-full h-full animate-pulse bg-gray-200" />
  </div>
</template>
<script setup lang="ts">
import { useSignedUrl } from '@/composables/useSignedUrl'
const props = defineProps<{ keyOrThumb: string | null, alt?: string }>()
const { url, refresh, setKey } = useSignedUrl(props.keyOrThumb || null)
watch(() => props.keyOrThumb, (k) => { setKey(k); refresh() }, { immediate: true })
const alt = computed(() => props.alt || 'Character image')
</script>
