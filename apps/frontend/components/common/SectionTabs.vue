<template>
  <div class="mb-4 flex gap-2 text-sm">
    <NuxtLink
      v-for="it in items"
      :key="it.to"
      :to="it.to"
      :class="tabClass(isActive(it))"
    >
      {{ it.label }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  items: { label: string; to: string; activePrefix?: string }[]
}>()

const route = useRoute()
const tabClass = (active:boolean)=>
  `px-3 py-1 rounded border ${active ? 'bg-blue-50 border-blue-300' : 'bg-white'}`

const isActive = (it:{to:string; activePrefix?:string})=>{
  const path = route.path
  const prefix = it.activePrefix ?? (it.to.endsWith('/') ? it.to : it.to + '/')
  return path === it.to || path.startsWith(prefix)
}
</script>
