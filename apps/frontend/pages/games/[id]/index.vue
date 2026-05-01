<template>
  <div class="min-h-screen bg-gray-50">
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12 text-gray-500">読み込み中...</div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {{ error }}
      </div>

      <article v-else-if="game" class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div class="aspect-[16/9] bg-gray-100">
          <img
            v-if="coverUrl"
            :src="coverUrl"
            alt="cover"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            カバー画像なし
          </div>
        </div>

        <div class="p-6 space-y-4">
          <h1 class="text-2xl font-bold text-gray-900">{{ game.title }}</h1>
          <p class="text-gray-700 whitespace-pre-wrap">{{ game.summary || '説明はありません。' }}</p>

          <div class="text-sm text-gray-500 space-y-1">
            <p>作者: {{ game.ownerId }}</p>
            <p>更新日: {{ formatDate(game.updatedAt) }}</p>
          </div>

          <div class="pt-2 flex flex-wrap gap-2">
            <NuxtLink
              :to="detailPlayTo"
              class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              :class="{ 'pointer-events-none opacity-50': !canPlay }"
            >
              プレイする
            </NuxtLink>
            <NuxtLink
              to="/games"
              class="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              一覧に戻る
            </NuxtLink>
          </div>

          <div v-if="!canPlay" class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm">
            このゲームは開始ノードが未設定のため、まだプレイできません。
          </div>
        </div>
      </article>
    </main>
  </div>
</template>

<script setup lang="ts">
type GameScene = {
  id: string
  startNodeId?: string | null
  nodes?: Array<{ id: string }>
}

type GameDetail = {
  id: string
  ownerId: string
  title: string
  summary: string | null
  coverAssetId: string | null
  startSceneId: string | null
  updatedAt: string
  scenes: GameScene[]
}

const route = useRoute()
const api = useGamesApi()
const { signedFromId } = useAssetMeta()

const loading = ref(true)
const error = ref<string | null>(null)
const game = ref<GameDetail | null>(null)
const coverUrl = ref<string | null>(null)

const formatDate = (value: string) => new Date(value).toLocaleDateString('ja-JP')

const resolvedStartScene = computed(() => {
  if (!game.value) return null
  if (game.value.startSceneId) {
    const byProjectStart = game.value.scenes?.find((s) => s.id === game.value?.startSceneId)
    if (byProjectStart) return byProjectStart
  }
  return game.value.scenes?.[0] || null
})

const resolvedStartNodeId = computed(() => {
  const scene = resolvedStartScene.value
  if (!scene) return null
  return scene.startNodeId || scene.nodes?.[0]?.id || null
})

const canPlay = computed(() => !!resolvedStartScene.value?.id && !!resolvedStartNodeId.value)

const detailPlayTo = computed(() => {
  if (!game.value) return '/games'
  if (!canPlay.value) return '#'
  return `/games/${game.value.id}/play?sceneId=${resolvedStartScene.value!.id}&nodeId=${resolvedStartNodeId.value}`
})

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const id = String(route.params.id)
    const res = await api.getPublic(id)
    game.value = res as GameDetail

    if (game.value?.coverAssetId) {
      coverUrl.value = await signedFromId(game.value.coverAssetId, true)
    }
  } catch (e: any) {
    const status = e?.statusCode || e?.status || e?.response?.status
    if (status === 403 || status === 404) {
      error.value = 'このゲームは公開されていないか、存在しません。'
    } else {
      error.value = e?.data?.message || e?.message || 'ゲーム詳細の取得に失敗しました。'
    }
  } finally {
    loading.value = false
  }
})
</script>
