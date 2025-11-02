<script setup lang="ts">
import AssetCard from '@/components/asset/AssetCard.vue'
import TabsSwitch from '@/components/common/TabsSwitch.vue'
definePageMeta({ name: 'my-favorites' })

import { ref, onMounted } from 'vue'
import { useAssetsApi } from '@/composables/useAssets'
import { useQuerySync } from '@/composables/useQuerySync'
import { watchDebounced } from '@vueuse/core'

const api = useAssetsApi()
const favorites = ref<any[]>([])
const qs = useQuerySync({ q: '', sort: 'createdAt:desc', type: '', primary: '', tags: '', limit: 50, offset: 0 })

async function load() {
  favorites.value = await api.listFavoriteAssets(qs.value)
}

onMounted(load)
watchDebounced(qs, load, { deep: true, debounce: 200 })
</script>

<template>
  <div class="mx-auto max-w-6xl p-6">
    <h1 class="text-2xl font-semibold mb-2">お気に入り</h1>
  <TabsSwitch :items="[{label:'アセット', to:'/my/favorites'}, {label:'キャラクター', to:'/my/favorites/characters'}]" />
    

    <div v-if="favorites.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <AssetCard v-for="asset in favorites" :key="asset.id" :asset="asset" :showFavorite="true" />
    </div>
    <div v-else class="text-slate-500">お気に入りのアセットはまだありません。</div>
  </div>
</template>