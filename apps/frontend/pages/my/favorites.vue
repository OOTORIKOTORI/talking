<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold mb-2">お気に入り</h1>
      <NuxtLink to="/assets" class="text-sm text-blue-600 hover:underline">公開ギャラリーへ</NuxtLink>
    </div>

    <!-- tabs: keep outside of any <form> to avoid submit -->
    <div class="mb-4 flex gap-2 text-sm">
      <NuxtLink to="/my/favorites" class="px-3 py-1 rounded border bg-blue-50 border-blue-300">アセット</NuxtLink>
      <NuxtLink to="/my/favorites/characters" class="px-3 py-1 rounded border bg-white">キャラクター</NuxtLink>
    </div>

    <!-- Filter bar -->
    <div class="rounded-xl border border-slate-200 bg-white p-4 mb-6 space-y-3">
      <input v-model="q" type="text" placeholder="タイトル・説明・タグで検索" class="w-full rounded-lg border px-3 py-2" />
      <div class="flex flex-wrap gap-3">
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500">コンテンツ</span>
          <select v-model="type" class="rounded-md border px-2 py-1">
            <option value="all">すべて</option>
            <option value="image">画像</option>
            <option value="audio">音声</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500">プライマリ</span>
          <select v-model="primary" class="rounded-md border px-2 py-1">
            <option :value="null">指定なし</option>
            <option>背景</option>
            <option>一枚絵</option>
            <option>その他</option>
            <option>BGM</option>
            <option>効果音</option>
            <option>ボイス</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500">タグ</span>
          <input v-model="tagQuery" placeholder="例: 森, 夜, 戦闘" class="rounded-md border px-2 py-1 min-w-[220px]" />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500">並び替え</span>
          <select v-model="sortKey" class="rounded-md border px-2 py-1">
            <option value="new">新しい順</option>
            <option value="old">古い順</option>
            <option value="title">タイトル</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-gray-500">読み込み中…</div>
    <div v-else-if="!viewItems.length" class="text-gray-500">該当するお気に入りがありません。</div>

    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <AssetCard
        v-for="a in viewItems"
        :key="a.id"
        :asset="a"
        :showFavorite="true"
        :onToggleFavorite="toggle"
      />
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFavoriteToggle } from '@/composables/useFavoriteToggle'

const assets = ref<any[]>([])
const loading = ref(true)
const { $api } = useNuxtApp()

// API返却の形の揺れに耐えるユーティリティ
function coerceAssetList(res: any): any[] {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.items)) return res.items
  if (Array.isArray(res?.data)) return res.data
  return []
}

async function fetchFavorites() {
  loading.value = true
  try {
    const res: any = await $api('/favorites')
    assets.value = coerceAssetList(res)
  } catch (e) {
    console.error('[favorites] load failed', e)
    assets.value = []
  } finally {
    loading.value = false
  }
}

// お気に入り切り替え（このページでは解除で一覧から即時に消す）
const toggling = new Set<string>()
async function toggle(asset: any) {
  if (toggling.has(asset.id)) return
  toggling.add(asset.id)
  try {
    // この画面では常に「解除」想定。APIが二値トグルなら POST/DELETE を条件で切り替えてOK
    await $api(`/assets/${asset.id}/favorite`, { method: 'DELETE' })
    assets.value = assets.value.filter(a => a.id !== asset.id)
  } catch (e) {
    console.error('[favorites] toggle failed', e)
  } finally {
    toggling.delete(asset.id)
  }
}
onMounted(fetchFavorites)

// ------- filters -------
const q = ref('')                      // キーワード（タイトル/説明/タグに対して簡易マッチ）
const type = ref<'all'|'image'|'audio'>('all')
const primary = ref<string|null>(null) // '背景','一枚絵','その他','BGM','効果音','ボイス','その他'
const tagQuery = ref('')               // カンマ区切り
const sortKey = ref<'new'|'old'|'title'>('new')

const tagTokens = computed(() =>
  tagQuery.value.split(',').map(s => s.trim()).filter(Boolean)
)

// プライマリラベル ↔ primaryTag の対応（AssetCardと同じ語彙）
const primaryMap: Record<string,string> = {
  '背景': 'IMAGE_BG',
  '一枚絵': 'IMAGE_CG',
  'その他': 'IMAGE_OTHER',
  'BGM': 'AUDIO_BGM',
  '効果音': 'AUDIO_SE',
  'ボイス': 'AUDIO_VOICE',
}

const filtered = computed(() => {
  const text = q.value.toLowerCase()
  const pTag = primary.value ? primaryMap[primary.value] ?? primary.value : null
  return assets.value.filter((a:any) => {
    // type
    if (type.value === 'image' && !a.contentType?.startsWith('image/')) return false
    if (type.value === 'audio' && !a.contentType?.startsWith('audio/')) return false
    // primary
    if (pTag && a.primaryTag !== pTag) return false
    // tag tokens (すべて含む)
    if (tagTokens.value.length) {
      const tags:string[] = a.tags || []
      const ok = tagTokens.value.every(t => tags.some(x => String(x).toLowerCase().includes(t.toLowerCase())))
      if (!ok) return false
    }
    // keyword
    if (text) {
      const hay = `${a.title||''} ${a.description||''} ${(a.tags||[]).join(' ')}`.toLowerCase()
      if (!hay.includes(text)) return false
    }
    return true
  })
})

const viewItems = computed(() => {
  const arr = [...filtered.value]
  switch (sortKey.value) {
    case 'old':   return arr.sort((a,b)=> new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    case 'title': return arr.sort((a,b)=> String(a.title||'').localeCompare(String(b.title||'')))
    default:      return arr.sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
})
</script>

