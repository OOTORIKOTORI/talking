<script setup lang="ts">
import MessageWindow from '@/components/game/MessageWindow.vue'
import NodePicker from '@/components/game/NodePicker.vue'
import AssetPicker from '@/components/pickers/AssetPicker.vue'
import CharacterPicker from '@/components/pickers/CharacterPicker.vue'
import CharacterImagePicker from '@/components/pickers/CharacterImagePicker.vue'
import MiniStage from '@/components/game/MiniStage.vue'
import MessageThemeModal from '@/components/game/MessageThemeModal.vue'
import { getSignedGetUrl } from '@/composables/useSignedUrl'
import { useAssetMeta } from '@/composables/useAssetMeta'
const baseURL = useRuntimeConfig().public.apiBase

definePageMeta({
  middleware: 'require-auth'
})

const route = useRoute()
const api = useGamesApi()
const { get: getAsset, signedFromId } = useAssetMeta()

// Declare all refs first before using them in computed/watch
const game = ref<any>(null)
const scenes = ref<any[]>([])
const nodes = ref<any[]>([])
const scene = ref<any>(null)
const node = ref<any>(null)
const nodeDraft = reactive<any>({})
const loading = ref(true)
const openBgPicker = ref(false)
const openMusicPicker = ref(false)
const openCharPicker = ref(false)
const openCharImagePicker = ref(false)
const openSfxPicker = ref(false)
const openNodePicker = ref(false)

const bgUrl = ref<string | null>(null)
const musicUrl = ref<string | null>(null)
const musicTitle = ref<string>('')
const pendingIndex = ref<number | null>(null)

// Place previewHref AFTER game, scene, and node are declared to avoid TDZ error
const previewHref = computed(() => {
  const g = game?.value
  if (!g?.id) return '#'
  const params = new URLSearchParams()
  const s = scene?.value
  const n = node?.value
  if (s?.id) params.set('sceneId', s.id)
  if (n?.id) params.set('nodeId', n.id)
  return params.toString()
    ? `/games/${g.id}/play?${params.toString()}`
    : `/games/${g.id}/play`
})

const openThemeModal = ref(false)

const previewTheme = computed(() => game.value?.messageTheme ?? {
  frame: { bg: 'rgba(20,24,36,0.72)', borderColor: 'rgba(255,255,255,0.2)', borderWidth: 2, radius: 16, padding: 16, shadow: true },
  name:  { show: true, bg: 'rgba(0,0,0,0.55)', color: '#fff', padding: 8, radius: 10 },
  text:  { color: '#fff', size: 14, lineHeight: 1.6 },
  typewriter: { msPerChar: 20 }
})

watch(
  () => nodeDraft.bgAssetId,
  async (id) => {
    bgUrl.value = id ? await signedFromId(id, true) : null
  },
  { immediate: false }
)

watch(
  () => nodeDraft.musicAssetId,
  async (id) => {
    if (!id) {
      musicUrl.value = null
      musicTitle.value = ''
      return
    }
    const meta = await getAsset(id)
    musicTitle.value = meta?.title || '(BGM)'
    musicUrl.value = await signedFromId(id, false)
  },
  { immediate: false }
)

const selectedCharLabel = computed(() => {
  return nodeDraft.speakerDisplayName || node.value?.speakerDisplayName || '未選択'
})

function clearChar() {
  nodeDraft.speakerCharacterId = ''
  if (!nodeDraft.speakerDisplayName) nodeDraft.speakerDisplayName = ''
}

function onCharPicked(c: any) {
  nodeDraft.speakerCharacterId = c.id
  if (!nodeDraft.speakerDisplayName) {
    nodeDraft.speakerDisplayName = c.displayName || c.name || ''
  }
  // If we're adding a new portrait, open the image picker
  if (pendingIndex.value === -1) {
    openCharImagePicker.value = true
  }
}

async function addPortrait() {
  if (!nodeDraft.portraits) nodeDraft.portraits = []
  // First select character
  pendingIndex.value = -1
  openCharPicker.value = true
}

