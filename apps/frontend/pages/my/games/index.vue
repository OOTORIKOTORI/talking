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
      <p class="text-gray-500">まだゲームプロジェクトがありません。</p>
      <p class="text-sm text-gray-400 mt-2">上のフォームから新規作成できます。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { runScenarioCheck } from '@/utils/scenarioCheck'

definePageMeta({
  middleware: 'require-auth'
})

const api = useGamesApi()
const toast = useToast()
const list = ref<any[]>([])
const title = ref('')
const loading = ref(true)
const togglingIds = ref<Record<string, boolean>>({})
const deletingIds = ref<Record<string, boolean>>({})

const isToggling = (id: string) => !!togglingIds.value[id]
const isDeleting = (id: string) => !!deletingIds.value[id]

const setToggling = (id: string, value: boolean) => {
  togglingIds.value = { ...togglingIds.value, [id]: value }
}

const setDeleting = (id: string, value: boolean) => {
  deletingIds.value = { ...deletingIds.value, [id]: value }
}

const refreshList = async () => {
  list.value = (await api.my()) as any[]
}

onMounted(async () => {
  try {
    await refreshList()
  } catch (error) {
    console.error('Failed to load games:', error)
    toast.error('ゲーム一覧の取得に失敗しました')
  } finally {
    loading.value = false
  }
})

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
    toast.success(next ? '公開に切り替えました' : '非公開に切り替えました')
  } catch (error) {
    game.isPublic = prev
    console.error('Failed to toggle public:', error)
    toast.error('公開設定の変更に失敗しました')
  } finally {
    setToggling(game.id, false)
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
    list.value = list.value.filter((item) => item.id !== game.id)
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
