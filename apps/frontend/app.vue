<template>
  <div>
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <NuxtLink to="/" class="text-xl font-bold text-gray-900">Talking</NuxtLink>

        <!-- PC nav -->
        <nav class="hidden md:flex items-center space-x-4">
          <NuxtLink to="/assets" class="text-gray-700 hover:text-gray-900">公開ギャラリー</NuxtLink>
          <NuxtLink to="/characters" class="text-gray-700 hover:text-gray-900">キャラクター</NuxtLink>
          <NuxtLink to="/games" class="text-gray-700 hover:text-gray-900">公開ゲーム</NuxtLink>
          <NuxtLink v-if="user" to="/my/games" class="text-gray-700 hover:text-gray-900">ゲーム制作</NuxtLink>
          <NuxtLink v-if="user" to="/upload" class="text-gray-700 hover:text-gray-900">アップロード</NuxtLink>
          <NuxtLink v-if="user" to="/my/assets" class="text-gray-700 hover:text-gray-900">アセット管理</NuxtLink>
          <NuxtLink v-if="user" to="/my/characters" class="text-gray-700 hover:text-gray-900">マイキャラ</NuxtLink>
          <NuxtLink v-if="user" to="/my/favorites" class="text-pink-600 hover:text-pink-700">お気に入り</NuxtLink>
          <NuxtLink v-if="user" to="/my/profile" class="text-gray-700 hover:text-gray-900">プロフィール</NuxtLink>
          <div v-if="user" class="flex items-center space-x-3">
            <span class="text-sm text-gray-600">{{ user.email }}</span>
            <NuxtLink to="/logout" class="text-red-600 hover:text-red-700">ログアウト</NuxtLink>
          </div>
          <NuxtLink v-else to="/login" class="text-blue-600 hover:text-blue-700 font-medium">ログイン</NuxtLink>
        </nav>

        <!-- ハンバーガーボタン（スマホ用） -->
        <button
          type="button"
          class="md:hidden p-2 rounded text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          :aria-label="menuOpen ? 'メニューを閉じる' : 'メニューを開く'"
          @click="menuOpen = !menuOpen"
        >
          <span v-if="menuOpen" class="text-xl leading-none">✕</span>
          <span v-else class="text-xl leading-none">☰</span>
        </button>
      </div>

      <!-- スマホ用メニュー -->
      <div
        v-if="menuOpen"
        id="mobile-menu"
        class="md:hidden border-t border-gray-200 bg-white"
      >
        <nav class="flex flex-col px-4 py-2">
          <NuxtLink to="/assets" class="py-3 text-gray-700 hover:text-gray-900 border-b border-gray-100" @click="menuOpen = false">公開ギャラリー</NuxtLink>
          <NuxtLink to="/characters" class="py-3 text-gray-700 hover:text-gray-900 border-b border-gray-100" @click="menuOpen = false">キャラクター</NuxtLink>
          <NuxtLink to="/games" class="py-3 text-gray-700 hover:text-gray-900 border-b border-gray-100" @click="menuOpen = false">公開ゲーム</NuxtLink>
          <template v-if="user">
            <NuxtLink to="/my/games" class="py-3 text-gray-700 hover:text-gray-900 border-b border-gray-100" @click="menuOpen = false">ゲーム制作</NuxtLink>
            <NuxtLink to="/upload" class="py-3 text-gray-700 hover:text-gray-900 border-b border-gray-100" @click="menuOpen = false">アップロード</NuxtLink>
            <NuxtLink to="/my/assets" class="py-3 text-gray-700 hover:text-gray-900 border-b border-gray-100" @click="menuOpen = false">アセット管理</NuxtLink>
            <NuxtLink to="/my/characters" class="py-3 text-gray-700 hover:text-gray-900 border-b border-gray-100" @click="menuOpen = false">マイキャラ</NuxtLink>
            <NuxtLink to="/my/favorites" class="py-3 text-pink-600 hover:text-pink-700 border-b border-gray-100" @click="menuOpen = false">お気に入り</NuxtLink>
            <NuxtLink to="/my/profile" class="py-3 text-gray-700 hover:text-gray-900 border-b border-gray-100" @click="menuOpen = false">プロフィール</NuxtLink>
            <div class="py-3 border-b border-gray-100">
              <span class="text-sm text-gray-600 break-all block mb-1">{{ user.email }}</span>
              <NuxtLink to="/logout" class="text-red-600 hover:text-red-700" @click="menuOpen = false">ログアウト</NuxtLink>
            </div>
          </template>
          <NuxtLink v-else to="/login" class="py-3 text-blue-600 hover:text-blue-700 font-medium" @click="menuOpen = false">ログイン</NuxtLink>
        </nav>
      </div>
    </header>
    <NuxtPage />
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
  import ToastContainer from '@/components/common/ToastContainer.vue'
  // auto-importの取りこぼしで dev が落ちるため、ここでは composable を使わず $supabase へ直接アクセスする
  import { useNuxtApp, onMounted, onUnmounted } from '#imports'

// スマホメニューの開閉状態
const menuOpen = ref(false)

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') menuOpen.value = false
}

// Supabase のユーザー情報を取得（$supabase 直接参照）
const user = ref<any>(null)
onMounted(async () => {
  const { $supabase } = useNuxtApp() as any
  const client = $supabase?.client || $supabase
  if (!client?.auth) return
  try {
    const { data: { session } } = await client.auth.getSession()
    user.value = session?.user || null
    client.auth.onAuthStateChange((_event: any, session: any) => {
      user.value = session?.user || null
    })
  } catch {}

  // Escapeキーでメニューを閉じる
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// ルート変更でメニューを閉じる
const route = useRoute()
watch(() => route.fullPath, () => { menuOpen.value = false })

useHead({
  title: 'Talking',
  meta: [
    { name: 'description', content: 'Talking Application' }
  ]
})
</script>
