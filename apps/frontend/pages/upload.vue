<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-4">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Upload File</h1>
        <div class="flex space-x-4">
          <NuxtLink
            to="/assets"
            class="text-blue-600 hover:text-blue-700 font-medium"
          >
            View Assets
          </NuxtLink>
          <NuxtLink
            to="/"
            class="text-gray-600 hover:text-gray-700 font-medium"
          >
            Home
          </NuxtLink>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 space-y-6">
        <!-- Title Input -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            Title (Optional)
          </label>
          <input
            id="title"
            v-model="title"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter a title for your file"
          />
        </div>

        <!-- File Upload Area -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Select File
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
                Drag and drop your file here, or
                <button
                  type="button"
                  class="text-blue-600 hover:text-blue-700 font-medium"
                  @click="fileInput?.click()"
                >
                  browse
                </button>
              </p>
              <p class="mt-1 text-xs text-gray-500">Images and audio files supported</p>
            </div>
            <div v-else class="text-left">
              <p class="text-sm font-medium text-gray-900">{{ selectedFile.name }}</p>
              <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
              <button
                type="button"
                class="mt-2 text-sm text-red-600 hover:text-red-700"
                @click="selectedFile = null"
              >
                Remove
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
          {{ uploading ? 'Uploading...' : 'Upload' }}
        </button>

        <!-- Error Message -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>

        <!-- Success Message with Preview -->
        <div v-if="uploadResult" class="p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
          <p class="text-sm text-green-800 font-medium">Upload successful!</p>
          <div>
            <p class="text-xs text-gray-600 mb-1">Public URL:</p>
            <a
              :href="uploadResult.publicUrl"
              target="_blank"
              class="text-sm text-blue-600 hover:text-blue-700 break-all"
            >
              {{ uploadResult.publicUrl }}
            </a>
          </div>

          <!-- Preview -->
          <div v-if="uploadResult.fileType.startsWith('image/')" class="mt-4">
            <p class="text-xs text-gray-600 mb-2">Preview:</p>
            <img
              :src="uploadResult.publicUrl"
              :alt="title || 'Uploaded image'"
              class="max-w-full h-auto rounded-lg border border-gray-200"
            />
          </div>
          <div v-else-if="uploadResult.fileType.startsWith('audio/')" class="mt-4">
            <p class="text-xs text-gray-600 mb-2">Preview:</p>
            <audio controls class="w-full">
              <source :src="uploadResult.publicUrl" :type="uploadResult.fileType" />
            </audio>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const title = ref('')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const uploading = ref(false)
const error = ref('')
const uploadResult = ref<{ publicUrl: string; key: string; fileType: string } | null>(null)

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

  try {
    const result = await uploadFile(selectedFile.value)
    uploadResult.value = {
      ...result,
      fileType: selectedFile.value.type
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Upload failed'
  } finally {
    uploading.value = false
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>
