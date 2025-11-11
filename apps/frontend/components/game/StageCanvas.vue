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
    fontPreset?: number // 1〜10
    rows?: number // 1〜6
  }
  camera?: { zoom?: number; cx?: number; cy?: number } | null
}>()

const stageRef = ref<HTMLElement | null>(null)

// useStageScale でステージの実寸を CSS変数に流す
useStageScale(stageRef)

// fontPreset→倍率テーブル
const presetK: Record<number, number> = {
  1: 0.70, 2: 0.80, 3: 0.90, 4: 0.95, 5: 1.00,
  6: 1.08, 7: 1.16, 8: 1.25, 9: 1.35, 10: 1.48
}

// 旧 fontSize(px) を fontPreset に変換（fontPreset が未指定の場合のみ）
function pxToPreset(px: number | undefined): number {
  if (px == null) return 5
  // 16px を基準に最近傍のプリセットを選択
  const ratio = px / 16
  if (ratio <= 0.75) return 1
  if (ratio <= 0.85) return 2
  if (ratio <= 0.925) return 3
  if (ratio <= 0.975) return 4
  if (ratio <= 1.04) return 5
  if (ratio <= 1.12) return 6
  if (ratio <= 1.205) return 7
  if (ratio <= 1.30) return 8
  if (ratio <= 1.415) return 9
  return 10
}

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
  
  // fontPreset が指定されていればそれを使用、未指定なら旧 fontSize(px) から変換
  const preset = props.theme.fontPreset ?? pxToPreset(props.theme.fontSize)
  const fsK = presetK[preset] ?? 1
  
  // 表示行数（デフォルト3）
  const rows = props.theme.rows ?? 3
  
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
    '--fs-k': String(fsK),
    '--fs-min': '12px',
    '--fs-max': '48px',
    '--rows': String(rows),
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
  /* 高さは行数分を常に確保（可変ではなく固定） */
  /* 計算: (フォントサイズ * 行の高さ * 行数) + パディング上下 */
  height: auto;
  min-height: calc(
    clamp(var(--fs-min, 12px), calc(var(--stage-h-px, 720px) * 0.030 * var(--fs-k, 1)), var(--fs-max, 48px)) 
    * var(--mw-lh, 1.8) 
    * var(--rows, 3) 
    + clamp(6px, calc(var(--stage-h-px, 720px) * 0.012), var(--mw-padding)) * 2
    + clamp(4px, calc(var(--stage-h-px, 720px) * 0.012), var(--mw-padding))
  );
  background: var(--mw-bg);
  border: 2px solid var(--mw-border);
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
  flex: 1;
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
