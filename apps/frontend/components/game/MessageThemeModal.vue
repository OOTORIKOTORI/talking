<template>
  <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
    <div class="flex min-h-screen items-center justify-center p-4 md:p-6">
      <div class="w-[min(1200px,96vw)] max-h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <!-- ヘッダー（固定） -->
        <div class="flex items-center justify-between px-5 pt-5 pb-0 border-b">
          <div class="flex items-end gap-0">
            <h3 class="font-semibold text-lg mr-6 pb-3">シナリオ全体設定</h3>
            <button
              v-for="tab in modalTabs"
              :key="tab.key"
              class="px-4 py-3 text-sm border-b-2 transition-colors"
              :class="activeModalTab === tab.key
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-800'"
              @click="activeModalTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>
          <button class="text-gray-500 hover:text-gray-700 text-2xl leading-none pb-3" @click="$emit('close')" title="閉じる">✕</button>
        </div>

        <!-- スクロール可能なコンテンツ領域 -->
        <div class="overflow-y-auto flex-1">
          <!-- ===== メッセージウィンドウ タブ ===== -->
          <template v-if="activeModalTab === 'message'">
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
          </template>

          <!-- ===== その他UI タブ ===== -->
          <template v-if="activeModalTab === 'ui'">
          <div class="px-5 py-5 space-y-6">

            <!-- プレビュー -->
            <section>
              <h4 class="font-semibold text-md mb-3 flex items-center gap-2"><span class="text-blue-600">👁️</span> プレビュー</h4>
              <div class="rounded-xl overflow-hidden border border-gray-200">
                <!-- モーダル風プレビュー -->
                <div class="p-4 text-sm font-medium" :style="{ background: uiDraft.modalOverlayColor || 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center' }">
                  <div class="w-full max-w-sm rounded-xl border p-4 space-y-3"
                    :style="{ background: uiDraft.modalBgColor || '#1e293b', borderColor: uiDraft.modalBorderColor || '#475569', color: uiDraft.modalTextColor || '#f1f5f9' }"
                  >
                    <div class="font-semibold">セーブ / ロード</div>
                    <div class="grid grid-cols-2 gap-2">
                      <div class="rounded-lg border p-2 text-xs" :style="{ background: uiDraft.slotFilledBg || 'rgba(255,255,255,0.07)', borderColor: uiDraft.slotSelectedBorder || '#60a5fa' }">
                        <div class="font-medium">手動 1</div>
                        <div class="opacity-60 mt-1 truncate">サンプルデータ</div>
                      </div>
                      <div class="rounded-lg border p-2 text-xs" :style="{ background: uiDraft.slotEmptyBg || 'rgba(255,255,255,0.04)', borderColor: uiDraft.modalBorderColor || '#475569' }">
                        <div class="font-medium">手動 2</div>
                        <div class="opacity-40 mt-1">データなし</div>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button class="px-3 py-1.5 rounded text-xs font-medium" :style="{ background: uiDraft.modalAccentColor || '#10b981', color: '#fff' }">この枠にセーブ</button>
                      <button class="px-3 py-1.5 rounded text-xs font-medium" :style="{ background: uiDraft.modalLoadAccentColor || '#38bdf8', color: '#fff' }">ロード</button>
                    </div>
                    <div class="text-xs text-right opacity-50 mt-1">
                      SAVE / LOAD ボタン →
                      <span class="inline-block rounded px-2 py-0.5 text-[10px]" :style="{ background: uiDraft.quickButtonBg || 'rgba(255,255,255,0.15)', color: uiDraft.quickButtonText || '#fff' }">SAVE</span>
                      <span class="inline-block rounded px-2 py-0.5 text-[10px] ml-1" :style="{ background: uiDraft.quickButtonBg || 'rgba(255,255,255,0.15)', color: uiDraft.quickButtonText || '#fff' }">LOAD</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- テーマプリセット -->
            <section>
              <h4 class="font-semibold text-md mb-3 flex items-center gap-2">
                <span class="text-indigo-600">🎨</span> テーマプリセット
              </h4>
              <p class="text-sm text-gray-600 mb-3">雰囲気に合ったテーマを一発適用（プレビューで色をすぐ確認できます）</p>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  v-for="(preset, key) in uiThemePresets"
                  :key="key"
                  class="flex flex-col items-center gap-1 p-3 border-2 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                  :title="preset.description"
                  @click="applyUiPreset(key as any)"
                >
                  <div class="w-full h-4 rounded flex overflow-hidden">
                    <div class="flex-1" :style="{ background: preset.settings.modalBgColor }"></div>
                    <div class="w-4" :style="{ background: preset.settings.modalAccentColor }"></div>
                    <div class="w-4" :style="{ background: preset.settings.modalLoadAccentColor }"></div>
                  </div>
                  <span class="text-xl mt-1">{{ preset.icon }}</span>
                  <span class="text-xs font-medium">{{ preset.name }}</span>
                  <span class="text-[10px] text-gray-500 text-center">{{ preset.description }}</span>
                </button>
              </div>
            </section>

            <!-- かんたん設定 -->
            <section>
              <h4 class="font-semibold text-md mb-3 flex items-center gap-2">
                <span class="text-blue-600">📐</span> かんたん設定
              </h4>
              <div class="grid gap-4 md:grid-cols-2 text-sm">
                <label class="flex flex-col">
                  <span class="mb-1 font-medium">オーバーレイ濃さ（1=薄 〜 10=濃）</span>
                  <input v-model.number="uiOverlayOpacity" type="range" min="1" max="10" step="1" class="mt-1" />
                  <span class="text-xs text-gray-600 text-center">{{ uiOverlayOpacity }}</span>
                </label>
                <label class="flex flex-col">
                  <span class="mb-1 font-medium">角丸（0=角張 〜 10=丸）</span>
                  <input v-model.number="uiRadiusPreset" type="range" min="0" max="10" step="1" class="mt-1" />
                  <span class="text-xs text-gray-600 text-center">{{ uiDraft.modalRadius ?? 16 }}px</span>
                </label>
              </div>
            </section>

            <!-- 色設定 -->
            <section>
              <h4 class="font-semibold text-md mb-3 flex items-center gap-2"><span class="text-purple-600">🎨</span> 色設定</h4>
              <div class="space-y-4">
                <ColorField
                  :modelValue="uiDraft.modalBgColor || '#0f172a'"
                  label="モーダル背景色"
                  :presets="uiColorPresets"
                  @update:modelValue="(v) => uiDraft.modalBgColor = rgbaToCss(v)"
                />
                <ColorField
                  :modelValue="uiDraft.modalTextColor || '#f1f5f9'"
                  label="テキスト色"
                  :presets="uiColorPresets"
                  @update:modelValue="(v) => uiDraft.modalTextColor = rgbaToCss(v)"
                />
                <ColorField
                  :modelValue="uiDraft.modalBorderColor || '#334155'"
                  label="枠線色"
                  :presets="uiColorPresets"
                  @update:modelValue="(v) => uiDraft.modalBorderColor = rgbaToCss(v)"
                />
                <ColorField
                  :modelValue="uiDraft.modalAccentColor || '#10b981'"
                  label="セーブボタン色"
                  :presets="uiColorPresets"
                  @update:modelValue="(v) => uiDraft.modalAccentColor = rgbaToCss(v)"
                />
                <ColorField
                  :modelValue="uiDraft.modalLoadAccentColor || '#38bdf8'"
                  label="ロードボタン色"
                  :presets="uiColorPresets"
                  @update:modelValue="(v) => uiDraft.modalLoadAccentColor = rgbaToCss(v)"
                />
              </div>
            </section>

            <!-- スロットカード -->
            <section>
              <h4 class="font-semibold text-md mb-3 flex items-center gap-2"><span class="text-amber-600">🗃️</span> スロットカード</h4>
              <div class="space-y-4">
                <ColorField
                  :modelValue="uiDraft.slotEmptyBg || 'rgba(255,255,255,0.04)'"
                  label="空スロット背景"
                  :presets="uiColorPresets"
                  @update:modelValue="(v) => uiDraft.slotEmptyBg = rgbaToCss(v)"
                />
                <ColorField
                  :modelValue="uiDraft.slotFilledBg || 'rgba(255,255,255,0.07)'"
                  label="データありスロット背景"
                  :presets="uiColorPresets"
                  @update:modelValue="(v) => uiDraft.slotFilledBg = rgbaToCss(v)"
                />
                <ColorField
                  :modelValue="uiDraft.slotSelectedBorder || '#60a5fa'"
                  label="選択中枠線色"
                  :presets="uiColorPresets"
                  @update:modelValue="(v) => uiDraft.slotSelectedBorder = rgbaToCss(v)"
                />
              </div>
            </section>

            <!-- SAVE/LOADクイックボタン -->
            <section>
              <h4 class="font-semibold text-md mb-3 flex items-center gap-2"><span class="text-cyan-600">💾</span> SAVE / LOAD クイックボタン（話者名横）</h4>
              <div class="space-y-4">
                <ColorField
                  :modelValue="uiDraft.quickButtonBg || 'rgba(255,255,255,0.15)'"
                  label="ボタン背景色"
                  :presets="uiColorPresets"
                  @update:modelValue="(v) => uiDraft.quickButtonBg = rgbaToCss(v)"
                />
                <ColorField
                  :modelValue="uiDraft.quickButtonText || '#ffffff'"
                  label="ボタンテキスト色"
                  :presets="uiColorPresets"
                  @update:modelValue="(v) => uiDraft.quickButtonText = rgbaToCss(v)"
                />
              </div>
            </section>

            <!-- リセット -->
            <div class="flex justify-end">
              <button class="px-3 py-1.5 text-sm rounded bg-gray-200 hover:bg-gray-300" @click="resetUi">その他UIをリセット</button>
            </div>
          </div>
          </template>

          <!-- ===== バックログ タブ ===== -->
          <template v-if="activeModalTab === 'backlog'">
          <div class="px-5 py-5 space-y-6">
            <section>
              <h4 class="font-semibold text-md mb-3 flex items-center gap-2"><span class="text-violet-600">📜</span> プレビュー</h4>
              <div class="rounded-xl p-4 border" :style="backlogPreviewStyle">
                <div class="space-y-3 max-h-[220px] overflow-y-auto">
                  <div class="border-b border-white/10 pb-2">
                    <div :style="backlogSpeakerStyle">案内役</div>
                    <p class="m-0 leading-7">ここに最新の会話ログが上から表示されます。</p>
                  </div>
                  <div class="border-b border-white/10 pb-2">
                    <div :style="backlogSpeakerStyle">主人公</div>
                    <p class="m-0 leading-7">背景色・文字色・話者色・文字サイズを確認できます。</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h4 class="font-semibold text-md mb-3 flex items-center gap-2"><span class="text-blue-600">📐</span> かんたん設定</h4>
              <div class="grid gap-4 md:grid-cols-2 text-sm">
                <label class="flex flex-col">
                  <span class="mb-1 font-medium">プリセット (1〜10)</span>
                  <input v-model.number="backlogDraft.preset" type="range" min="1" max="10" class="mt-1" />
                  <span class="text-xs text-gray-600 text-center">{{ backlogDraft.preset }}</span>
                </label>
                <label class="flex flex-col">
                  <span class="mb-1 font-medium">フォントサイズ (px)</span>
                  <input v-model.number="backlogDraft.fontSize" type="number" min="10" max="24" class="border rounded px-3 py-2" />
                </label>
              </div>
            </section>

            <section>
              <h4 class="font-semibold text-md mb-3 flex items-center gap-2"><span class="text-purple-600">🎨</span> 色設定</h4>
              <div class="space-y-4">
                <ColorField
                  :modelValue="backlogDraft.bgColor"
                  label="背景色"
                  :presets="uiColorPresets"
                  @update:modelValue="(v) => backlogDraft.bgColor = rgbaToCss(v)"
                />
                <ColorField
                  :modelValue="backlogDraft.textColor"
                  label="テキスト色"
                  :presets="uiColorPresets"
                  @update:modelValue="(v) => backlogDraft.textColor = rgbaToCss(v)"
                />
                <ColorField
                  :modelValue="backlogDraft.speakerColor"
                  label="話者名の色"
                  :presets="uiColorPresets"
                  @update:modelValue="(v) => backlogDraft.speakerColor = rgbaToCss(v)"
                />
              </div>
            </section>

            <div class="flex justify-end">
              <button class="px-3 py-1.5 text-sm rounded bg-gray-200 hover:bg-gray-300" @click="resetBacklog">バックログ設定をリセット</button>
            </div>
          </div>
          </template>

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
            <button @click="reset" class="px-4 py-2 bg-gray-200 border rounded hover:bg-gray-300 text-sm font-medium" :disabled="saving">
              リセット
            </button>
            <button @click="save" class="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium shadow disabled:bg-gray-400 disabled:cursor-not-allowed" :disabled="saving">
              {{ saving ? '保存中...' : '保存' }}
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
import type { MessageThemeV2, RGBA, GameUiTheme, BacklogTheme } from '@talking/types'
import { FONT_K, PADDING_K, RADIUS_PX, BORDER_PX, TYPE_MS, DEFAULT_BACKLOG_THEME, resolveBacklogPreset } from '@talking/types'
import MessageWindow from '@/components/game/MessageWindow.vue'
import ColorField from '@/components/ui/ColorField.vue'
import { migrateToV2, contrastRatio, contrastLevel, toRgba, rgbaToCss } from '@/utils/themeUtils'

