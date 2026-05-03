<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">ゲームプロジェクト</h1>

    <form class="mb-6 flex gap-2" @submit.prevent="onCreate">
      <input
        v-model="title"
        placeholder="新規タイトル"
        class="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <button
        type="submit"
        class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        作成
      </button>
    </form>

    <section class="mb-6 border border-gray-200 rounded-lg p-4 bg-white">
      <div class="flex flex-col lg:flex-row gap-3 lg:items-end">
        <form class="flex-1" @submit.prevent="applySearch">
          <label for="my-games-search" class="block text-sm font-medium text-gray-700 mb-1">
            キーワード検索
          </label>
          <div class="flex gap-2">
            <input
              id="my-games-search"
              v-model="searchInput"
              type="search"
              placeholder="タイトル・概要で検索"
              autocomplete="off"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              class="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
              :disabled="loading"
            >
              検索
            </button>
          </div>
        </form>

        <div class="w-full lg:w-52">
          <label for="my-games-status" class="block text-sm font-medium text-gray-700 mb-1">公開状態</label>
          <select
            id="my-games-status"
            v-model="status"
            class="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="applyStatus"
          >
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div class="w-full lg:w-56">
          <label for="my-games-sort" class="block text-sm font-medium text-gray-700 mb-1">並び替え</label>
          <select
            id="my-games-sort"
            v-model="sort"
            class="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="applySort"
          >
            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
        <p v-if="appliedQuery">検索: 「{{ appliedQuery }}」 / {{ list.length }}件</p>
        <p v-else>自作ゲーム {{ list.length }}件</p>
        <p>公開状態: {{ currentStatusLabel }}</p>
        <p>並び順: {{ currentSortLabel }}</p>
        <p v-if="loading">読み込み中...</p>
      </div>
    </section>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">読み込み中...</p>
    </div>

    <ul v-else-if="list.length > 0" class="space-y-3">
      <li
        v-for="g in list"
        :key="g.id"
        class="p-4 border border-gray-200 rounded-lg flex justify-between items-center hover:shadow-md transition-shadow"
      >
        <div class="flex-1">
          <NuxtLink
            :to="`/my/games/${g.id}/edit`"
            class="font-semibold text-lg text-blue-600 hover:text-blue-800"
          >
            {{ g.title }}
          </NuxtLink>
          <p v-if="g.summary" class="text-sm text-gray-600 mt-1">{{ g.summary }}</p>
          <p class="text-xs text-gray-400 mt-1">
            更新: {{ new Date(g.updatedAt).toLocaleDateString('ja-JP') }}
          </p>
          <div class="mt-2">
            <button
              type="button"
              class="inline-flex items-center px-3 py-1 text-xs rounded-full border transition-colors"
              :class="g.isPublic ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'"
              :disabled="isToggling(g.id)"
              @click="togglePublic(g)"
            >
              <span v-if="isToggling(g.id)">切替中...</span>
              <span v-else>{{ g.isPublic ? '公開中（クリックで非公開）' : '非公開（クリックで公開）' }}</span>
            </button>
          </div>
        </div>
        <div class="flex flex-col items-end gap-2">
          <div class="flex gap-2">
            <NuxtLink
              :to="`/my/games/${g.id}/edit`"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
            >
              編集
            </NuxtLink>
            <NuxtLink
              :to="`/games/${g.id}/play`"
              class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
            >
              再生
            </NuxtLink>
          </div>
          <button
            type="button"
            class="px-4 py-2 text-sm rounded border border-blue-200 text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="isDuplicating(g.id)"
            @click="onDuplicate(g)"
          >
            <span v-if="isDuplicating(g.id)">複製中...</span>
            <span v-else>ゲームを複製</span>
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm rounded border border-red-300 text-red-700 bg-white hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="isDeleting(g.id)"
            @click="onDelete(g)"
          >
            <span v-if="isDeleting(g.id)">削除中...</span>
            <span v-else>ゲームを削除</span>
          </button>
        </div>
      </li>
    </ul>

    <div v-else class="text-center py-12">
      <template v-if="hasAppliedFilter">
        <p class="text-gray-500">条件に一致する自作ゲームはありません。</p>
        <p class="text-sm text-gray-400 mt-2">検索語・並び替え・公開状態を見直してください。</p>
      </template>
      <template v-else>
        <p class="text-gray-500">まだゲームプロジェクトがありません。</p>
        <p class="text-sm text-gray-400 mt-2">上のフォームから新規作成できます。</p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { runScenarioCheck } from '@/utils/scenarioCheck'

type MyGame = {
  id: string
  title: string
  summary: string | null
  isPublic: boolean
  updatedAt: string
}

type MyGamesSort = 'updated' | 'created' | 'title' | 'public'
type MyGamesStatus = 'all' | 'public' | 'private'

definePageMeta({
  middleware: 'require-auth'
})

