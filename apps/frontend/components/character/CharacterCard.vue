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
      @click.prevent="onFavoriteClick"
      class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm transition"
      :class="character.isFavorite ? 'text-red-500' : 'text-gray-400'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" :fill="character.isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" class="w-5 h-5">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </button>
  </div>
</template>
<script setup lang="ts">
import type { Character } from '@talking/types'
const props = defineProps<{ character: Character }>()
const thumbKey = computed(() => props.character.images?.[0]?.thumbKey || props.character.images?.[0]?.key || null)
const { toggle } = useFavoriteToggleCharacter()
const onFavoriteClick = async () => {
  await toggle(props.character)
}
</script>
