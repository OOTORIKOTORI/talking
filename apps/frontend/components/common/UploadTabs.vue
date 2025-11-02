<template>
  <div class="mb-4 flex gap-2 text-sm">
    <NuxtLink
      to="/upload"
      :class="tabClass(active === 'asset')"
    >アセットをアップロード</NuxtLink>
    <NuxtLink
      to="/my/characters/new"
      :class="tabClass(active === 'character')"
    >キャラクターを作成</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ active: 'asset' | 'character' }>()
const tabClass = (active: boolean) =>
  `px-3 py-1 rounded border ${active ? 'bg-blue-50 border-blue-300' : 'bg-white'}`
</script>