const props = defineProps<{ gameId: string; initial?: any; initialUi?: GameUiTheme; initialBacklog?: BacklogTheme }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved', v: any): void }>()  

// タブ
type ModalTabKey = 'message' | 'ui' | 'backlog'
const activeModalTab = ref<ModalTabKey>('message')
const modalTabs: { key: ModalTabKey; label: string }[] = [
  { key: 'message', label: 'メッセージウィンドウ' },
  { key: 'ui', label: 'その他UI' },
  { key: 'backlog', label: 'バックログ' },
]

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

// --- その他UI設定 draft ---
const defaultUiTheme: GameUiTheme = {}
const uiDraft = ref<GameUiTheme>({ ...defaultUiTheme, ...(props.initialUi ?? {}) })
function resetUi() { uiDraft.value = { ...defaultUiTheme } }

// --- バックログ設定 draft ---
const backlogDraft = ref<BacklogTheme>({ ...(props.initialBacklog ?? DEFAULT_BACKLOG_THEME) })
function resetBacklog() { backlogDraft.value = { ...(props.initialBacklog ?? DEFAULT_BACKLOG_THEME) } }

const resolvedBacklog = computed(() => resolveBacklogPreset(backlogDraft.value.preset))
const backlogPreviewStyle = computed(() => ({
  background: backlogDraft.value.bgColor || resolvedBacklog.value.bgColor,
  color: backlogDraft.value.textColor || DEFAULT_BACKLOG_THEME.textColor,
  fontSize: `${backlogDraft.value.fontSize || resolvedBacklog.value.fontSize}px`,
}))
const backlogSpeakerStyle = computed(() => ({
  color: backlogDraft.value.speakerColor || DEFAULT_BACKLOG_THEME.speakerColor,
  fontWeight: 'bold',
}))

