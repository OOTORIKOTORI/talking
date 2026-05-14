<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section class="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
        <div class="max-w-3xl">
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900">
            Talking
          </h1>
          <p class="mt-3 text-base sm:text-lg text-gray-700">
            素材・キャラクターを見つけて、会話ゲームを作って公開できる場所です。
          </p>
          <p class="mt-2 text-sm sm:text-base text-gray-600">
            公開素材・公開キャラクターを探したり、自分の素材やゲームを管理できます。
          </p>
        </div>

        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <NuxtLink
            to="/explore"
            class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            素材・キャラクターを見つける
          </NuxtLink>
          <NuxtLink
            to="/games"
            class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
          >
            公開ゲームを見る
          </NuxtLink>
          <NuxtLink
            to="/my/games"
            class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
          >
            ゲームを作る
          </NuxtLink>
          <NuxtLink
            to="/upload"
            class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
          >
            素材をアップロード
          </NuxtLink>
        </div>
      </section>

      <section class="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <NuxtLink
          to="/explore"
          class="group bg-blue-50 border border-blue-200 rounded-lg shadow-sm p-5 hover:bg-blue-100 transition-colors xl:col-span-2"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-blue-900">見つける</h2>
              <p class="mt-2 text-sm text-blue-800">
                公開素材と公開キャラクターをまとめて検索できます。
              </p>
            </div>
            <svg
              class="w-5 h-5 text-blue-700 mt-1 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/assets"
          class="group bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">公開ギャラリー</h2>
              <p class="mt-2 text-sm text-gray-600">画像・音声素材を探せます。</p>
            </div>
            <svg
              class="w-5 h-5 text-gray-500 mt-1 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/characters"
          class="group bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">キャラクター</h2>
              <p class="mt-2 text-sm text-gray-600">公開キャラクターを探せます。</p>
            </div>
            <svg
              class="w-5 h-5 text-gray-500 mt-1 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/games"
          class="group bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">公開ゲーム</h2>
              <p class="mt-2 text-sm text-gray-600">公開された会話ゲームを遊べます。</p>
            </div>
            <svg
              class="w-5 h-5 text-gray-500 mt-1 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/my/games"
          class="group bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">ゲーム制作</h2>
              <p class="mt-2 text-sm text-gray-600">自分のゲームを作成・編集できます。</p>
            </div>
            <svg
              class="w-5 h-5 text-gray-500 mt-1 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/upload"
          class="group bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">素材アップロード</h2>
              <p class="mt-2 text-sm text-gray-600">画像・音声素材を追加できます。</p>
            </div>
            <svg
              class="w-5 h-5 text-gray-500 mt-1 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </NuxtLink>
      </section>

      <section class="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-5">
        <div class="mb-4">
          <h2 class="text-base sm:text-lg font-semibold text-gray-900">新着コンテンツ</h2>
          <p class="mt-1 text-sm text-gray-600">最近公開・追加されたゲームや素材をチェックできます。</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <section class="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white">
            <div class="flex items-center justify-between gap-2 mb-3">
              <h3 class="text-sm font-semibold text-gray-900">最近公開されたゲーム</h3>
              <NuxtLink to="/games" class="text-xs text-blue-600 hover:underline">一覧へ</NuxtLink>
            </div>

            <div v-if="latestGamesLoading" class="text-sm text-gray-500 py-3">読み込み中...</div>
            <p v-else-if="latestGamesError" class="text-sm text-red-600 py-3">取得できませんでした</p>
            <p v-else-if="latestGames.length === 0" class="text-sm text-gray-500 py-3">まだ公開コンテンツがありません</p>
            <div v-else class="space-y-3">
              <article
                v-for="game in latestGames"
                :key="game.id"
                class="rounded-lg border border-gray-200 bg-white p-3"
              >
                <NuxtLink :to="`/games/${game.id}`" class="text-sm font-semibold text-gray-900 hover:underline line-clamp-1">
                  {{ game.title || '（無題）' }}
                </NuxtLink>
                <p class="mt-1 text-sm text-gray-600 line-clamp-2">{{ gameSummary(game) }}</p>
                <p class="mt-1 text-xs text-gray-500">
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
                <p v-if="hasGameCounts(game)" class="mt-1 text-xs text-gray-500">
                  閲覧 {{ Number(game.viewCount || 0) }} / プレイ {{ Number(game.playCount || 0) }}
                </p>
                <div class="mt-2 flex items-center gap-2">
                  <NuxtLink
                    :to="`/games/${game.id}`"
                    class="px-2.5 py-1 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    詳細
                  </NuxtLink>
                  <NuxtLink
                    :to="`/games/${game.id}/play`"
                    class="px-2.5 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    プレイする
                  </NuxtLink>
                </div>
              </article>
            </div>
          </section>

          <section class="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white">
            <div class="flex items-center justify-between gap-2 mb-3">
              <h3 class="text-sm font-semibold text-gray-900">最近追加された素材</h3>
              <NuxtLink to="/assets" class="text-xs text-blue-600 hover:underline">一覧へ</NuxtLink>
            </div>

            <div v-if="latestAssetsLoading" class="text-sm text-gray-500 py-3">読み込み中...</div>
            <p v-else-if="latestAssetsError" class="text-sm text-red-600 py-3">取得できませんでした</p>
            <p v-else-if="latestAssets.length === 0" class="text-sm text-gray-500 py-3">まだ素材がありません</p>
            <div v-else class="space-y-3">
              <AssetCard
                v-for="asset in latestAssets"
                :key="asset.id"
                :asset="asset"
                :showFavorite="false"
              />
            </div>
          </section>

          <section class="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white">
            <div class="flex items-center justify-between gap-2 mb-3">
              <h3 class="text-sm font-semibold text-gray-900">最近追加されたキャラクター</h3>
              <NuxtLink to="/characters" class="text-xs text-blue-600 hover:underline">一覧へ</NuxtLink>
            </div>

            <div v-if="latestCharactersLoading" class="text-sm text-gray-500 py-3">読み込み中...</div>
            <p v-else-if="latestCharactersError" class="text-sm text-red-600 py-3">取得できませんでした</p>
            <p v-else-if="latestCharacters.length === 0" class="text-sm text-gray-500 py-3">まだキャラクターがありません</p>
            <div v-else class="space-y-3">
              <CharacterCard
                v-for="character in latestCharacters"
                :key="character.id"
                :character="character"
                :showFavorite="false"
              />
            </div>
          </section>
        </div>
      </section>

      <section class="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-5">
        <div class="flex items-center justify-between gap-3 mb-3">
          <h2 class="text-base sm:text-lg font-semibold text-gray-800">
            開発状態
          </h2>
          <span
            v-if="!pending"
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
            :class="healthStatus.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
          >
            <span
              class="w-2 h-2 mr-1.5 rounded-full"
              :class="healthStatus.ok ? 'bg-green-400' : 'bg-red-400'"
            ></span>
            {{ healthStatus.ok ? '正常' : '異常' }}
          </span>
        </div>

        <div v-if="pending" class="flex items-center py-3">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span class="ml-2 text-sm text-gray-600">Checking API...</span>
        </div>

        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-3">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Connection Error</h3>
              <p class="mt-1 text-sm text-red-700">{{ error.message }}</p>
            </div>
          </div>
        </div>

        <div v-else-if="data" class="space-y-3">
          <div class="bg-gray-50 border border-gray-200 rounded-md p-3">
            <div class="text-sm text-gray-700">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span class="font-medium">Status:</span>
                  <span class="ml-2">{{ (data as any).status || 'OK' }}</span>
                </div>
                <div v-if="(data as any).timestamp">
                  <span class="font-medium">Timestamp:</span>
                  <span class="ml-2">{{ new Date((data as any).timestamp).toLocaleTimeString() }}</span>
                </div>
              </div>
              <details class="mt-3">
                <summary class="cursor-pointer text-gray-600 hover:text-gray-900">
                  レスポンスを表示
                </summary>
                <pre class="bg-white rounded p-2 mt-2 overflow-x-auto text-xs">{{ JSON.stringify(data, null, 2) }}</pre>
              </details>
            </div>
          </div>
        </div>

        <div class="mt-3 text-xs sm:text-sm text-gray-500">
          <p>API ベースURL: <code class="bg-gray-100 px-2 py-1 rounded">{{ config.public.apiBase }}</code></p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from '#imports'
