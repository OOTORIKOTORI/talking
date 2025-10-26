<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">アセット詳細</h1>
          <NuxtLink
            to="/assets"
            class="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← アセット一覧に戻る
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Loading asset...</span>
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
            <h3 class="text-sm font-medium text-red-800">Error loading asset</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Asset Details -->
      <div v-else-if="asset" class="bg-white rounded-lg shadow overflow-hidden">
        <!-- Preview/Thumbnail -->
        <div class="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            v-if="asset.contentType.startsWith('image/')"
            :src="signedUrl"
            :alt="asset.title || 'Asset'"
            class="w-full h-full object-contain"
            @error="handleMediaError"
          />
          <audio
            v-else-if="asset.contentType.startsWith('audio/')"
            :src="signedUrl"
            controls
            class="w-full max-w-2xl px-4"
            @error="handleMediaError"
          ></audio>
          <div v-else class="flex flex-col items-center justify-center text-gray-400">
            <svg class="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="mt-4 text-lg">{{ getFileExtension(asset.contentType) }} File</span>
          </div>
        </div>

        <!-- Metadata -->
        <div class="p-6 space-y-6">
          <!-- Title -->
          <div>
            <h2 class="text-2xl font-bold text-gray-900">
              {{ asset.title || 'Untitled' }}
            </h2>
          </div>

          <!-- Info Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <dt class="text-sm font-medium text-gray-500">ファイルサイズ</dt>
              <dd class="mt-1 text-lg text-gray-900">{{ formatFileSize(asset.size) }}</dd>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <dt class="text-sm font-medium text-gray-500">コンテンツタイプ</dt>
              <dd class="mt-1 text-lg text-gray-900">{{ asset.contentType }}</dd>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <dt class="text-sm font-medium text-gray-500">作成</dt>
              <dd class="mt-1 text-lg text-gray-900">{{ formatDate(asset.createdAt) }}</dd>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <dt class="text-sm font-medium text-gray-500">アセットID</dt>
              <dd class="mt-1 text-sm text-gray-900 font-mono truncate">{{ asset.id }}</dd>
            </div>
          </div>

          <!-- URL -->
          <div class="border-t pt-4">
            <dt class="text-sm font-medium text-gray-500 mb-2">表示用URL（有効期限あり）</dt>
            <dd class="flex items-center space-x-2">
              <input
                :value="signedUrl"
                readonly
                class="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-mono text-gray-700"
              />
              <button
                @click="copyUrl"
                class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                {{ copied ? 'Copied!' : 'Copy' }}
              </button>
              <button
                @click="refreshSignedUrl"
                class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
              >
                再取得
              </button>
            </dd>
          </div>

          <!-- Actions -->
          <div class="border-t pt-4 flex space-x-4">
            <a
              :href="asset.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg class="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in New Tab
            </a>

            <a
              :href="asset.url"
              download
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg class="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { Asset } from '@talking/types';
import { getSignedGetUrl } from '@/composables/useSignedUrl';

const route = useRoute();
const { getAsset } = useAssets();

const asset = ref<Asset | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const copied = ref(false);
const signedUrl = ref<string>('');
const mediaErrorRetried = ref(false);

const loadAsset = async () => {
  const id = route.params.id as string;
  if (!id) {
    error.value = 'No asset ID provided';
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    asset.value = await getAsset(id);
    if (asset.value) {
      signedUrl.value = await getSignedGetUrl(asset.value.key);
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load asset';
  } finally {
    loading.value = false;
  }
};

const refreshSignedUrl = async () => {
  if (!asset.value) return;
  try {
    signedUrl.value = await getSignedGetUrl(asset.value.key);
    mediaErrorRetried.value = false;
  } catch (e) {
    console.error('Failed to refresh signed URL', e);
  }
};

const handleMediaError = async () => {
  if (mediaErrorRetried.value || !asset.value) return;
  mediaErrorRetried.value = true;
  await refreshSignedUrl();
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
  return d.toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getFileExtension = (contentType: string): string => {
  const parts = contentType.split('/');
  return parts[1]?.toUpperCase() || 'FILE';
};

const copyUrl = async () => {
  if (signedUrl.value) {
    try {
      await navigator.clipboard.writeText(signedUrl.value);
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    } catch (e) {
      console.error('Failed to copy URL', e);
    }
  }
};

// Load asset on mount
onMounted(() => {
  loadAsset();
});

useHead({
  title: () => asset.value ? `${asset.value.title || 'Asset'} - Talking` : 'Asset - Talking',
});
</script>
