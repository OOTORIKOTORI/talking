<template>
  <div class="mx-auto max-w-6xl p-6">
    <h1 class="text-2xl font-semibold mb-2">お気に入り</h1>
  <SectionTabs :items="[{label:'アセット', to:'/my/favorites', activePrefix:'/my/favorites'}, {label:'キャラクター', to:'/my/favorites/characters'}]" />
    

    <div v-if="list.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <CharacterCard v-for="c in list" :key="c.id" :character="c" />
    </div>
    <div v-else class="text-slate-500">お気に入りのキャラクターはまだありません。</div>
  </div>
</template>

<script setup lang="ts">
import CharacterCard from '@/components/character/CharacterCard.vue'
import { useCharactersApi } from '@/composables/useCharacters'

definePageMeta({ name: 'my-favorites-characters' })

const api = useCharactersApi()
const list = ref<any[]>([])
onMounted(async () => { list.value = await api.listFavorites() })
</script>
