<template>
  <div class="mx-auto max-w-6xl p-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold mb-2">コンテンツ管理</h1>
    </div>
  <TabsSwitch :items="[{ label: '素材', to: '/my/assets' }, { label: 'キャラクター', to: '/my/characters' }]" />
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <NuxtLink v-for="c in list" :key="c.id" :to="`/my/characters/${c.id}`" class="block rounded shadow bg-white overflow-hidden">
        <div class="aspect-[3/4]"><CharacterImageThumb :keyOrThumb="c.images?.[0]?.thumbKey || c.images?.[0]?.key || null" :alt="c.name" /></div>
        <div class="p-3 font-medium line-clamp-1">{{ c.name }}</div>
      </NuxtLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import TabsSwitch from '@/components/common/TabsSwitch.vue';
import { useCharactersApi } from '@/composables/useCharacters'
const api = useCharactersApi()
const list = ref<any[]>([])
onMounted(async () => { list.value = await api.listMine(undefined, 100, 0) })
</script>
