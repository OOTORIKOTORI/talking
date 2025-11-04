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

    <div v-else-if="game" class="w-full max-w-[1100px]">
      <div class="rounded-lg overflow-hidden shadow-2xl bg-black">
        <div class="w-full aspect-[16/9] relative">
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
          <div v-if="current" class="absolute inset-x-4 bottom-4 md:inset-x-8 md:bottom-6 z-20">
            <!-- 選択肢がある場合 -->
            <div v-if="choices && choices.length > 0" class="space-y-2 mb-4">
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
            <div v-else-if="!nextNodeId" class="text-center mb-4">
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
              :speaker="speaker"
              :text="displayedText"
              :theme="theme"
              :animate="true"
              @click="advanceWithinNodeOrNext(); ensureBgm()"
            />
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
watch(
  () => current.value?.musicAssetId,
  async (id) => { bgmUrl.value = id ? await signedFromId(id, false) : null },
  { immediate: true }
)
function ensureBgm() { bgmRef.value?.play().catch(() => {}) }
// BGM with consent gate
const needConsent = ref(false)
const hasConsent = () => localStorage.getItem('talking.audioConsent') === 'yes'
const giveConsent = () => { localStorage.setItem('talking.audioConsent','yes'); needConsent.value = false; ensureBgm() }

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

function start() {
  // Priority: explicit nodeId -> sceneId -> first available
  const q = route.query as any
  const nodeId = q.nodeId as string | undefined
  const sceneId = q.sceneId as string | undefined

  if (nodeId && map.has(nodeId)) {
    segIndex.value = 0
    current.value = map.get(nodeId)
  } else {
    const scene = (sceneId ? game.value.scenes.find((s:any)=>s.id===sceneId) : game.value.scenes[0])
    if (scene && scene.nodes?.length) {
      segIndex.value = 0
      current.value = scene.nodes[0]
    } else {
      error.value = 'ゲームの開始ノードが見つかりません'
    }
  }

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
