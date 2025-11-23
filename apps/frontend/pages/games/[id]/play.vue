<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <div v-if="loading" class="text-white text-center">
      <p class="text-xl">読み込み中...</p>
    </div>

    <div v-else-if="error" class="text-red-400 text-center">
      <p class="text-xl">エラー: {{ error }}</p>
      <NuxtLink to="/" class="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded">
        トップに戻る
      </NuxtLink>
    </div>

    <div v-else-if="game" class="w-[90vw] max-w-[1400px] mx-auto">
      <div class="rounded-lg overflow-hidden shadow-2xl bg-black relative">
        <!-- StageCanvasを使用して統一構造 (背景とキャラのみ) -->
        <StageCanvas 
          style="aspect-ratio: 16/9"
          :backgroundUrl="bgUrl"
          :characters="stageCharacters"
          :theme="stageTheme"
          :camera="stageCamera"
        />
        
        <!-- UI オーバーレイ（StageCanvas の上に絶対配置） -->
        <div class="absolute inset-0 pointer-events-none">
          <button class="absolute right-3 top-3 z-30 px-2 py-1 text-xs bg-black/50 text-white rounded pointer-events-auto" @click="openFs()">全画面</button>
          
          <!-- スタートオーバーレイ（showStartScreen が true のときのみ表示） -->
          <div v-if="showStartScreen" class="absolute inset-0 z-20 text-white flex items-center justify-center bg-black bg-opacity-50 pointer-events-auto">
            <div class="text-center">
              <h1 class="text-3xl font-bold mb-4">{{ game.title }}</h1>
              <p v-if="game.summary" class="text-gray-300 mb-6">{{ game.summary }}</p>
              <button
                @click="start"
                class="px-8 py-3 bg-blue-500 text-white rounded-lg text-xl hover:bg-blue-600 transition-colors"
              >
                スタート
              </button>
            </div>
          </div>

          <!-- BGMコントロール (常に非表示だが音は鳴る) -->
          <audio ref="bgmRef" :src="bgmUrl || undefined" :autoplay="soundOk" loop class="hidden" controls></audio>

          <!-- whole-stage click to advance & to trigger BGM -->
          <button 
            v-if="current && !showStartScreen && !showEndScreen && !showChoices"
            class="absolute inset-0 z-10 pointer-events-auto" 
            @click="hasChoices ? (showChoices = true, ensureBgm()) : (advanceWithinNodeOrNext(), ensureBgm())" 
            aria-label="next"
          ></button>

          <!-- message window (only when current exists and not on start screen) -->
          <div v-if="current && !showStartScreen && !fullscreen">
            <!-- 選択肢がある場合（クリック後に表示） -->
            <div v-if="hasChoices && showChoices" class="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto">
              <div class="space-y-3 w-[min(600px,80vw)]">
                <button
                  v-for="ch in choices"
                  :key="ch.id"
                  class="w-full px-6 py-4 bg-gray-800/90 rounded-lg text-center hover:bg-gray-700 transition-colors text-white text-lg font-medium shadow-lg"
                  @click="go(ch.targetNodeId); ensureBgm()"
                >
                  {{ ch.label }}
                </button>
              </div>
            </div>

            <!-- 通常のメッセージウィンドウ（常に表示） -->
            <MessageWindow
              :key="`msg-${currentNode?.id}`"
              :speaker="speaker"
              :text="displayedText"
              :accumulatedPrefix="prefixText"
              :theme="theme"
              :animate="true"
              @click="hasChoices ? (showChoices = true, ensureBgm()) : (advanceWithinNodeOrNext(), ensureBgm())"
            />
          </div>
          
          <!-- 終了画面（showEndScreenがtrueの場合のみ） -->
          <div v-if="showEndScreen" class="absolute left-[7%] right-[7%] bottom-[5%] text-center pointer-events-auto z-[150]">
            <p class="text-white text-lg mb-4 bg-black bg-opacity-70 py-2 px-4 rounded">おわり</p>
            <button
              @click="restart(); ensureBgm()"
              class="px-6 py-2 bg-green-500 rounded hover:bg-green-600 transition-colors text-white"
            >
              最初から
            </button>
          </div>
        </div>
      </div>
  
  <!-- Fullscreen Overlay -->
  <div v-if="fullscreen" class="fixed inset-0 z-50 bg-black">
    <div class="relative w-full h-full">
      <!-- フルスクリーンも StageCanvas で統一 (背景とキャラのみ) -->
      <StageCanvas 
        style="width: 100%; height: 100%"
        :backgroundUrl="bgUrl"
        :characters="stageCharacters"
        :theme="stageTheme"
        :camera="stageCamera"
      />
      
      <!-- UI オーバーレイ（StageCanvas の上に絶対配置） -->
      <div class="absolute inset-0 pointer-events-none">
        <!-- スタートオーバーレイ（showStartScreen が true のときのみ表示） -->
        <div v-if="showStartScreen" class="absolute inset-0 z-20 text-white flex items-center justify-center bg-black bg-opacity-50 pointer-events-auto">
          <div class="text-center">
            <h1 class="text-3xl font-bold mb-4">{{ game.title }}</h1>
            <p v-if="game.summary" class="text-gray-300 mb-6">{{ game.summary }}</p>
            <button
              @click="start"
              class="px-8 py-3 bg-blue-500 text-white rounded-lg text-xl hover:bg-blue-600 transition-colors"
            >
              スタート
            </button>
          </div>
        </div>

        <!-- whole-stage click to advance & to trigger BGM -->
        <button 
          v-if="current && !showStartScreen && !showEndScreen && !showChoices"
          class="absolute inset-0 z-[5] pointer-events-auto" 
          @click="hasChoices ? (showChoices = true, ensureBgm()) : (advanceWithinNodeOrNext(), ensureBgm())" 
          aria-label="next"
        ></button>

        <!-- message window (only when current exists and not on start screen) -->
        <div v-if="current && !showStartScreen">
          <!-- 選択肢がある場合（クリック後に表示） -->
          <div v-if="hasChoices && showChoices" class="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto">
            <div class="space-y-3 w-[min(600px,80vw)]">
              <button
                v-for="ch in choices"
                :key="ch.id"
                class="w-full px-6 py-4 bg-gray-800/90 rounded-lg text-center hover:bg-gray-700 transition-colors text-white text-lg font-medium shadow-lg"
                @click="go(ch.targetNodeId); ensureBgm()"
              >
                {{ ch.label }}
              </button>
            </div>
          </div>

          <!-- 通常のメッセージウィンドウ（常に表示） -->
          <MessageWindow
            :key="`msg-${currentNode?.id}`"
            :speaker="speaker"
            :text="displayedText"
            :accumulatedPrefix="prefixText"
            :theme="theme"
            :animate="true"
            @click="hasChoices ? (showChoices = true, ensureBgm()) : (advanceWithinNodeOrNext(), ensureBgm())"
          />
        </div>
        
        <!-- 終了画面（showEndScreenがtrueの場合のみ） -->
        <div v-if="showEndScreen" class="absolute left-[7%] right-[7%] bottom-[5%] text-center pointer-events-auto z-[150]">
          <p class="text-white text-lg mb-4 bg-black bg-opacity-70 py-2 px-4 rounded">おわり</p>
          <button
            @click="restart(); ensureBgm()"
            class="px-6 py-2 bg-green-500 rounded hover:bg-green-600 transition-colors text-white"
          >
            最初から
          </button>
        </div>
      </div>
      
      <button class="absolute right-4 top-4 bg-white/10 text-white rounded px-3 py-2 z-[60]" @click="closeFs()">閉じる（Esc）</button>
    </div>
  </div>

      <!-- 音声同意オーバーレイ -->
      <div v-if="!soundOk && bgmUrl" class="fixed inset-0 z-50 grid place-items-center bg-black/60">
        <div class="rounded-xl bg-white p-6 shadow-xl w-[min(560px,90vw)]">
          <h2 class="font-semibold text-lg mb-2">音声の再生について</h2>
          <p class="text-sm text-gray-600 mb-4">
            このページでは BGM / 効果音が再生されます。再生を有効にしますか？
          </p>
          <div class="flex gap-3 justify-end">
            <button 
              class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              @click="denySound"
            >
              あとで
            </button>
            <button 
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              @click="allowSound"
            >
              有効にする
            </button>
          </div>
        </div>
      </div>

      <!-- デバッグ情報 (開発時のみ) -->
      <div v-if="isDev" class="mt-4 p-4 bg-gray-800 rounded text-xs text-gray-300">
        <p>Current Node: {{ current?.id }}</p>
        <p>Next Node: {{ nextNodeId }}</p>
        <p>Choices: {{ choices?.length || 0 }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, nextTick } from 'vue'
