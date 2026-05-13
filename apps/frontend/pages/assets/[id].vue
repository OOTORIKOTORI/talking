<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-bold text-gray-900">アセット詳細</h1>
          <NuxtLink
            to="/assets"
            class="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← アセット一覧に戻る
          </NuxtLink>
        </div>
        <TabsSwitch :items="[{ label: 'アセット', to: '/assets' }, { label: 'キャラクター', to: '/characters' }]" />
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
            <div class="mt-2">
              <span
                class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded"
                :class="asset.isPublic === false ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'"
              >
                {{ asset.isPublic === false ? '非公開' : '公開' }}
              </span>
            </div>
            <div class="mt-3 flex items-center gap-3">
              <button
                @click="toggleAssetFavorite"
                :disabled="favoriteToggling"
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors disabled:opacity-50"
                :class="isFavorited ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'"
              >
                <span aria-hidden="true">{{ isFavorited ? '♥' : '♡' }}</span>
                <span>{{ isFavorited ? 'お気に入り済み' : 'お気に入り' }}</span>
              </button>
              <span class="text-sm text-gray-500">お気に入り {{ displayFavoriteCount }}</span>
            </div>
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

          <!-- Edit Button -->
          <div v-if="canManage" class="mt-6">
            <button
              @click="showEditModal = true"
              class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              編集
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Edit Modal -->
    <EditAssetModal
      v-if="showEditModal"
      :asset="asset"
      @close="showEditModal = false"
      @saved="loadAsset"
    />
  </div>
</template>

<script setup lang="ts">
import type { Asset } from '@talking/types';
import { getSignedGetUrl } from '@/composables/useSignedUrl';
import TabsSwitch from '@/components/common/TabsSwitch.vue';
import EditAssetModal from '@/components/EditAssetModal.vue';
import { useToast } from '@/composables/useToast';
import { useFavoriteToggle } from '@/composables/useFavoriteToggle';
import { formatCreatorLabel } from '@/utils/creatorDisplay';

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient() as any;
const { getAsset } = useAssets();
const toast = useToast();

const currentUserId = ref<string | null>(null);
const asset = ref<Asset | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const signedUrl = ref<string>('');
const favoriteToggling = ref(false);
const showEditModal = ref(false);

const isFavorited = computed(() => {
  if (!asset.value) return false;
  return !!(asset.value.isFavorite ?? asset.value.isFavorited);
});

const displayFavoriteCount = computed(() => {
  if (!asset.value) return 0;
  const count = Number(asset.value.favoriteCount ?? 0);
  return Number.isFinite(count) && count > 0 ? count : 0;
});

const canManage = computed(() => {
  return !!currentUserId.value && !!asset.value && asset.value.ownerId === currentUserId.value;
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
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load asset';
  } finally {
    loading.value = false;
  }
};

const toggleAssetFavorite = async () => {
  if (!asset.value || favoriteToggling.value) return;
  favoriteToggling.value = true;
  try {
    await useFavoriteToggle().toggle(asset.value as any);
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'お気に入り更新に失敗しました');
  } finally {
    favoriteToggling.value = false;
  }
};

onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  currentUserId.value = data?.session?.user?.id ?? null;
  loadAsset();
});

useHead({
  title: () => asset.value ? `${asset.value.title || 'Asset'} - Talking` : 'Asset - Talking',
});
</script>
