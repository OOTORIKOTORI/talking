<script setup lang="ts">
defineProps<{
  saving: boolean
}>()
const emit = defineEmits<{
  'save': []
  'save-and-create-next': []
}>()
</script>

<template>
  <div class="flex gap-2 border-t pt-3">
    <button
      class="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400"
      :disabled="saving"
      @click="emit('save')"
    >
      {{ saving ? '保存中...' : '保存' }}
    </button>
    <button
      class="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400"
      :disabled="saving"
      @click="emit('save-and-create-next')"
    >
      {{ saving ? '保存中...' : '保存して次のノードへ' }}
    </button>
  </div>
</template>
