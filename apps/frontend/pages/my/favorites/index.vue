<script setup lang="ts">
import AssetCard from '@/components/asset/AssetCard.vue'
import TabsSwitch from '@/components/common/TabsSwitch.vue'
definePageMeta({ name: 'my-favorites' })

import { ref, onBeforeUnmount, onMounted, watch, computed } from 'vue'
import { useAssetsApi } from '@/composables/useAssets'
import { useQuerySync } from '@/composables/useQuerySync'

const api = useAssetsApi()
const favorites = ref<any[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const total = ref(0)

const qs = useQuerySync({ 
  q: '', 
  type: '', 
  primaryTag: '', 
  tags: '', 
  sort: 'createdAt:desc', 
  limit: 50, 
  offset: 0 
})

// Form state for filters
const formQ = ref('')
const formType = ref('')
const formPrimaryTag = ref('')
const formTags = ref('')
const formSort = ref('createdAt:desc')

// Track if form has unsaved changes
const hasUnsavedChanges = ref(false)

// Computed: check if filters are active (sort doesn't count)
const hasActiveFilters = computed(() => {
  return formQ.value.trim() || formType.value || formPrimaryTag.value || formTags.value.trim()
})

// Initialize form from query
const initializeForm = () => {
  formQ.value = qs.value.q || ''
  formType.value = qs.value.type || ''
  formPrimaryTag.value = qs.value.primaryTag || ''
  formTags.value = qs.value.tags || ''
  formSort.value = qs.value.sort || 'createdAt:desc'
  hasUnsavedChanges.value = false
}

const applyFilters = () => {
  qs.value = {
    q: formQ.value,
    type: formType.value,
    primaryTag: formPrimaryTag.value,
    tags: formTags.value,
    sort: formSort.value,
    limit: 50,
    offset: 0,
  }
  hasUnsavedChanges.value = false
}

const resetFilters = () => {
  formQ.value = ''
  formType.value = ''
  formPrimaryTag.value = ''
  formTags.value = ''
  formSort.value = 'createdAt:desc'
  qs.value = {
    q: '',
    type: '',
    primaryTag: '',
    tags: '',
    sort: 'createdAt:desc',
    limit: 50,
    offset: 0,
  }
  hasUnsavedChanges.value = false
}

async function load() {
  isLoading.value = true
  error.value = null
  try {
    const result = await api.listFavoriteAssets(qs.value)
    favorites.value = result.items || []
    total.value = result.total || 0
  } catch (err: any) {
    console.error('Failed to load favorites:', err)
    error.value = 'お気に入り素材の取得に失敗しました'
    favorites.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  initializeForm()
  void load()
})

let loadTimer: ReturnType<typeof setTimeout> | null = null
watch(
  qs,
  () => {
    if (loadTimer) clearTimeout(loadTimer)
    loadTimer = setTimeout(() => {
      void load()
    }, 200)
  },
  { deep: true }
)

const trackFormChange = () => {
  hasUnsavedChanges.value = true
}

onBeforeUnmount(() => {
  if (loadTimer) clearTimeout(loadTimer)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-semibold">お気に入り</h1>
        </div>
        <TabsSwitch :items="[{label:'素材', to:'/my/favorites'}, {label:'キャラクター', to:'/my/favorites/characters'}]" />
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Search and Filter Card -->
      <div class="bg-white p-4 sm:p-5 rounded-lg shadow-sm mb-6">
        <!-- Search -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">検索</label>
          <input
            v-model="formQ"
            @input="trackFormChange"
            type="text"
            placeholder="お気に入り素材を検索（タイトル・説明・タグ）"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Filters -->
        <div class="mb-6">
          <h3 class="text-sm font-medium text-gray-700 mb-4">絞り込み</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Content Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">コンテンツタイプ</label>
              <select
                v-model="formType"
                @change="trackFormChange"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">すべて</option>
                <option value="image">画像</option>
                <option value="audio">音声</option>
              </select>
            </div>

            <!-- Primary Tag -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">プライマリタグ</label>
              <select
                v-model="formPrimaryTag"
                @change="trackFormChange"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">すべて</option>
                <option value="IMAGE_BG">背景</option>
                <option value="IMAGE_CG">一枚絵</option>
                <option value="IMAGE_OTHER">その他（画像）</option>
                <option value="AUDIO_BGM">BGM</option>
                <option value="AUDIO_SE">効果音</option>
                <option value="AUDIO_VOICE">ボイス</option>
                <option value="AUDIO_OTHER">その他（音声）</option>
              </select>
            </div>

            <!-- Tags -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">タグ</label>
              <input
                v-model="formTags"
                @input="trackFormChange"
                type="text"
                placeholder="カンマ区切り（例: カップル, 屋内）"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Sort -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">並び替え</label>
              <select
                v-model="formSort"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="createdAt:desc">新しい順</option>
                <option value="createdAt:asc">古い順</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="grid grid-cols-2 gap-3">
          <button
            @click="applyFilters"
            :disabled="!hasUnsavedChanges && !hasActiveFilters"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            適用
          </button>
          <button
            @click="resetFilters"
            :disabled="!hasActiveFilters"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            リセット
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div>
            <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
            <button
              @click="load"
              class="text-sm text-red-700 hover:text-red-600 mt-2"
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white p-4 sm:p-5 rounded-lg shadow-sm text-center">
        <svg class="inline h-8 w-8 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-500 mt-3">読み込み中...</p>
      </div>

      <!-- Content -->
      <div v-else-if="favorites.length">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AssetCard v-for="asset in favorites" :key="asset.id" :asset="asset" :showFavorite="true" />
        </div>
      </div>

      <!-- Empty State (No Filters) -->
      <div v-else-if="!hasActiveFilters" class="bg-white p-8 sm:p-12 rounded-lg shadow-sm text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">お気に入りの素材はまだありません</h3>
        <p class="mt-2 text-sm text-gray-500">素材をお気に入りに追加すると、ここに表示されます。</p>
        <nuxt-link to="/assets" class="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          公開ギャラリーで素材を探す
        </nuxt-link>
      </div>

      <!-- Empty State (With Filters) -->
      <div v-else class="bg-white p-8 sm:p-12 rounded-lg shadow-sm text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">条件に一致するお気に入り素材はありません</h3>
        <p class="mt-2 text-sm text-gray-500">検索語や絞り込み条件を変えて試してください。</p>
        <button
          @click="resetFilters"
          class="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          条件をリセット
        </button>
      </div>
    </main>
  </div>
</template>