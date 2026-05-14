<script setup lang="ts">
import AssetCard from '@/components/asset/AssetCard.vue'
import CharacterCard from '@/components/character/CharacterCard.vue'
import type { Asset, Character } from '@talking/types'
import { ref, onMounted, watch, computed } from 'vue'

type MixedItem =
  | { kind: 'ASSET'; key: string; createdAt: number; asset: Asset }
  | { kind: 'CHAR'; key: string; createdAt: number; character: Character }

// composables
const router = useRouter()
const route = useRoute()
const { searchAssets } = useAssets()
const { listPublic } = useCharactersApi()

// Data state
const items = ref<MixedItem[]>([])
const loading = ref(true)
const error = ref('')

// Form state (what user is currently editing)
const form = ref({
  q: '',
  kind: 'all' as 'all' | 'asset' | 'character',
  tags: '',
  sort: 'createdAt:desc' as 'createdAt:desc' | 'createdAt:asc',
})

// Track form changes (for apply button)
const formChanged = ref(false)

const trackFormChange = () => {
  formChanged.value = true
}

// Active filters (from current route query)
const hasActiveFilters = computed(() => {
  const q = (route.query.q as string || '').trim()
  const kind = (route.query.kind as string) || 'all'
  const tags = (route.query.tags as string || '').trim()
  return q.length > 0 || kind !== 'all' || tags.length > 0
})

// Initialize form from route query
const initializeFormFromRoute = () => {
  form.value.q = (route.query.q as string) || ''
  form.value.kind = (route.query.kind as any) || 'all'
  form.value.tags = (route.query.tags as string) || ''
  form.value.sort = (route.query.sort as any) || 'createdAt:desc'
  formChanged.value = false
}

// Apply filters (update route query)
const applyFilters = async () => {
  const newQuery: any = {}
  if (form.value.q.trim()) newQuery.q = form.value.q.trim()
  if (form.value.kind !== 'all') newQuery.kind = form.value.kind
  if (form.value.tags.trim()) newQuery.tags = form.value.tags.trim()
  if (form.value.sort !== 'createdAt:desc') newQuery.sort = form.value.sort
  
  await router.push({ query: newQuery })
  formChanged.value = false
}

// Reset filters
const resetFilters = async () => {
  form.value = {
    q: '',
    kind: 'all',
    tags: '',
    sort: 'createdAt:desc',
  }
  await router.push({ query: {} })
  formChanged.value = false
}

// Fetch data based on current query
const fetchData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const q = (route.query.q as string) || ''
    const kind = (route.query.kind as string) || 'all'
    const tags = (route.query.tags as string) || ''
    const sort = (route.query.sort as string) || 'createdAt:desc'

    const aItems: MixedItem[] = []
    const cItems: MixedItem[] = []

    // Fetch assets
    if (kind === 'all' || kind === 'asset') {
      const query: any = { limit: 24, offset: 0, sort }
      if (q) query.q = q
      if (tags) query.tags = tags
      const res = await searchAssets(query)
      aItems.push(...(res.items || []).map((a: any) => ({
        kind: 'ASSET' as const,
        key: `a:${a.id}`,
        createdAt: new Date(a.createdAt as any).getTime(),
        asset: a,
      })))
    }

    // Fetch characters
    if (kind === 'all' || kind === 'character') {
      const extra: any = { sort }
      if (tags) extra.tags = tags
      const res = await listPublic(q || undefined, 24, 0, extra)
      cItems.push(...(Array.isArray(res) ? res : []).map(c => ({
        kind: 'CHAR' as const,
        key: `c:${c.id}`,
        createdAt: new Date(c.createdAt as any).getTime(),
        character: c,
      })))
    }

    // Merge and sort by createdAt
    items.value = [...aItems, ...cItems].sort((x, y) => y.createdAt - x.createdAt)
  } catch (e: any) {
    error.value = e?.message || 'コンテンツの取得に失敗しました'
  } finally {
    loading.value = false
  }
}

// Watch route query changes
watch(() => route.query, () => {
  initializeFormFromRoute()
  fetchData()
}, { immediate: true })

useHead({ title: '見つける - Talking' })
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-semibold">見つける</h1>
          <NuxtLink to="/" class="text-blue-600 hover:text-blue-700 text-sm font-medium">ホーム</NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Description -->
      <div class="mb-6">
        <p class="text-sm text-gray-600">公開されている素材やキャラクターをまとめて探せます。</p>
      </div>

      <!-- Search/Filter Card -->
      <div class="mb-8 bg-white p-4 sm:p-5 rounded-lg shadow-sm">
        <!-- Search Input -->
        <div class="mb-5">
          <label for="search" class="block text-sm font-medium text-gray-700 mb-2">検索</label>
          <input
            id="search"
            v-model="form.q"
            type="text"
            placeholder="素材・キャラクターを検索（名前・説明・タグ）"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="trackFormChange"
          />
        </div>

        <!-- Kind Filter -->
        <div class="mb-5">
          <label for="kind" class="block text-sm font-medium text-gray-700 mb-2">種別</label>
          <select
            id="kind"
            v-model="form.kind"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="trackFormChange"
          >
            <option value="all">すべて</option>
            <option value="asset">素材</option>
            <option value="character">キャラクター</option>
          </select>
        </div>

        <!-- Tags Filter -->
        <div class="mb-5">
          <label for="tags" class="block text-sm font-medium text-gray-700 mb-2">タグ</label>
          <input
            id="tags"
            v-model="form.tags"
            type="text"
            placeholder="カンマで区切って複数指定可"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="trackFormChange"
          />
        </div>

        <!-- Sort -->
        <div class="mb-6">
          <label for="sort" class="block text-sm font-medium text-gray-700 mb-2">並び替え</label>
          <select
            id="sort"
            v-model="form.sort"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="trackFormChange"
          >
            <option value="createdAt:desc">新しい順</option>
            <option value="createdAt:asc">古い順</option>
          </select>
        </div>

        <!-- Buttons -->
        <div class="grid grid-cols-2 gap-3">
          <button
            @click="applyFilters"
            :disabled="!formChanged"
            class="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            適用
          </button>
          <button
            @click="resetFilters"
            class="px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400"
          >
            リセット
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">読み込み中...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-sm font-medium text-red-800">コンテンツの取得に失敗しました</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            <button
              @click="fetchData"
              class="mt-3 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded hover:bg-red-200"
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="items.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <template v-if="hasActiveFilters">
          <h3 class="mt-2 text-sm font-medium text-gray-900">条件に一致するコンテンツはありません</h3>
          <p class="mt-1 text-sm text-gray-500">検索語や絞り込み条件を変えて試してください。</p>
          <button
            @click="resetFilters"
            class="mt-4 px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400"
          >
            条件をリセット
          </button>
        </template>
        <template v-else>
          <h3 class="mt-2 text-sm font-medium text-gray-900">公開コンテンツはまだありません</h3>
          <p class="mt-1 text-sm text-gray-500">公開された素材やキャラクターがここに表示されます。</p>
        </template>
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
