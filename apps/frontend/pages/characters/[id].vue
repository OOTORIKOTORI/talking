<template>
  <div class="mx-auto max-w-5xl p-6">
    <NuxtLink to="/characters" class="text-blue-600 text-sm hover:underline">← 一覧へ</NuxtLink>
    <h1 class="text-3xl font-bold mt-2">{{ data?.name }}</h1>
    <div class="text-slate-600">{{ data?.displayName }}</div>
    <p class="mt-2 whitespace-pre-wrap">{{ data?.description }}</p>
    <div v-if="data?.tags?.length" class="mt-2 flex flex-wrap gap-1">
      <span v-for="t in data?.tags" :key="t" class="px-2 py-0.5 rounded-full bg-slate-100 ring-1 ring-slate-200 text-slate-700 text-xs">{{ t }}</span>
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

onMounted(async () => { data.value = await api.getPublic(String(route.params.id)) })

const viewImages = computed(() => {
  const imgs = data.value?.images || []
  return imgs.filter(i => (!emotion.value || i.emotion === emotion.value) && (!pattern.value || (i.pattern||'').includes(pattern.value)))
})
</script>
