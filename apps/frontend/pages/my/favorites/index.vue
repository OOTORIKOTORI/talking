<script setup lang="ts">
import AssetCard from '@/components/asset/AssetCard.vue'
import TabsSwitch from '@/components/common/TabsSwitch.vue'
definePageMeta({ name: 'my-favorites' })

import { ref, onBeforeUnmount, onMounted, watch } from 'vue'
import { useAssetsApi } from '@/composables/useAssets'
import { useQuerySync } from '@/composables/useQuerySync'

const api = useAssetsApi()
const favorites = ref<any[]>([])
const qs = useQuerySync({ sort: 'createdAt:desc', limit: 50, offset: 0 })

async function load() {
  favorites.value = await api.listFavoriteAssets(qs.value)
}

onMounted(load)

let loadTimer: ReturnType<typeof setTimeout> | null = null
watch(
  qs,
  () => {
    if (loadTimer) clearTimeout(loadTimer)
    loadTimer = setTimeout(() => {
      void load()
    }, 200)
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (loadTimer) clearTimeout(loadTimer)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-semibold">お気に入り</h1>
        </div>
        <TabsSwitch :items="[{label:'素材', to:'/my/favorites'}, {label:'キャラクター', to:'/my/favorites/characters'}]" />
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="favorites.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AssetCard v-for="asset in favorites" :key="asset.id" :asset="asset" :showFavorite="true" />
      </div>
      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">お気に入りの素材はまだありません</h3>
        <p class="mt-1 text-sm text-gray-500">素材をお気に入りに追加すると、ここに表示されます。</p>
      </div>
    </main>
  </div>
</template>