<template>
  <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
    <div class="flex min-h-screen items-center justify-center p-4 md:p-6">
      <div class="w-[min(1200px,96vw)] max-h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <!-- ヘッダー（固定） -->
        <div class="flex items-center justify-between p-5 border-b">
          <h3 class="font-semibold text-lg">シナリオ全体設定（メッセージウィンドウ v2）</h3>
          <button class="text-gray-500 hover:text-gray-700 text-2xl leading-none" @click="$emit('close')" title="閉じる">✕</button>
        </div>

        <!-- スクロール可能なコンテンツ領域 -->
        <div class="overflow-y-auto flex-1">
          <!-- ライブプレビュー -->
          <div class="p-5 bg-gray-50">
            <div class="relative aspect-[16/9] bg-neutral-900 rounded-lg overflow-hidden shadow-lg">
              <img :src="bg" class="absolute inset-0 w-full h-full object-cover opacity-60" alt="preview bg" />
              <div class="absolute inset-x-4 bottom-4 md:inset-x-8 md:bottom-6">
                <MessageWindow :speaker="speaker" :text="sample" :theme="previewTheme" :animate="true" />
              </div>
            </div>
          </div>

          <!-- フォーム -->
          <div class="px-5 pb-5 space-y-6">
            <!-- A. かんたん設定（プリセット） -->
            <section>
              <h4 class="font-semibold text-md mb-3 flex items-center gap-2">
                <span class="text-blue-600">📐</span> かんたん設定
              </h4>
              <div class="grid gap-4 md:grid-cols-2 text-sm">
                <!-- 文字サイズ -->
                <label class="flex flex-col">
                  <span class="mb-1 font-medium">文字サイズ（1=小 〜 10=大）</span>
                  <select v-model.number="draft.fontPreset" class="border rounded px-3 py-2">
                    <option :value="1">1 - 極小</option>
                    <option :value="2">2 - 小さめ</option>
                    <option :value="3">3 - 小</option>
                    <option :value="4">4 - やや小</option>
                    <option :value="5">5 - 標準</option>
                    <option :value="6">6 - やや大</option>
                    <option :value="7">7 - 大</option>
                    <option :value="8">8 - 特大</option>
                    <option :value="9">9 - 極大</option>
                    <option :value="10">10 - 最大</option>
                  </select>
                </label>

                <!-- ウィンドウサイズ -->
                <label class="flex flex-col">
                  <span class="mb-1 font-medium">ウィンドウサイズ（1=小 〜 10=大）</span>
                  <select v-model.number="draft.windowPreset" class="border rounded px-3 py-2">
                    <option v-for="i in 10" :key="i" :value="i">{{ i }}{{ i === 6 ? ' - 標準' : '' }}</option>
                  </select>
                </label>

                <!-- 表示行数 -->
                <label class="flex flex-col">
                  <span class="mb-1 font-medium">表示する行数</span>
                  <select v-model.number="draft.rows" class="border rounded px-3 py-2">
                    <option :value="1">1行</option>
                    <option :value="2">2行</option>
                    <option :value="3">3行（標準）</option>
                    <option :value="4">4行</option>
                    <option :value="5">5行</option>
                    <option :value="6">6行</option>
                  </select>
                </label>

                <!-- 内側余白 -->
                <label class="flex flex-col">
                  <span class="mb-1 font-medium">内側余白（1=狭 〜 10=広）</span>
                  <input v-model.number="draft.paddingPreset" type="range" min="1" max="10" step="1" class="mt-1" />
                  <span class="text-xs text-gray-600 text-center">{{ draft.paddingPreset }}</span>
                </label>

                <!-- 角丸 -->
                <label class="flex flex-col">
                  <span class="mb-1 font-medium">角丸（1=角張 〜 10=丸）</span>
                  <input v-model.number="draft.radiusPreset" type="range" min="1" max="10" step="1" class="mt-1" />
                  <span class="text-xs text-gray-600 text-center">{{ draft.radiusPreset }}</span>
                </label>

                <!-- 枠線太さ -->
                <label class="flex flex-col">
                  <span class="mb-1 font-medium">枠線太さ（1=無 〜 10=太）</span>
                  <input v-model.number="draft.borderPreset" type="range" min="1" max="10" step="1" class="mt-1" />
                  <span class="text-xs text-gray-600 text-center">{{ draft.borderPreset }}</span>
                </label>

                <!-- 影強度 -->
                <label class="flex flex-col">
                  <span class="mb-1 font-medium">影強度（1=無 〜 10=強）</span>
                  <input v-model.number="draft.shadowPreset" type="range" min="1" max="10" step="1" class="mt-1" />
                  <span class="text-xs text-gray-600 text-center">{{ draft.shadowPreset }}</span>
                </label>

                <!-- タイプ速度 -->
                <label class="flex flex-col">
                  <span class="mb-1 font-medium">タイプ速度（1=ゆっくり 〜 10=高速）</span>
                  <input v-model.number="draft.typeSpeedPreset" type="range" min="1" max="10" step="1" class="mt-1" />
                  <span class="text-xs text-gray-600 text-center">{{ draft.typeSpeedPreset }}</span>
                </label>
              </div>
            </section>

            <!-- B. 色設定 -->
            <section>
              <h4 class="font-semibold text-md mb-3 flex items-center gap-2">
                <span class="text-purple-600">🎨</span> 色設定
              </h4>
              <div class="space-y-4">
                <ColorField v-model="draft.frameBg" label="メッセージ枠の背景色" :presets="colorPresets" />
                <ColorField v-model="draft.frameBorder" label="枠線の色" :presets="colorPresets" />
                <ColorField v-model="draft.nameBg" label="名前欄の背景色" :presets="colorPresets" />
                <ColorField v-model="draft.textColor" label="文字の色" :presets="colorPresets" />

                <!-- コントラスト警告 -->
                <div v-if="contrastWarning" class="p-3 bg-yellow-50 border border-yellow-300 rounded text-sm">
                  <strong class="text-yellow-800">⚠ コントラスト注意:</strong>
                  <span class="text-yellow-700">{{ contrastWarning }}</span>
                </div>
              </div>
            </section>

            <!-- C. 上級設定（折り畳み） -->
            <section>
              <button
                @click="advancedOpen = !advancedOpen"
                class="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 rounded font-medium text-sm transition"
              >
                <span class="flex items-center gap-2">
                  <span class="text-gray-600">⚙️</span> 上級設定（px直接指定）
                </span>
                <span class="text-gray-500">{{ advancedOpen ? '▲' : '▼' }}</span>
              </button>
              
              <!-- 警告バッジ -->
              <div v-if="advancedTouched" class="mt-2 p-2 bg-yellow-50 border border-yellow-300 rounded text-xs text-yellow-800">
                ⚠️ 上級設定を変更すると、プリセット設定より優先されます。混乱を避けるため、どちらか一方のみを使用することを推奨します。
              </div>
              
              <div v-if="advancedOpen" class="mt-3 p-4 border rounded bg-gray-50 space-y-3 text-sm">
                <p class="text-xs text-gray-600">
                  ※ これらの設定は上限値として機能します。画面サイズに応じて自動調整されます。プリセット設定を推奨します。
                </p>
                <div class="grid gap-3 md:grid-cols-2">
                  <label class="flex flex-col">
                    <span class="mb-1">背景色（css文字列）</span>
                    <input v-model="advancedFrameBg" @input="touchAdvanced" class="border rounded px-2 py-1" placeholder="rgba(20,24,36,0.72)" />
                  </label>
                  <label class="flex flex-col">
                    <span class="mb-1">枠線色（css文字列）</span>
                    <input v-model="advancedFrameBorder" @input="touchAdvanced" class="border rounded px-2 py-1" placeholder="rgba(255,255,255,0.2)" />
                  </label>
                  <label class="flex flex-col">
                    <span class="mb-1">枠線幅(px)</span>
                    <input type="number" v-model.number="advancedBorderWidth" @input="touchAdvanced" class="border rounded px-2 py-1" />
                  </label>
                  <label class="flex flex-col">
                    <span class="mb-1">角丸(px)</span>
                    <input type="number" v-model.number="advancedRadius" @input="touchAdvanced" class="border rounded px-2 py-1" />
                  </label>
                  <label class="flex flex-col">
                    <span class="mb-1">内側余白(px)</span>
                    <input type="number" v-model.number="advancedPadding" @input="touchAdvanced" class="border rounded px-2 py-1" />
                  </label>
                  <label class="flex flex-col">
                    <span class="mb-1">文字サイズ(px)</span>
                    <input type="number" v-model.number="advancedFontSize" @input="touchAdvanced" class="border rounded px-2 py-1" />
                  </label>
                  <label class="flex flex-col">
                    <span class="mb-1">行間</span>
                    <input type="number" step="0.1" v-model.number="advancedLineHeight" @input="touchAdvanced" class="border rounded px-2 py-1" />
                  </label>
                  <label class="flex flex-col">
                    <span class="mb-1">タイプ速度(ms/文字)</span>
                    <input type="number" v-model.number="advancedTypeMs" @input="touchAdvanced" class="border rounded px-2 py-1" />
                  </label>
                </div>
              </div>
            </section>
          </div>
        </div>

        <!-- フッター（固定） -->
        <div class="flex flex-wrap gap-2 p-5 border-t justify-between bg-gray-50">
          <div class="flex gap-2">
            <button @click="exportTheme" class="px-4 py-2 bg-white border rounded hover:bg-gray-100 text-sm font-medium" title="現在の設定をJSONでダウンロード">
              📥 エクスポート
            </button>
            <button @click="importTheme" class="px-4 py-2 bg-white border rounded hover:bg-gray-100 text-sm font-medium" title="JSONファイルから設定を読み込み">
              📤 インポート
            </button>
          </div>
          <div class="flex gap-2">
            <button @click="reset" class="px-4 py-2 bg-gray-200 border rounded hover:bg-gray-300 text-sm font-medium">
              リセット
            </button>
            <button @click="save" class="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium shadow">
              保存
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- インポート用の隠しファイル入力 -->
    <input ref="fileInput" type="file" accept=".json" @change="onFileSelected" class="hidden" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MessageThemeV2, RGBA } from '@talking/types'