const route = useRoute()
const router = useRouter()
const api = useGamesApi()
const toast = useToast()
const list = ref<MyGame[]>([])
const title = ref('')
const loading = ref(true)
const togglingIds = ref<Record<string, boolean>>({})
const deletingIds = ref<Record<string, boolean>>({})
const duplicatingIds = ref<Record<string, boolean>>({})
const searchInput = ref('')
const appliedQuery = ref('')
const sort = ref<MyGamesSort>('updated')
const status = ref<MyGamesStatus>('all')

const sortOptions: Array<{ value: MyGamesSort; label: string }> = [
  { value: 'updated', label: '更新順' },
  { value: 'created', label: '作成順' },
  { value: 'title', label: 'タイトル順' },
  { value: 'public', label: '公開状態順' },
]

const statusOptions: Array<{ value: MyGamesStatus; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'public', label: '公開中' },
  { value: 'private', label: '非公開' },
]

const currentSortLabel = computed(
  () => sortOptions.find((opt) => opt.value === sort.value)?.label ?? '更新順'
)
const currentStatusLabel = computed(
  () => statusOptions.find((opt) => opt.value === status.value)?.label ?? 'すべて'
)
const hasAppliedFilter = computed(() => !!appliedQuery.value || status.value !== 'all')

const isToggling = (id: string) => !!togglingIds.value[id]
const isDeleting = (id: string) => !!deletingIds.value[id]
const isDuplicating = (id: string) => !!duplicatingIds.value[id]

const setToggling = (id: string, value: boolean) => {
  togglingIds.value = { ...togglingIds.value, [id]: value }
}

const setDeleting = (id: string, value: boolean) => {
  deletingIds.value = { ...deletingIds.value, [id]: value }
}

const setDuplicating = (id: string, value: boolean) => {
  duplicatingIds.value = { ...duplicatingIds.value, [id]: value }
}

const firstQuery = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

const normalizeSort = (value: unknown): MyGamesSort => {
  const v = String(value ?? '').trim().toLowerCase()
  if (v === 'updated' || v === 'created' || v === 'title' || v === 'public') return v
  return 'updated'
}

const normalizeStatus = (value: unknown): MyGamesStatus => {
  const v = String(value ?? '').trim().toLowerCase()
  if (v === 'all' || v === 'public' || v === 'private') return v
  return 'all'
}

const buildQuery = (q: string, nextSort: MyGamesSort, nextStatus: MyGamesStatus) => {
  const query: Record<string, any> = { ...route.query }
  if (q) {
    query.q = q
  } else {
    delete query.q
  }

  if (nextSort !== 'updated') {
    query.sort = nextSort
  } else {
    delete query.sort
  }

  if (nextStatus !== 'all') {
    query.status = nextStatus
  } else {
    delete query.status
  }

  return query
}

const refreshList = async () => {
  list.value = (await api.my({
    q: appliedQuery.value || undefined,
    sort: sort.value,
    status: status.value,
  })) as MyGame[]
}

const applySearch = async () => {
  const q = searchInput.value.trim()
  await router.push({ query: buildQuery(q, sort.value, status.value) })
}

const applySort = async () => {
  await router.push({ query: buildQuery(appliedQuery.value, sort.value, status.value) })
}

const applyStatus = async () => {
  await router.push({ query: buildQuery(appliedQuery.value, sort.value, status.value) })
}

