<template>
  <nav class="border-b border-gray-200">
    <ul class="-mb-px flex gap-6">
      <li v-for="item in items" :key="item.to">
        <NuxtLink
          :to="item.to"
          class="inline-flex items-center whitespace-nowrap border-b-2 px-1 pb-2 text-sm font-medium"
          :class="isActive(item.to)
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          {{ item.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
  
</template>

<script setup lang="ts">
interface Item { label: string; to: string }
defineProps<{ items: Item[] }>()

const route = useRoute()
function isActive(to: string) {
  // 先頭一致でアクティブ判定（/assets, /characters, /my/assets, /my/characters）
  return route.path === to || route.path.startsWith(to + '/')
}
</script>
