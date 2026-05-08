<template>
  <div class="mb-4 rounded-lg border border-gray-200 bg-gray-50">
    <div class="flex items-center justify-between gap-2 border-b border-gray-200 px-3 py-2">
      <div>
        <div class="font-semibold text-sm">手動クレジット</div>
        <div class="text-[11px] text-gray-500">
          素材サイト、BGM、効果音、協力者など、自動検出できないクレジットをゲーム単位で追加できます。
        </div>
      </div>
      <button
        type="button"
        class="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100"
        @click="open = !open"
      >
        {{ open ? '折りたたむ' : '展開' }}
      </button>
    </div>

    <div v-if="open" class="px-3 py-3 space-y-3">
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <span class="rounded border border-gray-300 bg-white px-2 py-1">{{ items.length }}件</span>
        <button
          type="button"
          class="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
          :disabled="loading"
          @click="load"
        >
          再読み込み
        </button>
        <button
          type="button"
          class="px-2 py-1 rounded border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
          :disabled="loading"
          @click="startCreate"
        >
          + 追加
        </button>
      </div>

      <div v-if="loading" class="text-xs text-gray-500">読み込み中...</div>
      <div v-else-if="error" class="rounded border border-red-200 bg-red-50 px-2 py-2 text-xs text-red-700">
        {{ error }}
      </div>

      <div v-if="editing" class="rounded border border-gray-300 bg-white p-3 space-y-2">
        <div class="text-xs font-semibold text-gray-700">
          {{ editing.mode === 'create' ? '手動クレジットを追加' : '手動クレジットを編集' }}
        </div>
        <label class="block text-xs">
          <span class="mb-1 block text-gray-600">表示名 *</span>
          <input v-model="form.label" class="w-full rounded border border-gray-300 px-2 py-1 text-sm" maxlength="100" />
        </label>
        <label class="block text-xs">
          <span class="mb-1 block text-gray-600">種別/役割</span>
          <input v-model="form.manualRole" class="w-full rounded border border-gray-300 px-2 py-1 text-sm" maxlength="50" />
        </label>
        <label class="block text-xs">
          <span class="mb-1 block text-gray-600">URL</span>
          <input
            v-model="form.manualUrl"
            class="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            placeholder="https://example.com"
          />
        </label>
        <label class="block text-xs">
          <span class="mb-1 block text-gray-600">補足</span>
          <textarea
            v-model="form.manualNote"
            class="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            rows="4"
            maxlength="2000"
          />
        </label>
        <label class="block text-xs">
          <span class="mb-1 block text-gray-600">表示順</span>
          <input v-model.number="form.sortOrder" type="number" class="w-28 rounded border border-gray-300 px-2 py-1 text-sm" />
        </label>

        <div v-if="formError" class="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
          {{ formError }}
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            :disabled="saving"
            @click="submit"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
          <button
            type="button"
            class="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
            :disabled="saving"
            @click="cancelEdit"
          >
            キャンセル
          </button>
        </div>
      </div>

      <div v-if="!loading && items.length === 0" class="rounded border border-gray-200 bg-white px-3 py-3 text-xs text-gray-500">
        手動クレジットはありません。
      </div>

      <ul v-else class="space-y-2">
        <li
          v-for="item in items"
          :key="item.id"
          class="rounded border border-gray-200 bg-white px-3 py-2"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <div class="font-medium text-sm text-gray-900 break-words">{{ item.label }}</div>
              <div v-if="item.manualRole" class="text-xs text-gray-600 mt-1">役割: {{ item.manualRole }}</div>
              <div v-if="item.manualNote" class="text-xs text-gray-700 mt-1 whitespace-pre-wrap break-words">{{ item.manualNote }}</div>
              <div v-if="item.manualUrl" class="mt-1 text-xs">
                <a
                  v-if="isHttpUrl(item.manualUrl)"
                  :href="item.manualUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:underline"
                >
                  {{ item.manualUrl }}
                </a>
                <span v-else class="text-gray-500">{{ item.manualUrl }}</span>
              </div>
              <div class="mt-1 text-[11px] text-gray-500">sort: {{ item.sortOrder }}</div>
            </div>
            <div class="flex shrink-0 gap-1">
              <button
                type="button"
                class="px-2 py-1 rounded border border-gray-300 bg-white text-xs hover:bg-gray-100"
                :disabled="saving"
                @click="startEdit(item)"
              >
                編集
              </button>
              <button
                type="button"
                class="px-2 py-1 rounded border border-red-300 bg-red-50 text-xs text-red-700 hover:bg-red-100 disabled:opacity-50"
                :disabled="deletingId === item.id"
                @click="remove(item)"
              >
                {{ deletingId === item.id ? '削除中...' : '削除' }}
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameManualCreditItem } from '@talking/types'

