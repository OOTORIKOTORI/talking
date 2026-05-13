<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-bold text-gray-900">素材詳細</h1>
          <NuxtLink
            to="/assets"
            class="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← 素材一覧に戻る
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

          <!-- Owner Management -->
          <div class="border-t pt-6 space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">管理</h3>

            <div class="space-y-2">
              <dt class="text-sm font-medium text-gray-500">表示用URL（有効期限あり）</dt>
              <dd class="flex flex-col sm:flex-row gap-2">
                <input
                  :value="signedUrl"
                  readonly
                  class="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-mono text-gray-700"
                />
                <button
                  @click="copyUrl"
                  :disabled="!signedUrl"
                  class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {{ copied ? 'Copied!' : 'Copy' }}
                </button>
                <button
                  @click="refreshSignedUrl"
                  :disabled="refreshingSignedUrl"
                  class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {{ refreshingSignedUrl ? '再取得中...' : '再取得' }}
                </button>
              </dd>
            </div>

            <div class="space-y-2">
              <dt class="text-sm font-medium text-gray-500">アクション</dt>
              <dd class="flex flex-wrap gap-2">
                <a
                  v-if="signedUrl"
                  :href="signedUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Open in New Tab
                </a>

                <a
                  v-if="signedUrl"
                  :href="signedUrl"
                  download
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Download
                </a>

                <button
                  v-if="canManage"
                  @click="showEditModal = true"
                  class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
                >
                  編集
                </button>

                <button
                  v-if="canManage"
                  @click="confirmDelete"
                  class="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                >
                  削除
                </button>
              </dd>
            </div>
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
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-lg font-medium text-gray-900 mb-2">素材を削除</h3>
            <p class="text-sm text-gray-500 mb-4">
              この素材を削除してよろしいですか？ 削除後しばらくは、「元に戻す」が可能です。
            </p>

            <div class="mb-4">
              <div v-if="usageImpactLoading" class="text-sm text-gray-500 italic">
                利用中ゲームへの影響を確認中...
              </div>
              <div v-else-if="usageImpactError" class="text-sm text-amber-700 bg-amber-50 rounded p-3">
                影響確認に失敗しました。削除は可能ですが、利用中ゲームがある可能性があります。
              </div>
              <div v-else-if="usageImpact">
                <div v-if="usageImpact.totalGameCount === 0" class="text-sm text-gray-500">
                  この素材を参照しているゲームは見つかりませんでした。
                </div>
                <div v-else class="text-sm space-y-2">
                  <p class="text-amber-700 font-medium">この素材はゲーム内で使用されています。</p>
                  <div class="bg-amber-50 rounded p-3 space-y-1 text-xs">
                    <div class="flex flex-wrap gap-4">
                      <span>あなたのゲーム: <strong>{{ usageImpact.ownGameCount }}件 / {{ usageImpact.ownReferenceCount }}参照</strong></span>
                      <span>他ユーザーのゲーム: <strong>{{ usageImpact.otherGameCount }}件 / {{ usageImpact.otherReferenceCount }}参照</strong></span>
                    </div>
                    <div class="text-gray-600">用途別: {{ formatByField(usageImpact.byField) }}</div>
                  </div>
                  <div v-if="usageImpact.ownGameSamples?.length > 0" class="mt-2">
                    <p class="text-xs font-medium text-gray-700 mb-1">あなたのゲームでの使用例（最大{{ usageImpact.sampleLimit }}件）</p>
                    <ul class="text-xs text-gray-600 space-y-0.5">
                      <li v-for="g in usageImpact.ownGameSamples" :key="g.gameId">
                        ・{{ g.title }}: {{ formatByFieldShort(g.byField) }}
                      </li>
                    </ul>
                    <p v-if="usageImpact.hasMoreOwnGames" class="text-xs text-gray-400 mt-1">他にも使用中のゲームがあります。</p>
                  </div>
                </div>
              </div>
            </div>

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

    <!-- Edit Modal -->
    <EditAssetModal
      :show="showEditModal"
      :asset="asset"
      @close="showEditModal = false"
      @success="handleSavedFromEdit"
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

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient() as any;
const { getAsset, deleteAsset, restoreAsset, getUsageImpact } = useAssets();
const { toggle } = useFavoriteToggle();
const toast = useToast();

