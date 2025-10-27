<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">アセット管理</h1>
          <div class="flex items-center gap-4">
            <NuxtLink
              to="/upload"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              新規アップロード
            </NuxtLink>
            <NuxtLink
              to="/"
              class="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← ホームへ戻る
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Search Box -->
      <div class="mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="自分の投稿内を検索（タイトル・説明・タグ）"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          @input="onSearchInput"
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading && assets.length === 0" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">読み込み中...</span>
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
        <h3 class="mt-2 text-sm font-medium text-gray-900">まだアセットがありません</h3>
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
          <div
            v-for="asset in assets"
            :key="asset.id"
            class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
          >
            <!-- Thumbnail (clickable to detail) -->
            <NuxtLink :to="`/assets/${asset.id}`" class="block">
              <div class="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden group">
                <img
                  v-if="asset.contentType.startsWith('image/')"
                  :src="asset.url"
                  :alt="asset.title || 'Asset thumbnail'"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div v-else class="flex flex-col items-center justify-center text-gray-400">
                  <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span class="mt-2 text-xs">{{ getFileExtension(asset.contentType) }}</span>
                </div>
              </div>
            </NuxtLink>

            <!-- Info -->
            <div class="p-4">
              <NuxtLink :to="`/assets/${asset.id}`">
                <h3 class="font-medium text-gray-900 truncate hover:text-blue-600">
                  {{ asset.title || 'Untitled' }}
                </h3>
              </NuxtLink>
              <p v-if="asset.description" class="mt-1 text-sm text-gray-600 truncate">
                {{ asset.description }}
              </p>
              <div v-if="asset.tags && asset.tags.length > 0" class="mt-2 flex flex-wrap gap-1">
                <span
                  v-for="tag in asset.tags.slice(0, 3)"
                  :key="tag"
                  class="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                >
                  {{ tag }}
                </span>
                <span v-if="asset.tags.length > 3" class="inline-block px-2 py-0.5 text-xs text-gray-500">
                  +{{ asset.tags.length - 3 }}
                </span>
              </div>
              <p class="mt-1 text-sm text-gray-500">
                {{ formatFileSize(asset.size) }}
              </p>
              <p class="mt-1 text-xs text-gray-400">
                {{ formatDate(asset.createdAt) }}
              </p>

              <!-- Action Buttons -->
              <div class="mt-4 flex gap-2">
                <button
                  @click="handleEdit(asset.id)"
                  class="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  編集
                </button>
                <button
                  @click="handleDelete(asset.id)"
                  class="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="nextCursor" class="mt-8 text-center">
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
import type { Asset } from '@talking/types';

definePageMeta({ 
  middleware: ['require-auth']
});

const { $api } = useNuxtApp();
const router = useRouter();

const assets = ref<Asset[]>([]);
const nextCursor = ref<string | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');
let searchTimeout: NodeJS.Timeout | null = null;

const loadMyAssets = async (cursor?: string) => {
  try {
    loading.value = true;
    error.value = null;

    const params: Record<string, any> = {
      limit: 20,
    };
    
    if (cursor) {
      params.cursor = cursor;
    }
    
    if (searchQuery.value.trim()) {
      params.q = searchQuery.value.trim();
    }

    const result = await $api('/assets/mine', { 
      query: params
    }) as { items: Asset[], nextCursor: string | null };
    
    if (cursor) {
      assets.value = [...assets.value, ...result.items];
    } else {
      assets.value = result.items;
    }
    
    nextCursor.value = result.nextCursor;
  } catch (e) {
    error.value = e instanceof Error ? `取得に失敗しました: ${e.message}` : '取得に失敗しました';
  } finally {
    loading.value = false;
  }
};

const onSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    loadMyAssets();
  }, 300);
};

const loadMore = () => {
  if (nextCursor.value && !loading.value) {
    loadMyAssets(nextCursor.value);
  }
};

const handleEdit = (id: string) => {
  // TODO: 編集ページへ遷移（将来実装）
  router.push(`/assets/${id}`);
};

const handleDelete = async (id: string) => {
  if (!confirm('本当にこのアセットを削除しますか？')) {
    return;
  }

  try {
    await $api(`/assets/${id}`, {
      method: 'DELETE'
    });
    
    // リストから削除
    assets.value = assets.value.filter(a => a.id !== id);
  } catch (e) {
    alert(e instanceof Error ? `削除に失敗しました: ${e.message}` : '削除に失敗しました');
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

const getFileExtension = (contentType: string): string => {
  const parts = contentType.split('/');
  return parts[1]?.toUpperCase() || 'FILE';
};

// Load initial data
onMounted(() => {
  loadMyAssets();
});

useHead({
  title: 'アセット管理 - Talking',
});
</script>
