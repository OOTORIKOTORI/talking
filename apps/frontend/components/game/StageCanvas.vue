<!-- components/game/StageCanvas.vue -->
<template>
  <div ref="stageRef" class="stage">
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

// キャラクター配置スタイル
function charStyle(c: { x:number; y:number; scale:number; z?:number }) {
  // y は足元の位置（0=上端、100=下端）
  return {
    left: `${c.x}%`,
    bottom: `${100 - c.y}%`,  // bottom で位置指定
    transform: `translateX(-50%) scale(${c.scale / 100})`,
    transformOrigin: 'bottom center',
    zIndex: String(10 + (c.z ?? 0))
  }
}

// メッセージウィンドウのサイズを基準サイズに対する比率で計算
// 基準: 1280x720 (16:9)
// 幅: 92% (最大1180px)
// 高さ: 18% (120px〜220px)
// 下マージン: 4%

const mwStyle = computed(() => ({
  '--mw-width': '92%',  // 幅は常に92%
  '--mw-max-width': '1180px',
  '--mw-height': '18%',  // 高さは常に18%
  '--mw-min-height': '120px',
  '--mw-max-height': '220px',
  '--mw-margin-bottom': '4%',  // 下マージンは常に4%
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
  max-width: var(--mw-max-width);
  height: var(--mw-height);
  min-height: var(--mw-min-height);
  max-height: var(--mw-max-height);
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
