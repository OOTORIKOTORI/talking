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
          @click="$emit('select', opt.id); $emit('close')"
        >
          <div class="text-xs text-gray-500">Scene {{ opt.sceneOrder }} / Node {{ opt.nodeOrder }} ・ {{ opt.id }}</div>
          <div class="truncate">{{ opt.preview }}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ game:any, currentId?:string | null }>()
const q = ref('')
const options = computed(() => {
  const list:any[] = []
  props.game?.scenes?.forEach((s:any, si:number) => {
    s.nodes?.forEach((n:any, ni:number) => {
      list.push({
        id: n.id,
        preview: (n.text || '').replace(/\s+/g,' ').slice(0, 60) + ((n.text||'').length>60?'…':''),
        sceneOrder: si+1,
        nodeOrder: ni+1,
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
