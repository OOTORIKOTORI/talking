<template>
  <div class="container mx-auto px-4 py-4">
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">読み込み中...</p>
    </div>

    <div v-else-if="game" class="space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">{{ game.title }}</h1>
        <NuxtLink
          :to="`/games/${game.id}/play`"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          プレビュー
        </NuxtLink>
      </div>

      <div class="grid grid-cols-12 gap-4 min-h-[600px]">
        <!-- シーン一覧 (左) -->
        <aside class="col-span-3 border border-gray-200 rounded-lg p-4 bg-white">
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
        <main class="col-span-5 border border-gray-200 rounded-lg p-4 bg-white">
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
                @click="selectNode(n)"
              >
                <div class="text-xs text-gray-500">#{{ n.order }}</div>
                <div class="font-medium truncate text-sm">
                  {{ n.text || '(無題の台詞)' }}
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

        <!-- プロパティ (右) -->
        <section class="col-span-4 border border-gray-200 rounded-lg p-4 bg-white max-h-[calc(100vh-140px)] overflow-y-auto sticky top-16">
          <h2 class="font-semibold mb-3 text-lg">プロパティ</h2>
          <div v-if="node">
            <div class="space-y-4">
              <div>
                <label class="block mb-1 text-sm font-medium">台詞</label>
                <textarea
                  v-model="nodeDraft.text"
                  class="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="6"
                  placeholder="ここに台詞を入力... (｜で区切ると段階表示)"
                />
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
                    <img v-if="nodeDraft.bgAssetId" :src="signed(nodeDraft.bgAssetId)" class="w-16 h-10 object-cover rounded border" />
                    <span v-else class="text-xs text-gray-500">未選択</span>
                    <button type="button" class="px-2 py-1 border rounded text-sm" @click="openBgPicker=true">変更</button>
                    <button v-if="nodeDraft.bgAssetId" type="button" class="px-2 py-1 border rounded text-sm" @click="nodeDraft.bgAssetId=''">クリア</button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">表情 / 立ち絵</label>
                  <div class="flex items-center gap-2">
                    <img v-if="nodeDraft.portraitAssetId" :src="signed(nodeDraft.portraitAssetId)" class="w-12 h-12 object-cover rounded-full border" />
                    <span v-else class="text-xs text-gray-500">未選択</span>
                    <button type="button" class="px-2 py-1 border rounded text-sm" @click="openPortraitPicker=true">選択</button>
                    <button v-if="nodeDraft.portraitAssetId" type="button" class="px-2 py-1 border rounded text-sm" @click="nodeDraft.portraitAssetId=''">クリア</button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">BGM</label>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-700 truncate flex-1">{{ nodeDraft.musicAssetId || '未選択' }}</span>
                    <button type="button" class="px-2 py-1 border rounded text-sm" @click="openMusicPicker=true">変更</button>
                    <button v-if="nodeDraft.musicAssetId" type="button" class="px-2 py-1 border rounded text-sm" @click="nodeDraft.musicAssetId=''">クリア</button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">SFX</label>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-700 truncate flex-1">{{ nodeDraft.sfxAssetId || '未選択' }}</span>
                    <button type="button" class="px-2 py-1 border rounded text-sm" @click="openSfxPicker=true">変更</button>
                    <button v-if="nodeDraft.sfxAssetId" type="button" class="px-2 py-1 border rounded text-sm" @click="nodeDraft.sfxAssetId=''">クリア</button>
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
          <!-- Pickers -->
          <AssetPicker v-model:open="openBgPicker" type="image" @select="(a)=> nodeDraft.bgAssetId = a.id" />
          <AssetPicker v-model:open="openMusicPicker" type="audio" @select="(a)=> nodeDraft.musicAssetId = a.id" />
          <AssetPicker v-model:open="openPortraitPicker" type="image" @select="(a)=> nodeDraft.portraitAssetId = a.id" />
          <AssetPicker v-model:open="openSfxPicker" type="audio" @select="(a)=> nodeDraft.sfxAssetId = a.id" />
          <CharacterPicker v-model:open="openCharPicker" @select="onCharPicked" />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AssetPicker from '@/components/pickers/AssetPicker.vue'
import CharacterPicker from '@/components/pickers/CharacterPicker.vue'
import { getSignedGetUrl } from '@/composables/useSignedUrl'

definePageMeta({
  middleware: 'require-auth'
})

const route = useRoute()
const api = useGamesApi()

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
const openPortraitPicker = ref(false)
const openSfxPicker = ref(false)

// Generate signed URL synchronously for preview
function signed(key: string | null | undefined): string {
  if (!key) return ''
  // For preview, just construct the API endpoint - browser will handle auth
  return `/api/uploads/signed-get?key=${encodeURIComponent(key)}`
}

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

function selectNode(n: any) {
  node.value = n
  Object.assign(nodeDraft, JSON.parse(JSON.stringify(n)))
  if (!nodeDraft.choices) {
    nodeDraft.choices = []
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
    await api.upsertNode(scene.value.id, nodeDraft)
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
</script>
