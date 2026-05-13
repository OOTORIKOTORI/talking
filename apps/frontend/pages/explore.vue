<script setup lang="ts">
import AssetCard from '@/components/asset/AssetCard.vue'
import CharacterCard from '@/components/character/CharacterCard.vue'
import type { Asset, Character } from '@talking/types'
import { ref, onMounted } from 'vue'

type MixedItem =
  | { kind: 'ASSET'; key: string; createdAt: number; asset: Asset }
  | { kind: 'CHAR'; key: string; createdAt: number; character: Character }

const { searchAssets } = useAssets()
const { listPublic } = useCharactersApi()

const items = ref<MixedItem[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    loading.value = true
    error.value = ''
    const [assetsRes, charsRes] = await Promise.all([
      searchAssets({ limit: 24, offset: 0, sort: 'createdAt:desc' }),
      listPublic(undefined, 24, 0, { sort: 'new' }),
    ])

    const aItems: MixedItem[] = (assetsRes.items || []).map((a: any) => ({
      kind: 'ASSET',
      key: `a:${a.id}`,
      createdAt: new Date(a.createdAt as any).getTime(),
      asset: a,
    }))
    const cItems: MixedItem[] = (Array.isArray(charsRes) ? charsRes : []).map(c => ({
      kind: 'CHAR',
      key: `c:${c.id}`,
      createdAt: new Date(c.createdAt as any).getTime(),
      character: c,
    }))

    items.value = [...aItems, ...cItems].sort((x, y) => y.createdAt - x.createdAt)
  } catch (e: any) {
    error.value = e?.message || '取得に失敗しました'
  } finally {
    loading.value = false
  }
})

useHead({ title: 'Explore - Talking' })
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-semibold">Explore</h1>
          <NuxtLink to="/" class="text-blue-600 hover:text-blue-700 text-sm font-medium">ホーム</NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <p class="text-sm text-gray-600">最新の素材とキャラクターを一緒に表示します</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">読み込み中…</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">アイテムの取得に失敗しました</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="items.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">アイテムがありません</h3>
        <p class="mt-1 text-sm text-gray-500">まだ表示するコンテンツがありません。</p>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="it in items" :key="it.key" class="relative">
          <span class="pointer-events-none absolute left-2 top-2 z-10 inline-block rounded bg-gray-900/80 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">
            {{ it.kind === 'ASSET' ? 'ASSET' : 'CHAR' }}
          </span>
          <component
            :is="it.kind === 'ASSET' ? 'AssetCard' : 'CharacterCard'"
            v-bind="it.kind === 'ASSET' ? { asset: it.asset, showFavorite: true } : { character: it.character }"
          />
        </div>
      </div>
    </main>
  </div>
</template>
