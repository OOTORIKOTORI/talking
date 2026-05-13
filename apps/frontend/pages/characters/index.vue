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
      <div class="mb-6 space-y-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="名前・説明・タグで検索"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <div class="bg-white p-4 rounded-lg shadow-sm space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">タグ（カンマ区切り）</label>
            <input
              v-model="tagsInput"
              type="text"
              placeholder="例: 学園, 女の子"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">並び替え</label>
            <select
              v-model="sortOrder"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt:desc">新しい順</option>
              <option value="createdAt:asc">古い順</option>
              <option value="name:asc">名前順</option>
            </select>
          </div>

          <div class="flex gap-2">
            <button
              @click="applyFilters"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              フィルタを適用
            </button>
            <button
              @click="resetFilters"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              リセット
            </button>
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
        <NuxtLink
          v-for="c in list"
          :key="c.id"
          :to="`/characters/${c.id}`"
          class="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
        >
          <div class="aspect-[3/4]">
            <CharacterImageThumb :keyOrThumb="c.images?.[0]?.thumbKey || c.images?.[0]?.key || null" :alt="c.name" />
          </div>

          <div class="p-4">
            <h3 class="font-medium text-gray-900 truncate">{{ c.displayName || c.name }}</h3>
            <p class="mt-1 text-xs text-slate-600">
              <span>作者: </span>
              <button
                v-if="c.ownerId"
                type="button"
                class="text-blue-600 hover:underline"
                @click.stop.prevent="goToProfile(c.ownerId)"
              >
                {{ formatCreatorLabel(c.ownerDisplayName, c.ownerId) }}
              </button>
              <span v-else>unknown</span>
            </p>

            <div v-if="c.creditRequired" class="mt-2">
              <span class="inline-block px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-800">
                クレジット必須
              </span>
            </div>

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
          </div>
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import TabsSwitch from '@/components/common/TabsSwitch.vue'
import { useCharactersApi } from '@/composables/useCharacters'
import { formatCreatorLabel } from '@/utils/creatorDisplay'

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
  fetchCharacters()
}

const resetFilters = () => {
  searchQuery.value = ''
  tagsInput.value = ''
  sortOrder.value = 'createdAt:desc'
  router.push({ query: {} })
  fetchCharacters()
}

const goToProfile = (ownerId: string) => {
  router.push(`/profiles/${ownerId}`)
}

onMounted(() => {
  loadFromQuery()
  fetchCharacters()
})

watch(() => route.query, () => {
  loadFromQuery()
})
</script>
