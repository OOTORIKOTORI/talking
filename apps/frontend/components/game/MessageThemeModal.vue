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
                <MessageWindow :key="animationKey" :speaker="speaker" :text="sample" :theme="previewTheme" :animate="true" />
              </div>
            </div>
          </div>

          <!-- フォーム -->
          <div class="px-5 pb-5 space-y-6">
            <!-- プリセット選択 -->
            <section>
              <h4 class="font-semibold text-md mb-3 flex items-center gap-2">
                <span class="text-indigo-600">🎨</span> テーマプリセット
              </h4>
              <p class="text-sm text-gray-600 mb-3">雰囲気に合わせたテーマを一発適用（行数・サイズは保持されます）</p>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  v-for="(preset, key) in themePresets"
                  :key="key"
                  @click="applyPreset(key as any)"
                  class="flex flex-col items-center gap-1 p-3 border-2 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                  :title="preset.description"
                >
                  <span class="text-2xl">{{ preset.icon }}</span>
                  <span class="text-xs font-medium">{{ preset.name }}</span>
                  <span class="text-[10px] text-gray-500 text-center">{{ preset.description }}</span>
                </button>
              </div>
            </section>

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

            <!-- B3. フォント装飾 -->
            <section>
              <h4 class="font-semibold text-md mb-3 flex items-center gap-2">
                <span class="text-green-600">✍️</span> フォント装飾
              </h4>
              <div class="grid gap-4 md:grid-cols-2 text-sm">
                <!-- フォントウェイト -->
                <label class="flex flex-col">
                  <span class="mb-1 font-medium">文字の太さ</span>
                  <select v-model="draft.fontWeight" class="border rounded px-3 py-2">
                    <option value="normal">標準</option>
                    <option value="300">細い (300)</option>
                    <option value="400">やや細い (400)</option>
                    <option value="500">ミディアム (500)</option>
                    <option value="600">やや太い (600)</option>
                    <option value="bold">太字 (Bold)</option>
                    <option value="700">太い (700)</option>
                    <option value="800">極太 (800)</option>
                    <option value="900">最太 (900)</option>
                  </select>
                </label>

                <!-- フォントスタイル -->
                <label class="flex flex-col">
                  <span class="mb-1 font-medium">文字スタイル</span>
                  <select v-model="draft.fontStyle" class="border rounded px-3 py-2">
                    <option value="normal">標準</option>
                    <option value="italic">イタリック</option>
                  </select>
                </label>

                <!-- フォントファミリー -->
                <label class="flex flex-col md:col-span-2">
                  <span class="mb-1 font-medium">フォント（30種類）</span>
                  <select v-model="draft.fontFamily" class="border rounded px-3 py-2">
                    <option :value="undefined">デフォルト（システム）</option>
                    
                    <optgroup label="📝 ゴシック体（標準）">
                      <option value="'Noto Sans JP', sans-serif">Noto Sans JP（標準・読みやすい）</option>
                      <option value="'M PLUS 1p', sans-serif">M PLUS 1p（すっきり）</option>
                      <option value="'Sawarabi Gothic', sans-serif">さわらびゴシック（細め）</option>
                      <option value="'Kosugi', sans-serif">小杉ゴシック（やや太め）</option>
                      <option value="'Zen Kaku Gothic New', sans-serif">Zen 角ゴシック（モダン）</option>
                    </optgroup>
                    
                    <optgroup label="🎨 丸ゴシック">
                      <option value="'Zen Maru Gothic', sans-serif">Zen 丸ゴシック（やさしい）</option>
                      <option value="'M PLUS Rounded 1c', sans-serif">M PLUS Rounded（太丸）</option>
                      <option value="'Kosugi Maru', sans-serif">小杉丸ゴシック（ポップ）</option>
                      <option value="'Kiwi Maru', sans-serif">キウイ丸（かわいい）</option>
                      <option value="'RocknRoll One', sans-serif">RocknRoll One（元気）</option>
                    </optgroup>
                    
                    <optgroup label="📖 明朝体">
                      <option value="'Noto Serif JP', serif">Noto Serif JP（標準明朝）</option>
                      <option value="'Sawarabi Mincho', serif">さわらび明朝（細め）</option>
                      <option value="'Shippori Mincho', serif">しっぽり明朝（和風）</option>
                      <option value="'Shippori Mincho B1', serif">しっぽり明朝B1（太め和風）</option>
                      <option value="'Zen Old Mincho', serif">Zen 旧明朝体（古風）</option>
                      <option value="'New Tegomin', serif">New てごみん（手書き風明朝）</option>
                    </optgroup>
                    
                    <optgroup label="🎭 装飾明朝">
                      <option value="'Kaisei Decol', serif">解星デコール（装飾的）</option>
                      <option value="'Kaisei Opti', serif">解星オプティ（エレガント）</option>
                      <option value="'Kaisei Tokumin', serif">解星特ミン（個性的）</option>
                      <option value="'Kaisei HarunoUmi', serif">解星春の海（優雅）</option>
                    </optgroup>
                    
                    <optgroup label="🎪 ポップ・個性的">
                      <option value="'Stick', sans-serif">スティック（細長い）</option>
                      <option value="'Potta One', sans-serif">ポッタ（太い）</option>
                      <option value="'Reggae One', sans-serif">レゲエ（カジュアル）</option>
                      <option value="'Dela Gothic One', sans-serif">デラゴシック（極太）</option>
                      <option value="'Hachi Maru Pop', sans-serif">はちまるポップ（レトロ）</option>
                      <option value="'Yusei Magic', sans-serif">油性マジック（手書き風）</option>
                      <option value="'Train One', sans-serif">トレイン（太角）</option>
                      <option value="'Rampart One', sans-serif">ランパート（インパクト）</option>
                      <option value="'Yomogi', sans-serif">ヨモギ（手書き風）</option>
                    </optgroup>
                    
                    <optgroup label="🎮 特殊">
                      <option value="'Mochiy Pop One', sans-serif">もちポップ（ぷにぷに）</option>
                      <option value="'Mochiy Pop P One', sans-serif">もちポップP（角丸）</option>
                      <option value="'DotGothic16', monospace">ドットゴシック16（ピクセル）</option>
                      <option value="'Courier New', monospace">等幅フォント（タイプライター）</option>
                      <option value="'Rock Salt', cursive">Rock Salt（手書きラフ）</option>
                      <option value="'Slackkey', cursive">Slackkey（筆記体風）</option>
                    </optgroup>
                  </select>
                </label>
              </div>
            </section>

            <!-- B4. 文字の縁取り -->
            <section>
              <h4 class="font-semibold text-md mb-3 flex items-center gap-2">
                <span class="text-purple-600">✨</span> 文字の縁取り
              </h4>
              <div class="grid gap-4 md:grid-cols-2 text-sm">
                <!-- 縁取り太さ -->
                <label class="flex flex-col">
                  <span class="mb-1 font-medium">縁取り太さ（px）</span>
                  <input 
                    v-model.number="draft.textStrokeWidth" 
                    type="range" 
                    min="0" 
                    max="8" 
                    step="0.5"
                    class="mb-1"
                  />
                  <span class="text-xs text-gray-600">{{ draft.textStrokeWidth ?? 0 }}px</span>
                </label>

                <!-- 縁取り色 -->
                <div>
                  <ColorField v-model="draft.textStrokeColor" label="縁取り色" :presets="colorPresets" />
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
  fontWeight: 'normal',
  fontStyle: 'normal',
  fontFamily: undefined, // デフォルトはシステムフォント
  textStrokeColor: { r: 0, g: 0, b: 0, a: 1 }, // 縁取り色（黒）
  textStrokeWidth: 0, // 縁取りなし
}

