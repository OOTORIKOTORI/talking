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

    <div v-else-if="game" class="w-full max-w-4xl">
      <!-- ゲームビューポート -->
      <div class="bg-black rounded-lg overflow-hidden shadow-2xl">
        <!-- ステージ（背景＋立ち絵）：MiniStage に置き換え -->
        <div class="relative h-96 bg-gray-800">
          <MiniStage
            :fill="true"
            :bg-asset-id="current?.bgAssetId || undefined"
            :portraits="portraits as any[]"
            :camera="camera"
          />

          <!-- スタートオーバーレイ（current が未設定のときのみ表示） -->
          <div v-if="!current" class="absolute inset-0 z-10 text-white flex items-center justify-center">
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
        </div>

        <!-- テキストエリア -->
        <div v-if="current" class="bg-gray-800 bg-opacity-95 p-6 text-white">
          <!-- 話者名 -->
          <div v-if="speaker" class="text-sm text-blue-300 mb-2 font-semibold">
            {{ speaker }}
          </div>

          <!-- 台詞 -->
          <div class="text-lg leading-relaxed whitespace-pre-wrap mb-4">
            {{ displayedText }}
          </div>

          <!-- 選択肢 -->
          <div v-if="choices && choices.length > 0" class="space-y-2">
            <button
              v-for="ch in choices"
              :key="ch.id"
              class="w-full px-4 py-3 bg-gray-700 rounded text-left hover:bg-gray-600 transition-colors"
              @click="go(ch.targetNodeId)"
            >
              {{ ch.label }}
            </button>
          </div>

          <!-- 次へボタン -->
          <button
            v-else-if="nextNodeId"
            class="mt-4 px-6 py-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors"
            @click="advanceWithinNodeOrNext"
          >
            次へ ▶
          </button>

          <!-- 終了 -->
          <div v-else class="mt-4 text-center">
            <p class="text-gray-400 mb-4">おわり</p>
            <button
              @click="restart"
              class="px-6 py-2 bg-green-500 rounded hover:bg-green-600 transition-colors"
            >
              最初から
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
import MiniStage from '@/components/game/MiniStage.vue'
import { computed } from 'vue'

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

// BGM/SFX用のaudio要素 (将来実装)
// const bgmAudio = ref<HTMLAudioElement | null>(null)

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
  // 最初のシーンの最初のノードから開始
  const startScene = game.value.scenes[0]
  if (startScene && startScene.nodes && startScene.nodes.length > 0) {
    segIndex.value = 0
    current.value = startScene.nodes[0]
  } else {
    error.value = 'ゲームの開始ノードが見つかりません'
  }
}

function restart() {
  current.value = null
  segIndex.value = 0
  start()
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
  const segs = segments.value
  if (segs.length > 1 && segIndex.value < segs.length - 1) {
    // まだ表示していない段階があるので、次の段階を表示
    segIndex.value += 1
    return
  }
  // すべて表示済み、または分割なし → 次のノードへ
  segIndex.value = 0
  if (nextNodeId.value) {
    go(nextNodeId.value)
  }
}

const speaker = computed(() => {
  if (!current.value) return ''
  // speakerDisplayName があれば優先、なければ空
  return current.value.speakerDisplayName || ''
})

const text = computed(() => {
  if (!current.value) return ''
  return current.value.text || ''
})

// ｜で区切られたセグメント
const segments = computed(() => {
  const raw = text.value || ''
  return raw.split('｜').filter((s: string) => s.length > 0 || s === '')
})

// 現在までに表示するテキスト
const displayedText = computed(() => {
  return segments.value.slice(0, segIndex.value + 1).join('')
})

const choices = computed(() => {
  if (!current.value) return []
  return current.value.choices || []
})

const nextNodeId = computed(() => {
  if (!current.value) return null
  return current.value.nextNodeId || null
})

const portraits = computed(() => (current.value?.portraits as any[]) || [])

// プレイヤにカメラを反映（エディタと共通のカメラ座標系）
const camera = computed(() => (current.value?.camera ?? { zoom: 100, cx: 50, cy: 50 }))
</script>
