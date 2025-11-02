<template>
  <div class="relative block group rounded-xl overflow-hidden bg-white ring-1 ring-black/5 hover:shadow">
    <NuxtLink :to="`/characters/${character.id}`">
      <div class="aspect-[3/4] bg-gray-100">
        <CharacterImageThumb :keyOrThumb="thumbKey" :alt="character.name" />
      </div>
      <div class="p-3">
        <div class="font-semibold line-clamp-1">{{ character.name }}</div>
        <div class="text-sm text-slate-500 line-clamp-1">{{ character.displayName }}</div>
      </div>
    </NuxtLink>
    <button
      @click="onToggleFav"
      class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm transition"
      :class="{ 'text-red-500': isFav, 'text-gray-400': !isFav, 'opacity-50': toggling }"
      :disabled="toggling"
      :aria-pressed="isFav ? 'true' : 'false'"
      aria-label="お気に入り"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" :fill="isFav ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" class="w-5 h-5">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </button>
  </div>
</template>
<script setup lang="ts">
import type { Character } from '@talking/types'
import { useCharactersApi } from '@/composables/useCharacters'

const props = defineProps<{ character: Character }>()
const thumbKey = computed(() => props.character.images?.[0]?.thumbKey || props.character.images?.[0]?.key || null)

const api = useCharactersApi()
const isFav = ref(!!props.character?.isFavorite)
const toggling = ref(false)

const onToggleFav = async (e: MouseEvent) => {
  e.stopPropagation()
  e.preventDefault()
  if (toggling.value) return
  toggling.value = true
  const prev = isFav.value
  isFav.value = !prev
  try {
    if (prev) {
      await api.unfavorite(props.character.id)
    } else {
      await api.favorite(props.character.id)
    }
    // 成功したら親のcharacter.isFavoriteも更新
    props.character.isFavorite = isFav.value
  } catch (err) {
    isFav.value = prev
    console.error('Failed to toggle favorite:', err)
  } finally {
    toggling.value = false
  }
}

// character.isFavoriteの変更を監視
watch(() => props.character?.isFavorite, (newVal) => {
  isFav.value = !!newVal
}, { immediate: true })
</script>