// UIカラープリセットパレット
const uiColorPresets = [
  '#0f172a', '#1e293b', '#334155', '#475569',
  '#ffffff', '#f1f5f9', '#000000',
  '#10b981', '#38bdf8', '#60a5fa',
  '#f59e0b', '#ec4899', '#ffd700',
  'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.07)', 'rgba(255,255,255,0.04)',
  'rgba(0,0,0,0.65)',
]

// UIテーマプリセット定義
const uiThemePresets = {
  dark: {
    name: 'ダーク',
    icon: '🌙',
    description: '暗色・シックなスタンダード',
    settings: {
      modalOverlayColor: 'rgba(0,0,0,0.65)', modalBgColor: '#0f172a', modalTextColor: '#f1f5f9',
      modalBorderColor: '#334155', modalAccentColor: '#10b981', modalLoadAccentColor: '#38bdf8',
      modalRadius: 16, slotEmptyBg: 'rgba(255,255,255,0.04)', slotFilledBg: 'rgba(255,255,255,0.1)',
      slotSelectedBorder: '#60a5fa', quickButtonBg: 'rgba(255,255,255,0.15)', quickButtonText: '#ffffff',
    },
  },
  light: {
    name: 'ライト',
    icon: '☀️',
    description: '明るく清潔感のあるデザイン',
    settings: {
      modalOverlayColor: 'rgba(0,0,0,0.4)', modalBgColor: '#ffffff', modalTextColor: '#1e293b',
      modalBorderColor: '#e2e8f0', modalAccentColor: '#16a34a', modalLoadAccentColor: '#0284c7',
      modalRadius: 12, slotEmptyBg: 'rgba(0,0,0,0.03)', slotFilledBg: 'rgba(0,0,0,0.08)',
      slotSelectedBorder: '#3b82f6', quickButtonBg: 'rgba(0,0,0,0.15)', quickButtonText: '#1e293b',
    },
  },
  fantasy: {
    name: 'ファンタジー',
    icon: '🏰',
    description: '紫×金の幻想的なデザイン',
    settings: {
      modalOverlayColor: 'rgba(20,0,40,0.75)', modalBgColor: '#1e0a3c', modalTextColor: '#f0e68c',
      modalBorderColor: '#b8860b', modalAccentColor: '#ffd700', modalLoadAccentColor: '#9370db',
      modalRadius: 4, slotEmptyBg: 'rgba(255,215,0,0.05)', slotFilledBg: 'rgba(255,215,0,0.12)',
      slotSelectedBorder: '#ffd700', quickButtonBg: 'rgba(255,215,0,0.2)', quickButtonText: '#ffd700',
    },
  },
  retro: {
    name: 'レトロ',
    icon: '🎮',
    description: 'ドット絵・レトロゲーム風',
    settings: {
      modalOverlayColor: 'rgba(0,0,0,0.85)', modalBgColor: '#000000', modalTextColor: '#00ff00',
      modalBorderColor: '#00ff00', modalAccentColor: '#00cc00', modalLoadAccentColor: '#00aaff',
      modalRadius: 0, slotEmptyBg: 'rgba(0,255,0,0.05)', slotFilledBg: 'rgba(0,255,0,0.15)',
      slotSelectedBorder: '#00ff00', quickButtonBg: 'rgba(0,255,0,0.15)', quickButtonText: '#00ff00',
    },
  },
  scifi: {
    name: 'SF',
    icon: '🚀',
    description: '未来的なサイバーパンク調',
    settings: {
      modalOverlayColor: 'rgba(0,10,30,0.85)', modalBgColor: '#020b18', modalTextColor: '#00e5ff',
      modalBorderColor: '#0288d1', modalAccentColor: '#00e5ff', modalLoadAccentColor: '#7c4dff',
      modalRadius: 2, slotEmptyBg: 'rgba(0,229,255,0.05)', slotFilledBg: 'rgba(0,229,255,0.12)',
      slotSelectedBorder: '#00e5ff', quickButtonBg: 'rgba(0,229,255,0.15)', quickButtonText: '#00e5ff',
    },
  },
  japanese: {
    name: '和風',
    icon: '🎌',
    description: '和紙・墨のような落ち着いたデザイン',
    settings: {
      modalOverlayColor: 'rgba(0,0,0,0.6)', modalBgColor: '#f5f0e8', modalTextColor: '#2d1a00',
      modalBorderColor: '#8b5e3c', modalAccentColor: '#8b1a1a', modalLoadAccentColor: '#2e5a2e',
      modalRadius: 8, slotEmptyBg: 'rgba(0,0,0,0.04)', slotFilledBg: 'rgba(139,90,60,0.1)',
      slotSelectedBorder: '#8b1a1a', quickButtonBg: 'rgba(139,90,60,0.2)', quickButtonText: '#2d1a00',
    },
  },
  horror: {
    name: 'ホラー',
    icon: '👻',
    description: '血のように赤い恐怖のデザイン',
    settings: {
      modalOverlayColor: 'rgba(0,0,0,0.9)', modalBgColor: '#0d0000', modalTextColor: '#cc0000',
      modalBorderColor: '#660000', modalAccentColor: '#cc0000', modalLoadAccentColor: '#440044',
      modalRadius: 0, slotEmptyBg: 'rgba(200,0,0,0.05)', slotFilledBg: 'rgba(200,0,0,0.12)',
      slotSelectedBorder: '#cc0000', quickButtonBg: 'rgba(200,0,0,0.2)', quickButtonText: '#cc0000',
    },
  },
  pastel: {
    name: 'パステル',
    icon: '🌸',
    description: 'やわらかく可愛いデザイン',
    settings: {
      modalOverlayColor: 'rgba(255,200,220,0.5)', modalBgColor: '#fff0f5', modalTextColor: '#6d2b6d',
      modalBorderColor: '#f0b8d8', modalAccentColor: '#e8719c', modalLoadAccentColor: '#82c8e8',
      modalRadius: 20, slotEmptyBg: 'rgba(232,113,156,0.05)', slotFilledBg: 'rgba(232,113,156,0.15)',
      slotSelectedBorder: '#e8719c', quickButtonBg: 'rgba(232,113,156,0.2)', quickButtonText: '#6d2b6d',
    },
  },
} as const