interface Props {
  gameId: string
  isPublic?: boolean
}

const props = defineProps<Props>()

const api = useGamesApi()

const open = ref(false)
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const formError = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const items = ref<GameManualCreditItem[]>([])

const editing = ref<{ mode: 'create' | 'edit'; id?: string } | null>(null)
const form = reactive({
  label: '',
  manualRole: '',
  manualNote: '',
  manualUrl: '',
  sortOrder: 0,
})

function isHttpUrl(value: string | null | undefined) {
  if (!value) return false
  return /^https?:\/\//i.test(value)
}

function normalizeFormPayload() {
  return {
    label: form.label,
    manualRole: form.manualRole,
    manualNote: form.manualNote,
    manualUrl: form.manualUrl,
    sortOrder: form.sortOrder,
  }
}

function resetForm() {
  form.label = ''
  form.manualRole = ''
  form.manualNote = ''
  form.manualUrl = ''
  form.sortOrder = items.value.length
  formError.value = null
}

function confirmForPublicChange() {
  if (!props.isPublic) return true
  if (!process.client) return true
  return window.confirm(
    'このゲームは公開中です。手動クレジットの変更は公開版にも反映されます。続行しますか？',
  )
}

function confirmForDelete(label: string) {
  if (!process.client) return true

  if (!props.isPublic) {
    return window.confirm(`手動クレジット「${label}」を削除しますか？`)
  }

  return window.confirm(
    `このゲームは公開中です。手動クレジット「${label}」を削除すると公開版にも反映されます。削除しますか？`,
  )
}

async function load() {
  if (!props.gameId) return
  loading.value = true
  error.value = null
  try {
    const res = await api.getManualCredits(props.gameId)
    items.value = Array.isArray(res) ? (res as GameManualCreditItem[]) : []
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || '手動クレジットの取得に失敗しました'
  } finally {
    loading.value = false
  }
}

function startCreate() {
  editing.value = { mode: 'create' }
  resetForm()
}

function startEdit(item: GameManualCreditItem) {
  editing.value = { mode: 'edit', id: item.id }
  form.label = item.label || ''
  form.manualRole = item.manualRole || ''
  form.manualNote = item.manualNote || ''
  form.manualUrl = item.manualUrl || ''
  form.sortOrder = item.sortOrder
  formError.value = null
}

function cancelEdit() {
  editing.value = null
  formError.value = null
}

async function submit() {
  if (!editing.value) return

  const label = form.label.trim()
  if (!label) {
    formError.value = '表示名を入力してください'
    return
  }

  if (!confirmForPublicChange()) {
    return
  }

  saving.value = true
  formError.value = null
  try {
    if (editing.value.mode === 'create') {
      await api.createManualCredit(props.gameId, normalizeFormPayload())
    } else if (editing.value.id) {
      await api.updateManualCredit(props.gameId, editing.value.id, normalizeFormPayload())
    }
    editing.value = null
    await load()
  } catch (e: any) {
    formError.value = e?.data?.message || e?.message || '保存に失敗しました'
  } finally {
    saving.value = false
  }
}

async function remove(item: GameManualCreditItem) {
  if (!confirmForDelete(item.label)) return

  deletingId.value = item.id
  try {
    await api.deleteManualCredit(props.gameId, item.id)
    await load()
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || '削除に失敗しました'
  } finally {
    deletingId.value = null
  }
}

watch(
  () => props.gameId,
  () => {
    editing.value = null
    void load()
  },
  { immediate: true },
)
</script>
