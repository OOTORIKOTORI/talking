<script setup lang="ts">
import { computed } from 'vue'
import { useVisualEffects } from '@/composables/useVisualEffects'
import type { VisualEffect } from '@talking/types'

interface Props {
  nodeDraft: any | null
}

const props = defineProps<Props>()

// ビジュアルエフェクト機能
const { playEffect } = useVisualEffects()

// nodeDraft が null のときは安全に処理
const draftOrDefault = computed(() => {
  if (!props.nodeDraft) {
    return {
      camera: { zoom: 100, cx: 50, cy: 50 },
      cameraFx: null,
      visualFx: {},
      colorFilter: { type: 'none', opacity: 50, durationMs: 500 },
      backgroundFilter: { blurPx: 0, dimOpacity: 0 },
    }
  }
  return props.nodeDraft
})

// cameraFxEnabled computed（既存ロジックのコピー）
const cameraFxEnabled = computed({
  get() {
    const fx = (draftOrDefault.value as any).cameraFx as any | undefined
    if (!fx) return false
    const duration = typeof fx.durationMs === 'number' ? fx.durationMs : 0
    // duration>0 かつ mode が cut 以外なら「有効」とみなす
    return duration > 0 && fx.mode !== 'cut'
  },
  set(enabled: boolean) {
    if (!props.nodeDraft) return
    if (!enabled) {
      props.nodeDraft.cameraFx = null
      return
    }
    const fx = ((props.nodeDraft as any).cameraFx ||= {}) as any
    if (typeof fx.durationMs !== 'number' || fx.durationMs <= 0) {
      fx.durationMs = 800
    }
    if (!fx.mode) {
      fx.mode = 'together'
    }
  },
})

// ビジュアルエフェクトのプレビュー
function previewVisualEffect() {
  if (props.nodeDraft?.visualFx) {
    playEffect(props.nodeDraft.visualFx)
  }
}
</script>

