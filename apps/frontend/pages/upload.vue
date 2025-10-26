<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-4">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">ファイルアップロード</h1>
        <div class="flex space-x-4">
          <NuxtLink
            to="/assets"
            class="text-blue-600 hover:text-blue-700 font-medium"
          >
            アセット一覧
          </NuxtLink>
          <NuxtLink
            to="/"
            class="text-gray-600 hover:text-gray-700 font-medium"
          >
            ホーム
          </NuxtLink>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 space-y-6">
        <!-- Title Input -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            タイトル（任意）
          </label>
          <input
            id="title"
            v-model="title"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ファイルのタイトルを入力"
          />
        </div>

        <!-- File Upload Area -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            ファイルを選択
          </label>
          <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
            :class="{ 'border-blue-500 bg-blue-50': isDragging }"
            @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*,audio/*"
              class="hidden"
              @change="handleFileSelect"
            />
            <div v-if="!selectedFile">
              <svg
                class="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <p class="mt-2 text-sm text-gray-600">
                ファイルをドラッグ＆ドロップ、または
                <button
                  type="button"
                  class="text-blue-600 hover:text-blue-700 font-medium"
                  @click="fileInput?.click()"
                >
                  参照
                </button>
              </p>
              <p class="mt-1 text-xs text-gray-500">画像・音声ファイル対応</p>
            </div>
            <div v-else class="text-left">
              <p class="text-sm font-medium text-gray-900">{{ selectedFile.name }}</p>
              <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
              <button
                type="button"
                class="mt-2 text-sm text-red-600 hover:text-red-700"
                @click="selectedFile = null"
              >
                削除
              </button>
            </div>
          </div>
        </div>

        <!-- Upload Button -->
        <button
          type="button"
          :disabled="!selectedFile || uploading"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          @click="handleUpload"
        >
          {{ uploading ? 'アップロード中...' : 'アップロード' }}
        </button>

        <!-- Error Message -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>

        <!-- Success Message with Preview -->
        <div v-if="uploadResult" class="p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
          <p class="text-sm text-green-800 font-medium">アップロードと保存が完了しました</p>
          <div>
            <label class="block text-xs text-gray-600 mb-1">表示用URL（有効期限あり）:</label>
            <div class="flex items-center space-x-2">
              <input
                type="text"
                readonly
                :value="uploadResult.signedUrl"
                class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 text-gray-700"
              />
              <button
                type="button"
                @click="refreshUploadSignedUrl"
                class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
              >
                再取得
              </button>
            </div>
          </div>

          <!-- Preview -->
          <div v-if="uploadResult.fileType.startsWith('image/')" class="mt-4">
            <p class="text-xs text-gray-600 mb-2">プレビュー:</p>
            <img
              :src="uploadResult.signedUrl"
              :alt="title || 'プレビュー'"
              class="max-w-full h-auto rounded-lg border border-gray-200"
              @error="handleUploadMediaError"
            />
          </div>
          <div v-else-if="uploadResult.fileType.startsWith('audio/')" class="mt-4">
            <p class="text-xs text-gray-600 mb-2">プレビュー:</p>
            <audio controls class="w-full" @error="handleUploadMediaError">
              <source :src="uploadResult.signedUrl" :type="uploadResult.fileType" />
            </audio>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getSignedGetUrl } from '@/composables/useSignedUrl';

const title = ref('')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const uploading = ref(false)
const error = ref('')
const uploadResult = ref<{ publicUrl: string; key: string; fileType: string; signedUrl?: string } | null>(null)
const uploadMediaErrorRetried = ref(false)

const { uploadFile } = useUploader()

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    uploadResult.value = null
    error.value = ''
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    selectedFile.value = event.dataTransfer.files[0]
    uploadResult.value = null
    error.value = ''
  }
}

async function handleUpload() {
  if (!selectedFile.value) return

  uploading.value = true
  error.value = ''
  uploadResult.value = null
  uploadMediaErrorRetried.value = false

  try {
    const result = await uploadFile(selectedFile.value, title.value || undefined)
    uploadResult.value = {
      ...result,
      fileType: selectedFile.value.type
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'アップロードに失敗しました'
  } finally {
    uploading.value = false
  }
}

async function refreshUploadSignedUrl() {
  if (!uploadResult.value) return;
  try {
    const newSignedUrl = await getSignedGetUrl(uploadResult.value.key);
    uploadResult.value.signedUrl = newSignedUrl;
    uploadMediaErrorRetried.value = false;
  } catch (err) {
    console.error('Failed to refresh signed URL', err);
  }
}

async function handleUploadMediaError() {
  if (uploadMediaErrorRetried.value || !uploadResult.value) return;
  uploadMediaErrorRetried.value = true;
  await refreshUploadSignedUrl();
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>
