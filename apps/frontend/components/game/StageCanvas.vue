<!-- components/game/StageCanvas.vue -->
<template>
  <div ref="stageRef" class="stage">
    <!-- ワールド（背景＋キャラ）: カメラ変換をここに適用 -->
    <div class="world" :style="worldStyle">
      <img v-if="backgroundUrl" class="bg" :src="backgroundUrl" alt="" />
      <img
        v-for="c in characters"
        :key="c.key"
        class="ch"
        :src="c.url"
        :style="charStyle(c)"
        alt=""
      />
    </div>
    <!-- メッセージウィンドウ（拡大しない） -->
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
    scale?: 'sm' | 'md' | 'lg'
  }
  camera?: { zoom?: number; cx?: number; cy?: number } | null
}>()

const stageRef = ref<HTMLElement | null>(null)

// カメラ変換スタイル（world レイヤーに適用）
const worldStyle = computed(() => {
  const z = Math.max(100, Math.min(300, props.camera?.zoom ?? 100)) / 100
  const cx = props.camera?.cx ?? 50
  const cy = props.camera?.cy ?? 50
  const tx = 50 - cx
  const ty = 50 - cy
  return { transform: `translate(${tx}%, ${ty}%) scale(${z})`, transformOrigin: 'center center' }
})

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

// メッセージウィンドウのサイズをプリセットで切替
// sm: やや小さめ / md: 標準 / lg: やや大きめ
const mwStyle = computed(() => {
  const scale = props.theme.scale ?? 'md'
  const MAP: Record<'sm'|'md'|'lg', { w:string; h:string; mb:string; mw:string }> = {
    sm: { w: '88%', h: '20%', mb: '4%', mw: '1100px' },
    md: { w: '92%', h: '22%', mb: '3%', mw: '1180px' },
    lg: { w: '96%', h: '26%', mb: '2%', mw: '1280px' }
  }
  const m = MAP[scale]
  return {
    '--mw-width': m.w,
    '--mw-max-width': m.mw,
    '--mw-height': m.h,
    '--mw-margin-bottom': m.mb,
    '--mw-bg': props.theme.bg,
    '--mw-border': props.theme.border,
    '--mw-radius': `${props.theme.radius}px`,
    '--mw-padding': `${props.theme.padding}px`,
    '--mw-name-bg': props.theme.nameBg,
    '--mw-text': props.theme.textColor,
    '--mw-fs': `${props.theme.fontSize}px`,
    '--mw-lh': String(props.theme.lineHeight)
  }
})
</script>

<style scoped>
.stage {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}
.world {
  position: absolute;
  inset: 0;
  will-change: transform;
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
  background: var(--mw-bg);
  border: 2px solid var(--mw-border);
  /* 角丸をコンテナサイズに応じて調整（最小8px、最大設定値） */
  border-radius: clamp(8px, calc(var(--mw-height) * 0.1), var(--mw-radius));
  color: var(--mw-text);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
}
.name {
  background: var(--mw-name-bg);
  /* padding もコンテナサイズに応じて調整（最小4px、最大設定値） */
  padding: clamp(4px, calc(var(--mw-height) * 0.05), var(--mw-padding));
  font-weight: 700;
  /* フォントサイズもコンテナに応じて調整（最小12px、最大設定値） */
  font-size: clamp(12px, calc(var(--mw-height) * 0.12), var(--mw-fs));
}
.text {
  /* padding もコンテナサイズに応じて調整（最小6px、最大設定値） */
  padding: clamp(6px, calc(var(--mw-height) * 0.08), var(--mw-padding));
  /* フォントサイズもコンテナに応じて調整（最小13px、最大設定値） */
  font-size: clamp(13px, calc(var(--mw-height) * 0.13), var(--mw-fs));
  line-height: var(--mw-lh);
  white-space: pre-wrap;
}
</style>
