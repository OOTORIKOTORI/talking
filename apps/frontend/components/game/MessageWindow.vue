<template>
  <div 
    class="mw pointer-events-auto"
    :style="mwStyle"
    @click="$emit('click', $event)"
  >
    <div
      v-if="speaker && showName"
      class="name"
      :style="nameStyle"
    >
      <span class="font-semibold">{{ speaker }}</span>
    </div>

    <p
      class="text"
      :style="textStyle"
    >
      {{ accumulatedPrefix }}{{ shown }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { resolveThemeV2, toRgba, rgbaToCss } from '@/utils/themeUtils'

defineOptions({
  inheritAttrs: false
})

const props = defineProps<{
  speaker?: string | null
  text: string | null
  animate?: boolean
  theme?: any
  accumulatedPrefix?: string  // 即座に表示する累積テキスト
}>()

// デバッグログ - すべてのpropsを監視
watch(() => props, (newVal) => {
  console.log('[MessageWindow] ALL props:', {
    speaker: newVal.speaker,
    text: newVal.text,
    animate: newVal.animate,
    accumulatedPrefix: newVal.accumulatedPrefix,
    hasAccumulatedPrefix: !!newVal.accumulatedPrefix
  })
}, { immediate: true, deep: true })

const theme = computed(() => props.theme ?? {})

// テーマをv2形式に解決
const resolved = computed(() => resolveThemeV2(props.theme))

// 背景色を生成（単色のみ）
const computedBgGradient = computed(() => {
  const t = props.theme
  
  if (!t) return 'rgba(20, 24, 36, 0.72)'
  
  // v2形式の場合
  if (t.themeVersion === 2) {
    return rgbaToCss(toRgba(t.frameBg))
  }
  
  // v1形式（フォールバック）
  return t.frame?.bg ?? 'rgba(20, 24, 36, 0.72)'
})

// メッセージウィンドウのスタイル
const mwStyle = computed(() => {
  const r = resolved.value
  return {
    '--mw-bg-gradient': computedBgGradient.value,
    '--mw-border-color': r.frameBorderCss,
    '--mw-border-width': `${r.borderPx}px`,
    '--mw-radius': `${r.radiusPx}px`,
    '--mw-padding': `${r.paddingK * 16}px`,
  } as any
})

// 名前欄のスタイル
const showName = computed(() => {
  const t = props.theme
  if (t?.themeVersion === 2) return true
  return t?.name?.show ?? true
})

const nameStyle = computed(() => {
  const r = resolved.value
  return {
    '--name-bg': r.nameBgCss,
    '--name-radius': `${r.radiusPx * 0.8}px`,
    '--name-padding': `${r.paddingK * 8}px`,
    '--name-font-size': `${16 * r.fontK * 0.9}px`,
  } as any
})

// テキストのスタイル
const textStyle = computed(() => {
  const r = resolved.value
  // 行数に基づいた固定高さを計算（フォントサイズ × line-height × 行数）
  const lineHeight = 1.8
  const fontSize = 16 * r.fontK
  const textHeight = fontSize * lineHeight * r.rows
  
  return {
    '--text-color': r.textColorCss,
    '--text-font-size': `${fontSize}px`,
    '--text-font-weight': r.fontWeight,
    '--text-font-style': r.fontStyle,
    '--text-font-family': r.fontFamily || 'inherit',
    '--text-height': `${textHeight}px`,
    '--text-stroke-color': r.textStrokeColorCss || 'transparent',
    '--text-stroke-width': `${r.textStrokeWidth}px`,
  } as any
})

const shown = ref('')

let timer: any = null
function typeTo(target: string) {
  clearInterval(timer)
  if (!props.animate) { shown.value = target; return }
  shown.value = ''
  const ms = resolved.value.typeMs ?? 25
  let i = 0
  timer = setInterval(() => {
    i++
    shown.value = target.slice(0, i)
    if (i >= target.length) clearInterval(timer)
  }, ms)
}

watch(() => props.text ?? '', (t) => typeTo(t), { immediate: true })
onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.mw {
  position: absolute;
  left: calc(var(--mw-left, 0.07) * 100%);
  bottom: calc(var(--mw-bottom, 0.05) * 100%);
  width: calc(var(--mw-w, 0.86) * 100%);
  background: var(--mw-bg-gradient, rgba(20, 24, 36, 0.72));
  color: var(--mw-fg, #fff);
  border: var(--mw-border-width, 2px) solid var(--mw-border-color, rgba(255, 255, 255, 0.2));
  border-radius: calc(var(--mw-radius, 16px) * var(--stage-scale, 1));
  padding: calc(var(--mw-padding, 20px) * var(--stage-scale, 1));
  box-sizing: border-box;
  line-height: var(--mw-lh, 1.8);
  z-index: 100;
  backdrop-filter: blur(calc(2px * var(--stage-scale, 1)));
  min-height: fit-content;
  user-select: none;
  -webkit-user-select: none;
  cursor: pointer;
}

.name {
  font-weight: 700;
  display: inline-block;
  margin-bottom: calc(8px * var(--stage-scale, 1));
  padding: calc(var(--name-padding, 8px) * var(--stage-scale, 1));
  border-radius: calc(var(--name-radius, 12px) * var(--stage-scale, 1));
  background: var(--name-bg, rgba(0, 0, 0, 0.55));
  color: #fff;
  font-size: calc(var(--name-font-size, 16px) * var(--stage-scale, 1));
}

.text {
  white-space: pre-wrap;
  word-wrap: break-word;
  color: var(--text-color, #fff);
  font-size: calc(var(--text-font-size, 18px) * var(--stage-scale, 1));
  line-height: 1.8;
  font-weight: var(--text-font-weight, normal);
  font-style: var(--text-font-style, normal);
  font-family: var(--text-font-family, inherit);
  height: calc(var(--text-height, 86.4px) * var(--stage-scale, 1));
  -webkit-text-stroke: calc(var(--text-stroke-width, 0px) * var(--stage-scale, 1)) var(--text-stroke-color, transparent);
  paint-order: stroke fill;
  overflow: hidden;
}
</style>

