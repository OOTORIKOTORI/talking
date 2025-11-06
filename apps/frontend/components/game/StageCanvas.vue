<template>
  <div ref="host" class="stage-host">
    <div class="stage-viewport">
      <slot name="background" />
      <slot name="characters" />
      <slot name="message" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStageScale } from '@/composables/useStageScale'

const host = ref<HTMLElement | null>(null)
useStageScale(host, 1280, 720)
</script>

<style scoped>
.stage-host {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.stage-viewport {
  position: absolute;
  inset: 0;
  width: var(--stage-base-w);
  height: var(--stage-base-h);
  transform-origin: top left;
  transform: scale(var(--stage-scale));
}
</style>
