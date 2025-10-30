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
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="img in images" :key="img.id" class="rounded overflow-hidden ring-1 ring-black/5 bg-white cursor-zoom-in" @click="openPreview(img)">
          <div class="aspect-[3/4]">
            <CharacterImageThumb :keyOrThumb="img.thumbKey || img.key" :alt="name" />
          </div>
          <div class="p-3 space-y-2 text-sm">
            <div class="flex gap-2">
              <select v-model="img.emotion" class="border rounded px-2 py-1">
                <option v-for="e in emotions" :key="e.value" :value="e.value">{{ e.label }}</option>
              </select>
              <input v-model="img.emotionLabel" class="border rounded px-2 py-1" placeholder="表示ラベル(例: 楽しい)" />
            </div>
            <input v-model="img.pattern" class="border rounded px-2 py-1 w-full" placeholder="パターン(服装/ポーズ等)" />
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <input type="number" v-model.number="img.sortOrder" class="w-24 border rounded px-2 py-1" />
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
  </div>
</template>
<script setup lang="ts">
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
}

const saveImage = async (img: CharacterImage) => {
  await api.updateImage(id, img.id, { emotion: img.emotion, emotionLabel: img.emotionLabel, pattern: img.pattern, sortOrder: img.sortOrder })
}

const removeImage = async (img: CharacterImage) => {
  if (!confirm('削除しますか？')) return
  await api.removeImage(id, img.id)
  images.value = images.value.filter(i => i.id !== img.id)
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
    images.value.unshift(created as any)
  }
  input.click()
}
</script>
