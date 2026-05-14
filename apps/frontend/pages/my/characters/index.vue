<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-semibold mb-2">コンテンツ管理</h1>
        </div>
        <TabsSwitch :items="[{ label: '素材', to: '/my/assets' }, { label: 'キャラクター', to: '/my/characters' }]" />
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Search and Filters -->
      <div class="mb-8">
        <!-- Search Section -->
        <div class="mb-4">
          <h2 class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">検索</h2>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="自分のキャラクターを検索（名前・説明・タグ）"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Filters Section -->
        <div class="bg-white p-4 sm:p-5 rounded-lg shadow-sm">
          <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">絞り込み</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Visibility Filter -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-2">公開状態</label>
              <div class="flex gap-2">
                <button
                  @click="visibilityFilter = 'all'"
                  :class="[
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    visibilityFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  すべて
                </button>
                <button
                  @click="visibilityFilter = 'public'"
                  :class="[
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    visibilityFilter === 'public' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  公開
                </button>
                <button
                  @click="visibilityFilter = 'private'"
                  :class="[
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    visibilityFilter === 'private' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  非公開
                </button>
              </div>
            </div>

            <!-- Tags Filter -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-2">タグ（カンマ区切り）</label>
              <input
                v-model="tagsInput"
                type="text"
                placeholder="例: 学園, 女の子"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <!-- Sort Filter -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-2">並び替え</label>
              <select
                v-model="sortOrder"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="createdAt:desc">新しい順</option>
                <option value="createdAt:asc">古い順</option>
                <option value="name:asc">名前順</option>
              </select>
            </div>

            <!-- Apply/Reset Buttons -->
            <div class="col-span-1 md:col-span-2 flex gap-2 pt-2">
              <button
                @click="applyFilters"
                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
              >
                フィルタを適用
              </button>
              <button
                @click="resetFilters"
                class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm transition-colors"
              >
                リセット
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <div class="flex items-center justify-center py-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">読み込み中...</span>
        </div>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-sm font-medium text-red-800">キャラクターの取得に失敗しました</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            <div class="mt-4">
              <button
                type="button"
                @click="fetchCharacters"
                class="inline-flex items-center px-4 py-2 border border-red-200 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors"
              >
                再読み込み
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="list.length === 0" class="bg-white border border-gray-200 rounded-lg shadow-sm px-6 py-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">
          {{ hasActiveFilters ? '条件に一致するキャラクターはありません' : 'まだキャラクターがありません' }}
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ hasActiveFilters ? '検索語や絞り込み条件を変えて試してください。' : 'キャラクターを作成して、ゲーム内で使える立ち絵や設定を管理しましょう。' }}
        </p>
        <div class="mt-6">
          <button
            v-if="hasActiveFilters"
            type="button"
            @click="resetFilters"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            条件をリセット
          </button>
          <NuxtLink
            v-else
            to="/my/characters/new"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            キャラクターを作成
          </NuxtLink>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="c in list"
          :key="c.id"
          class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
        >
          <!-- Thumbnail -->
          <NuxtLink :to="`/my/characters/${c.id}`" class="block aspect-[3/4] flex-shrink-0">
            <CharacterImageThumb :keyOrThumb="c.images?.[0]?.thumbKey || c.images?.[0]?.key || null" :alt="c.name" />
          </NuxtLink>

          <!-- Info area -->
          <div class="p-4 flex flex-col flex-1">
            <!-- Name -->
            <NuxtLink :to="`/my/characters/${c.id}`">
              <h3 class="font-medium text-gray-900 truncate hover:text-blue-600">{{ c.displayName || c.name }}</h3>
            </NuxtLink>
            <!-- Description -->
            <p class="mt-1 text-sm text-gray-600 truncate min-h-[1.25rem]">{{ c.description || '\u00A0' }}</p>

            <!-- Badges -->
            <div class="mt-2 flex flex-wrap gap-1.5 items-center">
              <span
                class="inline-block px-2 py-0.5 text-xs font-medium rounded"
                :class="c.isPublic ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
              >
                {{ c.isPublic ? '公開' : '非公開' }}
              </span>
              <span
                class="inline-block px-2 py-0.5 text-xs font-medium rounded"
                :class="c.creditRequired !== false ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'"
              >
                {{ c.creditRequired !== false ? 'クレジット必須' : 'クレジット任意' }}
              </span>
            </div>

            <!-- Tags -->
            <div v-if="c.tags && c.tags.length > 0" class="mt-2 flex flex-wrap gap-1">
              <span
                v-for="tag in c.tags.slice(0, 3)"
                :key="tag"
                class="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded"
              >
                {{ tag }}
              </span>
              <span v-if="c.tags.length > 3" class="inline-block px-2 py-0.5 text-xs text-gray-500">
                +{{ c.tags.length - 3 }}
              </span>
            </div>

            <!-- Meta -->
            <div class="mt-2 text-xs text-gray-400">
              {{ formatDate(c.createdAt) }}
            </div>

            <!-- Actions -->
            <div class="mt-4 pt-3 border-t border-gray-100">
              <NuxtLink
                :to="`/my/characters/${c.id}`"
                class="block w-full px-3 py-2 text-center text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                @click.stop
              >
                編集
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import TabsSwitch from '@/components/common/TabsSwitch.vue'
import { useCharactersApi } from '@/composables/useCharacters'

