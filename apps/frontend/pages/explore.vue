<template>
  <div class="mx-auto max-w-7xl p-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Explore</h1>
      <NuxtLink to="/" class="text-blue-600 hover:text-blue-700">ホーム</NuxtLink>
    </div>

    <div class="mb-4 text-sm text-gray-600">最新のアセットとキャラクターを一緒に表示します</div>

    <div v-if="loading" class="py-10 text-center text-gray-500">読み込み中…</div>
    <div v-else-if="error" class="py-4 px-5 bg-red-50 border border-red-200 text-red-800 rounded">{{ error }}</div>
    <div v-else>
      <div v-if="items.length === 0" class="text-gray-500">まだ項目がありません。</div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="it in items" :key="it.key" class="relative">
          <span class="pointer-events-none absolute left-2 top-2 z-10 inline-block rounded bg-gray-900/80 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">
            {{ it.kind === 'ASSET' ? 'ASSET' : 'CHAR' }}
          </span>
          <component
            :is="it.kind === 'ASSET' ? 'AssetCard' : 'CharacterCard'"
            v-bind="it.kind === 'ASSET' ? { asset: it.asset, showFavorite: true, onToggleFavorite: toggle } : { character: it.character }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Asset, Character } from '@talking/types'

type MixedItem =
  | { kind: 'ASSET'; key: string; createdAt: number; asset: Asset }
  | { kind: 'CHAR'; key: string; createdAt: number; character: Character }

const { searchAssets } = useAssets()
const { listPublic } = useCharactersApi()
const { toggle } = useFavoriteToggle()

const items = ref<MixedItem[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    loading.value = true
    error.value = ''
    const [assetsRes, charsRes] = await Promise.all([
      searchAssets({ limit: 24, offset: 0, sort: 'createdAt:desc' }),
      listPublic(undefined, 24, 0, { sort: 'new' }),
    ])

    const aItems: MixedItem[] = (assetsRes.items || []).map(a => ({
      kind: 'ASSET',
      key: `a:${a.id}`,
      createdAt: new Date(a.createdAt as any).getTime(),
      asset: a,
    }))
    const cItems: MixedItem[] = (Array.isArray(charsRes) ? charsRes : []).map(c => ({
      kind: 'CHAR',
      key: `c:${c.id}`,
      createdAt: new Date(c.createdAt as any).getTime(),
      character: c,
    }))

    items.value = [...aItems, ...cItems].sort((x, y) => y.createdAt - x.createdAt)
  } catch (e: any) {
    error.value = e?.message || '取得に失敗しました'
  } finally {
    loading.value = false
  }
})

useHead({ title: 'Explore - Talking' })
</script>