import { FONT_K, PADDING_K, RADIUS_PX, BORDER_PX, TYPE_MS } from '@talking/types'
import MessageWindow from '@/components/game/MessageWindow.vue'
import ColorField from '@/components/ui/ColorField.vue'
import { migrateToV2, contrastRatio, contrastLevel, toRgba, rgbaToCss } from '@/utils/themeUtils'

const props = defineProps<{ gameId: string; initial?: any }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved', v: any): void }>()

// デフォルトテーマ（v2）
const defaultThemeV2: MessageThemeV2 = {
  themeVersion: 2,
  rows: 3,
  scale: 'md',
  fontPreset: 5,
  windowPreset: 6,
  paddingPreset: 5,
  radiusPreset: 5,
  borderPreset: 3,
  shadowPreset: 4,
  typeSpeedPreset: 6,
  frameBg: { r: 20, g: 24, b: 36, a: 0.72 },
  frameBorder: { r: 255, g: 255, b: 255, a: 0.2 },
  nameBg: { r: 0, g: 0, b: 0, a: 0.55 },
  textColor: { r: 255, g: 255, b: 255, a: 1 },
}

// v1→v2 マイグレーション
const draft = ref<MessageThemeV2>(migrateToV2(props.initial ?? defaultThemeV2))

// 上級設定の開閉
const advancedOpen = ref(false)

