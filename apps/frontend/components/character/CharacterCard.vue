<template>
  <NuxtLink :to="`/characters/${character.id}`" class="block group rounded-xl overflow-hidden bg-white ring-1 ring-black/5 hover:shadow">
    <div class="aspect-[3/4] bg-gray-100">
      <CharacterImageThumb :keyOrThumb="thumbKey" :alt="character.name" />
    </div>
    <div class="p-3">
      <div class="font-semibold line-clamp-1">{{ character.name }}</div>
      <div class="text-sm text-slate-500 line-clamp-1">{{ character.displayName }}</div>
    </div>
  </NuxtLink>
</template>
<script setup lang="ts">
import type { Character } from '@talking/types'
const props = defineProps<{ character: Character }>()
const thumbKey = computed(() => props.character.images?.[0]?.thumbKey || props.character.images?.[0]?.key || null)
</script>
