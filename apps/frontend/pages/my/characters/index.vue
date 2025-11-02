<template>
  <div class="mx-auto max-w-6xl p-6">
    <SectionTabs :items="[{ label: 'アセット', to: '/my/assets', activePath: '/my/assets' }, { label: 'キャラクター', to: '/my/characters', activePath: '/my/characters' }]" />
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold mb-2">マイキャラクター</h1>
    </div>
    <div class="mb-4 flex gap-2 text-sm">
      <NuxtLink to="/my/assets" class="px-3 py-1 rounded border bg-white">アセット</NuxtLink>
      <NuxtLink to="/my/characters" class="px-3 py-1 rounded border bg-blue-50 border-blue-300">キャラクター</NuxtLink>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <NuxtLink v-for="c in list" :key="c.id" :to="`/my/characters/${c.id}`" class="block rounded shadow bg-white overflow-hidden">
        <div class="aspect-[3/4]"><CharacterImageThumb :keyOrThumb="c.images?.[0]?.thumbKey || c.images?.[0]?.key || null" :alt="c.name" /></div>
        <div class="p-3 font-medium line-clamp-1">{{ c.name }}</div>
      </NuxtLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import SectionTabs from '@/components/common/SectionTabs.vue';
import { useMyCharactersApi } from '@/composables/useMyCharacters'
const api = useMyCharactersApi()
const list = ref<any[]>([])
onMounted(async () => { list.value = await api.listMine(undefined, 100, 0) })
</script>
