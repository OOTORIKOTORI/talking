<template>
  <div v-if="open" class="fixed inset-0 z-50 bg-black/30 grid place-items-center" @click.self="$emit('update:open', false)">
    <div class="bg-white w-[min(880px,95vw)] max-h-[85vh] rounded-lg shadow p-4 overflow-auto">
      <div class="flex items-center justify-between mb-3">
        <div class="text-lg font-semibold">表情/立ち絵を選択</div>
        <span class="text-sm text-gray-500 truncate" v-if="character?.displayName">対象: {{ character.displayName }}</span>
      </div>
      <div v-if="loading" class="text-center py-12 text-gray-500">読み込み中...</div>
      <div v-else-if="images.length === 0" class="text-center py-12 text-gray-500">画像が登録されていません</div>
      <div v-else class="grid grid-cols-3 md:grid-cols-4 gap-3">
        <button v-for="img in images" :key="img.id" class="border rounded p-2 hover:bg-gray-50 text-left"
                @click="$emit('select', img); $emit('update:open', false)">
          <div class="aspect-[4/3] bg-gray-100 overflow-hidden rounded mb-1 grid place-items-center">
            <img v-if="thumbUrl(img)" :src="thumbUrl(img)!" class="w-full h-full object-cover" />
            <span v-else class="text-xs text-gray-500">no thumb</span>
          </div>
          <div class="text-xs text-gray-700 truncate">{{ img.emotionLabel || img.emotion }}</div>
          <div class="text-[10px] text-gray-500 truncate" v-if="img.pattern">{{ img.pattern }}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getSignedGetUrl } from '@/composables/useSignedUrl'

const props = defineProps<{ open: boolean; characterId: string }>()
const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'select', img: any): void
}>()

const baseURL = useRuntimeConfig().public.apiBase
const character = ref<any>(null)
const images = ref<any[]>([])
const loading = ref(false)
const thumbUrls = ref<Record<string, string>>({})

const load = async () => {
  if (!props.characterId) {
    images.value = []
    return
  }
  
  loading.value = true
  try {
    // Try public endpoint first, then fallback to my endpoint
    images.value = await $fetch<any[]>(`/characters/${props.characterId}/images`, { baseURL })
      .catch(() => $fetch<any[]>(`/my/characters/${props.characterId}/images`, { baseURL }))
    
    // Load thumbnails
    for (const img of images.value) {
      const key = img.thumbKey || img.key
      if (key) {
        thumbUrls.value[img.id] = await getSignedGetUrl(key)
      }
    }
  } catch (e) {
    console.error('Failed to load character images:', e)
    images.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.open, (v) => {
  if (v) load()
})

function thumbUrl(img: any) {
  return thumbUrls.value[img.id] || null
}
</script>
