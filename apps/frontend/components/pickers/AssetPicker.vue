<template>
  <div v-if="open" class="fixed inset-0 bg-black/30 grid place-items-center z-50" @click.self="$emit('update:open', false)">
    <div class="bg-white w-[min(960px,95vw)] max-h-[85vh] rounded-lg shadow p-4 overflow-auto">
      <div class="flex items-center justify-between mb-3">
        <div class="text-lg font-semibold">アセットを選択</div>
        <input v-model="q" placeholder="検索…" class="border rounded px-2 py-1 w-64" />
      </div>
      <div class="mb-3 border-b">
        <button class="px-3 py-2" :class="tab==='mine' ? 'border-b-2 border-black' : ''" @click="tab='mine'">自分のアセット</button>
        <button class="px-3 py-2" :class="tab==='fav' ? 'border-b-2 border-black' : ''" @click="tab='fav'">お気に入り</button>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button v-for="a in items" :key="a.id" class="border rounded p-2 text-left hover:bg-gray-50"
                @click="$emit('select', a); $emit('update:open', false)">
          <div class="aspect-video bg-gray-100 grid place-items-center overflow-hidden mb-2">
            <AssetThumbnail v-if="isImage(a)" :asset="a" />
            <div v-else class="text-xs text-gray-600">音声: {{ a.title || a.id }}</div>
          </div>
          <div class="text-sm font-medium truncate">{{ a.title || a.id }}</div>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useAssetsApi } from '@/composables/useAssets'
import AssetThumbnail from '@/components/AssetThumbnail.vue'
const props = defineProps<{ open: boolean; type?: 'image'|'audio' }>()
const emits = defineEmits<{(e:'update:open', v:boolean):void; (e:'select', a:any):void}>()
const api = useAssetsApi()
const tab = ref<'mine'|'fav'>('mine')
const q = ref('')
const items = ref<any[]>([])
const isImage = (a:any)=> String(a.contentType||'').startsWith('image/')
const isAudio = (a:any)=> String(a.contentType||'').startsWith('audio/')
async function load() {
  if (tab.value==='mine') {
    items.value = await api.listMine({ q: q.value || undefined, type: props.type, limit: 100 })
  } else {
    items.value = await api.listFavoriteAssets({ q: q.value || undefined, type: props.type, limit: 100 } as any).then((r:any)=> (r?.items ?? r) as any[])
  }
}
watch([tab,q], load, { immediate: true })
</script>