// v1→v2 マイグレーション
const draft = ref<MessageThemeV2>(migrateToV2(props.initial ?? defaultThemeV2))

// テーマプリセット定義（雰囲気重視、行数・サイズは保持）
const themePresets = {
  simple: {
    name: 'シンプル',
    icon: '📝',
    description: '読みやすいスタンダード',
    settings: {
      frameBg: { r: 20, g: 24, b: 36, a: 0.72 },
      frameBorder: { r: 255, g: 255, b: 255, a: 0.2 },
      nameBg: { r: 0, g: 0, b: 0, a: 0.55 },
      textColor: { r: 255, g: 255, b: 255, a: 1 },
      fontWeight: 'normal' as const,
      fontStyle: 'normal' as const,
      fontFamily: "'Noto Sans JP', sans-serif",
      textStrokeColor: { r: 0, g: 0, b: 0, a: 1 },
      textStrokeWidth: 0,
    }
  },
  japanese: {
    name: '和風',
    icon: '🎌',
    description: '和の情緒を演出',
    settings: {
      frameBg: { r: 242, g: 236, b: 225, a: 0.9 },
      frameBorder: { r: 139, g: 69, b: 19, a: 0.4 },
      nameBg: { r: 139, g: 69, b: 19, a: 0.7 },
      textColor: { r: 51, g: 51, b: 51, a: 1 },
      fontWeight: 'normal' as const,
      fontStyle: 'normal' as const,
      fontFamily: "'Shippori Mincho', serif",
      textStrokeColor: { r: 255, g: 255, b: 255, a: 0.3 },
      textStrokeWidth: 0.5,
    }
  },
  fantasy: {
    name: 'ファンタジー',
    icon: '🏰',
    description: '魔法と冒険の世界',
    settings: {
      frameBg: { r: 75, g: 0, b: 130, a: 0.75 },
      frameBorder: { r: 255, g: 215, b: 0, a: 0.5 },
      nameBg: { r: 138, g: 43, b: 226, a: 0.8 },
      textColor: { r: 255, g: 255, b: 255, a: 1 },
      fontWeight: '500' as const,
      fontStyle: 'normal' as const,
      fontFamily: "'Zen Kaku Gothic New', sans-serif",
      textStrokeColor: { r: 138, g: 43, b: 226, a: 0.8 },
      textStrokeWidth: 1.5,
    }
  },
  romance: {
    name: '恋愛ゲーム',
    icon: '💕',
    description: 'ときめきを演出',
    settings: {
      frameBg: { r: 255, g: 182, b: 193, a: 0.8 },
      frameBorder: { r: 255, g: 105, b: 180, a: 0.4 },
      nameBg: { r: 255, g: 20, b: 147, a: 0.7 },
      textColor: { r: 80, g: 0, b: 40, a: 1 },
      fontWeight: 'normal' as const,
      fontStyle: 'normal' as const,
      fontFamily: "'Kiwi Maru', sans-serif",
      textStrokeColor: { r: 255, g: 255, b: 255, a: 0.6 },
      textStrokeWidth: 1,
    }
  },
  retro: {
    name: 'レトロゲーム',
    icon: '🎮',
    description: '懐かしのドット絵風',
    settings: {
      frameBg: { r: 0, g: 0, b: 0, a: 0.85 },
      frameBorder: { r: 0, g: 255, b: 0, a: 0.8 },
      nameBg: { r: 0, g: 100, b: 0, a: 0.9 },
      textColor: { r: 0, g: 255, b: 0, a: 1 },
      fontWeight: 'bold' as const,
      fontStyle: 'normal' as const,
      fontFamily: "'DotGothic16', monospace",
      textStrokeColor: { r: 0, g: 0, b: 0, a: 1 },
      textStrokeWidth: 0,
    }
  },
  horror: {
    name: 'ホラー',
    icon: '👻',
    description: '恐怖を演出',
    settings: {
      frameBg: { r: 20, g: 0, b: 0, a: 0.9 },
      frameBorder: { r: 139, g: 0, b: 0, a: 0.7 },
      nameBg: { r: 80, g: 0, b: 0, a: 0.85 },
      textColor: { r: 220, g: 220, b: 220, a: 1 },
      fontWeight: 'normal' as const,
      fontStyle: 'normal' as const,
      fontFamily: "'Sawarabi Mincho', serif",
      textStrokeColor: { r: 139, g: 0, b: 0, a: 0.5 },
      textStrokeWidth: 1,
    }
  },
  scifi: {
    name: 'SF',
    icon: '🚀',
    description: '未来的でクール',
    settings: {
      frameBg: { r: 0, g: 20, b: 40, a: 0.85 },
      frameBorder: { r: 0, g: 191, b: 255, a: 0.6 },
      nameBg: { r: 0, g: 100, b: 150, a: 0.8 },
      textColor: { r: 0, g: 255, b: 255, a: 1 },
      fontWeight: '500' as const,
      fontStyle: 'normal' as const,
      fontFamily: "'M PLUS 1p', sans-serif",
      textStrokeColor: { r: 0, g: 50, b: 100, a: 0.8 },
      textStrokeWidth: 1,
    }
  },
  comedy: {
    name: 'コメディ',
    icon: '😄',
    description: '明るく楽しい雰囲気',
    settings: {
      frameBg: { r: 255, g: 255, b: 100, a: 0.85 },
      frameBorder: { r: 255, g: 140, b: 0, a: 0.5 },
      nameBg: { r: 255, g: 165, b: 0, a: 0.8 },
      textColor: { r: 51, g: 51, b: 51, a: 1 },
      fontWeight: 'bold' as const,
      fontStyle: 'normal' as const,
      fontFamily: "'Hachi Maru Pop', sans-serif",
      textStrokeColor: { r: 255, g: 255, b: 255, a: 0.8 },
      textStrokeWidth: 2,
    }
  },
}