const fullscreen = ref(false)
function openFs(){ fullscreen.value = true; document.documentElement.classList.add('overflow-hidden') }
function closeFs(){ fullscreen.value = false; document.documentElement.classList.remove('overflow-hidden') }

// Escキーでフルスクリーンを閉じる
const onEscKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeFs() }

import StageCanvas from '@/components/game/StageCanvas.vue'
import MessageWindow from '@/components/game/MessageWindow.vue'
import { computed, ref, watch, onMounted } from 'vue'
import { useAssetMeta } from '@/composables/useAssetMeta'
import { getSignedGetUrl } from '@/composables/useSignedUrl'
import { initAudioConsent, grantAudioConsent, audioConsent } from '@/composables/useAudioConsent'

const { signedFromId } = useAssetMeta()

const route = useRoute()
const router = useRouter()
const api = useGamesApi()
const runtimeConfig = useRuntimeConfig()

const game = ref<any>(null)
const map = new Map<string, any>()
const current = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const isDev = ref(runtimeConfig.public.isDev || false)
const showStartScreen = ref(true) // スタート画面の表示制御
const showEndScreen = ref(false) // 終了画面の表示制御
const showChoices = ref(false) // 選択肢の表示制御

// 音声同意状態
const soundOk = audioConsent

// クエリパラメータを文字列に正規化(配列対応)
function qStr(v: unknown) {
  if (Array.isArray(v)) return v[0] as string | undefined
  return v as string | undefined
}

