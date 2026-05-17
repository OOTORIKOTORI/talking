<script setup lang="ts">
defineProps<{
  sectionOpen: Record<string, boolean>
}>()
const emit = defineEmits<{
  'toggle-dangerous': []
  'delete-current-node': []
}>()
</script>

<template>
  <div>
    <!-- 危険操作セクション -->
    <div class="editor-section-header" @click="emit('toggle-dangerous')">
      <span class="editor-section-title">
        <span class="editor-section-toggle">{{ sectionOpen.dangerous ? '▼' : '▶' }}</span>
        危険操作
      </span>
    </div>
    <div v-if="sectionOpen.dangerous" class="border-t pt-3">
      <div class="text-sm font-medium mb-2 text-gray-700">ノード操作</div>
      <button
        class="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        @click="emit('delete-current-node')"
        aria-label="このノードを削除"
      >
        このノードを削除
      </button>
    </div>
  </div>
</template>

<style scoped>
/* edit.vue の scoped スタイルと同定義。セクション見出しを NodeDangerZone 内で使用するため複製 */
.editor-section-header {
  display: flex;
  cursor: pointer;
  margin: 1rem 0 0.75rem 0;
  border-top: 1px solid #e5e7eb;
  padding-top: 0.75rem;
  user-select: none;
}
.editor-section-header:hover {
  opacity: 0.8;
}
.editor-section-title {
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  color: #1f2937;
}
.editor-section-toggle {
  display: inline-block;
  width: 1.25rem;
  text-align: center;
  font-size: 0.75rem;
  transition: color 0.2s;
  color: #6b7280;
}
</style>