const api = useCharactersApi()
const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const tagsInput = ref('')
const visibilityFilter = ref<'all' | 'public' | 'private'>('all')
const sortOrder = ref<'createdAt:desc' | 'createdAt:asc' | 'name:asc'>('createdAt:desc')

const list = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const hasActiveFilters = computed(() => {
  return (
    searchQuery.value.trim().length > 0 ||
    tagsInput.value.trim().length > 0 ||
    visibilityFilter.value !== 'all'
  )
})

const loadFromQuery = () => {
  const query = route.query

  searchQuery.value = typeof query.q === 'string' ? query.q : ''
  tagsInput.value = typeof query.tags === 'string' ? query.tags : ''

  if (query.visibility === 'all' || query.visibility === 'public' || query.visibility === 'private') {
    visibilityFilter.value = query.visibility
  } else {
    visibilityFilter.value = 'all'
  }

  if (query.sort === 'createdAt:asc' || query.sort === 'name:asc' || query.sort === 'createdAt:desc') {
    sortOrder.value = query.sort
  } else {
    sortOrder.value = 'createdAt:desc'
  }
}

const buildQuery = () => {
  const query: Record<string, string | undefined> = {
    q: searchQuery.value.trim() || undefined,
    tags: tagsInput.value.trim() || undefined,
    visibility: visibilityFilter.value !== 'all' ? visibilityFilter.value : undefined,
    sort: sortOrder.value !== 'createdAt:desc' ? sortOrder.value : undefined,
  }

  Object.keys(query).forEach((k) => {
    if (!query[k]) delete query[k]
  })

  return query
}

const fetchCharacters = async () => {
  try {
    loading.value = true
    error.value = null
    const data = await api.listMine({
      q: searchQuery.value.trim() || undefined,
      tags: tagsInput.value.trim() || undefined,
      visibility: visibilityFilter.value,
      sort: sortOrder.value,
      limit: 100,
      offset: 0,
    })
    list.value = Array.isArray(data) ? data : []
  } catch (e: any) {
    error.value = e?.message || 'キャラクターの取得に失敗しました'
    list.value = []
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  router.push({ query: buildQuery() })
}

const resetFilters = () => {
  searchQuery.value = ''
  tagsInput.value = ''
  visibilityFilter.value = 'all'
  sortOrder.value = 'createdAt:desc'
  router.push({ query: {} })
}

const formatDate = (date: string | Date | undefined | null): string => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(() => {
  loadFromQuery()
  fetchCharacters()
})

watch(() => route.query, () => {
  loadFromQuery()
  fetchCharacters()
})
</script>