import { formatCreatorLabel } from '~/utils/creatorDisplay'

type HomeGame = {
  id: string
  title?: string | null
  summary?: string | null
  description?: string | null
  ownerId?: string | null
  ownerDisplayName?: string | null
  viewCount?: number | null
  playCount?: number | null
}

type HomeAsset = {
  id: string
  [key: string]: any
}

type HomeCharacter = {
  id: string
  [key: string]: any
}

const config = useRuntimeConfig()
const gamesApi = useGamesApi()
const assetsApi = useAssetsApi()
const charactersApi = useCharactersApi()

const latestGames = ref<HomeGame[]>([])
const latestGamesLoading = ref(true)
const latestGamesError = ref<string | null>(null)

const latestAssets = ref<HomeAsset[]>([])
const latestAssetsLoading = ref(true)
const latestAssetsError = ref<string | null>(null)

const latestCharacters = ref<HomeCharacter[]>([])
const latestCharactersLoading = ref(true)
const latestCharactersError = ref<string | null>(null)

const { data, pending, error } = await useFetch(`${config.public.apiBase}/health`, {
  method: 'GET'
})

const healthStatus = computed(() => {
  if (data.value && typeof data.value === 'object' && 'ok' in data.value) {
    return { ok: data.value.ok }
  }
  return { ok: !error.value && !pending.value }
})

