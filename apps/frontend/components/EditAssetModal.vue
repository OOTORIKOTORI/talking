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
                アセットを編集
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
                  placeholder="アセットのタイトル"
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
                  placeholder="アセットの説明"
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
                  :disabled="saving || !formData.primaryTag"
                >
                  <span v-if="saving">保存中...</span>
                  <span v-else>保存</span>
                </button>
              </div>
            </form>
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
});

const tagsInput = ref('');
const saving = ref(false);
const errorMessage = ref('');
const primaryTagError = ref('');

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
    };
    tagsInput.value = (asset.tags || []).join(', ');
  }
}, { immediate: true });

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
    emit('close');
  }
};

const handleSubmit = async () => {
  if (!props.asset) return;

  // Validate primary tag
  if (!validatePrimaryTag(formData.value.primaryTag, props.asset.contentType)) {
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
    };

    const updatedAsset = await $api<Asset>(`/assets/${props.asset.id}`, {
      method: 'PATCH',
      body: updateData,
    });

    emit('success', updatedAsset);
    close();

    // Show success toast (you can implement a toast system later)
    console.log('保存しました');
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
