<template>
  <div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
    <div class="bg-white rounded-xl w-[680px] max-w-[92vw] p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold">次ノードを選択</h3>
        <button class="text-gray-500 hover:text-gray-700" @click="$emit('close')">✕</button>
      </div>
      <input v-model="q" type="text" class="w-full border rounded px-3 py-2 mb-3" placeholder="検索（台詞の先頭など）" />
      <div class="max-h-[60vh] overflow-auto divide-y">
        <button
          v-for="opt in filtered"
          :key="opt.id"
          class="w-full text-left px-3 py-2 hover:bg-gray-50"
          :class="opt.id === currentId ? 'bg-blue-50' : ''"
          @click="$emit('select', opt.id); $emit('close')"
        >
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <span>Scene {{ opt.sceneOrder }}<template v-if="opt.sceneName">: {{ opt.sceneName }}</template></span>
            <span>/ Node {{ opt.nodeOrder }}</span>
            <span v-if="opt.isCurrentScene" class="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700">現在のシーン</span>
            <span v-if="opt.id === currentId" class="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">選択中</span>
          </div>
          <div class="truncate text-sm text-gray-900">{{ opt.preview }}</div>
          <div class="truncate text-[11px] text-gray-400">{{ opt.id }}</div>
        </button>
        <div v-if="filtered.length === 0" class="px-3 py-6 text-center text-sm text-gray-500">
          一致するノードがありません
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

const q = ref('')
const currentId = computed(() => props.currentId ?? null)

const options = computed(() => {
  const list:any[] = []
  ;(props.scenes ?? []).forEach((s:any, si:number) => {
    s.nodes?.forEach((n:any, ni:number) => {
      list.push({
        id: n.id,
        preview: (n.text || '').replace(/\s+/g,' ').slice(0, 60) + ((n.text||'').length>60?'…':''),
        sceneOrder: typeof s.order === 'number' ? s.order + 1 : si + 1,
        sceneName: s.name || '',
        nodeOrder: typeof n.order === 'number' ? n.order + 1 : ni + 1,
        isCurrentScene: s.id === props.currentSceneId,
      })
    })
  })
  return list
})
const filtered = computed(() => {
  const v = q.value.trim().toLowerCase()
  if (!v) return options.value
  return options.value.filter(o => o.id.toLowerCase().includes(v) || o.preview.toLowerCase().includes(v))
})
</script>
