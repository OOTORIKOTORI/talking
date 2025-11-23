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
import { ref, computed } from 'vue'
import { useStageScale } from '@/composables/useStageScale'
import MessageWindow from '@/components/game/MessageWindow.vue'
import type { MessageThemeV2, MessageTheme } from '@talking/types'

const props = defineProps<{
  backgroundUrl: string | null
  characters: Array<{ key: string; url: string; x: number; y: number; scale: number; z?: number }>
  message: { speaker?: string; text: string } | null
  theme: MessageThemeV2 | MessageTheme | any
  camera?: { zoom?: number; cx?: number; cy?: number } | null
}>()

const stageRef = ref<HTMLElement | null>(null)

// useStageScale でステージの実寸を CSS変数に流す
useStageScale(stageRef)

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
</style>
