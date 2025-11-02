<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto bg-white shadow-lg rounded-lg p-4 min-w-[300px] flex items-center justify-between border"
          :class="{
            'border-blue-500': toast.type === 'info',
            'border-green-500': toast.type === 'success',
            'border-red-500': toast.type === 'error',
            'border-yellow-500': toast.type === 'warning',
          }"
        >
          <span class="text-sm">{{ toast.message }}</span>
          <button
            v-if="toast.action"
            @click="toast.action.onClick"
            class="ml-3 px-3 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {{ toast.action.label }}
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const toast = useToast()
const toasts = ref(toast.getAll())

onMounted(() => {
  toast.subscribe(() => {
    toasts.value = toast.getAll()
  })
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
