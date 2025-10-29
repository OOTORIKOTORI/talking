<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">公開ギャラリー</h1>
          <NuxtLink
            to="/"
            class="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← ホームへ戻る
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Search and Filters -->
      <div class="mb-6 space-y-4">
        <!-- Search Box -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="タイトル・説明・タグで検索"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          @input="onSearchInput"
        />

        <!-- Filters Section -->
        <div class="bg-white p-4 rounded-lg shadow-sm space-y-4">
          <!-- Content Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">コンテンツタイプ</label>
            <div class="flex gap-2">
              <button
                @click="contentTypeFilter = undefined"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  contentTypeFilter === undefined
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                すべて
              </button>
              <button
                @click="contentTypeFilter = 'image'"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  contentTypeFilter === 'image'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                画像
              </button>
              <button
                @click="contentTypeFilter = 'audio'"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  contentTypeFilter === 'audio'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                音声
              </button>
            </div>
          </div>

          <!-- Primary Tag Filter -->
          <div v-if="contentTypeFilter === 'image' || contentTypeFilter === 'audio' || contentTypeFilter === undefined">
            <label class="block text-sm font-medium text-gray-700 mb-2">プライマリタグ</label>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="tag in availablePrimaryTags"
                :key="tag.value"
                class="inline-flex items-center px-3 py-2 rounded-lg border cursor-pointer transition-colors"
                :class="[
                  primaryTagFilter.includes(tag.value)
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                ]"
              >
                <input
                  type="checkbox"
                  :value="tag.value"
                  v-model="primaryTagFilter"
                  class="mr-2 rounded"
                />
                {{ tag.label }}
              </label>
            </div>
          </div>

          <!-- Tags Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">タグ（カンマ区切り）</label>
            <input
              v-model="tagsInput"
              type="text"
              placeholder="例: 森, 夜, 戦闘"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Sort Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">並び替え</label>
            <select
              v-model="sortOrder"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt:desc">新しい順</option>
              <option value="createdAt:asc">古い順</option>
            </select>
          </div>

          <!-- Apply/Reset Buttons -->
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

      <!-- Loading State -->
      <div v-if="loading && assets.length === 0" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Loading assets...</span>
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
            <h3 class="text-sm font-medium text-red-800">アセットの取得に失敗しました</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="assets.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">アセットはまだありません</h3>
        <p class="mt-1 text-sm text-gray-500">ファイルをアップロードして始めましょう。</p>
        <div class="mt-6">
          <NuxtLink
            to="/upload"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            ファイルをアップロード
          </NuxtLink>
        </div>
      </div>

      <!-- Assets Grid -->
      <div v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AssetCard
            v-for="asset in assets"
            :key="asset.id"
            :asset="asset"
            :showFavorite="true"
            :onToggleFavorite="toggle"
            @thumb-error="performSearch"
          />
        </div>

        <!-- Load More Button -->
        <div v-if="assets.length < total" class="mt-8 text-center">
          <button
            @click="loadMore"
            :disabled="loading"
            class="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">読み込み中...</span>
            <span v-else>さらに読み込む</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useFavoriteToggle } from '@/composables/useFavoriteToggle'
const { toggle } = useFavoriteToggle()
function toggleFavorite(asset: Asset) {
  toggle(asset)
}
import type { Asset } from '@talking/types';

const route = useRoute();
const router = useRouter();
const { searchAssets } = useAssets();

