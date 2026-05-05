<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-2xl mx-auto px-4 sm:px-6 py-4">
        <h1 class="text-xl font-semibold text-gray-900">クリエイタープロフィール</h1>
      </div>
    </header>

    <main class="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div v-if="loading" class="text-center py-12 text-gray-500">読み込み中...</div>

      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
      >
        {{ error }}
      </div>

      <article
        v-else-if="notFound"
        class="bg-white border border-gray-200 rounded-xl p-6 space-y-2"
      >
        <h2 class="text-lg font-semibold text-gray-900">プロフィールが見つかりません</h2>
        <p class="text-sm text-gray-600">指定されたユーザーの公開プロフィールは存在しないか、まだ設定されていません。</p>
      </article>

      <template v-else-if="profile">
        <article class="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <div>
            <h2 class="text-2xl font-semibold text-gray-900">
              {{ formatCreatorLabel(profile.displayName, profile.userId) }}
            </h2>
            <p class="mt-1 text-sm text-gray-500">ID: {{ formatShortOwnerId(profile.userId) }}</p>
          </div>

          <section>
            <h3 class="text-sm font-medium text-gray-700 mb-2">自己紹介</h3>
            <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ profile.bio?.trim() || '自己紹介はまだありません。' }}</p>
          </section>
        </article>

        <!-- 公開コンテンツ -->
        <div class="mt-6 space-y-6">
          <div v-if="contentsError" class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            公開コンテンツの取得に失敗しました。
          </div>

          <template v-else>
            <!-- 公開ゲーム -->
            <section>
              <h3 class="text-base font-semibold text-gray-800 mb-3">公開ゲーム</h3>
              <div v-if="contentsLoading" class="text-sm text-gray-400">読み込み中...</div>
              <p v-else-if="!contents?.games?.length" class="text-sm text-gray-400">まだ公開ゲームはありません。</p>
              <ul v-else class="space-y-2">
                <li v-for="game in contents.games" :key="game.id">
                  <NuxtLink
                    :to="`/games/${game.id}`"
                    class="block bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <p class="text-sm font-medium text-gray-900 truncate">{{ game.title || '（タイトルなし）' }}</p>
                    <p v-if="game.summary" class="mt-0.5 text-xs text-gray-500 line-clamp-2">{{ game.summary }}</p>
                    <p class="mt-1 text-xs text-gray-400">更新: {{ formatDate(game.updatedAt) }}</p>
                  </NuxtLink>
                </li>
              </ul>
            </section>

            <!-- 公開アセット -->
            <section>
              <h3 class="text-base font-semibold text-gray-800 mb-3">公開アセット</h3>
              <div v-if="contentsLoading" class="text-sm text-gray-400">読み込み中...</div>
              <p v-else-if="!contents?.assets?.length" class="text-sm text-gray-400">まだ公開アセットはありません。</p>
              <ul v-else class="space-y-2">
                <li v-for="asset in contents.assets" :key="asset.id">
                  <NuxtLink
                    :to="`/assets/${asset.id}`"
                    class="block bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <p class="text-sm font-medium text-gray-900 truncate">{{ asset.title || '（タイトルなし）' }}</p>
                    <p v-if="asset.description" class="mt-0.5 text-xs text-gray-500 line-clamp-2">{{ asset.description }}</p>
                    <p class="mt-1 text-xs text-gray-400">登録: {{ formatDate(asset.createdAt) }}</p>
                  </NuxtLink>
                </li>
              </ul>
            </section>

            <!-- 公開キャラクター -->
            <section>
              <h3 class="text-base font-semibold text-gray-800 mb-3">公開キャラクター</h3>
              <div v-if="contentsLoading" class="text-sm text-gray-400">読み込み中...</div>
              <p v-else-if="!contents?.characters?.length" class="text-sm text-gray-400">まだ公開キャラクターはありません。</p>
              <ul v-else class="space-y-2">
                <li v-for="character in contents.characters" :key="character.id">
                  <NuxtLink
                    :to="`/characters/${character.id}`"
                    class="block bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <p class="text-sm font-medium text-gray-900 truncate">{{ character.displayName || character.name || '（名前なし）' }}</p>
                    <p v-if="character.description" class="mt-0.5 text-xs text-gray-500 line-clamp-2">{{ character.description }}</p>
                    <p class="mt-1 text-xs text-gray-400">更新: {{ formatDate(character.updatedAt) }}</p>
                  </NuxtLink>
                </li>
              </ul>
            </section>
          </template>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { formatCreatorLabel, formatShortOwnerId } from '~/utils/creatorDisplay'

type PublicProfile = {
  userId: string
  displayName: string | null
  bio: string | null
  createdAt?: string
  updatedAt?: string
}

type ProfileContentGame = {
  id: string
  title: string
  summary: string | null
  updatedAt: string
}

type ProfileContentAsset = {
  id: string
  title: string | null
  description: string | null
  contentType: string
  createdAt: string
}

type ProfileContentCharacter = {
  id: string
  name: string
  displayName: string | null
  description: string | null
  updatedAt: string
}

type ProfileContents = {
  games: ProfileContentGame[]
  assets: ProfileContentAsset[]
  characters: ProfileContentCharacter[]
}

const route = useRoute()
const profilesApi = useProfilesApi()

const loading = ref(true)
const notFound = ref(false)
const error = ref<string | null>(null)
const profile = ref<PublicProfile | null>(null)

const contentsLoading = ref(false)
const contentsError = ref(false)
const contents = ref<ProfileContents | null>(null)

const formatDate = (value: string | Date | null | undefined): string => {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })
}

const normalizeUserId = (value: unknown): string => {
  if (typeof value === 'string') return value.trim()
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0].trim()
  return ''
}

const loadContents = async (userId: string) => {
  contentsLoading.value = true
  contentsError.value = false
  contents.value = null
  try {
    contents.value = (await profilesApi.getProfileContents(userId)) as ProfileContents
  } catch {
    contentsError.value = true
  } finally {
    contentsLoading.value = false
  }
}

const loadProfile = async () => {
  const userId = normalizeUserId(route.params.userId)

  loading.value = true
  notFound.value = false
  error.value = null
  profile.value = null
  contents.value = null
  contentsError.value = false

  if (!userId) {
    notFound.value = true
    loading.value = false
    return
  }

  try {
    const res = (await profilesApi.getPublicProfile(userId)) as PublicProfile
    profile.value = res
    // Load contents independently so a failure doesn't break the profile display
    loadContents(userId)
  } catch (e: any) {
    const status = e?.statusCode || e?.status || e?.response?.status
    if (status === 404) {
      notFound.value = true
    } else {
      error.value = e?.data?.message || e?.message || 'プロフィールの取得に失敗しました。'
    }
  } finally {
    loading.value = false
  }
}

watch(() => route.params.userId, loadProfile, { immediate: true })
</script>
