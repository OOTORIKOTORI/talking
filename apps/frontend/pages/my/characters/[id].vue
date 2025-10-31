<template>
  <div class="mx-auto max-w-6xl p-6 space-y-8">
    <div>
      <NuxtLink to="/my/characters" class="text-blue-600 text-sm hover:underline">← 一覧へ</NuxtLink>
      <h1 class="text-2xl font-semibold mt-2">編集: {{ name }}</h1>
    </div>

    <!-- 基本情報 -->
    <section class="bg-white rounded-xl p-4 ring-1 ring-black/5">
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm mb-1">キャラクター名</label>
          <input v-model="name" class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm mb-1">デフォルト表示名</label>
          <input v-model="displayName" class="w-full border rounded px-3 py-2" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm mb-1">説明</label>
          <textarea v-model="description" rows="4" class="w-full border rounded px-3 py-2" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm mb-1">タグ（カンマ区切り）</label>
          <input v-model="tagsCsv" class="w-full border rounded px-3 py-2" placeholder="例: 学園, 制服, 青髪" />
          <div class="mt-2 flex flex-wrap gap-1 text-xs">
            <span v-for="t in (tagsCsv.split(',').map(s=>s.trim()).filter(Boolean).slice(0,20))" :key="t" class="px-2 py-0.5 rounded-full bg-slate-100 ring-1 ring-slate-200 text-slate-700">{{ t }}</span>
          </div>
        </div>
        <label class="inline-flex items-center gap-2 text-sm"><input type="checkbox" v-model="isPublic" /> 公開する</label>
      </div>
      <div class="mt-4"><button class="px-4 py-2 bg-blue-600 text-white rounded" @click="save">保存</button></div>
    </section>

    <!-- 画像管理 -->
    <section class="bg-white rounded-xl p-4 ring-1 ring-black/5">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-semibold">立ち絵画像</h2>
        <button class="px-3 py-2 bg-blue-600 text-white rounded" @click="pickAndUpload">画像を追加</button>
      </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div v-for="(img, i) in images" :key="img.id"
          class="rounded overflow-hidden ring-1 ring-black/5 bg-white"
          draggable="true"
          @dragstart="onDragStart(i)"
          @dragover.prevent
          @drop="onDrop(i)">
          <div class="aspect-[3/4] cursor-zoom-in" @click="openPreview(img)">
            <CharacterImageThumb :keyOrThumb="img.thumbKey || img.key" :alt="name" />
          </div>
          <div class="p-3 space-y-2 text-sm">
            <div class="flex gap-2">
              <select v-model="img.emotion" class="border rounded px-2 py-1" @click.stop>
                <option v-for="e in emotions" :key="e.value" :value="e.value">{{ e.label }}</option>
              </select>
              <input v-model="img.emotionLabel" class="border rounded px-2 py-1" placeholder="表示ラベル(例: 楽しい)" @click.stop />
            </div>
            <input v-model="img.pattern" class="border rounded px-2 py-1 w-full" placeholder="パターン(服装/ポーズ等)" @click.stop />
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <input type="number" v-model.number="img.sortOrder" class="w-24 border rounded px-2 py-1" @click.stop />
                <span class="text-xs text-slate-500">（小さいほど上に表示）</span>
              </div>
              <div class="flex gap-2">
                <button class="px-2 py-1 border rounded" @click.stop="saveImage(img)">保存</button>
                <button class="px-2 py-1 border rounded text-red-600" @click.stop="removeImage(img)">削除</button>
              </div>
            </div>
          </div>
        </div>
        <ImageLightbox :open="previewOpen" :src="previewSrc" :alt="name || ''" @close="previewOpen=false" />
      </div>
    </section>
    <Transition name="toast">
      <div v-if="toastMessage" class="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>
<script setup lang="ts">
// Toast
const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null
const showToast = (msg: string) => {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMessage.value = '' }, 1800)
}
// ドラッグ＆ドロップ用
const dragFrom = ref<number|null>(null)
const onDragStart = (i: number) => { dragFrom.value = i }
const onDrop = async (to: number) => {
  const from = dragFrom.value
  dragFrom.value = null
  if (from === null || from === to) return
  // 並べ替え（ローカル）
  const arr = [...images.value]
  const moved = arr.splice(from, 1)[0]
  arr.splice(to, 0, moved)
  images.value = arr

  // sortOrder を 0..N-1 で再採番して保存
  for (let idx = 0; idx < images.value.length; idx++) {
    const im = images.value[idx]
    if (im.sortOrder !== idx) {
      im.sortOrder = idx
      await api.updateImage(id, im.id, { sortOrder: idx })
    }
  }
  showToast('並び順を保存しました')
}
import type { Character, CharacterImage } from '@talking/types'
import { useCharactersApi } from '@/composables/useCharacters'
import { EMOTION_JP_LABEL, emotionOptions } from '@/utils/characterLocales'
import ImageLightbox from '@/components/common/ImageLightbox.vue'
import { useSignedUrl } from '@/composables/useSignedUrl'
const route = useRoute(); const router = useRouter(); const { $api } = useNuxtApp()
const api = useCharactersApi()
const id = String(route.params.id)

