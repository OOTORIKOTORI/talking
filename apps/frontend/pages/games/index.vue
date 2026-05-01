<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 class="text-2xl font-semibold">公開ゲーム</h1>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading && items.length === 0" class="text-center py-12 text-gray-500">
        読み込み中...
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {{ error }}
      </div>

      <div v-else-if="items.length === 0" class="text-center py-16">
        <p class="text-gray-600">公開中のゲームはまだありません。</p>
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
              <p class="text-xs text-gray-400">更新: {{ formatDate(g.updatedAt) }}</p>

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
  ownerId: string
  createdAt: string
  updatedAt: string
}

const api = useGamesApi()
const { signedFromId } = useAssetMeta()

const items = ref<PublicGame[]>([])
const total = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)
const coverUrls = ref<Record<string, string>>({})

const limit = 24
const offset = ref(0)

const formatDate = (value: string) => new Date(value).toLocaleDateString('ja-JP')

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
  loading.value = true
  error.value = null
  try {
    const res = await api.listPublic({ limit, offset: append ? offset.value : 0 }) as any
    const nextItems = (res?.items || []) as PublicGame[]
    total.value = Number(res?.total || 0)

    if (append) {
      items.value = [...items.value, ...nextItems]
    } else {
      items.value = nextItems
    }

    offset.value = items.value.length
    await resolveCovers(nextItems)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || '公開ゲームの取得に失敗しました。'
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loading.value) return
  if (items.value.length >= total.value) return
  await fetchGames(true)
}

onMounted(async () => {
  await fetchGames(false)
})
</script>
