<script setup lang="ts">
import CharacterCard from '@/components/character/CharacterCard.vue'
import TabsSwitch from '@/components/common/TabsSwitch.vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useCharactersApi } from '@/composables/useCharacters'
import { useQuerySync } from '@/composables/useQuerySync'

definePageMeta({ name: 'my-favorites-characters' })

const api = useCharactersApi()
const list = ref<any[]>([])
const qs = useQuerySync({})

async function load() {
  list.value = await api.listFavoriteCharacters(qs.value)
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
      <div v-if="list.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <CharacterCard v-for="c in list" :key="c.id" :character="c" />
      </div>
      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m0 0l-2-1m2 1v2.5M14 4l-2 1m0 0L10 4m2 1V2.5M20 7l-2 1m0 0l-2-1m2 1v2.5M14 10l-2 1m0 0l-2-1m2 1v2.5" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">お気に入りのキャラクターはまだありません</h3>
        <p class="mt-1 text-sm text-gray-500">キャラクターをお気に入りに追加すると、ここに表示されます。</p>
      </div>
    </main>
  </div>
</template>
