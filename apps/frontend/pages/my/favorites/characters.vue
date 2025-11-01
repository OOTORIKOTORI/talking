<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <h1 class="text-2xl font-bold mb-6">お気に入りキャラクター</h1>
      <div v-if="pending" class="flex justify-center py-12">
        <div class="text-gray-500">読み込み中...</div>
      </div>
      <div v-else-if="error" class="text-red-500 py-12 text-center">
        エラーが発生しました
      </div>
      <div v-else-if="!characters?.length" class="text-gray-500 py-12 text-center">
        お気に入りのキャラクターがありません
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <CharacterCard v-for="char in characters" :key="char.id" :character="char" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'require-auth',
})

const api = useCharactersApi()
const { data: characters, pending, error } = await useAsyncData(
  'my-favorite-characters',
  () => api.listFavorites()
)
</script>
