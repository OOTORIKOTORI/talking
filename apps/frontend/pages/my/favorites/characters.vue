<template>
  <div class="mx-auto max-w-6xl p-6">
    <h1 class="text-2xl font-semibold mb-2">お気に入り</h1>

    <!-- tabs -->
    <div class="mb-4 flex gap-2 text-sm">
      <NuxtLink to="/my/favorites" class="px-3 py-1 rounded border bg-white">アセット</NuxtLink>
      <NuxtLink to="/my/favorites/characters" class="px-3 py-1 rounded border bg-blue-50 border-blue-300">キャラクター</NuxtLink>
    </div>

    <div v-if="list.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <CharacterCard v-for="c in list" :key="c.id" :character="c" />
    </div>
    <div v-else class="text-slate-500">お気に入りのキャラクターはまだありません。</div>
  </div>
</template>

<script setup lang="ts">
import CharacterCard from '@/components/character/CharacterCard.vue'
import { useCharactersApi } from '@/composables/useCharacters'
const api = useCharactersApi()
const list = ref<any[]>([])
onMounted(async () => { list.value = await api.listFavorites() })
</script>