// 上級設定用の変数（draft.frame/text/typewriter へのショートカット、互換用）
const advancedFrameBg = computed({
  get: () => (draft.value.frame?.bg ?? ''),
  set: (v) => {
    if (!draft.value.frame) draft.value.frame = {}
    draft.value.frame.bg = v
  },
})
const advancedFrameBorder = computed({
  get: () => (draft.value.frame?.borderColor ?? ''),
  set: (v) => {
    if (!draft.value.frame) draft.value.frame = {}
    draft.value.frame.borderColor = v
  },
})
const advancedBorderWidth = computed({
  get: () => (draft.value.frame?.borderWidth ?? 0),
  set: (v) => {
    if (!draft.value.frame) draft.value.frame = {}
    draft.value.frame.borderWidth = v
  },
})
const advancedRadius = computed({
  get: () => (draft.value.frame?.radius ?? 0),
  set: (v) => {
    if (!draft.value.frame) draft.value.frame = {}
    draft.value.frame.radius = v
  },
})
const advancedPadding = computed({
  get: () => (draft.value.frame?.padding ?? 0),
  set: (v) => {
    if (!draft.value.frame) draft.value.frame = {}
    draft.value.frame.padding = v
  },
})
const advancedFontSize = computed({
  get: () => (draft.value.text?.size ?? 0),
  set: (v) => {
    if (!draft.value.text) draft.value.text = {}
    draft.value.text.size = v
  },
})
const advancedLineHeight = computed({
  get: () => (draft.value.text?.lineHeight ?? 1.8),
  set: (v) => {
    if (!draft.value.text) draft.value.text = {}
    draft.value.text.lineHeight = v
  },
})
const advancedTypeMs = computed({
  get: () => (draft.value.typewriter?.msPerChar ?? 0),
  set: (v) => {
    if (!draft.value.typewriter) draft.value.typewriter = {}
    draft.value.typewriter.msPerChar = v
  },
})

