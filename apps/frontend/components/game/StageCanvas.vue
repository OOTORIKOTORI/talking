<!-- components/game/StageCanvas.vue -->
<template>
  <div ref="stageRef" class="stage" :style="stageStyle">
    <!-- ワールド（背景＋キャラ）: カメラ変換をここに適用 -->
    <div class="world" :style="worldStyle">
      <img v-if="backgroundUrl" class="bg" :src="backgroundUrl" alt="" :style="backgroundImageStyle" />
      <!-- 背景暗化オーバーレイ（背景の上、キャラの下） -->
      <div v-if="backgroundFilter?.dimOpacity && backgroundFilter.dimOpacity > 0" class="bg-dim" :style="backgroundDimStyle"></div>
      <img
        v-for="c in characters"
        :key="c.key"
        class="ch"
        :src="c.url"
        :style="charStyle(c)"
        alt=""
      />
    </div>
    
    <!-- エフェクトレイヤー -->
    <div class="effect-layer">
      <div v-if="props.effectState?.flash" class="flash" :style="flashStyle"></div>
    </div>
    
    <!-- カラーフィルターレイヤー -->
    <div v-if="colorFilter && colorFilter.type !== 'none'" class="filter-layer" :style="filterStyle"></div>
    
    <!-- MessageWindowコンポーネントを使用（テーマを統一） -->
    <MessageWindow
      v-if="message"
      :speaker="message.speaker"
      :text="message.text"
      :theme="props.theme"
      :animate="false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type CSSProperties } from 'vue'
import { useStageScale } from '@/composables/useStageScale'
import MessageWindow from '@/components/game/MessageWindow.vue'
import type { MessageThemeV2, MessageTheme, ColorFilter } from '@talking/types'
import type { EffectState } from '@/composables/useVisualEffects'

const props = defineProps<{
  backgroundUrl: string | null
  characters: Array<{ key: string; url: string; x: number; y: number; scale: number; z?: number }>
  message: { speaker?: string; text: string } | null
  theme: MessageThemeV2 | MessageTheme | any
  camera?: { zoom?: number; cx?: number; cy?: number } | null
  effectState?: EffectState
  colorFilter?: ColorFilter | null
  backgroundFilter?: any | null
}>()

const stageRef = ref<HTMLElement | null>(null)

// useStageScale でステージの実寸を CSS変数に流す
useStageScale(stageRef)

// ステージ全体のスタイル（shake エフェクト適用）
const stageStyle = computed(() => {
  const shake = props.effectState?.shake
  if (shake) {
    return {
      transform: `translate(${shake.translateX}px, ${shake.translateY}px)`,
    }
  }
  return {}
})

// カメラ変換スタイル（world レイヤーに適用）
const worldStyle = computed(() => {
  const z = Math.max(100, Math.min(300, props.camera?.zoom ?? 100)) / 100
  const cx = props.camera?.cx ?? 50
  const cy = props.camera?.cy ?? 50
  const tx = 50 - cx
  const ty = 50 - cy
  return { transform: `translate(${tx}%, ${ty}%) scale(${z})`, transformOrigin: 'center center' }
})

// フラッシュエフェクトのスタイル
const flashStyle = computed(() => {
  const flash = props.effectState?.flash
  if (flash) {
    return {
      backgroundColor: flash.color,
      opacity: flash.opacity,
    }
  }
  return {}
})

// カラーフィルターのスタイル
const filterStyle = computed<CSSProperties>(() => {
  const filter = props.colorFilter
  if (!filter || filter.type === 'none') return {}

  const opacity = (filter.opacity ?? 50) / 100
  const duration = filter.durationMs ?? 500

  // フィルタータイプに応じた色とブレンドモード
  let color = 'rgba(0, 0, 0, 0)'
  let mixBlendMode: CSSProperties['mixBlendMode'] = 'normal'

  switch (filter.type) {
    case 'sepia':
      color = `rgba(112, 66, 20, ${opacity})`
      break
    case 'monochrome':
      color = `rgba(128, 128, 128, ${opacity})`
      mixBlendMode = 'saturation'
      break
    case 'dark':
      color = `rgba(0, 0, 0, ${opacity})`
      break
    case 'night':
      color = `rgba(25, 25, 60, ${opacity})`
      break
    case 'dream':
      color = `rgba(255, 220, 255, ${opacity * 0.6})`
      break
  }
  
  return {
    backgroundColor: color,
    mixBlendMode,
    transition: `background-color ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`
  }
})

// 背景フィルター（背景画像のみ）のスタイル
const backgroundImageStyle = computed<CSSProperties>(() => {
  const bgFilter = props.backgroundFilter
  if (!bgFilter) return {}

  const blurPx = bgFilter.blurPx ?? 0
  const dimOpacity = bgFilter.dimOpacity ?? 0

  // blur 量に応じて背景をスケールして透けを防ぐ
  let scale = 1
  if (blurPx > 0) {
    // blurPx が大きいほどスケールを上げる（大体 0.04 ~ 0.05 / px）
    scale = Math.max(1, 1 + blurPx * 0.0035)
  }

  const filters = []
  if (blurPx > 0) {
    filters.push(`blur(${blurPx}px)`)
  }

  return {
    transform: `scale(${scale})`,
    filter: filters.length > 0 ? filters.join(' ') : undefined,
  }
})

// 背景暗化オーバーレイのスタイル
const backgroundDimStyle = computed<CSSProperties>(() => {
  const bgFilter = props.backgroundFilter
  if (!bgFilter || !bgFilter.dimOpacity || bgFilter.dimOpacity <= 0) return {}

  const opacity = Math.max(0, Math.min(60, bgFilter.dimOpacity)) / 100

  return {
    backgroundColor: `rgba(0, 0, 0, ${opacity})`,
  }
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
</script>

<style scoped>
.stage {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  will-change: transform;
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
.bg-dim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  will-change: background-color;
}
.ch {
  position: absolute;
  max-height: 100%;
  object-fit: contain;
  will-change: transform;
  transform-origin: bottom center;
}
.effect-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 50;
}
.flash {
  position: absolute;
  inset: 0;
  will-change: opacity;
}
.filter-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 40;
  will-change: background-color, opacity;
}
</style>

