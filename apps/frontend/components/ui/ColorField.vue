<template>
  <div class="color-field">
    <label v-if="label" class="block text-sm font-medium mb-2">{{ label }}</label>
    
    <div class="flex gap-2 items-start">
      <!-- カラーピッカー -->
      <div class="flex flex-col gap-1">
        <input
          type="color"
          :value="hexValue"
          @input="onColorChange"
          class="w-12 h-12 rounded border cursor-pointer"
          title="色を選択"
        />
        <div class="w-12 h-8 rounded border" :style="{ background: previewCss }" title="プレビュー"></div>
      </div>

      <!-- 入力フィールド -->
      <div class="flex-1 flex flex-col gap-2">
        <!-- HEX入力 -->
        <div class="flex items-center gap-2">
          <label class="text-xs text-gray-600 w-12">HEX</label>
          <input
            v-model="hexInput"
            @blur="onHexBlur"
            @keydown.enter="onHexBlur"
            type="text"
            placeholder="#RRGGBB"
            class="flex-1 border rounded px-2 py-1 text-sm font-mono"
          />
        </div>

        <!-- RGBA入力 -->
        <div class="flex items-center gap-2">
          <label class="text-xs text-gray-600 w-12">RGBA</label>
          <input
            v-model.number="localRgba.r"
            @input="onRgbaChange"
            type="number"
            min="0"
            max="255"
            placeholder="R"
            class="w-16 border rounded px-2 py-1 text-sm"
          />
          <input
            v-model.number="localRgba.g"
            @input="onRgbaChange"
            type="number"
            min="0"
            max="255"
            placeholder="G"
            class="w-16 border rounded px-2 py-1 text-sm"
          />
          <input
            v-model.number="localRgba.b"
            @input="onRgbaChange"
            type="number"
            min="0"
            max="255"
            placeholder="B"
            class="w-16 border rounded px-2 py-1 text-sm"
          />
        </div>

        <!-- 透明度スライダー -->
        <div class="flex items-center gap-2">
          <label class="text-xs text-gray-600 w-12">不透明</label>
          <input
            v-model.number="localRgba.a"
            @input="onRgbaChange"
            type="range"
            min="0"
            max="1"
            step="0.01"
            class="flex-1"
          />
          <span class="text-xs text-gray-600 w-12 text-right">{{ Math.round(localRgba.a * 100) }}%</span>
        </div>
      </div>
    </div>

    <!-- プリセットパレット -->
    <div v-if="presets && presets.length > 0" class="mt-3">
      <div class="text-xs text-gray-600 mb-1">プリセット</div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="(preset, i) in presets"
          :key="i"
          @click="applyPreset(preset)"
          :style="{ background: preset }"
          class="w-8 h-8 rounded border border-gray-300 hover:border-gray-500 cursor-pointer transition"
          :title="preset"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { RGBA } from '@talking/types'
import { hexToRgba, rgbaToHex, rgbaToCss, parseColor, toRgba } from '@/utils/themeUtils'

const props = defineProps<{
  modelValue: RGBA | string | undefined
  label?: string
  presets?: string[] // HEX or RGBA文字列の配列
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: RGBA): void
}>()

// ローカル状態（RGBA）
const localRgba = ref<RGBA>(toRgba(props.modelValue, { r: 255, g: 255, b: 255, a: 1 }))

// HEX入力用
const hexInput = ref<string>(rgbaToHex(localRgba.value))

// HEX値（カラーピッカー用）
const hexValue = computed(() => rgbaToHex(localRgba.value))

// プレビュー用CSS
const previewCss = computed(() => rgbaToCss(localRgba.value))

// modelValue の変更を監視
watch(() => props.modelValue, (newVal) => {
  localRgba.value = toRgba(newVal, localRgba.value)
  hexInput.value = rgbaToHex(localRgba.value)
}, { immediate: true })

// カラーピッカーの変更
function onColorChange(e: Event) {
  const target = e.target as HTMLInputElement
  const rgba = hexToRgba(target.value)
  rgba.a = localRgba.value.a // 透明度を維持
  localRgba.value = rgba
  hexInput.value = target.value
  emit('update:modelValue', localRgba.value)
}

// RGBA入力の変更
function onRgbaChange() {
  // 範囲チェック
  localRgba.value.r = Math.max(0, Math.min(255, localRgba.value.r || 0))
  localRgba.value.g = Math.max(0, Math.min(255, localRgba.value.g || 0))
  localRgba.value.b = Math.max(0, Math.min(255, localRgba.value.b || 0))
  localRgba.value.a = Math.max(0, Math.min(1, localRgba.value.a || 0))
  
  hexInput.value = rgbaToHex(localRgba.value)
  emit('update:modelValue', localRgba.value)
}

// HEX入力のBlur/Enter
function onHexBlur() {
  const parsed = parseColor(hexInput.value)
  if (parsed) {
    localRgba.value = { ...parsed, a: localRgba.value.a } // 透明度維持
    hexInput.value = rgbaToHex(localRgba.value)
    emit('update:modelValue', localRgba.value)
  } else {
    // 無効な入力は元に戻す
    hexInput.value = rgbaToHex(localRgba.value)
  }
}

// プリセット適用
function applyPreset(preset: string) {
  const parsed = parseColor(preset)
  if (parsed) {
    localRgba.value = parsed
    hexInput.value = rgbaToHex(localRgba.value)
    emit('update:modelValue', localRgba.value)
  }
}
</script>

<style scoped>
.color-field > * + * {
  margin-top: 0.5rem;
}
</style>
