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

      <article
        v-else-if="profile"
        class="bg-white border border-gray-200 rounded-xl p-6 space-y-5"
      >
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

const route = useRoute()
const profilesApi = useProfilesApi()

const loading = ref(true)
const notFound = ref(false)
const error = ref<string | null>(null)
const profile = ref<PublicProfile | null>(null)

const normalizeUserId = (value: unknown): string => {
  if (typeof value === 'string') return value.trim()
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0].trim()
  return ''
}

const loadProfile = async () => {
  const userId = normalizeUserId(route.params.userId)

  loading.value = true
  notFound.value = false
  error.value = null
  profile.value = null

  if (!userId) {
    notFound.value = true
    loading.value = false
    return
  }

  try {
    const res = (await profilesApi.getPublicProfile(userId)) as PublicProfile
    profile.value = res
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
