<template>
  <div class="mx-auto max-w-6xl p-6">
    <h1 class="text-2xl font-semibold mb-2">お気に入り</h1>
  <TabsSwitch :items="[{label:'アセット', to:'/my/favorites'}, {label:'キャラクター', to:'/my/favorites/characters'}]" />
    

    <div v-if="list.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <CharacterCard v-for="c in list" :key="c.id" :character="c" />
    </div>
    <div v-else class="text-slate-500">お気に入りのキャラクターはまだありません。</div>
  </div>
</template>

<script setup lang="ts">
import CharacterCard from '@/components/character/CharacterCard.vue'
import TabsSwitch from '@/components/common/TabsSwitch.vue'
import { useCharactersApi } from '@/composables/useCharacters'
import { useQuerySync } from '@/composables/useQuerySync'

definePageMeta({ name: 'my-favorites-characters' })

const api = useCharactersApi()
const rawList = ref<any[]>([])
const qs = useQuerySync({ q: '', sort: 'new', tags: '' })

// クライアントサイドフィルタリング（暫定）
const list = computed(() => {
  let result = rawList.value
  const q = (qs.value.q || '').toLowerCase()
  
  if (q) {
    result = result.filter((c: any) => {
      const searchText = [
        c.name || '',
        c.displayName || '',
        (c.tags || []).join(',')
      ].join(' ').toLowerCase()
      return searchText.includes(q)
    })
  }
  
  // tags フィルタ
  if (qs.value.tags) {
    const filterTags = qs.value.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    if (filterTags.length > 0) {
      result = result.filter((c: any) => {
        const charTags = c.tags || []
        return filterTags.some((ft: string) => charTags.includes(ft))
      })
    }
  }
  
  // sort (暫定: 'new' はデフォルトのまま)
  if (qs.value.sort === 'new') {
    result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  
  return result
})

onMounted(async () => { rawList.value = await api.listFavorites() })
</script>