// プリセット適用（行数・サイズは保持）
function applyPreset(presetKey: keyof typeof themePresets) {
  const preset = themePresets[presetKey]
  // 現在の行数・サイズ設定を保持
  const currentRows = draft.value.rows
  const currentScale = draft.value.scale
  const currentFontPreset = draft.value.fontPreset
  const currentWindowPreset = draft.value.windowPreset
  const currentPaddingPreset = draft.value.paddingPreset
  const currentRadiusPreset = draft.value.radiusPreset
  const currentBorderPreset = draft.value.borderPreset
  const currentShadowPreset = draft.value.shadowPreset
  const currentTypeSpeedPreset = draft.value.typeSpeedPreset
  
  // プリセット設定を適用
  Object.assign(draft.value, preset.settings)
  
  // 行数・サイズ設定を復元
  draft.value.rows = currentRows
  draft.value.scale = currentScale
  draft.value.fontPreset = currentFontPreset
  draft.value.windowPreset = currentWindowPreset
  draft.value.paddingPreset = currentPaddingPreset
  draft.value.radiusPreset = currentRadiusPreset
  draft.value.borderPreset = currentBorderPreset
  draft.value.shadowPreset = currentShadowPreset
  draft.value.typeSpeedPreset = currentTypeSpeedPreset
  
  animationKey.value++
}

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

