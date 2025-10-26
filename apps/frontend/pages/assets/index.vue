<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">Assets</h1>
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
            <h3 class="text-sm font-medium text-red-800">Error loading assets</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="assets.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No assets</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by uploading a file.</p>
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
          <NuxtLink
            v-for="asset in assets"
            :key="asset.id"
            :to="`/assets/${asset.id}`"
            class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
          >
            <!-- Thumbnail -->
            <div class="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
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

            <!-- Info -->
            <div class="p-4">
              <h3 class="font-medium text-gray-900 truncate">
                {{ asset.title || 'Untitled' }}
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ formatFileSize(asset.size) }}
              </p>
              <p class="mt-1 text-xs text-gray-400">
                {{ formatDate(asset.createdAt) }}
              </p>
            </div>
          </NuxtLink>
        </div>

        <!-- Load More Button -->
        <div v-if="nextCursor" class="mt-8 text-center">
          <button
            @click="loadMore"
            :disabled="loading"
            class="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Loading...</span>
            <span v-else>Load More</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { Asset } from '@talking/types';

const { listAssets } = useAssets();

const assets = ref<Asset[]>([]);
const nextCursor = ref<string | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const loadAssets = async (cursor?: string) => {
  try {
    loading.value = true;
    error.value = null;

    const result = await listAssets({ limit: 20, cursor });
    
    if (cursor) {
      assets.value = [...assets.value, ...result.items];
    } else {
      assets.value = result.items;
    }
    
    nextCursor.value = result.nextCursor;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load assets';
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  if (nextCursor.value && !loading.value) {
    loadAssets(nextCursor.value);
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
  return d.toLocaleDateString('en-US', { 
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
  loadAssets();
});

useHead({
  title: 'Assets - Talking',
});
</script>
