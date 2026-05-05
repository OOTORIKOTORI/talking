<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-2xl mx-auto px-4 sm:px-6 py-4">
        <h1 class="text-xl font-semibold text-gray-900">プロフィール設定</h1>
      </div>
    </header>

    <main class="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div v-if="initLoading" class="text-center py-12 text-gray-500">読み込み中...</div>

      <div v-else-if="initError" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {{ initError }}
      </div>

      <form v-else class="bg-white border border-gray-200 rounded-xl p-6 space-y-5" @submit.prevent="save">
        <div>
          <label for="displayName" class="block text-sm font-medium text-gray-700 mb-1">
            クリエイター表示名 <span class="text-red-500">*</span>
          </label>
          <input
            id="displayName"
            v-model="form.displayName"
            type="text"
            maxlength="40"
            class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="表示名（40文字以内）"
            :disabled="saving"
          />
          <p class="mt-1 text-xs text-gray-400">{{ form.displayName.length }}/40文字</p>
        </div>

        <div>
          <label for="bio" class="block text-sm font-medium text-gray-700 mb-1">
            自己紹介
          </label>
          <textarea
            id="bio"
            v-model="form.bio"
            rows="4"
            maxlength="500"
            class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="自己紹介・プロフィール文（500文字以内・任意）"
            :disabled="saving"
          />
          <p class="mt-1 text-xs text-gray-400">{{ form.bio.length }}/500文字</p>
        </div>

        <div v-if="saveError" class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {{ saveError }}
        </div>

        <div v-if="saveSuccess" class="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
          保存しました。
        </div>

        <div class="flex gap-3">
          <button
            type="submit"
            class="px-5 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
            :disabled="saving || !hasChanges || !isValid"
          >
            {{ saving ? '保存中...' : '保存する' }}
          </button>
          <NuxtLink
            to="/my/games"
            class="px-4 py-2 rounded border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
          >
            戻る
          </NuxtLink>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-auth' })

type MyProfile = {
  userId: string
  displayName: string | null
  bio: string | null
  isConfigured: boolean
  createdAt?: string
  updatedAt?: string
}

const profilesApi = useProfilesApi()

const initLoading = ref(true)
const initError = ref<string | null>(null)
const saving = ref(false)
const saveError = ref<string | null>(null)
const saveSuccess = ref(false)

const savedDisplayName = ref('')
const savedBio = ref('')

const form = reactive({
  displayName: '',
  bio: '',
})

const isValid = computed(() => form.displayName.trim().length > 0 && form.displayName.trim().length <= 40)

const hasChanges = computed(
  () => form.displayName.trim() !== savedDisplayName.value || form.bio.trim() !== savedBio.value,
)

onMounted(async () => {
  try {
    const profile = (await profilesApi.getMyProfile()) as MyProfile
    const dn = profile.displayName ?? ''
    const bio = profile.bio ?? ''
    savedDisplayName.value = dn
    savedBio.value = bio
    form.displayName = dn
    form.bio = bio
  } catch (e: any) {
    initError.value = e?.data?.message || e?.message || 'プロフィールの取得に失敗しました。'
  } finally {
    initLoading.value = false
  }
})

async function save() {
  saveError.value = null
  saveSuccess.value = false

  const trimmedName = form.displayName.trim()
  if (trimmedName.length === 0) {
    saveError.value = 'クリエイター表示名を入力してください。'
    return
  }
  if (trimmedName.length > 40) {
    saveError.value = 'クリエイター表示名は40文字以内で入力してください。'
    return
  }

  saving.value = true
  try {
    const payload: { displayName: string; bio?: string | null } = {
      displayName: trimmedName,
      bio: form.bio.trim() || null,
    }
    await profilesApi.updateMyProfile(payload)
    savedDisplayName.value = trimmedName
    savedBio.value = form.bio.trim()
    saveSuccess.value = true
  } catch (e: any) {
    saveError.value = e?.data?.message || e?.message || '保存に失敗しました。'
  } finally {
    saving.value = false
  }
}
</script>
