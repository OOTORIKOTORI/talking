<template>
  <div class="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">
          Talking
        </h1>
        <p class="text-gray-600">
          Audio Conversation Platform
        </p>
      </div>

      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-800">
            API Health Status
          </h2>
          <span
            v-if="!pending"
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
            :class="healthStatus.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
          >
            <span
              class="w-2 h-2 mr-2 rounded-full"
              :class="healthStatus.ok ? 'bg-green-400' : 'bg-red-400'"
            ></span>
            {{ healthStatus.ok ? 'Healthy' : 'Unhealthy' }}
          </span>
        </div>

        <div v-if="pending" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Checking API...</span>
        </div>

        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Connection Error</h3>
              <p class="mt-1 text-sm text-red-700">{{ error.message }}</p>
            </div>
          </div>
        </div>

        <div v-else-if="data" class="space-y-3">
          <div class="bg-gray-50 border border-gray-200 rounded-md p-4">
            <div class="text-sm text-gray-700">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <span class="font-medium">Status:</span>
                  <span class="ml-2">{{ data.status || 'OK' }}</span>
                </div>
                <div v-if="data.timestamp">
                  <span class="font-medium">Timestamp:</span>
                  <span class="ml-2">{{ new Date(data.timestamp).toLocaleTimeString() }}</span>
                </div>
              </div>
              <details class="mt-3">
                <summary class="cursor-pointer text-gray-600 hover:text-gray-900">
                  View full response
                </summary>
                <pre class="bg-white rounded p-2 mt-2 overflow-x-auto text-xs">{{ JSON.stringify(data, null, 2) }}</pre>
              </details>
            </div>
          </div>
        </div>

        <div class="mt-4 text-sm text-gray-500">
          <p>API Base URL: <code class="bg-gray-100 px-2 py-1 rounded">{{ config.public.apiBase }}</code></p>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">
          Quick Links
        </h2>
        <div class="grid grid-cols-1 gap-3">
          <NuxtLink
            to="/upload"
            class="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group"
          >
            <div>
              <h3 class="font-medium text-blue-900">Upload Files</h3>
              <p class="text-sm text-blue-700">Upload images and audio files to S3/MinIO</p>
            </div>
            <svg
              class="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

const { data, pending, error } = await useFetch(`${config.public.apiBase}/health`, {
  method: 'GET'
})

const healthStatus = computed(() => {
  if (data.value && typeof data.value === 'object' && 'ok' in data.value) {
    return { ok: data.value.ok }
  }
  return { ok: !error.value && !pending.value }
})
</script>