// カラープリセット
const colorPresets = [
  'rgba(20,24,36,0.72)',
  'rgba(0,0,0,0.8)',
  'rgba(255,255,255,0.9)',
  '#000000',
  '#ffffff',
  '#1e3a8a',
  '#7c3aed',
  '#059669',
  '#dc2626',
  '#ea580c',
]

// 詳細設定を触ったかのフラグ
const advancedTouched = ref(false)

// 詳細設定を触った時の処理
function touchAdvanced() {
  advancedTouched.value = true
}

// プレビュー用テーマ（MessageWindow用に旧形式へ変換）
const previewTheme = computed(() => {
  const d = draft.value
  
  // プリセットから実際の値を計算
  const fontK = FONT_K[d.fontPreset ?? 5] ?? 1
  const baseFontSize = 16
  const fontSize = Math.round(baseFontSize * fontK)
  
  const paddingK = PADDING_K[d.paddingPreset ?? 5] ?? 1
  const basePadding = 16
  const padding = Math.round(basePadding * paddingK)
  
  const radius = RADIUS_PX[d.radiusPreset ?? 5] ?? 12
  const borderWidth = BORDER_PX[d.borderPreset ?? 3] ?? 2
  const typeMs = TYPE_MS[d.typeSpeedPreset ?? 6] ?? 40
  
  // 上級設定が指定されていればそちらを優先
  const finalFontSize = advancedTouched.value && d.text?.size ? d.text.size : fontSize
  const finalPadding = advancedTouched.value && d.frame?.padding ? d.frame.padding : padding
  const finalRadius = advancedTouched.value && d.frame?.radius ? d.frame.radius : radius
  const finalBorderWidth = advancedTouched.value && d.frame?.borderWidth ? d.frame.borderWidth : borderWidth
  const finalTypeMs = advancedTouched.value && d.typewriter?.msPerChar ? d.typewriter.msPerChar : typeMs
  
  // v2から旧形式へ変換（MessageWindowが期待する形式）
  return {
    frame: {
      bg: rgbaToCss(toRgba(d.frameBg)),
      borderColor: rgbaToCss(toRgba(d.frameBorder)),
      borderWidth: finalBorderWidth,
      radius: finalRadius,
      padding: finalPadding,
      shadow: true,
    },
    name: {
      show: d.name?.show ?? true,
      bg: rgbaToCss(toRgba(d.nameBg)),
      color: '#fff',
      padding: Math.round(finalPadding * 0.5),
      radius: Math.round(finalRadius * 0.8),
    },
    text: {
      color: rgbaToCss(toRgba(d.textColor)),
      size: finalFontSize,
      lineHeight: d.text?.lineHeight ?? 1.8,
      fontPreset: d.fontPreset ?? 5,
      rows: d.rows ?? 3,
    },
    typewriter: {
      msPerChar: finalTypeMs,
    },
    scale: d.scale ?? 'md',
  }
})

