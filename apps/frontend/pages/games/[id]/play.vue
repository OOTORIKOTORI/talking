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
      <div class="rounded-lg overflow-hidden shadow-2xl bg-black">
        <!-- 新しい統一構造 -->
        <div class="tgk-stage">
          <button class="absolute right-3 top-3 z-30 px-2 py-1 text-xs bg-black/50 text-white rounded" @click="openFs()">全画面</button>
  
  <!-- Fullscreen Overlay -->
  <div v-if="fullscreen" class="fixed inset-0 z-50 bg-black">
    <div class="absolute inset-0">
      <!-- フルスクリーンも統一構造 -->
      <div class="tgk-stage w-full h-full">
        <!-- 内側ラッパー: zoom/パンを適用 -->
        <div class="tgk-stage__content" :style="{ transform: `scale(${(camera.zoom || 100)/100}) translate(${((50-(camera.cx||50)))}%, ${((50-(camera.cy||50)))}%)` }">
          <MiniStage
            :fill="true"
            :bg-asset-id="current?.bgAssetId || undefined"
            :portraits="portraitsResolved"
            :camera="{ zoom: 100, cx: 50, cy: 50 }"
          />
        </div>
        
        <!-- メッセージウィンドウ（拡大しない） -->
        <div class="tgk-stage__msg">
          <MessageWindow class="pointer-events-none" :speaker="speaker" :text="displayedText" :theme="theme" :animate="true" />
        </div>
      </div>
      <button class="absolute right-4 top-4 bg-white/10 text-white rounded px-3 py-2" @click="closeFs()">閉じる（Esc）</button>
    </div>
  </div>
          
          <!-- スタートオーバーレイ（showStartScreen が true のときのみ表示） -->
          <div v-if="showStartScreen" class="absolute inset-0 z-20 text-white flex items-center justify-center bg-black bg-opacity-50">
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

          <!-- 内側ラッパー: zoom/パンを適用 -->
          <div class="tgk-stage__content" :style="{ transform: `scale(${(camera.zoom || 100)/100}) translate(${((50-(camera.cx||50)))}%, ${((50-(camera.cy||50)))}%)` }">
            <MiniStage
              :fill="true"
              :bg-asset-id="current?.bgAssetId || undefined"
              :portraits="portraitsResolved"
              :camera="{ zoom: 100, cx: 50, cy: 50 }"
            />
          </div>

          <!-- hidden on mobile, shown as small control on md+ -->
          <audio ref="bgmRef" :src="bgmUrl || undefined" :autoplay="soundOk" loop class="hidden md:block md:absolute md:right-3 md:top-3 md:opacity-60" controls></audio>

          <!-- whole-stage click to advance & to trigger BGM (only when current exists and no choices and not on start screen) -->
          <button 
            v-if="current && !showStartScreen && (!choices || choices.length === 0)"
            class="absolute inset-0 z-10" 
            @click="advanceWithinNodeOrNext(); ensureBgm()" 
            aria-label="next"
          ></button>

          <!-- message window (only when current exists and not on start screen) -->
          <div v-if="current && !showStartScreen" class="tgk-stage__msg z-20">
            <!-- 選択肢がある場合 -->
            <div v-if="choices && choices.length > 0" class="w-full space-y-2 pointer-events-auto">
              <button
                v-for="ch in choices"
                :key="ch.id"
                class="w-full px-4 py-3 bg-gray-700 rounded text-left hover:bg-gray-600 transition-colors text-white"
                @click="go(ch.targetNodeId); ensureBgm()"
              >
                {{ ch.label }}
              </button>
            </div>

            <!-- 終了時のリスタートボタン -->
            <div v-else-if="!nextNodeId" class="w-full text-center pointer-events-auto">
              <p class="text-white text-lg mb-4 bg-black bg-opacity-70 py-2 px-4 rounded">おわり</p>
              <button
                @click="restart(); ensureBgm()"
                class="px-6 py-2 bg-green-500 rounded hover:bg-green-600 transition-colors text-white"
              >
                最初から
              </button>
            </div>

            <!-- 通常のメッセージウィンドウ -->
            <MessageWindow
              v-else
              class="pointer-events-none"
              :speaker="speaker"
              :text="displayedText"
              :theme="theme"
              :animate="true"
              @click="advanceWithinNodeOrNext(); ensureBgm()"
            />
          </div>
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

import MiniStage from '@/components/game/MiniStage.vue'
import MessageWindow from '@/components/game/MessageWindow.vue'
import { computed, ref, watch, onMounted } from 'vue'
import { useAssetMeta } from '@/composables/useAssetMeta'

const { signedFromId } = useAssetMeta()

const route = useRoute()
const api = useGamesApi()
const runtimeConfig = useRuntimeConfig()

const game = ref<any>(null)
const map = new Map<string, any>()
const current = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const isDev = ref(runtimeConfig.public.isDev || false)
const showStartScreen = ref(true) // スタート画面の表示制御

