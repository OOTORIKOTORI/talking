<template>
  <nav role="tablist" class="mb-4 flex gap-2 text-sm">
    <NuxtLink
      v-for="it in items"
      :key="it.to"
      :to="it.to"
      role="tab"
      :aria-selected="isActive(it) ? 'true' : 'false'"
      :class="tabClass(isActive(it))"
    >
      {{ it.label }}
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

interface TabItem {
  label: string
  to: string
  activePrefix?: string
}

const props = defineProps<{
  items: TabItem[]
}>()

const route = useRoute()

const tabClass = (active: boolean) =>
  `px-3 py-1 rounded border transition-colors ${
    active
      ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
  }`

const isActive = (it: TabItem) => {
  const p = route.path
  return it.activePrefix ? (p === it.to || p.startsWith(it.activePrefix)) : p === it.to
}
</script>
