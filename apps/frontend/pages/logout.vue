<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">ログアウト中...</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const router = useRouter()

onMounted(async () => {
  await supabase.auth.signOut()
  await router.push('/')
})
</script>
