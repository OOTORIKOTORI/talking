<script setup lang="ts">
import type { BacklogEntry, BacklogTheme } from '@talking/types'
import { resolveBacklogPreset } from '@talking/types'
import { computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  isOpen: boolean
  entries: BacklogEntry[]
  theme: BacklogTheme
}>()

const emit = defineEmits<{ close: [] }>()

const resolved = computed(() => resolveBacklogPreset(props.theme?.preset ?? 5))

const modalStyle = computed(() => ({
  background: props.theme?.bgColor || resolved.value.bgColor,
  fontSize: `${props.theme?.fontSize || resolved.value.fontSize}px`,
  color: props.theme?.textColor || '#e8e8e8',
}))

const speakerStyle = computed(() => ({
  color: props.theme?.speakerColor || '#ffd700',
  fontWeight: 'bold',
  marginBottom: '2px',
  display: 'block',
}))

const reversedEntries = computed(() => [...(props.entries ?? [])].reverse())

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) emit('close')
}

onMounted(() => document.addEventListener('keyup', onKey))
onUnmounted(() => document.removeEventListener('keyup', onKey))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="backlog-overlay"
      @click.self="emit('close')"
    >
      <div class="backlog-modal" :style="modalStyle">
        <div class="backlog-header">
          <span>バックログ</span>
          <button class="backlog-close" @click="emit('close')">✕</button>
        </div>
        <div class="backlog-body">
          <div
            v-for="(entry, i) in reversedEntries"
            :key="`${entry.nodeId}-${i}`"
            class="backlog-entry"
          >
            <span v-if="entry.speakerName" :style="speakerStyle">
              {{ entry.speakerName }}
            </span>
            <p class="backlog-text">{{ entry.text }}</p>
          </div>
          <p v-if="reversedEntries.length === 0" class="backlog-empty">
            まだログがありません
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backlog-overlay {
  position: fixed;
  inset: 0;
  z-index: 220;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
}

.backlog-modal {
  width: min(680px, 85vw);
  height: 70vh;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
}

.backlog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  font-weight: bold;
}

.backlog-close {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  font-size: 1.1rem;
  line-height: 1;
}

.backlog-body {
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.backlog-entry {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 10px;
}

.backlog-text {
  margin: 0;
  line-height: 1.7;
  white-space: pre-wrap;
}

.backlog-empty {
  text-align: center;
  opacity: 0.5;
  margin: 24px 0;
}
</style>
