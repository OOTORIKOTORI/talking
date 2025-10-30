<template>
  <div class="mx-auto max-w-xl p-6">
    <h1 class="text-2xl font-semibold mb-4">新規キャラクター</h1>
    <form @submit.prevent="submit">
      <label class="block mb-2 text-sm">キャラクター名</label>
      <input v-model="name" class="w-full border rounded px-3 py-2 mb-4" required />
      <label class="block mb-2 text-sm">デフォルト表示名</label>
      <input v-model="displayName" class="w-full border rounded px-3 py-2 mb-4" required />
      <label class="block mb-2 text-sm">説明</label>
      <textarea v-model="description" class="w-full border rounded px-3 py-2 mb-4" rows="5" />
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
const api = useCharactersApi()
const router = useRouter()
const name = ref(''); const displayName = ref(''); const description = ref(''); const isPublic = ref(true)
const submit = async () => {
  const c = await api.create({ name: name.value, displayName: displayName.value, description: description.value, isPublic: isPublic.value })
  router.push(`/my/characters/${c.id}`)
}
</script>
