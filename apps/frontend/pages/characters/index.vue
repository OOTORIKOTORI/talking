<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-semibold mb-2">公開ギャラリー</h1>
        </div>
        <TabsSwitch :items="[{ label: '素材', to: '/assets' }, { label: 'キャラクター', to: '/characters' }]" />
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
            placeholder="名前・説明・タグで検索"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Filters Section -->
        <div class="bg-white p-4 sm:p-5 rounded-lg shadow-sm">
          <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">絞り込み</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">読み込み中...</span>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-sm text-red-700">
        {{ error }}
      </div>

      <div v-else-if="list.length === 0" class="text-center py-12">
        <h3 class="mt-2 text-sm font-medium text-gray-900">
          {{ hasActiveFilters ? '条件に一致するキャラクターはありません。' : '公開キャラクターはまだありません。' }}
        </h3>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <CharacterCard v-for="c in list" :key="c.id" :character="c" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import CharacterCard from '@/components/character/CharacterCard.vue'
import TabsSwitch from '@/components/common/TabsSwitch.vue'
import { useCharactersApi } from '@/composables/useCharacters'

const api = useCharactersApi()
const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const tagsInput = ref('')
const sortOrder = ref<'createdAt:desc' | 'createdAt:asc' | 'name:asc'>('createdAt:desc')

const list = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const hasActiveFilters = computed(() => {
  return !!searchQuery.value.trim() || !!tagsInput.value.trim() || sortOrder.value !== 'createdAt:desc'
})

const loadFromQuery = () => {
  const query = route.query

  searchQuery.value = typeof query.q === 'string' ? query.q : ''
  tagsInput.value = typeof query.tags === 'string' ? query.tags : ''

  if (query.sort === 'createdAt:asc' || query.sort === 'name:asc' || query.sort === 'createdAt:desc') {
    sortOrder.value = query.sort
  } else {
    sortOrder.value = 'createdAt:desc'
  }
}

function buildQuery() {
  const query: Record<string, string | undefined> = {
    q: searchQuery.value.trim() || undefined,
    tags: tagsInput.value.trim() || undefined,
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
    const data = await api.listPublic(searchQuery.value || undefined, 60, 0, {
      tags: tagsInput.value.trim() || undefined,
      sort: sortOrder.value,
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
  sortOrder.value = 'createdAt:desc'
  router.push({ query: {} })
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
