<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">お気に入りアセット</h1>
          <NuxtLink to="/" class="text-blue-600 hover:text-blue-700 font-medium">← ホームへ戻る</NuxtLink>
        </div>
      </div>
    </header>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="pending" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        <span class="ml-3 text-gray-600">読み込み中...</span>
      </div>
      <div v-else>
        <div v-if="assets.length === 0" class="text-center text-gray-500 py-12">
          <span>お気に入りはまだありません。</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AssetThumbnail v-for="asset in assets" :key="asset.id" :asset="asset" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import AssetThumbnail from '@/components/AssetThumbnail.vue'
import type { Asset } from '@talking/types'

const assets = ref<Asset[]>([])
const pending = ref(true)
const limit = 30
const offset = 0

onMounted(async () => {
  try {
    const res = await useApi()('/favorites', { query: { limit, offset } }) as Asset[]
    assets.value = res
  } finally {
    pending.value = false
  }
})
</script>

