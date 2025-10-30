<template>
  <div class="mx-auto max-w-5xl p-6">
    <NuxtLink to="/characters" class="text-blue-600 text-sm hover:underline">← 一覧へ</NuxtLink>
    <h1 class="text-3xl font-bold mt-2">{{ data?.name }}</h1>
    <div class="text-slate-600">{{ data?.displayName }}</div>
    <p class="mt-2 whitespace-pre-wrap">{{ data?.description }}</p>

    <div class="mt-6 flex gap-3 items-center">
      <label class="text-sm text-slate-500">感情</label>
      <select v-model="emotion" class="border rounded px-2 py-1">
        <option value="">すべて</option>
        <option v-for="e in emotions" :key="e" :value="e">{{ e }}</option>
      </select>
      <input v-model="pattern" class="border rounded px-2 py-1" placeholder="パターン（任意文字列）" />
    </div>

    <div class="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="img in viewImages" :key="img.id" class="bg-white rounded shadow overflow-hidden aspect-[3/4]">
        <CharacterImageThumb :keyOrThumb="img.thumbKey || img.key" :alt="data?.name" />
        <div class="p-2 text-xs text-slate-600">{{ img.emotionLabel || img.emotion }} <span v-if="img.pattern">/ {{ img.pattern }}</span></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Character } from '@talking/types'
import { useCharactersApi } from '@/composables/useCharacters'
const route = useRoute()
const api = useCharactersApi()
const data = ref<Character | null>(null)
const emotion = ref<string>('')
const pattern = ref<string>('')
const emotions = ['NEUTRAL','HAPPY','SAD','ANGRY','SURPRISED','FEAR','DISGUST','SHY','SLEEPY','THINKING','OTHER']

onMounted(async () => { data.value = await api.getPublic(String(route.params.id)) })

const viewImages = computed(() => {
  const imgs = data.value?.images || []
  return imgs.filter(i => (!emotion.value || i.emotion === emotion.value) && (!pattern.value || (i.pattern||'').includes(pattern.value)))
})
</script>
