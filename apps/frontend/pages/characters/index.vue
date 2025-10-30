<template>
  <div class="mx-auto max-w-6xl p-6">
    <h1 class="text-2xl font-semibold mb-4">キャラクター</h1>
    <div class="mb-4">
      <input v-model="q" type="text" placeholder="キャラクター検索" class="w-full rounded border px-3 py-2" />
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <CharacterCard v-for="c in list" :key="c.id" :character="c" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useCharactersApi } from '@/composables/useCharacters'
const api = useCharactersApi()
const q = ref('')
const list = ref<any[]>([])
watchEffect(async () => { list.value = await api.listPublic(q.value || undefined) })
</script>
