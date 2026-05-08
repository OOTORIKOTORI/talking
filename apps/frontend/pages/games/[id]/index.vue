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
            <p>
              作者:
              <NuxtLink
                v-if="game.ownerId"
                :to="`/profiles/${game.ownerId}`"
                class="text-blue-600 hover:underline"
              >
                {{ formatCreatorLabel(game.ownerDisplayName, game.ownerId) }}
              </NuxtLink>
              <span v-else>{{ formatCreatorLabel(game.ownerDisplayName, game.ownerId) }}</span>
            </p>
            <p>更新日: {{ formatDate(game.updatedAt) }}</p>
            <p>閲覧数: {{ Number(game.viewCount || 0) }}</p>
            <p>プレイ数: {{ Number(game.playCount || 0) }}</p>
          </div>

          <section
            v-if="hasCredits"
            class="rounded-lg border border-gray-200 bg-gray-50/70 p-4 space-y-3"
          >
            <h2 class="text-sm font-semibold tracking-wide text-gray-700">クレジット</h2>

            <div v-if="credits?.assetCredits?.length" class="space-y-2">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">素材</h3>
              <ul class="space-y-1.5">
                <li
                  v-for="item in credits.assetCredits"
                  :key="`asset-${item.assetId}`"
                  class="rounded border border-gray-200 bg-white px-3 py-2"
                >
                  <template v-if="item.linkable">
                    <NuxtLink :to="`/assets/${item.assetId}`" class="block font-medium text-gray-900 hover:underline text-sm">
                      {{ item.title }}
                    </NuxtLink>
                    <div class="mt-1 flex flex-wrap items-center gap-1.5">
                      <NuxtLink
                        v-if="item.ownerId && item.linkable !== false"
                        :to="`/profiles/${item.ownerId}`"
                        class="text-xs text-blue-600 hover:underline"
                      >
                        by {{ formatCreatorLabel(item.ownerDisplayName, item.ownerId) }}
                      </NuxtLink>
                      <span v-else class="text-xs text-gray-500">by {{ item.ownerId ? formatCreatorLabel(item.ownerDisplayName, item.ownerId) : 'unknown' }}</span>
                      <span
                        class="rounded-full px-1.5 py-0.5 text-[11px] font-medium"
                        :class="item.creditRequired !== false ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'"
                      >
                        {{ item.creditRequired !== false ? 'クレジット必須' : 'クレジット任意' }}
                      </span>
                      <span
                        v-for="badge in creditFieldBadges(item.fields)"
                        :key="badge"
                        class="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] text-gray-600"
                      >{{ badge }}</span>
                    </div>
                    <p v-if="item.usageTerms" class="mt-1.5 text-xs text-gray-600 line-clamp-2 whitespace-pre-wrap">{{ item.usageTerms }}</p>
                  </template>
                  <template v-else>
                    <span class="block font-medium text-gray-400 text-sm">{{ item.title }}</span>
                    <div class="mt-1 flex flex-wrap items-center gap-1.5">
                      <span class="text-xs text-gray-400">詳細非公開</span>
                      <span
                        v-for="badge in creditFieldBadges(item.fields)"
                        :key="badge"
                        class="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] text-gray-500"
                      >{{ badge }}</span>
                    </div>
                  </template>
                </li>
              </ul>
            </div>

            <div v-if="credits?.characterCredits?.length" class="space-y-2">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">キャラクター</h3>
              <ul class="space-y-1.5">
                <li
                  v-for="item in credits.characterCredits"
                  :key="`character-${item.characterId}`"
                  class="rounded border border-gray-200 bg-white px-3 py-2"
                >
                  <template v-if="item.linkable">
                    <NuxtLink :to="`/characters/${item.characterId}`" class="block font-medium text-gray-900 hover:underline text-sm">
                      {{ item.displayName || item.name }}
                    </NuxtLink>
                    <div class="mt-1 flex flex-wrap items-center gap-1.5">
                      <NuxtLink
                        v-if="item.ownerId && item.linkable !== false"
                        :to="`/profiles/${item.ownerId}`"
                        class="text-xs text-blue-600 hover:underline"
                      >
                        by {{ formatCreatorLabel(item.ownerDisplayName, item.ownerId) }}
                      </NuxtLink>
                      <span v-else class="text-xs text-gray-500">by {{ item.ownerId ? formatCreatorLabel(item.ownerDisplayName, item.ownerId) : 'unknown' }}</span>
                      <span
                        class="rounded-full px-1.5 py-0.5 text-[11px] font-medium"
                        :class="item.creditRequired !== false ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'"
                      >
                        {{ item.creditRequired !== false ? 'クレジット必須' : 'クレジット任意' }}
                      </span>
                      <span
                        v-for="badge in creditFieldBadges(item.fields)"
                        :key="badge"
                        class="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] text-gray-600"
                      >{{ badge }}</span>
                    </div>
                    <p v-if="item.usageTerms" class="mt-1.5 text-xs text-gray-600 line-clamp-2 whitespace-pre-wrap">{{ item.usageTerms }}</p>
                  </template>
                  <template v-else>
                    <span class="block font-medium text-gray-400 text-sm">{{ item.displayName || item.name }}</span>
                    <div class="mt-1 flex flex-wrap items-center gap-1.5">
                      <span class="text-xs text-gray-400">詳細非公開</span>
                      <span
                        v-for="badge in creditFieldBadges(item.fields)"
                        :key="badge"
                        class="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] text-gray-500"
                      >{{ badge }}</span>
                    </div>
                  </template>
                </li>
              </ul>
            </div>

            <div v-if="credits?.manualCredits?.length" class="space-y-2">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">手動クレジット</h3>
              <ul class="space-y-1.5">
                <li
                  v-for="item in credits.manualCredits"
                  :key="`manual-${item.id}`"
                  class="rounded border border-gray-200 bg-white px-3 py-2"
                >
                  <p class="font-medium text-sm text-gray-900 break-words">{{ item.label }}</p>
                  <p v-if="item.manualRole" class="mt-1 text-xs text-gray-600">種別/役割: {{ item.manualRole }}</p>
                  <p v-if="item.manualNote" class="mt-1.5 text-xs text-gray-700 whitespace-pre-wrap">{{ item.manualNote }}</p>
                  <p v-if="item.manualUrl" class="mt-1.5 text-xs">
                    <a
                      v-if="isHttpUrl(item.manualUrl)"
                      :href="item.manualUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-blue-600 hover:underline"
                    >
                      {{ item.manualUrl }}
                    </a>
                    <span v-else class="text-gray-500">{{ item.manualUrl }}</span>
                  </p>
                </li>
              </ul>
            </div>
          </section>

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
import { formatCreatorLabel } from '~/utils/creatorDisplay'

