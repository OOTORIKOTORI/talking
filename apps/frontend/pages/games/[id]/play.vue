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
        <!-- 背景 -->
        <div
          class="relative h-96 bg-gray-800 flex items-center justify-center"
          :style="bgStyle"
        >
          <div v-if="!current" class="text-white text-center">
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

        <!-- テキストエリア -->
        <div v-if="current" class="bg-gray-800 bg-opacity-95 p-6 text-white">
          <!-- 話者名 -->
          <div v-if="speaker" class="text-sm text-blue-300 mb-2 font-semibold">
            {{ speaker }}
          </div>

          <!-- 台詞 -->
          <div class="text-lg leading-relaxed whitespace-pre-wrap mb-4">
            {{ text }}
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
            @click="go(nextNodeId)"
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
const route = useRoute()
const api = useGamesApi()
const runtimeConfig = useRuntimeConfig()

const game = ref<any>(null)
const map = new Map<string, any>()
const current = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const isDev = ref(runtimeConfig.public.isDev || false)

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
    current.value = startScene.nodes[0]
  } else {
    error.value = 'ゲームの開始ノードが見つかりません'
  }
}

function restart() {
  current.value = null
  start()
}

function go(targetNodeId: string | null) {
  if (!targetNodeId) {
    current.value = null
    return
  }
  
  const nextNode = map.get(targetNodeId)
  if (nextNode) {
    current.value = nextNode
  } else {
    console.warn('Node not found:', targetNodeId)
    current.value = null
  }
}

const speaker = computed(() => {
  if (!current.value) return ''
  return current.value.speakerCharacterId || ''
})

const text = computed(() => {
  if (!current.value) return ''
  return current.value.text || ''
})

const choices = computed(() => {
  if (!current.value) return []
  return current.value.choices || []
})

const nextNodeId = computed(() => {
  if (!current.value) return null
  return current.value.nextNodeId || null
})

const bgStyle = computed(() => {
  if (!current.value?.bgAssetId) return ''
  
  // 署名URL取得 (簡易版: 直接URLを構築)
  // 本番では useSignedUrl を使用するか、API経由で取得
  const baseURL = runtimeConfig.public.apiBase
  return `background-image: url('${baseURL}/uploads/signed-get?key=${current.value.bgAssetId}'); background-size: cover; background-position: center;`
})
</script>