const data = ref<Character | null>(null)
const name = ref(''); const displayName = ref(''); const description = ref(''); const isPublic = ref(true)
const images = ref<CharacterImage[]>([])
const tagsCsv = ref('')

const emotions = emotionOptions(true)

const previewOpen = ref(false)
const previewSrc = ref<string | null>(null)
const { url: fullUrl, setKey: setFullKey, refresh: refreshFull } = useSignedUrl(null)
watch(fullUrl, v => { if (v) previewSrc.value = v })
const openPreview = async (img: any) => {
  setFullKey(img.key); await refreshFull(); previewOpen.value = true
}

onMounted(async () => {
  data.value = await api.getMine(id)
  name.value = data.value.name; displayName.value = data.value.displayName; description.value = data.value.description || ''; isPublic.value = !!data.value.isPublic
  images.value = (data.value.images || []).map(i => ({ ...i }))
  tagsCsv.value = (data.value.tags || []).join(', ')
})

const save = async () => {
  const toTags = (csv: string) => Array.from(new Set(csv.split(',').map(s => s.trim()).filter(Boolean))).slice(0, 20)
  await api.update(id, { name: name.value, displayName: displayName.value, description: description.value, isPublic: isPublic.value, tags: toTags(tagsCsv.value) })
  data.value = await api.getMine(id)
  showToast('保存しました')
}

const saveImage = async (img: CharacterImage) => {
  await api.updateImage(id, img.id, { emotion: img.emotion, emotionLabel: img.emotionLabel, pattern: img.pattern, sortOrder: img.sortOrder })
  showToast('保存しました')
}

const removeImage = async (img: CharacterImage) => {
  if (!confirm('削除しますか？')) return
  await api.removeImage(id, img.id)
  images.value = images.value.filter(i => i.id !== img.id)
  showToast('削除しました')
}

// 画像追加：署名URL→PUT→メタ登録
const pickAndUpload = async () => {
  const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'
  input.onchange = async () => {
    const file = input.files?.[0]; if (!file) return
    // 1) PUT用署名URLの取得
    const res: any = await $api('/uploads/signed-url', { method: 'POST', body: { filename: file.name, contentType: file.type } })
    const { url, fields, key } = res
    // 2) PUT（S3直PUT or FormData）
    if (url && !fields) {
      await fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
    } else {
      const fd = new FormData()
      Object.entries(fields || {}).forEach(([k,v]) => fd.append(k, String(v)))
      fd.append('file', file)
      await fetch(url, { method: 'POST', body: fd })
    }
    // 3) メタ登録
    const created = await api.addImage(id, { key, contentType: file.type, width: undefined, height: undefined, size: file.size })
    // 現在の最大 sortOrder を算出（未設定は 0 とみなす）
    const maxOrder = Math.max(0, ...images.value.map(i => Number.isFinite(i.sortOrder) ? i.sortOrder! : 0))
    const nextOrder = maxOrder + 1
    // サーバにも反映（次回取得でも末尾になるように）
    await api.updateImage(id, (created as any).id, { sortOrder: nextOrder })
    // ローカルにも反映して**最後尾**に push
  images.value.push({ ...(created as any), sortOrder: nextOrder } as any)
  showToast('画像を追加しました')
  }
  input.click()
}

defineExpose({
  name,
  displayName,
  description,
  isPublic,
  tagsCsv,
  save,
  pickAndUpload,
  images,
  emotions,
  openPreview,
  saveImage,
  removeImage,
  previewOpen,
  previewSrc
})
</script>
<style scoped>
.toast-enter-active,.toast-leave-active{ transition: opacity .2s, transform .2s }
.toast-enter-from,.toast-leave-to{ opacity:0; transform: translateY(6px) }
/* ドラッグ可能カードの装飾 */
[draggable="true"] { cursor: grab; transition: box-shadow .2s; }
[draggable="true"]:active, [draggable="true"].dragging {
  box-shadow: 0 0 0 2px #3b82f6;
}
</style>
