<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

        <!-- Modal -->
        <div class="flex min-h-screen items-center justify-center p-4">
          <div
            class="relative w-full max-w-2xl bg-white rounded-lg shadow-xl"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b">
              <h3 class="text-xl font-semibold text-gray-900">
                素材を編集
              </h3>
              <button
                @click="close"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
              <!-- Title -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  タイトル
                </label>
                <input
                  v-model="formData.title"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="素材のタイトル"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  説明
                </label>
                <textarea
                  v-model="formData.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="素材の説明"
                />
              </div>

              <!-- Primary Tag -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  必須タグ <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.primaryTag"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="" disabled>選択してください</option>
                  <option
                    v-for="tag in availablePrimaryTags"
                    :key="tag.value"
                    :value="tag.value"
                  >
                    {{ tag.label }}
                  </option>
                </select>
                <p v-if="primaryTagError" class="mt-1 text-sm text-red-600">
                  {{ primaryTagError }}
                </p>
              </div>

              <!-- Tags -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  自由タグ（カンマ区切り）
                </label>
                <input
                  v-model="tagsInput"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例: 森, 夜, 戦闘"
                />
                <p class="mt-1 text-sm text-gray-500">
                  カンマで区切って複数のタグを入力できます
                </p>
              </div>

              <div class="flex items-center gap-3">
                <input
                  id="asset-public"
                  v-model="formData.isPublic"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label for="asset-public" class="text-sm font-medium text-gray-700">
                  公開する
                </label>
              </div>

              <!-- Error Message -->
              <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4">
                <p class="text-sm text-red-800">{{ errorMessage }}</p>
              </div>

              <!-- Actions -->
              <div class="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  @click="close"
                  class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  :disabled="saving"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="saving || privateImpactLoading || !formData.primaryTag"
                >
                  <span v-if="saving">保存中...</span>
                  <span v-else-if="privateImpactLoading">確認中...</span>
                  <span v-else>保存</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div
          v-if="showPrivateImpactModal"
          class="fixed inset-0 z-[60] bg-gray-500 bg-opacity-75 flex items-center justify-center"
          @click.self="showPrivateImpactModal = false"
        >
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900">この素材を非公開にしますか？</h3>
                <p class="mt-2 text-sm text-gray-600">
                  この素材を非公開にすると、公開中ゲームの公開前チェックやクレジット確認で「非公開素材」として警告されます。
                </p>
                <p class="mt-1 text-sm text-gray-600">
                  必要に応じて、ゲーム側で別の素材に差し替えてください。
                </p>

                <div v-if="privateImpactError" class="mt-4 rounded p-3 text-sm bg-amber-50 text-amber-700">
                  利用影響の取得に失敗しました。内容確認なしでも続行できますが、利用中ゲームがある可能性があります。
                </div>

                <div v-else-if="privateImpact" class="mt-4 space-y-3">
                  <div v-if="hasPublicUsage" class="rounded p-3 text-sm bg-amber-100 text-amber-900">
                    公開中のゲームで使用されています（{{ privateImpact.publicGameCount }}件）。
                  </div>
                  <div v-else class="rounded p-3 text-sm bg-blue-50 text-blue-800">
                    自分のゲームで使用されています（公開中ゲームでの使用はありません）。
                  </div>

                  <div class="bg-gray-50 rounded p-3 text-xs text-gray-700 space-y-1">
                    <p>参照中ゲーム: {{ privateImpact.totalGameCount }}件</p>
                    <p>使用箇所数: {{ privateImpact.totalReferenceCount }}箇所</p>
                  </div>

                  <div v-if="privateImpact.ownGameSamples?.length" class="space-y-1">
                    <p class="text-xs font-medium text-gray-700">あなたのゲームでの使用例（最大{{ privateImpact.sampleLimit }}件）:</p>
                    <ul class="text-xs text-gray-600 space-y-1">
                      <li v-for="g in privateImpact.ownGameSamples" :key="g.gameId" class="flex flex-wrap gap-2">
                        <span>{{ g.title }}</span>
                        <span class="rounded px-2 py-0.5" :class="g.isPublic ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'">
                          {{ g.isPublic ? '公開中' : '非公開' }}
                        </span>
                        <span>{{ g.referenceCount }}箇所</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="mt-5 flex gap-3">
                  <button
                    type="button"
                    class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    :disabled="saving"
                    @click="showPrivateImpactModal = false"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    class="flex-1 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
                    :disabled="saving"
                    @click="confirmPrivateAndSave"
                  >
                    非公開にして保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Asset } from '@talking/types';

interface Props {
  show: boolean;
  asset: Asset | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'success', asset: Asset): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { $api } = useNuxtApp();

const formData = ref({
  title: '',
  description: '',
  primaryTag: '',
  tags: [] as string[],
  isPublic: true,
});

const tagsInput = ref('');
const saving = ref(false);
const errorMessage = ref('');
const primaryTagError = ref('');
const showPrivateImpactModal = ref(false);
const privateImpact = ref<any>(null);
const privateImpactError = ref(false);
const privateImpactLoading = ref(false);
const privateImpactConfirmed = ref(false);

