<template>
  <div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" @click.self="emit('close')" @keydown="onKeydown">
    <div
      ref="modalPanelRef"
      class="bg-white rounded-xl w-[820px] max-w-[96vw] flex flex-col"
      style="max-height: 80vh;"
      tabindex="-1"
    >
      <!-- ヘッダー -->
      <div class="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
        <h3 class="font-semibold">次ノードを選択</h3>
        <button class="text-gray-500 hover:text-gray-700" @click="emit('close')">✕</button>
      </div>
      <!-- 検索欄 -->
      <div class="px-4 pb-2 flex-shrink-0">
        <input
          ref="searchInputRef"
          v-model="q"
          type="text"
          class="w-full border rounded px-3 py-2 text-sm"
          placeholder="検索（台詞・シーン名・node id）"
        />
      </div>
      <!-- 本体: 左右2カラム (検索中は1カラム) -->
      <div class="flex flex-1 min-h-0 border-t">
        <!-- 左ペイン: シーン一覧 (検索中は非表示) -->
        <div v-if="!isSearching" class="w-48 flex-shrink-0 border-r overflow-y-auto">
          <div v-if="sceneList.length === 0" class="px-3 py-6 text-center text-sm text-gray-400">
            シーンがありません
          </div>
          <button
            v-for="sc in sceneList"
            :key="sc.id"
            class="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
            :class="sc.id === selectedSceneId ? 'bg-blue-50' : ''"
            @click="selectedSceneId = sc.id"
          >
            <div class="text-xs font-medium text-gray-800 truncate">Scene {{ sc.order }}<template v-if="sc.name">: {{ sc.name }}</template></div>
            <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span class="text-[11px] text-gray-400">{{ sc.nodeCount }} nodes</span>
              <span v-if="sc.id === props.currentSceneId" class="text-[10px] rounded bg-emerald-100 px-1 py-0.5 text-emerald-700 leading-none">現在のシーン</span>
            </div>
          </button>
        </div>
        <!-- 右ペイン: ノード一覧 -->
        <div class="flex-1 min-h-0 flex flex-col">
          <div class="flex-1 overflow-y-auto divide-y">
            <!-- 検索モード: 全シーン横断結果 -->
            <template v-if="isSearching">
              <div v-if="searchResults.length === 0" class="px-3 py-6 text-center text-sm text-gray-400">
                一致するノードがありません
              </div>
              <button
                v-for="opt in searchResults"
                :id="optionRowId(opt.id)"
                :key="opt.id"
                class="w-full text-left px-3 py-2 hover:bg-gray-50"
                :class="optionRowClass(opt.id)"
                @click="selectOption(opt.id)"
              >
                <div class="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                  <span class="font-medium text-gray-700">Scene {{ opt.sceneOrder }}<template v-if="opt.sceneName">: {{ opt.sceneName }}</template></span>
                  <span>/ Node {{ opt.nodeOrder }}</span>
                  <span v-if="opt.isCurrentScene" class="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700">現在のシーン</span>
                  <span v-if="opt.isStartNode" class="rounded bg-lime-100 px-1.5 py-0.5 text-lime-700">開始ノード</span>
                  <span v-if="opt.id === currentId" class="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">選択中</span>
                  <span v-if="opt.id === highlightedId" class="rounded bg-amber-100 px-1.5 py-0.5 text-amber-700">ハイライト中</span>
                </div>
                <div class="truncate text-sm text-gray-900 mt-0.5">{{ opt.preview }}</div>
                <div class="truncate text-[11px] text-gray-400">{{ opt.id }}</div>
              </button>
            </template>
            <!-- 通常モード: 選択中シーンのノード -->
            <template v-else>
              <div v-if="sceneList.length === 0" class="px-3 py-6 text-center text-sm text-gray-400">
                シーンがありません
              </div>
              <div v-else-if="selectedSceneNodes.length === 0" class="px-3 py-6 text-center text-sm text-gray-400">
                このシーンにはノードがありません
              </div>
              <button
                v-for="opt in selectedSceneNodes"
                :id="optionRowId(opt.id)"
                :key="opt.id"
                class="w-full text-left px-3 py-2 hover:bg-gray-50"
                :class="optionRowClass(opt.id)"
                @click="selectOption(opt.id)"
              >
                <div class="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                  <span>Node {{ opt.nodeOrder }}</span>
                  <span v-if="opt.isStartNode" class="rounded bg-lime-100 px-1.5 py-0.5 text-lime-700">開始ノード</span>
                  <span v-if="opt.id === currentId" class="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">選択中</span>
                  <span v-if="opt.id === highlightedId" class="rounded bg-amber-100 px-1.5 py-0.5 text-amber-700">ハイライト中</span>
                </div>
                <div class="truncate text-sm text-gray-900 mt-0.5">{{ opt.preview }}</div>
                <div class="truncate text-[11px] text-gray-400">{{ opt.id }}</div>
              </button>
            </template>
          </div>

          <!-- 詳細プレビュー -->
          <div class="border-t bg-gray-50 px-3 py-2 text-xs text-gray-700">
            <template v-if="previewNode">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-gray-800">プレビュー</span>
                <span>Scene {{ previewNode.sceneOrder }}<template v-if="previewNode.sceneName">: {{ previewNode.sceneName }}</template></span>
                <span>Node {{ previewNode.nodeOrder }}</span>
                <span v-if="previewNode.id === currentId" class="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">現在選択中</span>
                <span v-if="previewNode.isStartNode" class="rounded bg-lime-100 px-1.5 py-0.5 text-lime-700">開始ノード</span>
              </div>
              <div class="mt-1 text-[11px] text-gray-500">ID: {{ previewNode.id }}</div>
              <div class="mt-1 text-sm text-gray-900 whitespace-pre-wrap break-words max-h-24 overflow-hidden">{{ previewNode.detailText }}</div>
              <div class="mt-1 flex items-center gap-3 text-[11px] text-gray-600 flex-wrap">
                <span>選択肢: {{ previewNode.choiceCount }}件</span>
                <span>nextNode: {{ previewNode.hasNextNode ? '設定あり' : '未設定' }}</span>
              </div>
            </template>
            <div v-else class="text-gray-400">プレビュー対象のノードがありません</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type NodeOption = {
  id: string
  preview: string
  detailText: string
  sceneId: string
  sceneName: string
  sceneOrder: number
  nodeOrder: number
  isCurrentScene: boolean
  isStartNode: boolean
  choiceCount: number
  hasNextNode: boolean
}

