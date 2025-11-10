<template>
  <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
    <div class="flex min-h-screen items-center justify-center p-4 md:p-6">
      <div class="w-[min(1200px,96vw)] max-h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <!-- ヘッダー（固定） -->
        <div class="flex items-center justify-between p-5 border-b">
          <h3 class="font-semibold">シナリオ全体設定（メッセージウィンドウ）</h3>
          <button class="text-gray-500 hover:text-gray-700" @click="$emit('close')">✕</button>
        </div>

        <!-- スクロール可能なコンテンツ領域 -->
        <div class="overflow-y-auto flex-1">
          <!-- live preview -->
          <div class="p-5">
            <div class="relative aspect-[16/9] bg-neutral-900 rounded-lg overflow-hidden">
              <img :src="bg" class="absolute inset-0 w-full h-full object-cover opacity-60" alt="preview bg" />
              <div class="absolute inset-x-4 bottom-4 md:inset-x-8 md:bottom-6"
                   :style="{ '--stage-scale': scaleFactor }">
                <MessageWindow :speaker="speaker" :text="sample" :theme="draft" :animate="true" />
              </div>
            </div>
          </div>

          <!-- form -->
          <div class="px-5 pb-5">
            <div class="grid gap-4 md:grid-cols-2 text-sm">
              <label>サイズプリセット
                <select v-model="draft.scale" class="w-full border rounded px-2 py-1 mt-1">
                  <option value="sm">小</option>
                  <option value="md">中（標準）</option>
                  <option value="lg">大</option>
                </select>
              </label>
              <div class="md:col-span-2 text-xs text-gray-500">
                ※ 詳細(px)は最大値として動作します。画面サイズに応じて自動的に縮小・拡大します。
              </div>

              <!-- ここから詳細(px)群 -->
              <label>背景（rgba）<input v-model="draft.frame.bg" class="w-full border rounded px-2 py-1 mt-1" /></label>
              <label>枠線色（rgba）<input v-model="draft.frame.borderColor" class="w-full border rounded px-2 py-1 mt-1" /></label>
              <label>枠線px<input type="number" v-model.number="draft.frame.borderWidth" class="w-full border rounded px-2 py-1 mt-1" /></label>
              <label>角丸px<input type="number" v-model.number="draft.frame.radius" class="w-full border rounded px-2 py-1 mt-1" /></label>
              <label>内側余白px<input type="number" v-model.number="draft.frame.padding" class="w-full border rounded px-2 py-1 mt-1" /></label>
              <label class="flex items-center">名前の表示<input type="checkbox" v-model="draft.name.show" class="ml-2" /></label>
              <label>名前背景（rgba）<input v-model="draft.name.bg" class="w-full border rounded px-2 py-1 mt-1" /></label>
              <label>文字色<input v-model="draft.text.color" class="w-full border rounded px-2 py-1 mt-1" /></label>
              <label>文字サイズpx<input type="number" v-model.number="draft.text.size" class="w-full border rounded px-2 py-1 mt-1" /></label>
              <label>行間<input type="number" step="0.1" v-model.number="draft.text.lineHeight" class="w-full border rounded px-2 py-1 mt-1" /></label>
              <label>タイプ速度ms/字<input type="number" v-model.number="draft.typewriter.msPerChar" class="w-full border rounded px-2 py-1 mt-1" /></label>
            </div>
          </div>
        </div>

        <!-- フッター（固定） -->
        <div class="flex gap-2 p-5 border-t justify-end bg-gray-50">
          <button class="px-3 py-2 bg-gray-100 border rounded hover:bg-gray-200" @click="reset">リセット</button>
          <button class="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" @click="save">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MessageWindow from '@/components/game/MessageWindow.vue'

const props = defineProps<{ gameId:string, initial?:any }>()
const emit = defineEmits<{ (e:'close'):void, (e:'saved', v:any):void }>()

const defaultTheme = {
  frame: { bg: 'rgba(20,24,36,0.72)', borderColor: 'rgba(255,255,255,0.2)', borderWidth: 2, radius: 16, padding: 16, shadow: true },
  name:  { show: true, bg: 'rgba(0,0,0,0.55)', color: '#fff', padding: 8, radius: 10 },
  text:  { color: '#fff', size: 16, lineHeight: 1.8 },
  typewriter: { msPerChar: 25 },
  scale: 'md'
}
const draft = ref<any>(props.initial ? structuredClone(props.initial) : structuredClone(defaultTheme))

const scaleFactor = computed(() => {
  const s = (draft.value?.scale ?? 'md') as 'sm'|'md'|'lg'
  return s === 'sm' ? 0.9 : s === 'lg' ? 1.15 : 1
})

const speaker = ref('ガイドさん')
const sample  = ref('ここにサンプル本文が1文字ずつ表示されます。テーマの変更は即時プレビュー。')
const bg = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&auto=format&fit=crop&q=60'

function reset(){ draft.value = props.initial ? structuredClone(props.initial) : structuredClone(defaultTheme) }
async function save(){
  const v = draft.value
  await $fetch(`/games/${props.gameId}`, { method:'PATCH', body: { messageTheme: v } })
  emit('saved', structuredClone(v))
  emit('close')
}
</script>