function changePortrait(i: number) {
  pendingIndex.value = i
  openCharPicker.value = true
}

function removePortrait(i: number) {
  nodeDraft.portraits.splice(i, 1)
}

async function onImagePicked(img: any) {
  const url = await getSignedGetUrl(img.thumbKey || img.key)
  const entry = {
    characterId: nodeDraft.speakerCharacterId,
    imageId: img.id,
    key: img.key,
    thumb: url,
    x: 50,
    y: 80,
    scale: 100,
    z: 0,
    characterName: nodeDraft.speakerDisplayName
  }
  if (pendingIndex.value !== null && pendingIndex.value >= 0) {
    nodeDraft.portraits[pendingIndex.value] = entry
    pendingIndex.value = null
  } else if (pendingIndex.value === -1) {
    nodeDraft.portraits.push(entry)
    pendingIndex.value = null
  }
}

onMounted(async () => {
  try {
    game.value = await api.get(route.params.id as string)
    scenes.value = (await api.listScenes(game.value.id)) as any[]
  } catch (error) {
    console.error('Failed to load game:', error)
    alert('ゲームの読み込みに失敗しました')
  } finally {
    loading.value = false
  }
})

async function selectScene(s: any) {
  scene.value = s
  try {
    nodes.value = (await api.listNodes(s.id)) as any[]
  } catch (error) {
    console.error('Failed to load nodes:', error)
  }
  node.value = null
}

async function addScene() {
  try {
    await api.upsertScene(game.value.id, {
      name: `Scene ${scenes.value.length + 1}`,
      order: scenes.value.length,
    })
    scenes.value = (await api.listScenes(game.value.id)) as any[]
  } catch (error) {
    console.error('Failed to add scene:', error)
    alert('シーンの追加に失敗しました')
  }
}

async function setSceneStartNode(id: string) {
  if (!scene.value) return
  await $fetch(`/games/scenes/${scene.value.id}`, {
    baseURL,
    method: 'PATCH',
    body: { startNodeId: id },
  })
  scene.value.startNodeId = id
}

function selectNode(n: any) {
  node.value = n
  Object.assign(nodeDraft, JSON.parse(JSON.stringify(n)))
  if (!nodeDraft.choices) {
    nodeDraft.choices = []
  }
  if (!nodeDraft.portraits) {
    nodeDraft.portraits = []
  }
  // camera デフォルト補完
  if (!nodeDraft.camera) {
    nodeDraft.camera = { zoom: 100, cx: 50, cy: 50 }
  }
  // 既存データを開いたときに p.thumb を補完
  hydratePortraitThumbs()
}

// 既存 portraits のサムネ署名URLを補完する
async function hydratePortraitThumbs() {
  if (!nodeDraft.portraits) return
  for (const p of nodeDraft.portraits) {
    try {
      if (p.thumb) continue
      let key = p.key
      // key が無ければキャラ画像一覧から該当IDを引いて key/thumbKey を得る
      if (!key && p.characterId && p.imageId) {
        const list = await $fetch<any[]>(`/characters/${p.characterId}/images`, { baseURL })
          .catch(() => $fetch<any[]>(`/my/characters/${p.characterId}/images`, { baseURL }))
        const hit = list?.find(x => x.id === p.imageId)
        key = hit?.thumbKey || hit?.key
      }
      if (key) {
        p.thumb = await getSignedGetUrl(key)
      }
    } catch (e) {
      console.warn('thumb hydrate failed', p, e)
    }
  }
}

async function addNode() {
  if (!scene.value) return
  try {
    await api.upsertNode(scene.value.id, { text: '...' })
    nodes.value = (await api.listNodes(scene.value.id)) as any[]
  } catch (error) {
    console.error('Failed to add node:', error)
    alert('ノードの追加に失敗しました')
  }
}

