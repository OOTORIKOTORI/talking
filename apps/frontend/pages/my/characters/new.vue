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
      <input v-model="tagsCsv" class="w-full border rounded px-3 py-2 mb-4" placeholder="例: 学園, 制服, 青髪" />
      <div class="mt-2 flex flex-wrap gap-1 text-xs mb-4">
        <span v-for="t in (tagsCsv.split(',').map(s=>s.trim()).filter(Boolean).slice(0,20))" :key="t" class="px-2 py-0.5 rounded-full bg-slate-100 ring-1 ring-slate-200 text-slate-700">{{ t }}</span>
      </div>
      <label class="inline-flex items-center gap-2 text-sm mb-4"><input type="checkbox" v-model="isPublic" /> 公開する</label>
      <div class="mb-4">
        <label class="inline-flex items-center gap-2 text-sm"><input type="checkbox" v-model="creditRequired" /> クレジット表記を必須にする</label>
      </div>
      <div class="mb-4">
        <label class="block mb-1 text-sm">利用条件（任意）</label>
        <textarea v-model="usageTerms" class="w-full border rounded px-3 py-2" rows="3" maxlength="1000" placeholder="例: 改変OK。ゲーム内クレジット表記をお願いします。"></textarea>
        <p class="mt-1 text-xs text-gray-500">{{ usageTerms.length }}/1000文字</p>
      </div>
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
const creditRequired = ref(true)
const usageTerms = ref('')
const toTags = (csv: string) => Array.from(new Set(csv.split(',').map(s => s.trim()).filter(Boolean))).slice(0, 20)
const submit = async () => {
  const tags = toTags(tagsCsv.value)
  const c = await api.create({
    name: name.value,
    displayName: displayName.value,
    description: description.value,
    isPublic: isPublic.value,
    tags,
    creditRequired: creditRequired.value,
    usageTerms: usageTerms.value.trim() || undefined,
  })
  router.push(`/my/characters/${c.id}`)
}
</script>
