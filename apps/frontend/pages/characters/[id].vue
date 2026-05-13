<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-bold text-gray-900">キャラクター詳細</h1>
          <NuxtLink
            to="/characters"
            class="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← キャラクター一覧に戻る
          </NuxtLink>
        </div>
        <TabsSwitch :items="[{ label: '素材', to: '/assets' }, { label: 'キャラクター', to: '/characters' }]" />
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">キャラクターを読み込み中...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">キャラクターの読み込みに失敗しました</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Character Details -->
      <div v-else-if="data" class="bg-white rounded-lg shadow overflow-hidden">
        <div class="p-6 space-y-6">
          <!-- Title & Meta -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">
                {{ data.name || 'Untitled' }}
              </h2>
              <div class="text-gray-500 text-sm">{{ data.displayName }}</div>
              <div class="mt-2 flex items-center gap-2">
                <span class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded"
                  :class="data.isPublic === false ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'">
                  {{ data.isPublic === false ? '非公開' : '公開' }}
                </span>
                <span class="text-xs text-gray-500">ID: {{ data.id }}</span>
              </div>
              <div class="mt-1 text-sm text-gray-600">
                <span>作者: </span>
                <NuxtLink
                  v-if="data.ownerId"
                  :to="`/profiles/${data.ownerId}`"
                  class="text-blue-600 hover:underline"
                >
                  {{ formatCreatorLabel(data.ownerDisplayName, data.ownerId) }}
                </NuxtLink>
                <span v-else>unknown</span>
              </div>
            </div>
            <div class="flex flex-col items-end gap-2">
              <button
                @click="onFavoriteClick"
                :disabled="favoriteToggling"
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors disabled:opacity-50"
                :class="isFavorited ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'"
              >
                <span aria-hidden="true">{{ isFavorited ? '♥' : '♡' }}</span>
                <span>{{ isFavorited ? 'お気に入り済み' : 'お気に入り' }}</span>
              </button>
            </div>
          </div>

          <!-- Description -->
          <div v-if="data.description" class="bg-gray-50 rounded-lg p-4">
            <dt class="text-sm font-medium text-gray-500">説明</dt>
            <dd class="mt-1 text-gray-900 whitespace-pre-wrap">{{ data.description }}</dd>
          </div>
          <div v-else class="bg-gray-50 rounded-lg p-4">
            <dt class="text-sm font-medium text-gray-500">説明</dt>
            <dd class="mt-1 text-gray-400">—</dd>
          </div>

          <!-- Tags -->
          <div v-if="data.tags?.length" class="flex flex-wrap gap-1">
            <NuxtLink v-for="t in data.tags" :key="t" :to="`/characters?tags=${encodeURIComponent(t)}`" class="px-2 py-0.5 rounded-full bg-slate-100 ring-1 ring-slate-200 text-slate-700 text-xs hover:bg-slate-200 transition-colors">{{ t }}</NuxtLink>
          </div>

          <!-- Usage Terms -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-sm font-medium text-gray-500 mb-2">利用条件</div>
            <div class="flex items-center gap-2 mb-2">
              <span
                class="inline-block px-2 py-0.5 text-xs font-semibold rounded-full"
                :class="data.creditRequired !== false ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'"
              >
                {{ data.creditRequired !== false ? 'クレジット表記: 必須' : 'クレジット表記: 任意' }}
              </span>
            </div>
            <p v-if="data.usageTerms" class="text-sm text-gray-800 whitespace-pre-wrap">{{ data.usageTerms }}</p>
            <p v-else class="text-sm text-gray-400">個別の利用条件は未設定です。</p>
          </div>

          <!-- 画像・表情 -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">画像・表情</h3>
            <div class="bg-gray-50 rounded-lg p-4 flex flex-wrap gap-3 items-center mb-4">
              <label class="text-sm text-gray-500">感情</label>
              <select v-model="emotion" class="border rounded px-2 py-1">
                <option value="">すべて</option>
                <option v-for="e in emotions" :key="e.value" :value="e.value">{{ e.label }}</option>
              </select>
              <input v-model="pattern" class="border rounded px-2 py-1" placeholder="パターン（任意文字列）" />
            </div>
            <div v-if="viewImages.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div v-for="img in viewImages" :key="img.id" class="bg-white rounded shadow overflow-hidden">
                <div class="aspect-[3/4] cursor-zoom-in" @click="openPreview(img)">
                  <CharacterImageThumb :keyOrThumb="img.thumbKey || img.key" :alt="data.name" />
                </div>
                <div class="p-2 text-xs text-gray-600">
                  {{ img.emotionLabel || EMOTION_JP_LABEL[img.emotion as keyof typeof EMOTION_JP_LABEL] }}
                  <span v-if="img.pattern">/ {{ img.pattern }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-400 text-center py-8">表示できる画像はありません。</div>
            <ImageLightbox :open="previewOpen" :src="previewSrc" :alt="data.name || ''" @close="previewOpen=false" />
          </div>

          <!-- 管理セクション（ownerのみ） -->
          <div v-if="canManage" class="border-t pt-6 mt-6">
            <h3 class="text-lg font-semibold text-gray-900">管理</h3>
            <div class="mt-2">
              <NuxtLink :to="`/my/characters/${data.id}`" class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">
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
import type { Character } from '@talking/types'
import { useCharactersApi } from '@/composables/useCharacters'
import { EMOTION_JP_LABEL, emotionOptions } from '@/utils/characterLocales'
import ImageLightbox from '@/components/common/ImageLightbox.vue'
import TabsSwitch from '@/components/common/TabsSwitch.vue'
import { formatCreatorLabel } from '@/utils/creatorDisplay'
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useFavoriteToggleCharacter } from '@/composables/useFavoriteToggleCharacter'
import { useSignedUrl } from '@/composables/useSignedUrl'

