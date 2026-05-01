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
      </li>
    </ul>

    <div v-else class="text-center py-12">
      <p class="text-gray-500">まだゲームプロジェクトがありません。</p>
      <p class="text-sm text-gray-400 mt-2">上のフォームから新規作成できます。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'require-auth'
})

const api = useGamesApi()
const toast = useToast()
const list = ref<any[]>([])
const title = ref('')
const loading = ref(true)
const togglingIds = ref<Record<string, boolean>>({})

const isToggling = (id: string) => !!togglingIds.value[id]

const setToggling = (id: string, value: boolean) => {
  togglingIds.value = { ...togglingIds.value, [id]: value }
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
  game.isPublic = next
  setToggling(game.id, true)

  try {
    await api.update(game.id, { isPublic: next })
    toast.success(next ? '公開に切り替えました' : '非公開に切り替えました')
  } catch (error) {
    game.isPublic = prev
    console.error('Failed to toggle public:', error)
    toast.error('公開設定の変更に失敗しました')
  } finally {
    setToggling(game.id, false)
  }
}
</script>