// 開始シーン・ノードの強制解決（クエリパラメータがない場合はreplaceで追加）
async function ensureStartQuery() {
  const q = route.query
  const sceneIdQ = qStr(q.sceneId)
  const nodeIdQ = qStr(q.nodeId)
  
  // 既にクエリパラメータがあれば何もしない
  if (sceneIdQ && nodeIdQ) return

  // ゲームデータがない場合は何もしない
  if (!game.value) return

  const scenes = game.value.scenes
  if (!scenes?.length) return

  // 開始シーンを決定
  const scene = scenes.find((s: any) => s.id === sceneIdQ) ?? scenes[0]
  if (!scene) return

  // 開始ノードを決定(優先順: scene.startNodeId → 先頭ノード)
  let nodeId = scene.startNodeId
  if (!nodeId && scene.nodes?.length) {
    nodeId = scene.nodes[0].id
  }
  if (!nodeId) return

  // クエリパラメータをreplaceで追加
  await router.replace({
    name: route.name as string,
    params: route.params,
    query: { ...q, sceneId: scene.id, nodeId }
  })
}

// 開始シーン・ノードを優先順で解決する関数
function resolveStart(gameData: any) {
  if (!gameData?.scenes?.length) return { scene: undefined, node: undefined }

  const sceneIdQ = qStr(route.query.sceneId)
  const nodeIdQ  = qStr(route.query.nodeId)

  // 1. どのシーンから始めるか
  let scene = gameData.scenes.find((s: any) => s.id === sceneIdQ) ?? gameData.scenes[0]

  // 2. どのノードから始めるか (優先順: nodeId → scene.startNodeId → 先頭ノード)
  let node = scene?.nodes?.find((n: any) => n.id === nodeIdQ)
  if (!node && scene?.startNodeId) {
    node = scene.nodes?.find((n: any) => n.id === scene.startNodeId)
  }
  if (!node) {
    node = scene?.nodes?.[0]
  }

  return { scene, node }
}

// 開始位置を適用する(データ読込後に必ず呼ぶ)
function applyStart() {
  const { scene, node } = resolveStart(game.value)
  if (node) {
    accumulatedText.value = ''
    current.value = node
    // クエリパラメータがある場合は自動開始
    if (route.query.sceneId || route.query.nodeId) {
      showStartScreen.value = false
    }
  } else if (scene) {
    error.value = '開始ノードがありません'
  } else {
    error.value = '開始シーンがありません'
  }
}

// 累積テキスト（前ノードのセリフを継続する場合に使用）
const accumulatedText = ref('')

// thumb のキャッシュ
const thumbCache = ref<Map<string, string>>(new Map())

// Resolve portraits (computed で常に最新の thumb を反映)
const portraitsResolved = computed(() => {
  const arr = current.value?.portraits ?? []
  return arr.map((p: any) => {
    const cacheKey = p.imageId || p.key
    return {
      ...p,
      thumb: p.thumb || thumbCache.value.get(cacheKey) || ''
    }
  })
})

