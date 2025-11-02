<script setup lang="ts">
import AssetCard from '@/components/asset/AssetCard.vue'
import TabsSwitch from '@/components/common/TabsSwitch.vue'
definePageMeta({ name: 'my-favorites' })

import { ref, onMounted, computed } from 'vue'
import { useAssetsApi } from '@/composables/useAssets'
import { useQuerySync } from '@/composables/useQuerySync'

const api = useAssetsApi()
const rawFavorites = ref<any[]>([])
const qs = useQuerySync({ q: '', sort: 'createdAt:desc', type: '', primary: '', tags: '' })

// クライアントサイドフィルタリング（暫定: サーバ統一は別タスク）
const favorites = computed(() => {
  let result = rawFavorites.value
  const q = (qs.value.q || '').toLowerCase()
  
  if (q) {
    result = result.filter((a: any) => {
      const searchText = [
        a.title || '',
        a.description || '',
        (a.tags || []).join(',')
      ].join(' ').toLowerCase()
      return searchText.includes(q)
    })
  }
  
  // type フィルタ
  if (qs.value.type === 'image') {
    result = result.filter((a: any) => a.contentType?.startsWith('image/'))
  } else if (qs.value.type === 'audio') {
    result = result.filter((a: any) => a.contentType?.startsWith('audio/'))
  }
  
  // primary タグフィルタ
  if (qs.value.primary) {
    result = result.filter((a: any) => a.primaryTag === qs.value.primary)
  }
  
  // tags フィルタ
  if (qs.value.tags) {
    const filterTags = qs.value.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    if (filterTags.length > 0) {
      result = result.filter((a: any) => {
        const assetTags = a.tags || []
        return filterTags.some((ft: string) => assetTags.includes(ft))
      })
    }
  }
  
  // sort
  if (qs.value.sort === 'createdAt:asc') {
    result = [...result].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  } else {
    result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  
  return result
})

onMounted(async () => {
  rawFavorites.value = await api.listFavorites()
})
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