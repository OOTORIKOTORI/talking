<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 class="text-2xl font-semibold">公開ゲーム</h1>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section class="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div class="flex flex-col lg:flex-row gap-3 lg:items-end">
          <form class="flex-1" @submit.prevent="applySearch">
            <label for="games-search" class="block text-sm font-medium text-gray-700 mb-1">
              キーワード検索
            </label>
            <div class="flex gap-2">
              <input
                id="games-search"
                v-model="searchInput"
                type="search"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="タイトル・説明で検索"
                autocomplete="off"
              />
              <button
                type="submit"
                class="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                :disabled="loading"
              >
                検索
              </button>
            </div>
          </form>

          <div class="w-full lg:w-56">
            <label for="games-sort" class="block text-sm font-medium text-gray-700 mb-1">並び替え</label>
            <select
              id="games-sort"
              v-model="sort"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="applySort"
            >
              <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
          <p v-if="appliedQuery">検索: 「{{ appliedQuery }}」 / {{ total }}件</p>
          <p v-else>公開ゲーム {{ total }}件</p>
          <p v-if="loading">{{ appliedQuery ? '検索中...' : '読み込み中...' }}</p>
        </div>
      </section>

      <div v-if="loading && items.length === 0" class="text-center py-12 text-gray-500">
        {{ appliedQuery ? '検索中...' : '読み込み中...' }}
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {{ error }}
      </div>

      <div v-else-if="items.length === 0" class="text-center py-16">
        <p class="text-gray-600">{{ appliedQuery ? '条件に一致する公開ゲームはありません。' : '公開中のゲームはまだありません。' }}</p>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="g in items"
            :key="g.id"
            class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
          >
            <div class="aspect-[16/9] bg-gray-100">
              <img
                v-if="coverUrls[g.id]"
                :src="coverUrls[g.id]"
                alt="cover"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                カバー画像なし
              </div>
            </div>

            <div class="p-4 space-y-2">
              <h2 class="font-semibold text-gray-900 line-clamp-1">{{ g.title }}</h2>
              <p class="text-sm text-gray-600 line-clamp-2">{{ g.description || '説明はありません。' }}</p>
              <p class="text-xs text-gray-500">作者: {{ formatCreatorLabel(g.ownerDisplayName, g.ownerId) }}</p>
              <p class="text-xs text-gray-400">更新: {{ formatDate(g.updatedAt) }}</p>
              <p class="text-xs text-gray-500">閲覧 {{ Number(g.viewCount || 0) }} / プレイ {{ Number(g.playCount || 0) }}</p>

              <div class="pt-2 flex gap-2">
                <NuxtLink
                  :to="`/games/${g.id}`"
                  class="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  詳細
                </NuxtLink>
                <NuxtLink
                  :to="`/games/${g.id}/play`"
                  class="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  プレイする
                </NuxtLink>
              </div>
            </div>
          </article>
        </div>

        <div v-if="items.length < total" class="mt-8 text-center">
          <button
            class="px-5 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            :disabled="loading"
            @click="loadMore"
          >
            {{ loading ? '読み込み中...' : 'さらに読み込む' }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
type PublicGame = {
  id: string
  title: string
  description: string | null
  coverAssetId: string | null
  viewCount?: number
  playCount?: number
  ownerId: string
  ownerDisplayName?: string | null
  createdAt: string
  updatedAt: string
}

type PublicGamesSort = 'new' | 'updated' | 'title'

const route = useRoute()
const router = useRouter()
const api = useGamesApi()
const { signedFromId } = useAssetMeta()

const items = ref<PublicGame[]>([])
const total = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)
const coverUrls = ref<Record<string, string>>({})

const limit = 24
const offset = ref(0)
const sort = ref<PublicGamesSort>('new')
const searchInput = ref('')
const appliedQuery = ref('')

const sortOptions: Array<{ value: PublicGamesSort; label: string }> = [
  { value: 'new', label: '新着順' },
  { value: 'updated', label: '更新順' },
  { value: 'title', label: 'タイトル順' },
]

let fetchSeq = 0

const formatDate = (value: string) => new Date(value).toLocaleDateString('ja-JP')

const formatShortOwnerId = (ownerId?: string | null): string => {
  if (!ownerId) return 'unknown'
  if (ownerId.length <= 12) return ownerId
  return `${ownerId.slice(0, 4)}...${ownerId.slice(-4)}`
}

const formatCreatorLabel = (displayName?: string | null, ownerId?: string | null): string => {
  const name = typeof displayName === 'string' ? displayName.trim() : ''
  return name || formatShortOwnerId(ownerId)
}

const firstQuery = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

const normalizeSort = (value: unknown): PublicGamesSort => {
  const v = String(value ?? '').trim().toLowerCase()
  if (v === 'updated' || v === 'title' || v === 'new') return v
  return 'new'
}

const buildQuery = (q: string, nextSort: PublicGamesSort) => {
  const query: Record<string, any> = { ...route.query }
  if (q) {
    query.q = q
  } else {
    delete query.q
  }
  if (nextSort !== 'new') {
    query.sort = nextSort
  } else {
    delete query.sort
  }
  return query
}

const resolveCovers = async (games: PublicGame[]) => {
  for (const g of games) {
    if (!g.coverAssetId) continue
    if (coverUrls.value[g.id]) continue
    const url = await signedFromId(g.coverAssetId, true)
    if (url) {
      coverUrls.value = { ...coverUrls.value, [g.id]: url }
    }
  }
}

const fetchGames = async (append = false) => {
  const currentSeq = ++fetchSeq
  loading.value = true
  error.value = null
  try {
    const res = await api.listPublic({
      limit,
      offset: append ? offset.value : 0,
      q: appliedQuery.value || undefined,
      sort: sort.value,
    }) as any

    if (currentSeq !== fetchSeq) return

    const nextItems = (res?.items || []) as PublicGame[]
    total.value = Number(res?.total || 0)

    if (append) {
      items.value = [...items.value, ...nextItems]
    } else {
      items.value = nextItems
      coverUrls.value = {}
    }

    offset.value = items.value.length
    await resolveCovers(nextItems)
  } catch (e: any) {
    if (currentSeq !== fetchSeq) return
    error.value = e?.data?.message || e?.message || '公開ゲームの取得に失敗しました。'
  } finally {
    if (currentSeq === fetchSeq) {
      loading.value = false
    }
  }
}

const applySearch = async () => {
  const q = searchInput.value.trim()
  await router.push({ query: buildQuery(q, sort.value) })
}

const applySort = async () => {
  await router.push({ query: buildQuery(appliedQuery.value, sort.value) })
}

const loadMore = async () => {
  if (loading.value) return
  if (items.value.length >= total.value) return
  await fetchGames(true)
}

watch(
  () => route.query,
  async () => {
    const rawQ = firstQuery(route.query.q) || ''
    const normalizedQ = rawQ.trim()
    const rawSort = firstQuery(route.query.sort)
    const normalizedSort = normalizeSort(rawSort)

    const normalizedSortQuery = normalizedSort === 'new' ? undefined : normalizedSort
    const currentSortQuery = rawSort && rawSort.trim() ? rawSort.trim().toLowerCase() : undefined
    const needsCanonicalize = rawQ !== normalizedQ || currentSortQuery !== normalizedSortQuery

    if (needsCanonicalize) {
      await router.replace({ query: buildQuery(normalizedQ, normalizedSort) })
      return
    }

    searchInput.value = normalizedQ
    appliedQuery.value = normalizedQ
    sort.value = normalizedSort
    offset.value = 0
    await fetchGames(false)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  fetchSeq += 1
})
</script>
