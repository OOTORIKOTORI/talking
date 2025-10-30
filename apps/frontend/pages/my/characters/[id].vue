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
        <div v-for="img in images" :key="img.id" class="rounded overflow-hidden ring-1 ring-black/5 bg-white">
          <div class="aspect-[3/4]">
            <CharacterImageThumb :keyOrThumb="img.thumbKey || img.key" :alt="name" />
          </div>
          <div class="p-3 space-y-2 text-sm">
            <div class="flex gap-2">
              <select v-model="img.emotion" class="border rounded px-2 py-1">
                <option v-for="e in emotions" :key="e" :value="e">{{ e }}</option>
              </select>
              <input v-model="img.emotionLabel" class="border rounded px-2 py-1" placeholder="表示ラベル(例: 楽しい)" />
            </div>
            <input v-model="img.pattern" class="border rounded px-2 py-1 w-full" placeholder="パターン(服装/ポーズ等)" />
            <div class="flex items-center justify-between">
              <input type="number" v-model.number="img.sortOrder" class="w-20 border rounded px-2 py-1" />
              <div class="flex gap-2">
                <button class="px-2 py-1 border rounded" @click="saveImage(img)">保存</button>
                <button class="px-2 py-1 border rounded text-red-600" @click="removeImage(img)">削除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import type { Character, CharacterImage } from '@talking/types'
import { useCharactersApi } from '@/composables/useCharacters'
const route = useRoute(); const router = useRouter(); const { $api } = useNuxtApp()
const api = useCharactersApi()
const id = String(route.params.id)

const data = ref<Character | null>(null)
const name = ref(''); const displayName = ref(''); const description = ref(''); const isPublic = ref(true)
const images = ref<CharacterImage[]>([])

const emotions = ['NEUTRAL','HAPPY','SAD','ANGRY','SURPRISED','FEAR','DISGUST','SHY','SLEEPY','THINKING','OTHER']

onMounted(async () => {
  data.value = await api.getMine(id)
  name.value = data.value.name; displayName.value = data.value.displayName; description.value = data.value.description || ''; isPublic.value = !!data.value.isPublic
  images.value = (data.value.images || []).map(i => ({ ...i }))
})

const save = async () => {
  await api.update(id, { name: name.value, displayName: displayName.value, description: description.value, isPublic: isPublic.value })
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