async function saveNode() {
  if (!scene.value || !node.value) return
  try {
    // 署名URLはDBに保存しない(TTL切れ防止)
    const payload = JSON.parse(JSON.stringify(nodeDraft))
    if (Array.isArray(payload.portraits)) {
      payload.portraits = payload.portraits.map((p: any) => {
        const { thumb, ...rest } = p
        return rest
      })
    }
    await api.upsertNode(scene.value.id, payload)
    nodes.value = (await api.listNodes(scene.value.id)) as any[]
    // Update the current node
    const updated = nodes.value.find((n) => n.id === node.value.id)
    if (updated) {
      selectNode(updated)
    }
  } catch (error) {
    console.error('Failed to save node:', error)
    alert('ノードの保存に失敗しました')
  }
}

async function deleteCurrentNode() {
  if (!node.value) return
  if (!confirm('このノードを削除しますか?')) return
  
  try {
    await api.delNode(node.value.id)
    nodes.value = (await api.listNodes(scene.value.id)) as any[]
    node.value = null
  } catch (error) {
    console.error('Failed to delete node:', error)
    alert('ノードの削除に失敗しました')
  }
}

function addChoice() {
  if (!nodeDraft.choices) {
    nodeDraft.choices = []
  }
  nodeDraft.choices.push({ label: '', targetNodeId: '' })
}

function removeChoice(index: number) {
  nodeDraft.choices.splice(index, 1)
}

// ---------- 3ペイン可変 & 全画面 ----------
const fullscreenProps = ref(false)
const wrap = ref<HTMLElement | null>(null)
const widths = useState('gameEditorPaneWidths', () => ({ scenes: 280, nodes: 520, props: 420 })) // px
const min = { scenes: 200, nodes: 360, props: 360 }
const gridStyle = computed(() => ({
  '--w-scenes': widths.value.scenes + 'px',
  '--w-nodes': widths.value.nodes + 'px',
  '--w-props': widths.value.props + 'px',
  '--sz-resizer': '8px',
}) as any)

