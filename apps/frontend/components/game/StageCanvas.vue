<!-- components/game/StageCanvas.vue -->
<template>
  <div ref="stageRef" class="stage" :style="stageStyle">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'

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

const stageRef = ref<HTMLElement | null>(null)
const stageWidth = ref(1280)
const stageHeight = ref(720)

// リサイズ監視
function updateSize() {
  if (stageRef.value) {
    stageWidth.value = stageRef.value.clientWidth
    stageHeight.value = stageRef.value.clientHeight
  }
}

onMounted(() => {
  updateSize()
  window.addEventListener('resize', updateSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
})

const stageStyle = computed(() => ({
  '--stage-w': `${stageWidth.value}px`,
  '--stage-h': `${stageHeight.value}px`
}))

function charStyle(c: { x:number; y:number; scale:number; z?:number }) {
  // y は足元の位置（0=上端、100=下端）
  // translate(-50%, -100%) で画像の下端を基準点にする
  return {
    left: `${c.x}%`,
    bottom: `${100 - c.y}%`,  // top ではなく bottom で位置指定
    transform: `translateX(-50%) scale(${c.scale / 100})`,
    transformOrigin: 'bottom center',
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
  max-height: 100%;
  object-fit: contain;
  will-change: transform;
  transform-origin: bottom center;
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