const assets = ref<Asset[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');
const total = ref(0);
const offset = ref(0);

// Filter states
const contentTypeFilter = ref<'image' | 'audio' | undefined>(undefined);
const primaryTagFilter = ref<string[]>([]);
const tagsInput = ref('');
const sortOrder = ref<'createdAt:desc' | 'createdAt:asc'>('createdAt:desc');

let searchTimeout: NodeJS.Timeout | null = null;

// Available primary tags based on content type
const availablePrimaryTags = computed(() => {
  const imageOnly = contentTypeFilter.value === 'image';
  const audioOnly = contentTypeFilter.value === 'audio';

  const imageTags = [
    { value: 'IMAGE_BG', label: '背景' },
    { value: 'IMAGE_CG', label: '一枚絵' },
    { value: 'IMAGE_OTHER', label: 'その他' },
  ];

  const audioTags = [
    { value: 'AUDIO_BGM', label: 'BGM' },
    { value: 'AUDIO_SE', label: '効果音' },
    { value: 'AUDIO_VOICE', label: 'ボイス' },
    { value: 'AUDIO_OTHER', label: 'その他' },
  ];

  if (imageOnly) return imageTags;
  if (audioOnly) return audioTags;
  return [...imageTags, ...audioTags];
});

// Primary tag label mapping
const primaryTagLabels: Record<string, string> = {
  IMAGE_BG: '背景',
  IMAGE_CG: '一枚絵',
  IMAGE_OTHER: 'その他',
  AUDIO_BGM: 'BGM',
  AUDIO_SE: '効果音',
  AUDIO_VOICE: 'ボイス',
  AUDIO_OTHER: 'その他',
};

const getPrimaryTagLabel = (tag: string): string => {
  return primaryTagLabels[tag] || tag;
};

// Load data from query params on mount
const loadFromQuery = () => {
  const query = route.query;
  
  if (query.q && typeof query.q === 'string') {
    searchQuery.value = query.q;
  }
  
  if (query.contentType === 'image' || query.contentType === 'audio') {
    contentTypeFilter.value = query.contentType;
  }
  
  if (query.primaryTag) {
    primaryTagFilter.value = Array.isArray(query.primaryTag) 
      ? query.primaryTag as string[] 
      : [query.primaryTag as string];
  }
  
  if (query.tags && typeof query.tags === 'string') {
    tagsInput.value = query.tags;
  }
  
  if (query.sort === 'createdAt:asc' || query.sort === 'createdAt:desc') {
    sortOrder.value = query.sort;
  }
};

const performSearch = async () => {
  try {
    loading.value = true;
    error.value = null;

    const params: Record<string, any> = {
      q: searchQuery.value,
      limit: 20,
      offset: offset.value,
      sort: sortOrder.value,
    };

    if (contentTypeFilter.value) {
      params.contentType = contentTypeFilter.value;
    }

    if (primaryTagFilter.value.length > 0) {
      params.primaryTag = primaryTagFilter.value.join(',');
    }

    if (tagsInput.value.trim()) {
      params.tags = tagsInput.value;
    }

    const result = await searchAssets(params);
    
    if (offset.value === 0) {
      assets.value = result.items;
    } else {
      assets.value = [...assets.value, ...result.items];
    }
    
    total.value = result.total;
  } catch (e) {
    error.value = e instanceof Error ? `検索に失敗しました: ${e.message}` : '検索に失敗しました';
  } finally {
    loading.value = false;
  }
};

const onSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    offset.value = 0;
    performSearch();
  }, 300);
};

const applyFilters = () => {
  offset.value = 0;
  
  // Update query params
  const query: Record<string, any> = {
    q: searchQuery.value || undefined,
    contentType: contentTypeFilter.value || undefined,
    primaryTag: primaryTagFilter.value.length > 0 ? primaryTagFilter.value.join(',') : undefined,
    tags: tagsInput.value.trim() || undefined,
    sort: sortOrder.value !== 'createdAt:desc' ? sortOrder.value : undefined,
  };

  // Remove undefined values
  Object.keys(query).forEach(key => {
    if (query[key] === undefined) {
      delete query[key];
    }
  });

  router.push({ query });
  performSearch();
};

const resetFilters = () => {
  searchQuery.value = '';
  contentTypeFilter.value = undefined;
  primaryTagFilter.value = [];
  tagsInput.value = '';
  sortOrder.value = 'createdAt:desc';
  offset.value = 0;
  
  router.push({ query: {} });
  performSearch();
};

const loadMore = () => {
  if (!loading.value && assets.value.length < total.value) {
    offset.value += 20;
    performSearch();
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Load initial data
onMounted(() => {
  loadFromQuery();
  performSearch();
});

// Watch route changes
watch(() => route.query, () => {
  loadFromQuery();
});

useHead({
  title: '公開ギャラリー - Talking',
});
</script>
