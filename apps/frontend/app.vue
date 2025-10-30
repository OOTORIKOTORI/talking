<template>
  <div>
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <NuxtLink to="/" class="text-xl font-bold text-gray-900">Talking</NuxtLink>
        <nav class="flex items-center space-x-4">
         <NuxtLink to="/assets" class="text-gray-700 hover:text-gray-900">公開ギャラリー</NuxtLink>
         <NuxtLink to="/characters" class="text-gray-700 hover:text-gray-900">キャラクター</NuxtLink>
          <NuxtLink v-if="user" to="/upload" class="text-gray-700 hover:text-gray-900">アップロード</NuxtLink>
          <NuxtLink v-if="user" to="/my/assets" class="text-gray-700 hover:text-gray-900">アセット管理</NuxtLink>
         <NuxtLink v-if="user" to="/my/characters" class="text-gray-700 hover:text-gray-900">マイキャラ</NuxtLink>
          <NuxtLink v-if="user" to="/my/favorites" class="text-pink-600 hover:text-pink-700">お気に入り</NuxtLink>
          <div v-if="user" class="flex items-center space-x-3">
            <span class="text-sm text-gray-600">{{ user.email }}</span>
            <NuxtLink to="/logout" class="text-red-600 hover:text-red-700">ログアウト</NuxtLink>
          </div>
          <NuxtLink v-else to="/login" class="text-blue-600 hover:text-blue-700 font-medium">ログイン</NuxtLink>
        </nav>
      </div>
    </header>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()

useHead({
  title: 'Talking',
  meta: [
    { name: 'description', content: 'Talking Application' }
  ]
})
</script>