const route = useRoute()
const api = useCharactersApi()
const data = ref<Character | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const emotion = ref<string>('')
const pattern = ref<string>('')
const emotions = emotionOptions()
const favoriteToggling = ref(false)
const previewOpen = ref(false)
const previewSrc = ref<string | null>(null)
const currentUserId = ref<string | null>(null)

const { toggle } = useFavoriteToggleCharacter()
const isFavorited = computed(() => {
  const character = data.value as (Character & { isFavorited?: boolean }) | null
  if (!character) return false
  return !!(character.isFavorite ?? character.isFavorited)
})

const canManage = computed(() => {
  return !!currentUserId.value && !!data.value && data.value.ownerId === currentUserId.value
})

const loadCharacter = async () => {
  loading.value = true
  error.value = null
  try {
    data.value = await api.getPublic(String(route.params.id))
  } catch (e: any) {
    error.value = e?.message || '取得に失敗しました'
  } finally {
    loading.value = false
  }
}

const onFavoriteClick = async () => {
  if (!data.value || favoriteToggling.value) return
  favoriteToggling.value = true
  try {
    await toggle(data.value)
  } catch (e) {
    // エラー時は何もしない
  } finally {
    favoriteToggling.value = false
  }
}

const viewImages = computed(() => {
  const imgs = data.value?.images || []
  return imgs.filter(i => (!emotion.value || i.emotion === emotion.value) && (!pattern.value || (i.pattern||'').includes(pattern.value)))
})

const { url: fullUrl, setKey: setFullKey, refresh: refreshFull } = useSignedUrl(null)
watch(fullUrl, (v) => {
  if (v) previewSrc.value = v
})
const openPreview = async (img: any) => {
  setFullKey(img.key)
  await refreshFull()
  previewOpen.value = true
}

onMounted(async () => {
  const supabase = useSupabaseClient() as any
  const { data } = await supabase.auth.getSession()
  currentUserId.value = data?.session?.user?.id ?? null
  await loadCharacter()
})

useHead({
  title: () => data.value ? `${data.value.name || 'キャラクター'} - Talking` : 'キャラクター - Talking',
})
</script>