// current.portraits が変化したら thumb を補完
watch(
  () => current.value?.portraits,
  async (list: any[] | undefined) => {
    if (!list || list.length === 0) return
    console.log('[play.vue] portraits changed, resolving thumbs...', list)
    
    for (const p of list) {
      const cacheKey = p.imageId || p.key
      if (!cacheKey) {
        console.warn('[play.vue] portrait has no imageId or key', p)
        continue
      }
      
      if (!thumbCache.value.has(cacheKey)) {
        try {
          let url: string | null = null
          
          // 優先順位: 1) p.key がある場合は直接署名URL取得、2) imageId から取得
          if (p.key) {
            url = await getSignedGetUrl(p.key)
            console.log('[play.vue] resolved thumb via key for', cacheKey, '→', url)
          } else if (p.imageId) {
            url = await signedFromId(p.imageId, true)
            console.log('[play.vue] resolved thumb via imageId for', cacheKey, '→', url)
          }
          
          if (url) {
            thumbCache.value.set(cacheKey, url)
          }
        } catch (e) {
          console.warn('[play.vue] thumb resolve failed for', p, e)
        }
      } else {
        console.log('[play.vue] using cached thumb for', cacheKey)
      }
    }
    console.log('[play.vue] thumbCache now has', thumbCache.value.size, 'entries', Array.from(thumbCache.value.keys()))
  },
  { immediate: true, deep: true }
)

// 背景画像URL
const bgUrl = ref<string | null>(null)
watch(
  () => current.value?.bgAssetId,
  async (id) => {
    bgUrl.value = id ? await signedFromId(id, true) : null
  },
  { immediate: true }
)

// scaleToHeight: 旧仕様の scale 値を％に変換
function scaleToHeight(s: number | undefined) {
  if (s == null) return 30
  return s > 60 ? Math.round(s / 3) : s
}

// BGM wiring (click to start)
const bgmUrl = ref<string | null>(null)
const bgmRef = ref<HTMLAudioElement | null>(null)

// 音声を有効にする
async function allowSound() {
  if (bgmRef.value) {
    await grantAudioConsent([bgmRef.value])
  }
}

// 音声を後回しにする
function denySound() {
  // 何もしない（同意しない状態を維持）
}

// BGMを再生(soundOkの場合のみ)
function ensureBgm() {
  if (soundOk.value && bgmRef.value) {
    bgmRef.value.play().catch(() => {})
  }
}

// currentのmusicAssetIdが変化したらBGM URLを更新
watch(
  () => current.value?.musicAssetId,
  async (id) => { bgmUrl.value = id ? await signedFromId(id, false) : null },
  { immediate: true }
)

// Message theme (project-level setting with fallback)
const defaultThemeV2 = {
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
  gradientDirection: 'none',
  gradientColor: { r: 40, g: 44, b: 52, a: 0.72 },
  fontWeight: 'normal',
  fontStyle: 'normal',
}
const theme = computed(() => (game.value as any)?.messageTheme ?? defaultThemeV2)

// StageCanvas はテーマをそのまま渡す（内部で v2 解決される）
const stageTheme = computed(() => theme.value)


// StageCanvas 用のキャラクター配列
const stageCharacters = computed(() => {
  return portraitsResolved.value.map((p: any) => {
    const cacheKey = p.imageId || p.key
    return {
      key: cacheKey || String(Math.random()),
      url: p.thumb || thumbCache.value.get(cacheKey) || '',
      x: p.x ?? 50,
      y: p.y ?? 80,
      scale: p.scale ?? 100,
      z: p.z ?? 0
    }
  })
})

// StageCanvas 用のメッセージ (play.vue では null - メッセージウィンドウは別で表示)
const stageMessage = computed(() => null)

// StageCanvas 用のカメラ
const stageCamera = computed(() => {
  const cam = (current.value as any)?.camera
  return cam ? { zoom: cam.zoom ?? 100, cx: cam.cx ?? 50, cy: cam.cy ?? 50 } : { zoom: 100, cx: 50, cy: 50 }
})

onMounted(async () => {
  // 音声同意を確認
  initAudioConsent()
  
  // Escキーイベントリスナーを追加
  window.addEventListener('keydown', onEscKey)
  
  try {
    game.value = await api.get(route.params.id as string)
    
    // ノードマップを構築
    game.value.scenes.forEach((s: any) => {
      s.nodes.forEach((n: any) => {
        map.set(n.id, n)
      })
    })

    loading.value = false
    
    // クエリパラメータがない場合は自動的に追加
    await ensureStartQuery()
    
    // データ読込完了後に必ず開始位置を適用
    applyStart()
    
    // 音声同意済みかつBGMがあれば自動再生
    if (soundOk.value && bgmUrl.value && bgmRef.value) {
      bgmRef.value.play().catch(() => {})
    }
  } catch (err: any) {
    console.error('Failed to load game:', err)
    error.value = err.message || 'ゲームの読み込みに失敗しました'
    loading.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onEscKey)
})