// コントラスト警告
const contrastWarning = computed(() => {
  const fg = toRgba(draft.value.textColor)
  const bg = toRgba(draft.value.frameBg)
  const ratio = contrastRatio(fg, bg)
  const level = contrastLevel(ratio)
  if (level === 'low') {
    return `文字色と背景色のコントラストが低い（比率 ${ratio.toFixed(2)}:1）ため、読みづらい可能性があります。`
  }
  if (level === 'AA') {
    return `コントラスト比 ${ratio.toFixed(2)}:1（AA基準をクリア。AAA基準には未達）`
  }
  return ''
})

// プレビュー用サンプル
const speaker = ref('ガイドさん')
const sample = ref('ここにサンプル本文が1文字ずつ表示されます。テーマの変更は即時プレビューに反映されます。')
const bg = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&auto=format&fit=crop&q=60'

// リセット
function reset() {
  draft.value = migrateToV2(props.initial ?? defaultThemeV2)
  advancedTouched.value = false
}

// 保存
const { $api } = useNuxtApp()
const toast = useToast()

async function save() {
  try {
    console.log('[MessageThemeModal] 保存開始', props.gameId, draft.value)
    
    // 色をRGBAオブジェクトから文字列へ変換してからシリアライズ
    const v = JSON.parse(JSON.stringify(draft.value))
    
    // RGBAオブジェクトをCSS文字列に変換
    if (v.frameBg && typeof v.frameBg === 'object') {
      v.frameBg = rgbaToCss(v.frameBg)
    }
    if (v.frameBorder && typeof v.frameBorder === 'object') {
      v.frameBorder = rgbaToCss(v.frameBorder)
    }
    if (v.nameBg && typeof v.nameBg === 'object') {
      v.nameBg = rgbaToCss(v.nameBg)
    }
    if (v.textColor && typeof v.textColor === 'object') {
      v.textColor = rgbaToCss(v.textColor)
    }
    
    console.log('[MessageThemeModal] シリアライズ完了', v)
    const result = await $api(`/games/${props.gameId}`, { method: 'PATCH', body: { messageTheme: v } })
    console.log('[MessageThemeModal] API呼び出し成功', result)
    toast.success('保存しました')
    emit('saved', v)
    emit('close')
  } catch (error: any) {
    console.error('[MessageThemeModal] 保存に失敗しました:', error)
    console.error('[MessageThemeModal] エラー詳細:', error.data, error.message, error.statusText)
    toast.error('保存に失敗しました: ' + (error.data?.message || error.message || error.statusText || '不明なエラー'))
  }
}

// エクスポート
function exportTheme() {
  const json = JSON.stringify(draft.value, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `message-theme-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('テーマをエクスポートしました')
}

// インポート
const fileInput = ref<HTMLInputElement | null>(null)
function importTheme() {
  fileInput.value?.click()
}
function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const json = JSON.parse(ev.target?.result as string)
      draft.value = migrateToV2(json)
      advancedTouched.value = false
      toast.success('テーマをインポートしました')
    } catch (err: any) {
      console.error('インポートエラー:', err)
      toast.error('インポートに失敗しました: ' + err.message)
    }
  }
  reader.readAsText(file)
  // ファイル選択をリセット（同じファイルを再選択可能に）
  target.value = ''
}
</script>