const hasGameCounts = (game: HomeGame) => {
  return game.viewCount != null || game.playCount != null
}

const gameSummary = (game: HomeGame) => {
  const raw = game.summary || game.description
  const text = typeof raw === 'string' ? raw.trim() : ''
  return text || '説明はありません。'
}

const fetchLatestGames = async () => {
  latestGamesLoading.value = true
  latestGamesError.value = null
  try {
    const res = await gamesApi.listPublic({ limit: 3, offset: 0, sort: 'new' }) as any
    latestGames.value = Array.isArray(res?.items) ? res.items : []
  } catch (e: any) {
    latestGamesError.value = e?.message || 'ゲームの取得に失敗しました'
    latestGames.value = []
  } finally {
    latestGamesLoading.value = false
  }
}

const fetchLatestAssets = async () => {
  latestAssetsLoading.value = true
  latestAssetsError.value = null
  try {
    const res = await assetsApi.listPublic({ limit: 3, offset: 0, sort: 'createdAt:desc' }) as any
    latestAssets.value = Array.isArray(res?.items) ? res.items : []
  } catch (e: any) {
    latestAssetsError.value = e?.message || '素材の取得に失敗しました'
    latestAssets.value = []
  } finally {
    latestAssetsLoading.value = false
  }
}

const fetchLatestCharacters = async () => {
  latestCharactersLoading.value = true
  latestCharactersError.value = null
  try {
    const res = await charactersApi.listPublic(undefined, 3, 0, { sort: 'createdAt:desc' }) as any
    latestCharacters.value = Array.isArray(res) ? res : []
  } catch (e: any) {
    latestCharactersError.value = e?.message || 'キャラクターの取得に失敗しました'
    latestCharacters.value = []
  } finally {
    latestCharactersLoading.value = false
  }
}

onMounted(() => {
  void fetchLatestGames()
  void fetchLatestAssets()
  void fetchLatestCharacters()
})
</script>