const hasPublicUsage = computed(() => {
  if (!privateImpact.value) return false;
  return Number(privateImpact.value.publicGameCount || 0) > 0;
});

// Available primary tags based on content type
const availablePrimaryTags = computed(() => {
  if (!props.asset) return [];

  const isImage = props.asset.contentType.startsWith('image/');
  const isAudio = props.asset.contentType.startsWith('audio/');

  if (isImage) {
    return [
      { value: 'IMAGE_BG', label: '背景' },
      { value: 'IMAGE_CG', label: '一枚絵' },
      { value: 'IMAGE_OTHER', label: 'その他' },
    ];
  }

  if (isAudio) {
    return [
      { value: 'AUDIO_BGM', label: 'BGM' },
      { value: 'AUDIO_SE', label: '効果音' },
      { value: 'AUDIO_VOICE', label: 'ボイス' },
      { value: 'AUDIO_OTHER', label: 'その他' },
    ];
  }

  return [];
});

// Validate primary tag against content type
const validatePrimaryTag = (tag: string, contentType: string): boolean => {
  const isImage = contentType.startsWith('image/');
  const isAudio = contentType.startsWith('audio/');

  if (isImage && !tag.startsWith('IMAGE_')) {
    primaryTagError.value = '画像ファイルには IMAGE_ で始まるタグを選択してください';
    return false;
  }

  if (isAudio && !tag.startsWith('AUDIO_')) {
    primaryTagError.value = '音声ファイルには AUDIO_ で始まるタグを選択してください';
    return false;
  }

  primaryTagError.value = '';
  return true;
};

// Initialize form when asset changes
watch(() => props.asset, (asset) => {
  if (asset) {
    formData.value = {
      title: asset.title || '',
      description: asset.description || '',
      primaryTag: asset.primaryTag,
      tags: asset.tags || [],
      isPublic: asset.isPublic !== false,
    };
    tagsInput.value = (asset.tags || []).join(', ');
    privateImpactConfirmed.value = false;
    privateImpact.value = null;
    privateImpactError.value = false;
    showPrivateImpactModal.value = false;
  }
}, { immediate: true });

watch(() => formData.value.isPublic, () => {
  privateImpactConfirmed.value = false;
});

// Watch primaryTag for validation
watch(() => formData.value.primaryTag, (newTag) => {
  if (newTag && props.asset) {
    validatePrimaryTag(newTag, props.asset.contentType);
  }
});

const close = () => {
  if (!saving.value) {
    errorMessage.value = '';
    primaryTagError.value = '';
    showPrivateImpactModal.value = false;
    emit('close');
  }
};

const shouldCheckPrivateImpact = () => {
  if (!props.asset) return false;
  const wasPublic = props.asset.isPublic !== false;
  return wasPublic && formData.value.isPublic === false;
};

const checkPrivateImpactBeforeSave = async (): Promise<boolean> => {
  if (!props.asset || !shouldCheckPrivateImpact() || privateImpactConfirmed.value) {
    return true;
  }

  privateImpact.value = null;
  privateImpactError.value = false;
  privateImpactLoading.value = true;

  try {
    const impact = await $api<any>(`/assets/${props.asset.id}/usage-impact`);
    if (!impact || Number(impact.totalGameCount || 0) === 0) {
      privateImpactConfirmed.value = true;
      return true;
    }
    privateImpact.value = impact;
    showPrivateImpactModal.value = true;
    return false;
  } catch {
    privateImpactError.value = true;
    showPrivateImpactModal.value = true;
    return false;
  } finally {
    privateImpactLoading.value = false;
  }
};

const confirmPrivateAndSave = async () => {
  showPrivateImpactModal.value = false;
  privateImpactConfirmed.value = true;
  await handleSubmit();
};

const handleSubmit = async () => {
  if (!props.asset) return;
  if (saving.value || privateImpactLoading.value) return;

  // Validate primary tag
  if (!validatePrimaryTag(formData.value.primaryTag, props.asset.contentType)) {
    return;
  }

  if (!(await checkPrivateImpactBeforeSave())) {
    return;
  }

  try {
    saving.value = true;
    errorMessage.value = '';

    // Parse tags from input
    const tags = tagsInput.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const updateData = {
      title: formData.value.title || undefined,
      description: formData.value.description || undefined,
      primaryTag: formData.value.primaryTag,
      tags,
      isPublic: formData.value.isPublic,
    };

    const updatedAsset = await $api<Asset>(`/assets/${props.asset.id}`, {
      method: 'PATCH',
      body: updateData,
    });

    emit('success', updatedAsset);
    close();
  } catch (error: any) {
    console.error('Failed to update asset:', error);

    if (error.statusCode === 401 || error.statusCode === 403) {
      errorMessage.value = '権限がありません';
    } else if (error.statusCode === 400) {
      errorMessage.value = '入力を確認してください';
    } else {
      errorMessage.value = '保存に失敗しました。もう一度お試しください。';
    }
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