onMounted(() => {
  // 以前の幅を復元
  const saved = localStorage.getItem('gameEditorPaneWidths')
  if (saved) {
    try { Object.assign(widths.value, JSON.parse(saved)) } catch {}
  }
  // Fキーで切替
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
function onKey(e: KeyboardEvent) {
  if (e.key.toLowerCase() === 'f') { e.preventDefault(); fullscreenProps.value = !fullscreenProps.value }
  if (e.key === 'Escape') { fullscreenProps.value = false }
}

let resizing: 'left' | 'right' | null = null
let startX = 0, startWidths = { scenes: 0, nodes: 0, props: 0 }, wrapWidth = 0
function startResize(side: 'left' | 'right', ev: PointerEvent) {
  resizing = side
  startX = ev.clientX
  startWidths = { ...widths.value }
  wrapWidth = wrap.value?.getBoundingClientRect().width ?? 0
  ;(ev.target as HTMLElement).setPointerCapture(ev.pointerId)
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp, { once: true })
}
function onMove(ev: PointerEvent) {
  if (!resizing) return
  const dx = ev.clientX - startX
  const w = { ...startWidths }
  if (resizing === 'left') {
    w.scenes = Math.max(min.scenes, startWidths.scenes + dx)
    w.nodes = Math.max(min.nodes, startWidths.nodes - dx)
  } else {
    w.nodes = Math.max(min.nodes, startWidths.nodes + dx)
    w.props = Math.max(min.props, startWidths.props - dx)
  }
  // wrap 幅にリサイズバー(×2)とギャップ(×4)を考慮
  const RES = 8, GAP = 16
  const maxSum = Math.max(0, wrapWidth - 2*RES - 4*GAP)
  const sum = w.scenes + w.nodes + w.props
  if (sum > maxSum) {
    const over = sum - maxSum
    if (resizing === 'left') w.nodes = Math.max(min.nodes, w.nodes - over)
    else w.props = Math.max(min.props, w.props - over)
  }
  widths.value = w
}
function onUp() {
  resizing = null
  localStorage.setItem('gameEditorPaneWidths', JSON.stringify(widths.value))
  window.removeEventListener('pointermove', onMove)
}
</script>

<template>
  <div class="container mx-auto px-4 py-4">
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">読み込み中...</p>
    </div>

    <div v-else-if="game" class="space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">{{ game.title }}</h1>
        <NuxtLink
          v-if="game?.id"
          :to="previewHref"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          プレビュー
        </NuxtLink>
      </div>

      <div
        ref="wrap"
        class="editor-grid"
        :style="gridStyle"
        tabindex="0"
        @keydown.esc.prevent.stop="fullscreenProps=false"
      >
        <!-- シーン一覧 (左) -->
        <aside v-show="!fullscreenProps" class="pane pane-scenes border border-gray-200 rounded-lg p-4 bg-white" aria-label="scenes">
          <h2 class="font-semibold mb-3 text-lg">シーン</h2>
          <ul class="space-y-2">
            <li
              v-for="s in scenes"
              :key="s.id"
              @click="selectScene(s)"
              :class="[
                'px-3 py-2 rounded cursor-pointer transition-colors',
                s.id === scene?.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 hover:bg-gray-100',
              ]"
            >
              {{ s.name }}
            </li>
          </ul>
          <button
            class="mt-4 w-full px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            @click="addScene"
          >
            + シーン追加
          </button>
        </aside>

        <!-- ノード一覧 (中央) -->
        <main v-show="!fullscreenProps" class="pane pane-nodes border border-gray-200 rounded-lg p-4 bg-white" aria-label="nodes">
          <h2 class="font-semibold mb-3 text-lg">ノード</h2>
          <div v-if="!scene" class="text-center py-12 text-gray-500">
            左からシーンを選択してください
          </div>
          <div v-else>
            <ul class="space-y-2">
              <li
                v-for="n in nodes"
                :key="n.id"
                class="p-3 border border-gray-200 rounded cursor-pointer hover:shadow-md transition-shadow"
                :class="{ 'border-blue-500 bg-blue-50': n.id === node?.id }"
              >
                <div class="flex items-center">
                  <div class="text-xs text-gray-500 mr-2">#{{ n.order }}</div>
                  <div class="font-medium truncate text-sm flex-1" @click="selectNode(n)">
                    {{ n.text || '(無題の台詞)' }}
                  </div>
                  <button class="ml-2 text-xs px-2 py-1 border rounded" @click.stop="setSceneStartNode(n.id)">▶開始ノードに設定</button>
                  <span v-if="scene?.startNodeId===n.id" class="ml-1 text-[10px] text-green-600">開始</span>
                </div>
                <div v-if="n.choices?.length" class="text-xs text-purple-600 mt-1">
                  選択肢 × {{ n.choices.length }}
                </div>
              </li>
            </ul>
            <button
              class="mt-4 w-full px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              @click="addNode"
            >
              + 台詞追加
            </button>
          </div>
        </main>

        <!-- resizer between scenes & nodes -->
        <div v-show="!fullscreenProps" class="resizer resizer-left" aria-label="resize-left" @pointerdown="startResize('left', $event)"></div>
        <!-- resizer between nodes & props -->
        <div v-show="!fullscreenProps" class="resizer resizer-right" aria-label="resize-right" @pointerdown="startResize('right', $event)"></div>

        <!-- プロパティ (右) -->
        <section
          class="pane pane-props border border-gray-200 rounded-lg p-4 bg-white overflow-y-auto"
          :class="fullscreenProps ? 'props-fullscreen' : 'props-normal'"
        >
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold text-lg">プロパティ</h2>
            <div class="flex items-center gap-2">
              <button class="px-2 py-1 border rounded text-sm" @click="fullscreenProps=!fullscreenProps">
                {{ fullscreenProps ? '通常表示' : '全画面' }}
              </button>
              <button class="ml-2 px-2 py-1 text-xs border rounded hover:bg-gray-50" @click="openThemeModal=true">全体設定</button>
              <span class="text-xs text-gray-500 hidden md:inline">Fで切替 / Escで閉じる</span>
            </div>
          </div>

          <!-- ミニプレビュー -->
          <!-- 全画面は 2 カラムに分割：左=ステージ / 右=フォーム -->
          <div v-if="fullscreenProps && node" class="fs-grid">
            <div class="stage-outer">
              <div class="stage-inner">
                <div class="relative w-full h-full">
                  <MiniStage :fill="true"
                             :bg-asset-id="nodeDraft.bgAssetId"
                             :portraits="nodeDraft.portraits || []"
                             :camera="nodeDraft.camera" />
                  <div class="absolute inset-x-2 bottom-2">
                    <MessageWindow
                      :speaker="nodeDraft.speakerDisplayName || ''"
                      :text="nodeDraft.text || ''"
                      :theme="previewTheme"
                      :animate="true"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="fs-form">
              <div class="space-y-4">
                <div>
                  <label class="block mb-1 text-sm font-medium">台詞</label>
                  <textarea
                    v-model="nodeDraft.text"
                    class="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="6"
                    placeholder="ここに台詞を入力... (｜で区切ると段階表示)"
                  ></textarea>
                </div>

              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium mb-1">話者キャラ</label>
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-700 truncate flex-1">{{ selectedCharLabel || '未選択' }}</span>
                    <button type="button" class="px-2 py-1 border rounded text-sm" @click="openCharPicker=true">変更</button>
                    <button v-if="nodeDraft.speakerCharacterId" type="button" class="px-2 py-1 border rounded text-sm" @click="clearChar">クリア</button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">話者表記（任意）</label>
                  <input
                    v-model="nodeDraft.speakerDisplayName"
                    class="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: ??? / 田中 / あだ名"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">背景</label>
                  <div class="flex items-center gap-2">
                    <img v-if="bgUrl" :src="bgUrl" class="w-16 h-10 object-cover rounded border" />
                    <span v-else class="text-xs text-gray-500">未選択</span>
                    <button type="button" class="px-2 py-1 border rounded text-sm" @click="openBgPicker=true">変更</button>
                    <button v-if="nodeDraft.bgAssetId" type="button" class="px-2 py-1 border rounded text-sm" @click="nodeDraft.bgAssetId=''">クリア</button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">BGM</label>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-700 truncate flex-1">{{ musicTitle || '未選択' }}</span>
                    <button type="button" class="px-2 py-1 border rounded text-sm" @click="openMusicPicker=true">変更</button>
                    <button v-if="nodeDraft.musicAssetId" type="button" class="px-2 py-1 border rounded text-sm" @click="nodeDraft.musicAssetId=''">クリア</button>
                  </div>
                  <audio v-if="musicUrl" :src="musicUrl" controls preload="none" class="mt-1 w-full"></audio>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">SFX</label>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-700 truncate flex-1">{{ nodeDraft.sfxAssetId || '未選択' }}</span>
                    <button type="button" class="px-2 py-1 border rounded text-sm" @click="openSfxPicker=true">変更</button>
                    <button v-if="nodeDraft.sfxAssetId" type="button" class="px-2 py-1 border rounded text-sm" @click="nodeDraft.sfxAssetId=''">クリア</button>
                  </div>
                </div>

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

                <!-- 立ち絵（複数配置） -->
                <div class="mt-3">
                  <div class="flex items-center justify-between">
                    <label class="block text-sm font-semibold">キャラクター配置</label>
                    <button type="button" class="px-2 py-1 border rounded text-sm" @click="addPortrait">追加</button>
                  </div>
                  <div v-if="(nodeDraft.portraits||[]).length===0" class="text-xs text-gray-500 mt-1">未配置</div>
                  <div v-for="(p, i) in (nodeDraft.portraits ||= [])" :key="i" class="mt-2 p-2 border rounded">
                    <div class="flex items-center gap-2">
                      <img v-if="p.thumb" :src="p.thumb" class="w-12 h-12 object-cover rounded-full border" />
                      <span class="text-xs text-gray-700 truncate flex-1">{{ p.characterName || p.characterId }}</span>
                      <button type="button" class="px-2 py-1 border rounded text-xs" @click="changePortrait(i)">画像変更</button>
                      <button type="button" class="px-2 py-1 border rounded text-xs" @click="removePortrait(i)">削除</button>
                    </div>
                    <div class="grid grid-cols-4 gap-2 mt-2">
                      <label class="text-xs">X%<input type="number" v-model.number="p.x" class="w-full border rounded px-1 py-0.5" /></label>
                      <label class="text-xs">Y%<input type="number" v-model.number="p.y" class="w-full border rounded px-1 py-0.5" /></label>
                      <label class="text-xs">Scale%<input type="number" v-model.number="p.scale" class="w-full border rounded px-1 py-0.5" /></label>
                      <label class="text-xs">Z<input type="number" v-model.number="p.z" class="w-full border rounded px-1 py-0.5" /></label>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1">次ノードID</label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="nodeDraft.nextNodeId"
                      class="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="node_xxx"
                    />
                    <button class="px-2 py-1 text-sm bg-gray-100 border rounded hover:bg-gray-200" @click="openNodePicker=true">選択</button>
                  </div>
                  <NodePicker v-if="openNodePicker" :game="game" :current-id="nodeDraft.nextNodeId" @close="openNodePicker=false" @select="(id: string)=> nodeDraft.nextNodeId=id" />
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  class="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  @click="saveNode"
                >
                  保存
                </button>
                <button
                  class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                  @click="addChoice"
                >
                  選択肢追加
                </button>
                <button
                  class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  @click="deleteCurrentNode"
                >
                  削除
                </button>
              </div>

              <div>
                <div class="font-semibold mb-2">選択肢</div>
                <div v-if="!nodeDraft.choices || nodeDraft.choices.length === 0" class="text-sm text-gray-500">
                  選択肢はありません
                </div>
                <div v-else class="space-y-2">
                  <div
                    v-for="(c, i) in nodeDraft.choices"
                    :key="i"
                    class="flex gap-2 items-center p-2 bg-gray-50 rounded"
                  >
                    <input
                      v-model="c.label"
                      class="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder="表示テキスト"
                    />
                    <input
                      v-model="c.targetNodeId"
                      class="w-40 border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder="targetNodeId"
                    />
                    <button
                      class="px-2 py-1 bg-red-400 text-white rounded text-xs hover:bg-red-500"
                      @click="removeChoice(i)"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>

          <!-- 通常表示の場合 -->
          <div v-if="!fullscreenProps">
            <div v-if="node" class="mb-3">
              <MiniStage :fill="false"
                         :bg-asset-id="nodeDraft.bgAssetId"
                         :portraits="nodeDraft.portraits || []"
                         :camera="nodeDraft.camera" />
            </div>

            <div v-if="node">
              <div class="space-y-4">
                <div>
                  <label class="block mb-1 text-sm font-medium">台詞</label>
                  <textarea
                    v-model="nodeDraft.text"
                    class="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="6"
                    placeholder="ここに台詞を入力... (｜で区切ると段階表示)"
                  ></textarea>
                </div>

                <div class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium mb-1">話者キャラ</label>
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-gray-700 truncate flex-1">{{ selectedCharLabel || '未選択' }}</span>
                      <button type="button" class="px-2 py-1 border rounded text-sm" @click="openCharPicker=true">変更</button>
                      <button v-if="nodeDraft.speakerCharacterId" type="button" class="px-2 py-1 border rounded text-sm" @click="clearChar">クリア</button>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">話者表記（任意）</label>
                    <input
                      v-model="nodeDraft.speakerDisplayName"
                      class="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: ??? / 田中 / あだ名"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">背景</label>
                    <div class="flex items-center gap-2">
                      <img v-if="bgUrl" :src="bgUrl" class="w-16 h-10 object-cover rounded border" />
                      <span v-else class="text-xs text-gray-500">未選択</span>
                      <button type="button" class="px-2 py-1 border rounded text-sm" @click="openBgPicker=true">変更</button>
                      <button v-if="nodeDraft.bgAssetId" type="button" class="px-2 py-1 border rounded text-sm" @click="nodeDraft.bgAssetId=''">クリア</button>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">BGM</label>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-700 truncate flex-1">{{ musicTitle || '未選択' }}</span>
                      <button type="button" class="px-2 py-1 border rounded text-sm" @click="openMusicPicker=true">変更</button>
                      <button v-if="nodeDraft.musicAssetId" type="button" class="px-2 py-1 border rounded text-sm" @click="nodeDraft.musicAssetId=''">クリア</button>
                    </div>
                    <audio v-if="musicUrl" :src="musicUrl" controls preload="none" class="mt-1 w-full"></audio>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">SFX</label>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-700 truncate flex-1">{{ nodeDraft.sfxAssetId || '未選択' }}</span>
                      <button type="button" class="px-2 py-1 border rounded text-sm" @click="openSfxPicker=true">変更</button>
                      <button v-if="nodeDraft.sfxAssetId" type="button" class="px-2 py-1 border rounded text-sm" @click="nodeDraft.sfxAssetId=''">クリア</button>
                    </div>
                  </div>

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

                  <!-- 立ち絵（複数配置） -->
                  <div class="mt-3">
                    <div class="flex items-center justify-between">
                      <label class="block text-sm font-semibold">キャラクター配置</label>
                      <button type="button" class="px-2 py-1 border rounded text-sm" @click="addPortrait">追加</button>
                    </div>
                    <div v-if="(nodeDraft.portraits||[]).length===0" class="text-xs text-gray-500 mt-1">未配置</div>
                    <div v-for="(p, i) in (nodeDraft.portraits ||= [])" :key="i" class="mt-2 p-2 border rounded">
                      <div class="flex items-center gap-2">
                        <img v-if="p.thumb" :src="p.thumb" class="w-12 h-12 object-cover rounded-full border" />
                        <span class="text-xs text-gray-700 truncate flex-1">{{ p.characterName || p.characterId }}</span>
                        <button type="button" class="px-2 py-1 border rounded text-xs" @click="changePortrait(i)">画像変更</button>
                        <button type="button" class="px-2 py-1 border rounded text-xs" @click="removePortrait(i)">削除</button>
                      </div>
                      <div class="grid grid-cols-4 gap-2 mt-2">
                        <label class="text-xs">X%<input type="number" v-model.number="p.x" class="w-full border rounded px-1 py-0.5" /></label>
                        <label class="text-xs">Y%<input type="number" v-model.number="p.y" class="w-full border rounded px-1 py-0.5" /></label>
                        <label class="text-xs">Scale%<input type="number" v-model.number="p.scale" class="w-full border rounded px-1 py-0.5" /></label>
                        <label class="text-xs">Z<input type="number" v-model.number="p.z" class="w-full border rounded px-1 py-0.5" /></label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-1">次ノードID</label>
                    <input
                      v-model="nodeDraft.nextNodeId"
                      class="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="node_xxx"
                    />
                  </div>
                </div>

                <div class="flex gap-2">
                  <button
                    class="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    @click="saveNode"
                  >
                    保存
                  </button>
                  <button
                    class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                    @click="addChoice"
                  >
                    選択肢追加
                  </button>
                  <button
                    class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    @click="deleteCurrentNode"
                  >
                    削除
                  </button>
                </div>

                <div>
                  <div class="font-semibold mb-2">選択肢</div>
                  <div v-if="!nodeDraft.choices || nodeDraft.choices.length === 0" class="text-sm text-gray-500">
                    選択肢はありません
                  </div>
                  <div v-else class="space-y-2">
                    <div
                      v-for="(c, i) in nodeDraft.choices"
                      :key="i"
                      class="flex gap-2 items-center p-2 bg-gray-50 rounded"
                    >
                      <input
                        v-model="c.label"
                        class="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="表示テキスト"
                      />
                      <input
                        v-model="c.targetNodeId"
                        class="w-40 border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="targetNodeId"
                      />
                      <button
                        class="px-2 py-1 bg-red-400 text-white rounded text-xs hover:bg-red-500"
                        @click="removeChoice(i)"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-12 text-gray-500">
              ノードを選択してください
            </div>
          </div>
          <!-- Pickers -->
          <AssetPicker v-model:open="openBgPicker" type="image" @select="(a)=> nodeDraft.bgAssetId = a.id" />
          <AssetPicker v-model:open="openMusicPicker" type="audio" @select="(a)=> nodeDraft.musicAssetId = a.id" />
          <AssetPicker v-model:open="openSfxPicker" type="audio" @select="(a)=> nodeDraft.sfxAssetId = a.id" />
          <CharacterPicker v-model:open="openCharPicker" @select="onCharPicked" />
          <CharacterImagePicker v-model:open="openCharImagePicker" :character-id="nodeDraft.speakerCharacterId || ''" @select="onImagePicked" />
        </section>
      <!-- ...existing code... -->
      </div>
    </div>
  </div>
