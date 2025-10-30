<template>
  <teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" @click.self="close">
  <img :src="src || ''" :alt="alt" class="max-h-[90vh] max-w-[90vw] object-contain" @load="onLoad" />
      <button class="absolute top-4 right-4 text-white text-2xl" @click="close">×</button>
    </div>
  </teleport>
</template>
<script setup lang="ts">
const props = defineProps<{ open: boolean; src: string | null; alt?: string }>()
const emit = defineEmits<{ close: [] }>()
const close = () => emit('close')
const onLoad = () => {} // 余白
onMounted(() => { window.addEventListener('keydown', onKey) })
onUnmounted(() => { window.removeEventListener('keydown', onKey) })
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') emit('close') }
</script>