// プレビュー用テーマ（v2形式をそのまま渡す）
const previewTheme = computed(() => {
  return draft.value
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
const bg = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&auto=format&fit=crop&q=60'

// サンプル文字のバリエーション（行数に応じて）
const sampleTexts: Record<number, string> = {
  1: 'ここにサンプル本文が1文字ずつ表示されます。',
  2: 'ここにサンプル本文が1文字ずつ表示されます。\n2行目のテキストも表示されます。',
  3: 'ここにサンプル本文が1文字ずつ表示されます。\n2行目のテキストも表示されます。\n3行目まで確認できます。',
  4: 'ここにサンプル本文が1文字ずつ表示されます。\n2行目のテキストも表示されます。\n3行目まで確認できます。\n4行表示のサンプルです。',
  5: 'ここにサンプル本文が1文字ずつ表示されます。\n2行目のテキストも表示されます。\n3行目まで確認できます。\n4行表示のサンプルです。\n5行目まで表示されています。',
  6: 'ここにサンプル本文が1文字ずつ表示されます。\n2行目のテキストも表示されます。\n3行目まで確認できます。\n4行表示のサンプルです。\n5行目まで表示されています。\n最大6行まで表示できます。',
}

// 行数とタイプ速度に応じてサンプルテキストを更新
const sample = computed(() => {
  const rows = draft.value.rows ?? 3
  return sampleTexts[rows] ?? sampleTexts[3]
})

// タイプ速度が変更されたら再アニメーション用のキー
const animationKey = ref(0)

// タイプ速度または行数が変更されたら再アニメーション
watch([() => draft.value.typeSpeedPreset, () => draft.value.rows, () => draft.value.typewriter?.msPerChar], () => {
  animationKey.value++
})

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

