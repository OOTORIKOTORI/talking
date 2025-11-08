<!-- components/game/StageCanvas.vue -->
<template>
  <div class="stage" :style="stageStyle">
    <img v-if="backgroundUrl" class="bg" :src="backgroundUrl" alt="" />
    <img
      v-for="c in characters"
      :key="c.key"
      class="ch"
      :src="c.url"
      :style="charStyle(c)"
      alt=""
    />
    <div v-if="message" class="mw" :style="mwStyle">
      <div v-if="message.speaker" class="name">{{ message.speaker }}</div>
      <div class="text">{{ message.text }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  backgroundUrl: string | null
  characters: Array<{ key: string; url: string; x: number; y: number; scale: number; z?: number }>
  message: { speaker?: string; text: string } | null
  theme: {
    bg: string
    border: string
    radius: number
    padding: number
    nameBg: string
    textColor: string
    fontSize: number
    lineHeight: number
  }
}>()

const stageStyle = computed(() => ({
  '--stage-w': '100%',
  '--stage-h': 'auto'
}))

function charStyle(c: { x:number; y:number; scale:number; z?:number }) {
  return {
    left: `${c.x}%`,
    top: `${c.y}%`,
    transform: `translate(-50%, -100%) scale(${c.scale / 100})`,
    zIndex: String(10 + (c.z ?? 0))
  }
}

const mwStyle = computed(() => ({
  '--mw-width': 'min(calc(0.92 * var(--stage-w)), 1180px)',
  '--mw-height': 'clamp(120px, calc(0.18 * var(--stage-h)), 220px)',
  '--mw-margin-bottom': 'clamp(8px, calc(0.04 * var(--stage-h)), 24px)',
  '--mw-bg': props.theme.bg,
  '--mw-border': props.theme.border,
  '--mw-radius': `${props.theme.radius}px`,
  '--mw-padding': `${props.theme.padding}px`,
  '--mw-name-bg': props.theme.nameBg,
  '--mw-text': props.theme.textColor,
  '--mw-fs': `${props.theme.fontSize}px`,
  '--mw-lh': String(props.theme.lineHeight)
}))
</script>

<style scoped>
.stage {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}
.bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ch {
  position: absolute;
  bottom: 0;
  will-change: transform;
}
.mw {
  position: absolute;
  left: 50%;
  bottom: var(--mw-margin-bottom);
  transform: translateX(-50%);
  width: var(--mw-width);
  height: var(--mw-height);
  background: var(--mw-bg);
  border: 2px solid var(--mw-border);
  border-radius: var(--mw-radius);
  color: var(--mw-text);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
}
.name {
  background: var(--mw-name-bg);
  padding: var(--mw-padding);
  font-weight: 700;
}
.text {
  padding: var(--mw-padding);
  font-size: var(--mw-fs);
  line-height: var(--mw-lh);
  white-space: pre-wrap;
}
</style>
