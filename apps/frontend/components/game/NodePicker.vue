<template>
  <div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" @click.self="$emit('close')">
    <div class="bg-white rounded-xl w-[820px] max-w-[96vw] flex flex-col" style="max-height: 80vh;">
      <!-- ヘッダー -->
      <div class="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
        <h3 class="font-semibold">次ノードを選択</h3>
        <button class="text-gray-500 hover:text-gray-700" @click="$emit('close')">✕</button>
      </div>
      <!-- 検索欄 -->
      <div class="px-4 pb-2 flex-shrink-0">
        <input
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
        <div class="flex-1 overflow-y-auto divide-y">
          <!-- 検索モード: 全シーン横断結果 -->
          <template v-if="isSearching">
            <div v-if="searchResults.length === 0" class="px-3 py-6 text-center text-sm text-gray-400">
              一致するノードがありません
            </div>
            <button
              v-for="opt in searchResults"
              :key="opt.id"
              class="w-full text-left px-3 py-2 hover:bg-gray-50"
              :class="opt.id === currentId ? 'bg-blue-50' : ''"
              @click="$emit('select', opt.id); $emit('close')"
            >
              <div class="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                <span class="font-medium text-gray-700">Scene {{ opt.sceneOrder }}<template v-if="opt.sceneName">: {{ opt.sceneName }}</template></span>
                <span>/ Node {{ opt.nodeOrder }}</span>
                <span v-if="opt.isCurrentScene" class="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700">現在のシーン</span>
                <span v-if="opt.id === currentId" class="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">選択中</span>
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
              :key="opt.id"
              class="w-full text-left px-3 py-2 hover:bg-gray-50"
              :class="opt.id === currentId ? 'bg-blue-50' : ''"
              @click="$emit('select', opt.id); $emit('close')"
            >
              <div class="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                <span>Node {{ opt.nodeOrder }}</span>
                <span v-if="opt.id === currentId" class="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">選択中</span>
              </div>
              <div class="truncate text-sm text-gray-900 mt-0.5">{{ opt.preview }}</div>
              <div class="truncate text-[11px] text-gray-400">{{ opt.id }}</div>
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  scenes?: any[]
  currentId?: string | null
  currentSceneId?: string | null
}>()

defineEmits<{
  close: []
  select: [id: string]
}>()

const q = ref('')
const currentId = computed(() => props.currentId ?? null)
const isSearching = computed(() => q.value.trim().length > 0)

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
  const scene = (props.scenes ?? []).find((s: any) => s.id === sceneId)
  if (!scene) return []
  return (scene.nodes ?? []).map((n: any, ni: number) => ({
    id: n.id,
    preview: (n.text || '').replace(/\s+/g, ' ').slice(0, 80) + ((n.text || '').length > 80 ? '…' : ''),
    nodeOrder: typeof n.order === 'number' ? n.order + 1 : ni + 1,
  }))
})

// 全ノードオプション (検索用)
const allOptions = computed(() => {
  const list: any[] = []
  ;(props.scenes ?? []).forEach((s: any, si: number) => {
    s.nodes?.forEach((n: any, ni: number) => {
      list.push({
        id: n.id,
        preview: (n.text || '').replace(/\s+/g, ' ').slice(0, 80) + ((n.text || '').length > 80 ? '…' : ''),
        sceneOrder: typeof s.order === 'number' ? s.order + 1 : si + 1,
        sceneName: s.name || '',
        nodeOrder: typeof n.order === 'number' ? n.order + 1 : ni + 1,
        isCurrentScene: s.id === props.currentSceneId,
      })
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
      o.sceneName.toLowerCase().includes(v)
  )
})
</script>
