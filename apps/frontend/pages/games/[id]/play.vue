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
        <div class="w-full aspect-[16/9] relative">
          <button class="absolute right-3 top-3 z-30 px-2 py-1 text-xs bg-black/50 text-white rounded" @click="openFs()">全画面</button>
  <!-- Fullscreen Overlay -->
  <div v-if="fullscreen" class="fixed inset-0 z-50 bg-black">
    <div class="absolute inset-0">
      <MiniStage
        :fill="true"
        :bg-asset-id="current?.bgAssetId || undefined"
        :portraits="portraitsResolved"
        :camera="camera"
      />
      <div class="absolute inset-x-0 bottom-0 pointer-events-none">
        <MessageWindow class="pointer-events-none" :speaker="speaker" :text="displayedText" :theme="theme" :animate="true" />
      </div>
      <button class="absolute right-4 top-4 bg-white/10 text-white rounded px-3 py-2" @click="closeFs()">閉じる（Esc）</button>
    </div>
  </div>
          <!-- スタートオーバーレイ（current が未設定のときのみ表示） -->
          <div v-if="!current" class="absolute inset-0 z-20 text-white flex items-center justify-center bg-black bg-opacity-50">
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

          <MiniStage
            :fill="true"
            :bg-asset-id="current?.bgAssetId || undefined"
            :portraits="portraitsResolved"
            :camera="camera"
          />

          <!-- hidden on mobile, shown as small control on md+ -->
          <audio ref="bgmRef" :src="bgmUrl || undefined" loop class="hidden md:block md:absolute md:right-3 md:top-3 md:opacity-60" controls></audio>

          <!-- whole-stage click to advance & to trigger BGM (only when current exists and no choices) -->
          <button 
            v-if="current && (!choices || choices.length === 0)"
            class="absolute inset-0 z-10" 
            @click="advanceWithinNodeOrNext(); ensureBgm()" 
            aria-label="next"
          ></button>

          <!-- message window (only when current exists) -->
          <div v-if="current" class="absolute inset-x-0 bottom-0 pointer-events-none z-20">
            <!-- 選択肢がある場合 -->
            <div v-if="choices && choices.length > 0" class="mx-[5%] mb-[3%] w-[90%] space-y-2 pointer-events-auto">
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
            <div v-else-if="!nextNodeId" class="mx-[5%] mb-[3%] w-[90%] text-center pointer-events-auto">
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

      <!-- BGM同意モーダル -->
      <div v-if="needConsent" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div class="bg-white rounded-xl shadow-xl p-8 max-w-xs w-full text-center relative z-50">
          <h2 class="text-lg font-bold mb-4">BGM再生の許可</h2>
          <p class="mb-6">BGMを再生するには許可が必要です。<br>OKを押すとBGMが流れます。</p>
          <button class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" @click="giveConsent">OK</button>
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
import { onBeforeUnmount } from 'vue'
const fullscreen = ref(false)
function openFs(){ fullscreen.value = true; document.documentElement.classList.add('overflow-hidden') }
function closeFs(){ fullscreen.value = false; document.documentElement.classList.remove('overflow-hidden') }
onMounted(() => window.addEventListener('keydown', (e)=>{ if (e.key==='Escape') closeFs() }))
onBeforeUnmount(() => window.removeEventListener('keydown', (e)=>{}))
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

// クエリパラメータの取得
const sceneIdQ = computed(() => (route.query.sceneId as string | undefined) || undefined)
const nodeIdQ  = computed(() => (route.query.nodeId  as string | undefined) || undefined)

// 開始シーン・ノードを優先順で解決する関数
function resolveStart(gameData: any) {
  // 1. どのシーンから始めるか
  let scene = gameData?.scenes?.[0]
  if (sceneIdQ.value) {
    const found = gameData.scenes.find((s: any) => s.id === sceneIdQ.value)
    if (found) scene = found
  }

  // 2. どのノードから始めるか (優先順: nodeId → scene.startNodeId → 先頭ノード)
  let node = undefined
  if (nodeIdQ.value) {
    node = scene?.nodes?.find((n: any) => n.id === nodeIdQ.value)
  }
  if (!node && scene?.startNodeId) {
    node = scene.nodes?.find((n: any) => n.id === scene.startNodeId)
  }
  if (!node) {
    node = scene?.nodes?.[0]
  }

  return { scene, node }
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
const needConsent = ref(false)
const hasConsent = () => localStorage.getItem('talking.audioConsent') === 'yes'
function ensureBgm() { bgmRef.value?.play().catch(() => {}) }
const giveConsent = () => { localStorage.setItem('talking.audioConsent','yes'); needConsent.value = false; ensureBgm() }

// BGM URLが変化したときに同意モーダルを出す
watch(bgmUrl, (u) => {
  if (u && !hasConsent()) needConsent.value = true
}, { immediate: true })

// currentのmusicAssetIdが変化したらBGM URLを更新
watch(
  () => current.value?.musicAssetId,
  async (id) => { bgmUrl.value = id ? await signedFromId(id, false) : null },
  { immediate: true }
)

// マウント時に同意済みかつBGMがあれば自動再生
onMounted(() => {
  if (hasConsent() && bgmUrl.value) ensureBgm()
})

// Message theme (project-level setting with fallback)
const defaultTheme = {
  frame: { bg: 'rgba(20,24,36,0.72)', borderColor: 'rgba(255,255,255,0.2)', borderWidth: 2, radius: 16, padding: 16, shadow: true },
  name:  { show: true, bg: 'rgba(0,0,0,0.55)', color: '#fff', padding: 8, radius: 10 },
  text:  { color: '#fff', size: 16, lineHeight: 1.8 },
  typewriter: { msPerChar: 25 }
}
const theme = computed(() => (game.value as any)?.messageTheme ?? defaultTheme)

onMounted(async () => {
  try {
    game.value = await api.get(route.params.id as string)
    
    // ノードマップを構築
    game.value.scenes.forEach((s: any) => {
      s.nodes.forEach((n: any) => {
        map.set(n.id, n)
      })
    })

    loading.value = false
  } catch (err: any) {
    console.error('Failed to load game:', err)
    error.value = err.message || 'ゲームの読み込みに失敗しました'
    loading.value = false
  }
})

// クエリパラメータが変わったときも再解決（ゲームロード完了後のみ）
watch(() => [sceneIdQ.value, nodeIdQ.value], () => {
  if (!game.value || loading.value) return
  const { scene, node } = resolveStart(game.value)
  if (scene && node) {
    segIndex.value = 0
    current.value = node
  }
}, { immediate: false })

function start() {
  // resolveStart関数を使用して優先順位通りに開始位置を解決
  const { scene, node } = resolveStart(game.value)

  if (!scene) {
    error.value = '開始シーンがありません'
    return
  }
  if (!node) {
    error.value = '開始ノードがありません'
    return
  }

  segIndex.value = 0
  current.value = node

  // BGM consent overlay
  needConsent.value = !!bgmUrl.value && !hasConsent()
}

function restart() {
  current.value = null
  segIndex.value = 0
  start()
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