const currentUserId = ref<string | null>(null);
const asset = ref<Asset | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const copied = ref(false);
const signedUrl = ref<string>('');
const mediaErrorRetried = ref(false);
const refreshingSignedUrl = ref(false);
const favoriteToggling = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const deleting = ref(false);
const usageImpact = ref<any>(null);
const usageImpactLoading = ref(false);
const usageImpactError = ref(false);

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
      mediaErrorRetried.value = false;
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
    await toggle(asset.value as any);
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'お気に入り更新に失敗しました');
  } finally {
    favoriteToggling.value = false;
  }
};

const refreshSignedUrl = async () => {
  if (!asset.value) return;
  try {
    refreshingSignedUrl.value = true;
    signedUrl.value = await getSignedGetUrl(asset.value.key);
    mediaErrorRetried.value = false;
  } catch (e) {
    console.error('Failed to refresh signed URL', e);
    toast.error('表示用URLの再取得に失敗しました');
  } finally {
    refreshingSignedUrl.value = false;
  }
};

const handleMediaError = async () => {
  if (mediaErrorRetried.value || !asset.value) return;
  mediaErrorRetried.value = true;
  await refreshSignedUrl();
};

const getFileExtension = (contentType: string): string => {
  const parts = contentType.split('/');
  return parts[1]?.toUpperCase() || 'FILE';
};

const copyUrl = async () => {
  if (!signedUrl.value) return;
  try {
    await navigator.clipboard.writeText(signedUrl.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (e) {
    console.error('Failed to copy URL', e);
    toast.error('URLのコピーに失敗しました');
  }
};

const formatByField = (byField: Record<string, number> | undefined) => {
  if (!byField) return 'なし';
  const labels: Record<string, string> = {
    coverAssetId: 'カバー',
    bgAssetId: '背景',
    musicAssetId: 'BGM',
    sfxAssetId: 'SE',
    portraitAssetId: '立ち絵',
  };
  return Object.entries(byField)
    .filter(([, v]) => Number(v) > 0)
    .map(([k, v]) => `${labels[k] ?? k} ${v}`)
    .join(' / ') || 'なし';
};

const formatByFieldShort = (byField: Record<string, number> | undefined) => {
  if (!byField) return 'なし';
  const labels: Record<string, string> = {
    coverAssetId: 'カバー',
    bgAssetId: '背景',
    musicAssetId: 'BGM',
    sfxAssetId: 'SE',
    portraitAssetId: '立ち絵',
  };
  const parts = Object.entries(byField)
    .filter(([, v]) => Number(v) > 0)
    .map(([k, v]) => `${labels[k] ?? k} ${v}参照`);
  return parts.join(' / ') || 'なし';
};

const confirmDelete = async () => {
  usageImpact.value = null;
  usageImpactError.value = false;
  showDeleteModal.value = true;
  if (!asset.value) return;

  usageImpactLoading.value = true;
  try {
    usageImpact.value = await getUsageImpact(asset.value.id);
  } catch {
    usageImpactError.value = true;
  } finally {
    usageImpactLoading.value = false;
  }
};

const handleDelete = async () => {
  if (!asset.value) return;

  try {
    deleting.value = true;
    const assetId = asset.value.id;
    const assetTitle = asset.value.title || 'アセット';

    await deleteAsset(asset.value.id);
    showDeleteModal.value = false;

    toast.info(`${assetTitle}を削除しました`, {
      duration: 5000,
      action: {
        label: '元に戻す',
        onClick: async () => {
          try {
            await restoreAsset(assetId);
            toast.success('復元しました');
            await loadAsset();
          } catch {
            toast.error('復元に失敗しました');
          }
        }
      }
    });

    setTimeout(() => {
      router.push('/assets');
    }, 500);
  } catch (e) {
    const message = e instanceof Error ? e.message : '削除に失敗しました';
    toast.error(message);
    deleting.value = false;
  }
};

const handleSavedFromEdit = async () => {
  showEditModal.value = false;
  await loadAsset();
};

onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  currentUserId.value = data?.session?.user?.id ?? null;
  loadAsset();
});

useHead({
  title: () => asset.value ? `${asset.value.title || '素材'} - Talking` : '素材 - Talking',
});
</script>