</template>


<!-- root <template>の末尾に常駐モーダル配置（重複防止済み） -->
<MessageThemeModal
  v-if="openThemeModal"
  :game-id="game.value.id"
  :initial="game.value.messageTheme"
  @close="openThemeModal=false"
  @saved="(v)=>{ game.value.messageTheme=v }"
/>

<style scoped>
.editor-grid{
  display: grid;
  grid-template-columns:
    var(--w-scenes,280px)
    var(--sz-resizer,8px)
    var(--w-nodes,1fr)
    var(--sz-resizer,8px)
    var(--w-props,420px);
  gap: 1rem;
  align-items: stretch;
  grid-template-rows: 1fr;          /* ← 行を1本に固定 */
  box-sizing: border-box;
}
.pane{ min-height: calc(100vh - 140px); grid-row: 1; }   /* ← どの pane も1行目に固定 */
.resizer{ grid-row: 1; }                                  /* ← リサイズバーも同じ行に固定 */
.pane-scenes { grid-column: 1; }
.pane-nodes  { grid-column: 3; }
.pane-props  { grid-column: 5; }
.props-normal{ position: sticky; top: 64px; }
.props-fullscreen{
  position: fixed; inset: 0; z-index: 50; background: #fff; /* 余白を廃止して全面使用 */
  padding: 16px; overflow: auto;
}
.resizer{
  width: var(--sz-resizer,8px); cursor: col-resize; background: transparent; user-select: none;
  align-self: stretch; /* 縦に伸ばす */
}
.resizer-left  { grid-column: 2; }
.resizer-right { grid-column: 4; }
.resizer:hover{ background: #e5e7eb; }
.resizer:active{ background: #cbd5e1; }

/* === 全画面レイアウト（左右2カラム） === */
.fs-grid{
  display: grid;
  grid-template-columns: minmax(640px, 1fr) minmax(360px, 440px);
  gap: 24px;
  align-items: start;
}
@media (max-width: 1200px){
  .fs-grid{ grid-template-columns: 1fr; }
}
/* 左カラムのステージは高さ基準でクランプして 16:9 維持 */
.stage-outer{
  width: 100%;
  max-height: 72vh;
  display: flex; justify-content: center; align-items: flex-start;
}
.stage-inner{
  /* 画面が広ければ大きく、狭ければ縮む / 高さ72vh以内に収める */
  width: min(100%, calc(72vh * (16 / 9)));
  aspect-ratio: 16 / 9;
  height: auto;
}
.fs-form{ width: 100%; }
</style>
