<template>
  <div class="mb-4 flex gap-2 text-sm">
    <NuxtLink
      v-for="it in items" :key="it.to" :to="it.to"
      :class="tabClass($route.path.startsWith(it.activePath ?? it.to))"
    >{{ it.label }}</NuxtLink>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ items: { label:string; to:string; activePath?:string }[] }>()
const tabClass = (active:boolean)=>
  `px-3 py-1 rounded border ${active ? 'bg-blue-50 border-blue-300' : 'bg-white'}`
</script>
