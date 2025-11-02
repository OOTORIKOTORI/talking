<template>
  <div class="mx-auto max-w-xl p-6">
    <h1 class="text-2xl font-semibold mb-2">新規キャラクター</h1>
    <UploadTabs active="character" />
    <form @submit.prevent="submit">
      <label class="block mb-2 text-sm">キャラクター名</label>
      <input v-model="name" class="w-full border rounded px-3 py-2 mb-4" required />
      <label class="block mb-2 text-sm">デフォルト表示名</label>
      <input v-model="displayName" class="w-full border rounded px-3 py-2 mb-4" required />
      <label class="block mb-2 text-sm">説明</label>
      <textarea v-model="description" class="w-full border rounded px-3 py-2 mb-4" rows="5" />
      <label class="block mb-2 text-sm">タグ（カンマ区切り）</label>
      <input v-model="tagsCsv" class="w-full border rounded px-3 py-2 mb-6" placeholder="例: 学園, 制服, 青髪" />
      <div class="mt-2 flex flex-wrap gap-1 text-xs">
        <span v-for="t in (tagsCsv.split(',').map(s=>s.trim()).filter(Boolean).slice(0,20))" :key="t" class="px-2 py-0.5 rounded-full bg-slate-100 ring-1 ring-slate-200 text-slate-700">{{ t }}</span>
      </div>
      <label class="inline-flex items-center gap-2 text-sm mb-6"><input type="checkbox" v-model="isPublic" /> 公開する</label>
      <div class="flex gap-3">
        <button class="px-4 py-2 bg-blue-600 text-white rounded">作成</button>
        <NuxtLink to="/my/characters" class="px-4 py-2 border rounded">キャンセル</NuxtLink>
      </div>
    </form>
  </div>
</template>
<script setup lang="ts">
import { useCharactersApi } from '@/composables/useCharacters'
import UploadTabs from '@/components/common/UploadTabs.vue'
const api = useCharactersApi()
const router = useRouter()
const name = ref(''); const displayName = ref(''); const description = ref(''); const isPublic = ref(true)
const tagsCsv = ref('')
const toTags = (csv: string) => Array.from(new Set(csv.split(',').map(s => s.trim()).filter(Boolean))).slice(0, 20)
const submit = async () => {
  const c = await api.create({ name: name.value, displayName: displayName.value, description: description.value, isPublic: isPublic.value })
  const tags = toTags(tagsCsv.value)
  if (tags.length) {
    await api.update(c.id, { tags })
  }
  router.push(`/my/characters/${c.id}`)
}
</script>
