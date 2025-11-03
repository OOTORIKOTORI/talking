<template>
  <div v-if="open" class="fixed inset-0 bg-black/30 grid place-items-center z-50" @click.self="$emit('update:open', false)">
    <div class="bg-white w-[min(800px,95vw)] max-h-[85vh] rounded-lg shadow p-4 overflow-auto">
      <div class="flex items-center justify-between mb-3">
        <div class="text-lg font-semibold">キャラクターを選択</div>
        <input v-model="q" placeholder="検索…" class="border rounded px-2 py-1 w-64" />
      </div>
      <div class="mb-3 border-b">
        <button class="px-3 py-2" :class="tab==='mine' ? 'border-b-2 border-black' : ''" @click="tab='mine'">自分のキャラ</button>
        <button class="px-3 py-2" :class="tab==='fav' ? 'border-b-2 border-black' : ''" @click="tab='fav'">お気に入り</button>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button v-for="c in items" :key="c.id" class="border rounded p-2 text-left hover:bg-gray-50"
                @click="$emit('select', c); $emit('update:open', false)">
          <div class="text-sm font-medium truncate">{{ c.displayName || c.name || c.id }}</div>
          <div class="text-xs text-gray-600 truncate">{{ (c.tags||[]).join(', ') }}</div>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
import { useCharactersApi } from '@/composables/useCharacters'
const props = defineProps<{ open: boolean }>()
const emits = defineEmits<{(e:'update:open', v:boolean):void; (e:'select', c:any):void}>()
const api = useCharactersApi()
const tab = ref<'mine'|'fav'>('mine')
const q = ref('')
const items = ref<any[]>([])
const doLoad = async () => {
  if (tab.value==='mine') {
    items.value = await api.listMine({ q: q.value || undefined, limit: 100 }) as any[]
  } else {
    const result: any = await api.listFavoriteCharacters({ q: q.value || undefined, limit: 100 })
    items.value = Array.isArray(result) ? result : (result?.items ?? result?.results ?? [])
  }
}
watchDebounced([tab, q], doLoad, { immediate: true, debounce: 200 })
</script>