type GameScene = {
  id: string
  startNodeId?: string | null
  nodes?: Array<{ id: string }>
}

type GameDetail = {
  id: string
  ownerId: string
  ownerDisplayName?: string | null
  title: string
  summary: string | null
  coverAssetId: string | null
  viewCount?: number
  playCount?: number
  startSceneId: string | null
  updatedAt: string
  scenes: GameScene[]
}

type GameCreditAssetField = 'coverAssetId' | 'bgAssetId' | 'musicAssetId' | 'sfxAssetId' | 'portraitAssetId'
type GameCreditCharacterField = 'speakerCharacterId' | 'portraits'

type GameCreditsResult = {
  gameId: string
  assetCredits: Array<{
    assetId: string
    title: string
    ownerId: string | null
    ownerDisplayName?: string | null
    contentType: string | null
    primaryTag: string | null
    usageCount: number
    fields: Array<{ field: GameCreditAssetField; label: string; count: number }>
    status: 'active' | 'deleted' | 'missing'
    linkable: boolean
    usageTerms?: string | null
    creditRequired?: boolean
  }>
  characterCredits: Array<{
    characterId: string
    displayName: string
    name: string
    ownerId: string | null
    ownerDisplayName?: string | null
    usageCount: number
    fields: Array<{ field: GameCreditCharacterField; label: string; count: number }>
    status: 'active' | 'deleted' | 'missing' | 'private'
    linkable: boolean
    usageTerms?: string | null
    creditRequired?: boolean
  }>
  manualCredits: Array<{
    id: string
    label: string
    manualRole: string | null
    manualNote: string | null
    manualUrl: string | null
    sortOrder: number
    snapshotLockedAt: string | null
    locked: boolean
  }>
  counts: {
    assets: number
    characters: number
    manual: number
    total: number
  }
  checkedAt: string
}

const route = useRoute()
const api = useGamesApi()
const { signedFromId } = useAssetMeta()

const loading = ref(true)
const error = ref<string | null>(null)
const game = ref<GameDetail | null>(null)
const coverUrl = ref<string | null>(null)
const credits = ref<GameCreditsResult | null>(null)

const formatDate = (value: string) => new Date(value).toLocaleDateString('ja-JP')
const creditFieldBadges = (fields: Array<{ label: string; count: number }>): string[] =>
  fields.map((field) => `${field.label} ${field.count}箇所`)
const isHttpUrl = (value: string | null | undefined): boolean => /^https?:\/\//i.test(String(value || ''))

const hasCredits = computed(() => Number(credits.value?.counts?.total || 0) > 0)

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

    void (async () => {
      try {
        const creditsRes = await api.getCredits(id)
        credits.value = creditsRes as GameCreditsResult
      } catch (creditsFetchError) {
        console.warn('failed to fetch game credits', creditsFetchError)
      }
    })()

    try {
      await api.countView(id)
      if (game.value) {
        game.value = {
          ...game.value,
          viewCount: Number(game.value.viewCount || 0) + 1,
        }
      }
    } catch {
      // カウント失敗時も詳細表示は継続する
    }

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
