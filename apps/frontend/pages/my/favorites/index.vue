<script setup lang="ts">
definePageMeta({ name: 'my-favorites' })

import { ref } from 'vue'

const route = useRoute()
const router = useRouter()

const favorites = ref([])

const safeReplaceQuery = (q: Record<string, any>) => {
  router.replace({ path: route.path, query: q })
}
</script>

<template>
  <div class="mx-auto max-w-6xl p-6">
    <h1 class="text-2xl font-semibold mb-2">お気に入り</h1>

    <!-- タブ -->
    <div class="mb-4 flex gap-2 text-sm">
      <NuxtLink to="/my/favorites" class="px-3 py-1 rounded border bg-blue-50 border-blue-300">アセット</NuxtLink>
      <NuxtLink to="/my/favorites/characters" class="px-3 py-1 rounded border bg-white">キャラクター</NuxtLink>
    </div>

    <div v-if="favorites.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div v-for="item in favorites" :key="item.id">
        {{ item.name }}
      </div>
    </div>
    <div v-else class="text-slate-500">お気に入りのアセットはまだありません。</div>
  </div>
</template>