<template>
  <div class="mx-auto max-w-5xl p-6">
    <div class="mb-4">
      <TabsSwitch :items="[{ label: 'アセット', to: '/assets' }, { label: 'キャラクター', to: '/characters' }]" />
    </div>
    <NuxtLink to="/characters" class="text-blue-600 text-sm hover:underline">← 一覧へ</NuxtLink>
    <div class="flex items-start justify-between mt-2">
      <div class="flex-1">
        <h1 class="text-3xl font-bold">{{ data?.name }}</h1>
        <div class="text-slate-600">{{ data?.displayName }}</div>
      </div>
      <button
        v-if="data"
        @click="onFavoriteClick"
        class="flex items-center gap-1 px-3 py-1.5 rounded-full border transition"
        :class="data.isFavorite ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" :fill="data.isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" class="w-5 h-5">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span class="text-sm">{{ data.isFavorite ? 'お気に入り' : 'お気に入りに追加' }}</span>
      </button>
    </div>
    <p class="mt-2 whitespace-pre-wrap">{{ data?.description }}</p>
    <div v-if="data?.tags?.length" class="mt-2 flex flex-wrap gap-1">
      <NuxtLink v-for="t in data?.tags" :key="t" :to="`/characters?tags=${encodeURIComponent(t)}`" class="px-2 py-0.5 rounded-full bg-slate-100 ring-1 ring-slate-200 text-slate-700 text-xs hover:bg-slate-200 transition-colors">{{ t }}</NuxtLink>
    </div>

    <div class="mt-6 flex gap-3 items-center">
      <label class="text-sm text-slate-500">感情</label>
      <select v-model="emotion" class="border rounded px-2 py-1">
        <option value="">すべて</option>
        <option v-for="e in emotions" :key="e.value" :value="e.value">{{ e.label }}</option>
      </select>
      <input v-model="pattern" class="border rounded px-2 py-1" placeholder="パターン（任意文字列）" />
    </div>

  <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div v-for="img in viewImages" :key="img.id" class="bg-white rounded shadow overflow-hidden">
        <div class="aspect-[3/4] cursor-zoom-in" @click="openPreview(img)">
          <CharacterImageThumb :keyOrThumb="img.thumbKey || img.key" :alt="data?.name" />
        </div>
        <div class="p-2 text-xs text-slate-600">
          {{ img.emotionLabel || EMOTION_JP_LABEL[img.emotion as keyof typeof EMOTION_JP_LABEL] }}
          <span v-if="img.pattern">/ {{ img.pattern }}</span>
        </div>
      </div>
    </div>
    <ImageLightbox :open="previewOpen" :src="previewSrc" :alt="data?.name || ''" @close="previewOpen=false" />
  </div>
</template>
<script setup lang="ts">
import type { Character } from '@talking/types'
import { useCharactersApi } from '@/composables/useCharacters'
import { EMOTION_JP_LABEL, emotionOptions } from '@/utils/characterLocales'
import ImageLightbox from '@/components/common/ImageLightbox.vue'
import { useSignedUrl } from '@/composables/useSignedUrl'
import TabsSwitch from '@/components/common/TabsSwitch.vue'
const route = useRoute()
const api = useCharactersApi()
const data = ref<Character | null>(null)
const emotion = ref<string>('')
const pattern = ref<string>('')
const emotions = emotionOptions()

const previewOpen = ref(false)
const previewSrc = ref<string | null>(null)
const { url: fullUrl, setKey: setFullKey, refresh: refreshFull } = useSignedUrl(null)
watch(fullUrl, v => { if (v) previewSrc.value = v })
const openPreview = async (img: any) => {
  setFullKey(img.key); await refreshFull(); previewOpen.value = true
}

const { toggle } = useFavoriteToggleCharacter()
const onFavoriteClick = async () => {
  if (data.value) {
    await toggle(data.value)
  }
}

onMounted(async () => { data.value = await api.getPublic(String(route.params.id)) })

const viewImages = computed(() => {
  const imgs = data.value?.images || []
  return imgs.filter(i => (!emotion.value || i.emotion === emotion.value) && (!pattern.value || (i.pattern||'').includes(pattern.value)))
})
</script>