const props = defineProps<{
  scenes?: any[]
  currentId?: string | null
  currentSceneId?: string | null
}>()

const emit = defineEmits<{
  close: []
  select: [id: string]
}>()

const q = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const modalPanelRef = ref<HTMLElement | null>(null)
const currentId = computed(() => props.currentId ?? null)
const isSearching = computed(() => q.value.trim().length > 0)
const highlightedId = ref<string | null>(null)

function toPreviewText(v: unknown, max: number) {
  const text = typeof v === 'string' ? v : ''
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) return '(本文なし)'
  return normalized.slice(0, max) + (normalized.length > max ? '…' : '')
}

function toNodeOption(s: any, si: number, n: any, ni: number): NodeOption {
  const sceneOrder = typeof s?.order === 'number' ? s.order + 1 : si + 1
  const nodeOrder = typeof n?.order === 'number' ? n.order + 1 : ni + 1
  const text = typeof n?.text === 'string' ? n.text : ''
  return {
    id: n.id,
    preview: toPreviewText(text, 80),
    detailText: toPreviewText(text, 200),
    sceneId: s.id,
    sceneName: s.name || '',
    sceneOrder,
    nodeOrder,
    isCurrentScene: s.id === props.currentSceneId,
    isStartNode: !!s.startNodeId && s.startNodeId === n.id,
    choiceCount: Array.isArray(n?.choices) ? n.choices.length : 0,
    hasNextNode: !!n?.nextNodeId,
  }
}

// シーン一覧
const sceneList = computed(() => {
  return (props.scenes ?? []).map((s: any, si: number) => ({
    id: s.id,
    name: s.name || '',
    order: typeof s.order === 'number' ? s.order + 1 : si + 1,
    nodeCount: s.nodes?.length ?? 0,
  }))
})

