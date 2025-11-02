<template>
  <div class="mx-auto max-w-6xl p-6">
    <SectionTabs :items="[{ label: 'アセット', to: '/assets', activePath: '/assets' }, { label: 'キャラクター', to: '/characters', activePath: '/characters' }]" />
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold mb-2">キャラクター</h1>
    </div>
    <div class="mb-4 flex gap-2 text-sm">
      <NuxtLink to="/assets" class="px-3 py-1 rounded border bg-white">アセット</NuxtLink>
      <NuxtLink to="/characters" class="px-3 py-1 rounded border bg-blue-50 border-blue-300">キャラクター</NuxtLink>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <NuxtLink v-for="c in list" :key="c.id" :to="`/characters/${c.id}`" class="block rounded shadow bg-white overflow-hidden">
        <div class="aspect-[3/4]"><CharacterImageThumb :keyOrThumb="c.images?.[0]?.thumbKey || c.images?.[0]?.key || null" :alt="c.name" /></div>
        <div class="p-3 font-medium line-clamp-1">{{ c.name }}</div>
      </NuxtLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import SectionTabs from '@/components/common/SectionTabs.vue';
import { useCharactersApi } from '@/composables/useCharacters'
const api = useCharactersApi()
const route = useRoute()
const router = useRouter()

const q = ref<string>('')
const tagsCsv = ref<string>('')
const sort = ref<'new'|'old'|'name'>('new')
const list = ref<any[]>([])

// 初期値: URLクエリから採用
onMounted(() => {
  if (typeof route.query.q === 'string') q.value = route.query.q
  if (typeof route.query.tags === 'string') tagsCsv.value = route.query.tags
  if (route.query.sort === 'old' || route.query.sort === 'name' || route.query.sort === 'new') sort.value = route.query.sort
})

// クエリ同期: 変更時にURL更新（デフォルト値は省略）
watch([q, tagsCsv, sort], () => {
  const query: Record<string, string | undefined> = {
    q: q.value || undefined,
    tags: (tagsCsv.value || '').trim() || undefined,
    sort: sort.value !== 'new' ? sort.value : undefined,
  }
  router.replace({ query })
})

// 正規化: CSV -> ユニーク配列（最大20件）
function toTags(csv: string): string[] {
  const items = (csv || '')
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0)
  const seen = new Set<string>()
  const uniq: string[] = []
  for (const t of items) {
    const key = t.toLowerCase()
    if (!seen.has(key)) { seen.add(key); uniq.push(t) }
    if (uniq.length >= 20) break
  }
  return uniq
}

// データ取得 + 並び替え（API未対応時のフォールバック）
watchEffect(async () => {
  const tagsArr = toTags(tagsCsv.value)
  const extra: Record<string, any> = {}
  if (tagsArr.length) extra.tags = tagsArr.join(',')
  if (sort.value) extra.sort = sort.value

  const data = await api.listPublic(q.value || undefined, 30, 0, extra)

  // クライアント側で暫定並び替え
  const byName = (a:any,b:any) => String(a.name||'').localeCompare(String(b.name||''))
  const byNew = (a:any,b:any) => new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime()
  const byOld = (a:any,b:any) => new Date(a.createdAt||0).getTime() - new Date(b.createdAt||0).getTime()
  const arr = Array.isArray(data) ? [...data] : []
  list.value = sort.value === 'name' ? arr.sort(byName)
    : sort.value === 'old' ? arr.sort(byOld)
    : arr.sort(byNew)
})
</script>