function applyUiPreset(key: keyof typeof uiThemePresets) {
  uiDraft.value = { ...uiThemePresets[key].settings }
}

// オーバーレイ濃さ（1=薄 〜 10=濃 → alpha 0.1〜1.0 にマッピング）
const uiOverlayOpacity = computed({
  get: () => {
    const parsed = toRgba(uiDraft.value.modalOverlayColor, { r: 0, g: 0, b: 0, a: 0.65 })
    return Math.max(1, Math.min(10, Math.round(parsed.a * 10)))
  },
  set: (v: number) => {
    const opacity = Math.max(0.1, Math.min(1, v / 10))
    const parsed = toRgba(uiDraft.value.modalOverlayColor, { r: 0, g: 0, b: 0, a: opacity })
    parsed.a = opacity
    uiDraft.value.modalOverlayColor = rgbaToCss(parsed)
  },
})

// 角丸プリセット（0〜10 → 0〜32px）
const uiRadiusPreset = computed({
  get: () => Math.round((uiDraft.value.modalRadius ?? 16) / 3.2),
  set: (v: number) => { uiDraft.value.modalRadius = Math.round(v * 3.2) },
})

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
  resetUi()
  resetBacklog()
}

// 保存
const toast = useToast()
const saving = ref(false)

async function save() {
  saving.value = true
  try {
    const { $api } = useNuxtApp() // 関数内で取得してSSR問題を回避
    
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
    
    const result: any = await $api(`/games/${props.gameId}`, {
      method: 'PATCH',
      body: { messageTheme: v, gameUiTheme: uiDraft.value, backlogTheme: backlogDraft.value }
    })
    
    // 親へ通知（即時反映させる）
    emit('saved', {
      messageTheme: result?.messageTheme ?? v,
      gameUiTheme: result?.gameUiTheme ?? uiDraft.value,
      backlogTheme: result?.backlogTheme ?? backlogDraft.value,
    })
    toast.success('全体設定を保存しました')
    emit('close')
  } catch (error: any) {
    console.error('[MessageThemeModal] 保存に失敗しました:', error)
    console.error('[MessageThemeModal] エラー詳細:', error.data, error.message, error.statusText)
    
    const status = error?.response?.status ?? error?.status
    const msg = error?.response?._data?.message ?? error?.data?.message ?? error?.message ?? error?.statusText ?? '不明なエラー'
    toast.error(`保存エラー${status ? ` (${status})` : ''}: ${msg}`)
  } finally {
    saving.value = false
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

