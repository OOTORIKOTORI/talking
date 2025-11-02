<script setup lang="ts">
import AssetCard from '@/components/asset/AssetCard.vue'
import SectionTabs from '@/components/common/SectionTabs.vue'
definePageMeta({ name: 'my-favorites' })

import { ref, onMounted } from 'vue'
import { useAssetsApi } from '@/composables/useAssets'

const route = useRoute()
const router = useRouter()
const api = useAssetsApi()
const favorites = ref<any[]>([])

const safeReplaceQuery = (q: Record<string, any>) => {
  router.replace({ path: route.path, query: q })
}

onMounted(async () => {
  favorites.value = await api.listFavorites()
})
</script>

<template>
  <div class="mx-auto max-w-6xl p-6">
    <h1 class="text-2xl font-semibold mb-2">お気に入り</h1>
  <SectionTabs :items="[{label:'アセット', to:'/my/favorites'}, {label:'キャラクター', to:'/my/favorites/characters'}]" />
    

    <div v-if="favorites.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <AssetCard v-for="asset in favorites" :key="asset.id" :asset="asset" :showFavorite="true" />
    </div>
    <div v-else class="text-slate-500">お気に入りのアセットはまだありません。</div>
  </div>
</template>