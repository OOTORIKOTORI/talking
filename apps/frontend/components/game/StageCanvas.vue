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
import { useStageScale } from '@/composables/useStageScale'
import { resolveThemeV2 } from '@/utils/themeUtils'
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

// v2テーマを解決してCSS変数に変換
const mwStyle = computed(() => {
  const resolved = resolveThemeV2(props.theme)
  
  return {
    '--mw-width': resolved.windowW,
    '--mw-max-width': resolved.windowMw,
    '--mw-height': resolved.windowH,
    '--mw-margin-bottom': resolved.windowMb,
    '--mw-bg': resolved.frameBgCss,
    '--mw-border': resolved.frameBorderCss,
    '--mw-radius': `${resolved.radiusPx}px`,
    '--mw-padding': `${resolved.paddingK * 16}px`,  // paddingK は倍率なので基準16pxで掛ける
    '--mw-name-bg': resolved.nameBgCss,
    '--mw-text': resolved.textColorCss,
    '--fs-k': String(resolved.fontK),
    '--fs-min': '12px',
    '--fs-max': '48px',
    '--rows': String(resolved.rows),
    '--mw-lh': '1.8',
    '--mw-border-w': `${resolved.borderPx}px`,
    '--type-ms': `${resolved.typeMs}ms`,
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
  /* 高さは行数分を常に固定（内容量に関わらず一定） */
  /* 計算: テキストエリア(フォントサイズ * 行の高さ * 行数 + パディング上下) + 名前エリア(フォントサイズ + パディング上下 + マージン) */
  height: calc(
    /* テキストエリア: 本文の行数分 */
    clamp(var(--fs-min, 12px), calc(var(--stage-h-px, 720px) * 0.030 * var(--fs-k, 1)), var(--fs-max, 48px)) 
    * var(--mw-lh, 1.8) 
    * var(--rows, 3) 
    + clamp(6px, calc(var(--stage-h-px, 720px) * 0.012), var(--mw-padding)) * 2
    /* 名前エリア: 名前フォントサイズ + パディング上下 + 下マージン */
    + clamp(var(--fs-min, 12px), calc(var(--stage-h-px, 720px) * 0.028 * var(--fs-k, 1)), var(--fs-max, 48px))
    + clamp(4px, calc(var(--stage-h-px, 720px) * 0.012), var(--mw-padding)) * 2
    + clamp(6px, calc(var(--stage-h-px, 720px) * 0.012), var(--mw-padding))
  );
  background: var(--mw-bg);
  border: var(--mw-border-w, 2px) solid var(--mw-border);
  /* 角丸をステージ実高さに応じて調整（最小8px、最大設定値） */
  border-radius: clamp(8px, calc(var(--stage-h-px, 720px) * 0.01), var(--mw-radius));
  color: var(--mw-text);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
}
.name {
  background: var(--mw-name-bg);
  /* padding もステージ実高さに応じて調整（最小4px、最大設定値） */
  padding: clamp(4px, calc(var(--stage-h-px, 720px) * 0.012), var(--mw-padding));
  font-weight: 700;
  /* フォントサイズ: 実ステージ高さ基準（最小12px、最大48px） */
  font-size: clamp(var(--fs-min, 12px), calc(var(--stage-h-px, 720px) * 0.028 * var(--fs-k, 1)), var(--fs-max, 48px));
}
.text {
  /* padding もステージ実高さに応じて調整（最小6px、最大設定値） */
  padding: clamp(6px, calc(var(--stage-h-px, 720px) * 0.012), var(--mw-padding));
  /* フォントサイズ: 実ステージ高さ基準（最小12px、最大48px） */
  font-size: clamp(var(--fs-min, 12px), calc(var(--stage-h-px, 720px) * 0.030 * var(--fs-k, 1)), var(--fs-max, 48px));
  line-height: var(--mw-lh);
  white-space: pre-wrap;
  /* スクロールバー非表示＆行クランプ */
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: var(--rows, 3);
  /* 非WebKit向け（将来対応） */
  line-clamp: var(--rows, 3);
}
</style>