<template>
  <div v-if="props.nodeDraft" class="space-y-4">
    <!-- カメラ -->
    <div>
      <div class="font-semibold mb-1">カメラ</div>
      <div class="flex items-center gap-2 mb-2">
        <span class="text-sm w-14">倍率</span>
        <input type="range" min="100" max="300" step="5"
               v-model.number="nodeDraft.camera.zoom" class="flex-1" />
        <input type="number" min="100" max="300" step="5"
               v-model.number="nodeDraft.camera.zoom"
               class="w-20 border rounded px-2 py-1 text-right" />
        <span class="text-sm">%</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm w-14">位置</span>
        <span class="text-xs text-gray-500">X</span>
        <input type="number" min="0" max="100" step="1"
               v-model.number="nodeDraft.camera.cx"
               class="w-20 border rounded px-2 py-1 text-right" />
        <span class="text-xs text-gray-500">Y</span>
        <input type="number" min="0" max="100" step="1"
               v-model.number="nodeDraft.camera.cy"
               class="w-20 border rounded px-2 py-1 text-right" />
        <span class="text-xs text-gray-500">（中心%）</span>
      </div>
    </div>

    <!-- カメラ演出 (MVP) -->
    <div class="mt-3 border-t pt-3">
      <div class="flex items-center justify-between mb-2">
        <div class="font-semibold">カメラ演出</div>
        <label class="flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            v-model="cameraFxEnabled"
            class="rounded"
          />
          有効
        </label>
      </div>

      <div v-if="cameraFxEnabled" class="space-y-2 text-sm">
        <div class="flex items-center gap-2">
          <span class="w-20">モード</span>
          <select
            v-model="nodeDraft.cameraFx.mode"
            class="border rounded px-2 py-1 flex-1"
          >
            <option value="together">ズーム＋パン同時</option>
            <option value="pan-then-zoom">パン → ズーム</option>
            <option value="zoom-then-pan">ズーム → パン</option>
            <option value="cut">カット切替</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <span class="w-20">時間</span>
          <input
            type="number"
            min="0"
            step="50"
            v-model.number="nodeDraft.cameraFx.durationMs"
            class="w-28 border rounded px-2 py-1 text-right"
          />
          <span class="text-xs text-gray-500">ms</span>
        </div>

        <p class="text-xs text-gray-500">
          開始位置は「前ノードのカメラ」または cameraFx.from、終了位置は「このノードのカメラ」または cameraFx.to になります。
        </p>
      </div>
    </div>

    <!-- ビジュアルエフェクト -->
    <div class="mt-3 border-t pt-3">
      <div class="font-semibold mb-2">ビジュアルエフェクト</div>
      <div class="space-y-2">
        <div>
          <label class="block text-xs font-medium mb-1">種類</label>
          <select
            v-model="nodeDraft.visualFx.type"
            class="w-full border rounded px-2 py-1 text-sm"
          >
            <option :value="undefined">なし</option>
            <option value="shake">画面揺れ</option>
            <option value="flash">フラッシュ</option>
          </select>
        </div>
        <div v-if="nodeDraft.visualFx?.type">
          <label class="block text-xs font-medium mb-1">強度</label>
          <div class="flex gap-2">
            <label class="flex items-center gap-1 text-sm">
              <input
                type="radio"
                v-model="nodeDraft.visualFx.intensity"
                value="small"
                class="rounded"
              />
              小
            </label>
            <label class="flex items-center gap-1 text-sm">
              <input
                type="radio"
                v-model="nodeDraft.visualFx.intensity"
                value="medium"
                class="rounded"
              />
              中
            </label>
            <label class="flex items-center gap-1 text-sm">
              <input
                type="radio"
                v-model="nodeDraft.visualFx.intensity"
                value="large"
                class="rounded"
              />
              大
            </label>
          </div>
        </div>
        <button
          v-if="nodeDraft.visualFx?.type"
          class="w-full px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          @click="previewVisualEffect"
        >
          プレビュー
        </button>
      </div>
    </div>

    <!-- カラーフィルター -->
    <div class="mt-3 border-t pt-3">
      <div class="font-semibold mb-2">カラーフィルター（画面全体）</div>
      <div class="space-y-2">
        <div>
          <label class="block text-xs font-medium mb-1">フィルター</label>
          <select
            v-model="nodeDraft.colorFilter.type"
            class="w-full border rounded px-2 py-1 text-sm"
          >
            <option value="none">なし</option>
            <option value="sepia">セピア（回想）</option>
            <option value="monochrome">モノクロ</option>
            <option value="dark">暗転</option>
            <option value="night">夜</option>
            <option value="dream">夢</option>
          </select>
        </div>
        <div v-if="nodeDraft.colorFilter?.type !== 'none'">
          <label class="block text-xs font-medium mb-1">不透明度: {{ nodeDraft.colorFilter.opacity }}%</label>
          <input
            type="range"
            min="0"
            max="100"
            v-model.number="nodeDraft.colorFilter.opacity"
            class="w-full"
          />
        </div>
        <div v-if="nodeDraft.colorFilter?.type !== 'none'">
          <label class="block text-xs font-medium mb-1">フェード時間</label>
          <div class="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="100"
              v-model.number="nodeDraft.colorFilter.durationMs"
              class="w-24 border rounded px-2 py-1 text-right text-sm"
            />
            <span class="text-xs text-gray-500">ms</span>
          </div>
        </div>
        <p class="text-xs text-gray-500">
          フィルターは次ノードで解除するまで継続されます
        </p>
      </div>
    </div>

    <!-- 背景フィルター（背景画像のみ） -->
    <div class="mt-3 border-t pt-3">
      <div class="font-semibold mb-2">背景フィルター（背景画像のみ）</div>
      <div class="space-y-2">
        <p class="text-xs text-gray-600 mb-2">
          背景画像だけをぼかします。キャラクターや文章はぼかしません。
        </p>
        <div>
          <label class="block text-xs font-medium mb-1">ぼかし強度: {{ nodeDraft.backgroundFilter?.blurPx ?? 0 }}px</label>
          <input
            type="range"
            min="0"
            max="24"
            v-model.number="nodeDraft.backgroundFilter.blurPx"
            class="w-full"
          />
          <span class="text-xs text-gray-500">0～24px</span>
        </div>
        <div>
          <label class="block text-xs font-medium mb-1">暗さ: {{ nodeDraft.backgroundFilter?.dimOpacity ?? 0 }}%</label>
          <input
            type="range"
            min="0"
            max="60"
            v-model.number="nodeDraft.backgroundFilter.dimOpacity"
            class="w-full"
          />
          <span class="text-xs text-gray-500">0～60%</span>
        </div>
      </div>
    </div>
  </div>
</template>
