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

          <!-- Description -->
          <div v-if="asset.description" class="bg-gray-50 rounded-lg p-4">
            <dt class="text-sm font-medium text-gray-500">説明</dt>
            <dd class="mt-1 text-gray-900 whitespace-pre-wrap">{{ asset.description }}</dd>
          </div>
          <div v-else class="bg-gray-50 rounded-lg p-4">
            <dt class="text-sm font-medium text-gray-500">説明</dt>
            <dd class="mt-1 text-gray-400">—</dd>
          </div>

          <!-- Primary Tag -->
          <div class="bg-gray-50 rounded-lg p-4">
            <dt class="text-sm font-medium text-gray-500 mb-2">種別</dt>
            <dd>
              <span class="inline-block px-3 py-1 text-sm font-semibold bg-indigo-100 text-indigo-800 rounded-lg">
                {{ formatPrimaryTag(asset.primaryTag) }}
              </span>
            </dd>
          </div>

          <!-- Tags -->
          <div class="bg-gray-50 rounded-lg p-4">
            <dt class="text-sm font-medium text-gray-500 mb-2">タグ</dt>
            <dd v-if="asset.tags && asset.tags.length > 0" class="flex flex-wrap gap-2">
              <span
                v-for="tag in asset.tags"
                :key="tag"
                class="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
              >
                {{ tag }}
              </span>
            </dd>
            <dd v-else class="text-gray-400">—</dd>
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

          <!-- Edit Section -->
          <div v-if="canManage" class="border-t pt-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">編集</h3>
            <form @submit.prevent="saveAsset" class="space-y-4">
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                <input
                  id="title"
                  v-model="editForm.title"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea
                  id="description"
                  v-model="editForm.description"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              <div>
                <label for="tags" class="block text-sm font-medium text-gray-700 mb-1">タグ（カンマ区切り）</label>
                <input
                  id="tags"
                  v-model="editForm.tagsString"
                  type="text"
                  placeholder="例: 画像, デザイン, 2024"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div class="flex space-x-3">
                <button
                  type="submit"
                  :disabled="saving"
                  class="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ saving ? '保存中...' : '保存' }}
                </button>
                <button
                  type="button"
                  @click="resetForm"
                  class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
                >
                  リセット
                </button>
              </div>
            </form>
          </div>

          <!-- Actions -->
          <div class="border-t pt-4 flex justify-between">
            <div class="flex space-x-4">
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

            <button
              v-if="canManage"
              @click="confirmDelete"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <svg class="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              削除
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
      @click.self="showDeleteModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-lg font-medium text-gray-900 mb-2">アセットを削除</h3>
            <p class="text-sm text-gray-500 mb-4">
              このアセットを完全に削除してよろしいですか？この操作は取り消せません。
            </p>
            <div class="flex space-x-3">
              <button
                @click="handleDelete"
                :disabled="deleting"
                class="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {{ deleting ? '削除中...' : '削除する' }}
              </button>
              <button
                @click="showDeleteModal = false"
                :disabled="deleting"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Asset } from '@talking/types';
import { getSignedGetUrl } from '@/composables/useSignedUrl';

const route = useRoute();
const router = useRouter();
const { $supabase } = useNuxtApp() as any
const supabase = $supabase as any;
const { getAsset, updateAsset, deleteAsset } = useAssets();

// Get current user session
const currentUserId = ref<string | null>(null);

const asset = ref<Asset | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const copied = ref(false);
const signedUrl = ref<string>('');
const mediaErrorRetried = ref(false);
const saving = ref(false);
const showDeleteModal = ref(false);
const deleting = ref(false);

// Check if current user can manage this asset
const canManage = computed(() => {
  return !!currentUserId.value && !!asset.value && asset.value.ownerId === currentUserId.value;
});

const editForm = ref({
  title: '',
  description: '',
  tagsString: '',
});

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
      resetForm();
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load asset';
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  if (asset.value) {
    editForm.value.title = asset.value.title || '';
    editForm.value.description = asset.value.description || '';
    editForm.value.tagsString = asset.value.tags?.join(', ') || '';
  }
};

const saveAsset = async () => {
  if (!asset.value) return;

  try {
    saving.value = true;
    
    const tags = editForm.value.tagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const updated = await updateAsset(asset.value.id, {
      title: editForm.value.title || undefined,
      description: editForm.value.description || undefined,
      tags,
    });

    if (updated) {
      asset.value = { ...asset.value, ...updated };
    }
    
    // Show success toast (simple alert for now)
    alert('保存しました');
  } catch (e) {
    const message = e instanceof Error ? e.message : '保存に失敗しました';
    alert(message);
  } finally {
    saving.value = false;
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

const formatPrimaryTag = (tag: string): string => {
  const labels: Record<string, string> = {
    'IMAGE_BG': '背景',
    'IMAGE_CG': '一枚絵',
    'IMAGE_OTHER': 'その他（画像）',
    'AUDIO_BGM': 'BGM',
    'AUDIO_SE': '効果音',
    'AUDIO_VOICE': 'ボイス',
    'AUDIO_OTHER': 'その他（音声）',
  };
  return labels[tag] || tag;
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

const confirmDelete = () => {
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!asset.value) return;

  try {
    deleting.value = true;
    await deleteAsset(asset.value.id);
    
    // Redirect to assets list
    await router.push('/assets');
  } catch (e) {
    const message = e instanceof Error ? e.message : '削除に失敗しました';
    alert(message);
    deleting.value = false;
  }
};

// Load asset on mount and get current user session
onMounted(async () => {
  // Get current user session
  const { data } = await supabase.auth.getSession();
  currentUserId.value = data?.session?.user?.id ?? null;
  
  // Load asset
  loadAsset();
});

useHead({
  title: () => asset.value ? `${asset.value.title || 'Asset'} - Talking` : 'Asset - Talking',
});
</script>