// クエリパラメータが変わったときも再解決(ゲームロード完了後のみ)
watch(
  () => [route.query.sceneId, route.query.nodeId, game.value?.scenes?.length],
  async () => {
    if (game.value && !loading.value) {
      await ensureStartQuery()
      applyStart()
    }
  },
  { deep: true }
)

function start() {
  // スタート画面を非表示にして開始
  accumulatedText.value = ''
  showStartScreen.value = false
  
  if (!current.value) {
    applyStart()
  }
  
  // 音声同意済みならBGMを再生
  ensureBgm()
}

function restart() {
  accumulatedText.value = ''
  showStartScreen.value = true
  showEndScreen.value = false
  showChoices.value = false // 選択肢表示をリセット
  current.value = null
  applyStart()
  ensureBgm()
}

function go(targetNodeId: string | null) {
  if (!targetNodeId) {
    current.value = null
    return
  }
  
  showEndScreen.value = false
  showChoices.value = false // 選択肢表示をリセット
  
  const nextNode = map.get(targetNodeId)
  if (nextNode) {
    console.log('[play.vue] go() - nextNode:', {
      id: nextNode.id,
      text: nextNode.text,
      continuesPreviousText: nextNode.continuesPreviousText
    })
    
    // 次のノードが前のテキストを継続する場合、現在のテキストを累積に追加
    if (nextNode.continuesPreviousText) {
      // 現在の完全なテキスト（累積 + 現在のテキスト）を保存
      const newAccumulated = accumulatedText.value + (current.value?.text ?? '')
      console.log('[play.vue] go() -継続モード:', {
        before: accumulatedText.value,
        currentText: current.value?.text,
        after: newAccumulated
      })
      accumulatedText.value = newAccumulated
    } else {
      // 継続しない場合はリセット
      console.log('[play.vue] go() - リセット')
      accumulatedText.value = ''
    }
    current.value = nextNode
  } else {
    console.warn('Node not found:', targetNodeId)
    current.value = null
  }
}

function advanceWithinNodeOrNext() {
  showChoices.value = false // 選択肢表示をリセット
  
  // 選択肢がある場合は選択肢を表示
  if (hasChoices.value) {
    showChoices.value = true
    return
  }
  
  // nextNodeIdがある場合はそれに従う
  if (current.value?.nextNodeId) {
    go(current.value.nextNodeId)
    return
  }
  
  // nextNodeIdも選択肢も無い場合は終了画面を表示
  showEndScreen.value = true
}

const speaker = computed(() => {
  if (!current.value) return ''
  return current.value.speakerDisplayName || ''
})

// 累積テキスト（即座に表示する部分）
const prefixText = computed(() => {
  const result = current.value?.continuesPreviousText ? accumulatedText.value : ''
  console.log('[play.vue] prefixText computed:', {
    continuesPreviousText: current.value?.continuesPreviousText,
    accumulatedText: accumulatedText.value,
    result
  })
  return result
})

// デバッグ用: prefixTextの変化を監視
watch(prefixText, (newVal) => {
  console.log('[play.vue] prefixText changed to:', newVal)
}, { immediate: true })

// 現在のノードのテキスト（タイプライター効果を適用する部分）
const displayedText = computed(() => {
  return current.value?.text ?? ''
})

const choices = computed(() => {
  if (!current.value) return []
  return current.value.choices || []
})

const hasChoices = computed(() => choices.value.length > 0)

const nextNodeId = computed(() => {
  if (!current.value) return null
  return current.value.nextNodeId || null
})

// 終了ノードかどうかを判定（次のノードも選択肢もシーン内の次も無い）
const isEndNode = computed(() => {
  if (!current.value) return false
  
  // 選択肢がある場合は終了ではない
  if (current.value.choices && current.value.choices.length > 0) return false
  
  // nextNodeIdがある場合は終了ではない
  if (current.value.nextNodeId) return false
  
  // シーン内に次のノードがあるかチェック
  const scene = game.value?.scenes?.find((s: any) => 
    s.nodes?.some((n: any) => n.id === current.value.id)
  )
  if (scene) {
    const idx = scene.nodes?.findIndex((n: any) => n.id === current.value.id)
    if (idx !== undefined && idx >= 0 && scene.nodes[idx + 1]) {
      return false // 次のノードがある
    }
  }
  
  return true // すべての遷移先が無い = 終了
})

// プレイヤにカメラを反映（エディタと共通のカメラ座標系）
const camera = computed(() => (current.value?.camera ?? { zoom: 100, cx: 50, cy: 50 }))
</script>