// クエリパラメータを文字列に正規化（配列対応）
function qStr(v: unknown) {
  if (Array.isArray(v)) return v[0] as string | undefined
  return v as string | undefined
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

// 開始位置を適用する（データ読込後に必ず呼ぶ）
function applyStart() {
  const { scene, node } = resolveStart(game.value)
  if (node) {
    segIndex.value = 0
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

// 台詞の段階表示用
const segIndex = ref(0)

// Resolve portraits (thumb via signed GET)
const portraitsResolved = ref<any[]>([])
watch(
  () => current.value?.portraits,
  async (list: any[] | undefined) => {
    const arr = list ?? []
    portraitsResolved.value = await Promise.all(
      arr.map(async (p: any) => ({
        ...p,
        thumb: p.thumb ?? (p.imageId ? await signedFromId(p.imageId, true) : null),
      }))
    )
  },
  { immediate: true, deep: true }
)
// Resolve portraits for MiniStage


// BGM wiring (click to start)
const bgmUrl = ref<string | null>(null)
const bgmRef = ref<HTMLAudioElement | null>(null)
const soundOk = useState<boolean>('tgk-sound-ok', () => false)

// 音声同意の確認
function checkSoundConsent() {
  soundOk.value = localStorage.getItem('tgk:soundOk') === '1'
}

// 音声を有効にする
function allowSound() {
  localStorage.setItem('tgk:soundOk', '1')
  soundOk.value = true
  nextTick(() => {
    if (bgmRef.value) {
      bgmRef.value.play().catch(() => {})
    }
  })
}

// 音声を後回しにする
function denySound() {
  soundOk.value = false
}

// BGMを再生（soundOkの場合のみ）
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
const defaultTheme = {
  frame: { bg: 'rgba(20,24,36,0.72)', borderColor: 'rgba(255,255,255,0.2)', borderWidth: 2, radius: 16, padding: 16, shadow: true },
  name:  { show: true, bg: 'rgba(0,0,0,0.55)', color: '#fff', padding: 8, radius: 10 },
  text:  { color: '#fff', size: 16, lineHeight: 1.8 },
  typewriter: { msPerChar: 25 }
}
const theme = computed(() => (game.value as any)?.messageTheme ?? defaultTheme)

onMounted(async () => {
  // 音声同意を確認
  checkSoundConsent()
  
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
    
    // データ読込完了後に必ず開始位置を適用
    applyStart()
    
    // 音声同意済みかつBGMがあれば自動再生
    if (soundOk.value && bgmUrl.value) ensureBgm()
  } catch (err: any) {
    console.error('Failed to load game:', err)
    error.value = err.message || 'ゲームの読み込みに失敗しました'
    loading.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onEscKey)
})

// クエリパラメータが変わったときも再解決（ゲームロード完了後のみ）
watch(
  () => [route.query.sceneId, route.query.nodeId, game.value?.scenes?.length],
  () => {
    if (game.value && !loading.value) {
      applyStart()
    }
  },
  { deep: true }
)

function start() {
  // スタート画面を非表示にして開始
  showStartScreen.value = false
  
  if (!current.value) {
    applyStart()
  }
  
  // 音声同意済みならBGMを再生
  ensureBgm()
}

function restart() {
  showStartScreen.value = true
  current.value = null
  segIndex.value = 0
  applyStart()
  ensureBgm()
}

function go(targetNodeId: string | null) {
  if (!targetNodeId) {
    current.value = null
    return
  }
  
  segIndex.value = 0
  const nextNode = map.get(targetNodeId)
  if (nextNode) {
    current.value = nextNode
  } else {
    console.warn('Node not found:', targetNodeId)
    current.value = null
  }
}

function advanceWithinNodeOrNext() {
  // クリックで次のノードへ進む
  segIndex.value = 0
  if (nextNodeId.value) {
    go(nextNodeId.value)
    return
  }
  // nextNodeIdも選択肢も無い場合はorder順で次へ
  if (!current.value?.nextNodeId && (!current.value?.choices || current.value.choices.length===0)) {
    const s = game.value.scenes.find((sc:any)=> sc.nodes?.some((n:any)=>n.id===current.value.id))
    if (s) {
      const idx = s.nodes.findIndex((n:any)=>n.id===current.value.id)
      const next = s.nodes[idx+1]
      if (next) { current.value = next; segIndex.value = 0; return }
    }
  }
}

const speaker = computed(() => {
  if (!current.value) return ''
  return current.value.speakerDisplayName || ''
})

const displayedText = computed(() => current.value?.text ?? '')

const choices = computed(() => {
  if (!current.value) return []
  return current.value.choices || []
})

const nextNodeId = computed(() => {
  if (!current.value) return null
  return current.value.nextNodeId || null
})

// プレイヤにカメラを反映（エディタと共通のカメラ座標系）
const camera = computed(() => (current.value?.camera ?? { zoom: 100, cx: 50, cy: 50 }))
</script>