watch(
  () => route.query,
  async () => {
    const rawQ = firstQuery(route.query.q) || ''
    const normalizedQ = rawQ.trim()
    const rawSort = firstQuery(route.query.sort)
    const rawStatus = firstQuery(route.query.status)
    const normalizedSort = normalizeSort(rawSort)
    const normalizedStatus = normalizeStatus(rawStatus)

    const normalizedSortQuery = normalizedSort === 'updated' ? undefined : normalizedSort
    const normalizedStatusQuery = normalizedStatus === 'all' ? undefined : normalizedStatus
    const currentSortQuery = rawSort && rawSort.trim() ? rawSort.trim().toLowerCase() : undefined
    const currentStatusQuery = rawStatus && rawStatus.trim() ? rawStatus.trim().toLowerCase() : undefined
    const needsCanonicalize =
      rawQ !== normalizedQ ||
      currentSortQuery !== normalizedSortQuery ||
      currentStatusQuery !== normalizedStatusQuery

    if (needsCanonicalize) {
      await router.replace({ query: buildQuery(normalizedQ, normalizedSort, normalizedStatus) })
      return
    }

    searchInput.value = normalizedQ
    appliedQuery.value = normalizedQ
    sort.value = normalizedSort
    status.value = normalizedStatus

    loading.value = true
    try {
      await refreshList()
    } catch (error) {
      console.error('Failed to load games:', error)
      toast.error('ゲーム一覧の取得に失敗しました')
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)

async function onCreate() {
  if (!title.value.trim()) return
  
  try {
    await api.create({ title: title.value })
    await refreshList()
    title.value = ''
    toast.success('ゲームを作成しました')
  } catch (error) {
    console.error('Failed to create game:', error)
    toast.error('ゲームの作成に失敗しました')
  }
}

async function togglePublic(game: any) {
  if (isToggling(game.id)) return

  const prev = !!game.isPublic
  const next = !prev
  setToggling(game.id, true)

  try {
    if (next) {
      const editable = await api.getEdit(game.id)
      const check = runScenarioCheck({
        scenes: editable?.scenes ?? [],
        startSceneId: editable?.startSceneId,
      })

      const errorIssues = check.issues.filter((issue) => issue.severity === 'error')
      const warningCount = check.counts.warning

      if (errorIssues.length > 0) {
        const details = errorIssues
          .slice(0, 3)
          .map((issue, index) => `${index + 1}. ${issue.message}`)
          .join('\n')
        const restCount = Math.max(errorIssues.length - 3, 0)
        const suffix = restCount > 0 ? `\nほか ${restCount} 件` : ''

        toast.error(`エラー${errorIssues.length}件のため公開できません`)
        const shouldMoveToEdit = window.confirm(
          `公開できません。シナリオチェックでエラーが見つかりました。エラーを修正してから公開してください。\n\n${details}${suffix}\n\nシナリオチェックを確認するため編集画面へ移動しますか？`
        )
        if (shouldMoveToEdit) {
          await navigateTo(`/my/games/${game.id}/edit?focusScenarioCheck=1&scenarioCheckFilter=error`)
        }
        return
      }

      if (warningCount > 0) {
        const proceed = window.confirm(
          `警告がありますが公開しますか？未設定の選択肢や到達不能ノードが残っている可能性があります。\n\n警告 ${warningCount} 件`
        )
        if (!proceed) {
          toast.info('公開をキャンセルしました')
          return
        }
      }
    }

    await api.update(game.id, { isPublic: next })
    game.isPublic = next
    await refreshList()
    toast.success(next ? '公開に切り替えました' : '非公開に切り替えました')
  } catch (error: any) {
    game.isPublic = prev
    console.error('Failed to toggle public:', error)

    const rawMessage = error?.data?.message
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(' / ')
      : (typeof rawMessage === 'string' ? rawMessage : (error?.message || '公開設定の変更に失敗しました'))
    const errors = Array.isArray(error?.data?.errors)
      ? error.data.errors.filter((item: unknown) => typeof item === 'string' && item.trim().length > 0)
      : []

    toast.error(message)

    if (next && errors.length > 0) {
      const details = errors
        .slice(0, 5)
        .map((item: string, index: number) => `${index + 1}. ${item}`)
        .join('\n')
      const restCount = Math.max(errors.length - 5, 0)
      const suffix = restCount > 0 ? `\nほか ${restCount} 件` : ''
      window.alert(`${message}\n\n${details}${suffix}`)
    }
  } finally {
    setToggling(game.id, false)
  }
}

const resolveDuplicatedGameId = (res: any): string | null => {
  if (typeof res?.id === 'string' && res.id.trim().length > 0) return res.id
  if (typeof res?.gameId === 'string' && res.gameId.trim().length > 0) return res.gameId
  if (typeof res?.game?.id === 'string' && res.game.id.trim().length > 0) return res.game.id
  return null
}

async function onDuplicate(game: any) {
  if (isDuplicating(game.id)) return

  const titleForConfirm = String(game?.title || '無題')
  const confirmed = window.confirm(
    `ゲーム「${titleForConfirm}」を複製します。複製先は非公開で作成されます。続行しますか？`
  )
  if (!confirmed) return

  setDuplicating(game.id, true)
  try {
    const duplicated = await api.duplicate(game.id)
    const duplicatedId = resolveDuplicatedGameId(duplicated)
    await refreshList()
    toast.success('ゲームを複製しました（複製先は非公開）')

    if (duplicatedId) {
      await navigateTo(`/my/games/${duplicatedId}/edit`)
    }
  } catch (error: any) {
    console.error('Failed to duplicate game:', error)
    const message = error?.data?.message || error?.message || 'ゲームの複製に失敗しました'
    toast.error(message)
  } finally {
    setDuplicating(game.id, false)
  }
}

async function onDelete(game: any) {
  if (isDeleting(game.id)) return

  const titleForConfirm = String(game?.title || '無題')
  const confirmed = window.confirm(
    `ゲーム「${titleForConfirm}」を削除します。公開一覧・編集画面から表示されなくなります。この操作は元に戻せない可能性があります。この操作を実行しますか？`
  )
  if (!confirmed) return

  setDeleting(game.id, true)
  try {
    await api.del(game.id)
    await refreshList()
    toast.success('ゲームを削除しました')
  } catch (error: any) {
    console.error('Failed to delete game:', error)
    const message = error?.data?.message || error?.message || 'ゲームの削除に失敗しました'
    toast.error(message)
  } finally {
    setDeleting(game.id, false)
  }
}
</script>