// 初期選択シーン: currentSceneId → currentId を含むシーン → 先頭
const initialSceneId = computed(() => {
  const scenes = props.scenes ?? []
  if (!scenes.length) return null

  // currentSceneId が存在するか確認
  if (props.currentSceneId && scenes.some((s: any) => s.id === props.currentSceneId)) {
    return props.currentSceneId
  }
  // currentId を含むシーンを探す
  if (props.currentId) {
    const found = scenes.find((s: any) => s.nodes?.some((n: any) => n.id === props.currentId))
    if (found) return found.id
  }
  return scenes[0]?.id ?? null
})

const selectedSceneId = ref<string | null>(null)

// 初期化 (props変化時も追従)
watch(initialSceneId, (v) => {
  if (!selectedSceneId.value) {
    selectedSceneId.value = v
  }
}, { immediate: true })

// 選択中シーンのノード
const selectedSceneNodes = computed(() => {
  const sceneId = selectedSceneId.value
  const sceneIndex = (props.scenes ?? []).findIndex((s: any) => s.id === sceneId)
  const scene = sceneIndex >= 0 ? (props.scenes ?? [])[sceneIndex] : null
  if (!scene) return []
  return (scene.nodes ?? []).map((n: any, ni: number) => toNodeOption(scene, sceneIndex, n, ni))
})

// 全ノードオプション (検索用)
const allOptions = computed<NodeOption[]>(() => {
  const list: NodeOption[] = []
  ;(props.scenes ?? []).forEach((s: any, si: number) => {
    s.nodes?.forEach((n: any, ni: number) => {
      list.push(toNodeOption(s, si, n, ni))
    })
  })
  return list
})

// 検索結果
const searchResults = computed(() => {
  const v = q.value.trim().toLowerCase()
  if (!v) return []
  return allOptions.value.filter(
    (o) =>
      o.id.toLowerCase().includes(v) ||
      o.preview.toLowerCase().includes(v) ||
      o.sceneName.toLowerCase().includes(v) ||
      o.detailText.toLowerCase().includes(v)
  )
})

const visibleOptions = computed(() => (isSearching.value ? searchResults.value : selectedSceneNodes.value))

function selectOption(id: string) {
  emit('select', id)
  emit('close')
}

function moveHighlight(delta: number) {
  const list = visibleOptions.value
  if (!list.length) {
    highlightedId.value = null
    return
  }

  const currentIndex = list.findIndex((opt) => opt.id === highlightedId.value)
  if (currentIndex < 0) {
    highlightedId.value = list[0].id
    return
  }
  const nextIndex = (currentIndex + delta + list.length) % list.length
  highlightedId.value = list[nextIndex].id
}

function onKeydown(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return

  if (e.key === 'Escape') {
    e.preventDefault()
    emit('close')
    return
  }
  if (e.isComposing) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    moveHighlight(1)
    return
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    moveHighlight(-1)
    return
  }

  if (e.key === 'Enter') {
    const targetId = highlightedId.value ?? visibleOptions.value[0]?.id
    if (!targetId) return
    e.preventDefault()
    selectOption(targetId)
  }
}

function optionRowClass(id: string) {
  if (id === highlightedId.value) {
    return 'bg-amber-50 ring-1 ring-inset ring-amber-300'
  }
  if (id === currentId.value) {
    return 'bg-blue-50'
  }
  return ''
}

function optionRowId(id: string) {
  return `nodepicker-option-${id}`
}

const previewNode = computed(() => {
  const list = visibleOptions.value
  if (!list.length) return null
  const highlighted = list.find((o) => o.id === highlightedId.value)
  if (highlighted) return highlighted
  const selected = list.find((o) => o.id === currentId.value)
  return selected ?? list[0]
})

watch(visibleOptions, (list) => {
  if (!list.length) {
    highlightedId.value = null
    return
  }
  if (highlightedId.value && list.some((opt) => opt.id === highlightedId.value)) {
    return
  }
  const selected = list.find((opt) => opt.id === currentId.value)
  highlightedId.value = selected?.id ?? list[0].id
}, { immediate: true })

watch(highlightedId, async (id) => {
  if (!id) return
  await nextTick()
  const el = document.getElementById(optionRowId(id))
  el?.scrollIntoView({ block: 'nearest' })
})

onMounted(async () => {
  await nextTick()
  if (searchInputRef.value) {
    searchInputRef.value.focus()
    return
  }
  modalPanelRef.value?.focus()
})
</script>
