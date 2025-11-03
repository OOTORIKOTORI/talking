<template>
  <!-- 親から与えられるボックスサイズにフィットさせる -->
  <div :class="[fill ? 'w-full h-full' : 'w-full aspect-[16/9]', 'bg-black relative overflow-hidden rounded']">
    <img v-if="bg" :src="bg" class="absolute inset-0 w-full h-full object-cover opacity-90" />
    <div v-for="(p, i) in portraits" :key="i"
         class="absolute will-change-transform"
         :style="{
           left: p.x + '%',
           top: p.y + '%',
           transform: `translate(-50%, -100%) scale(${(p.scale || 100) / 100})`,
           zIndex: p.z || 0
         }">
      <img v-if="p.thumb" :src="p.thumb" class="max-h-64 object-contain drop-shadow-lg" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAssetMeta } from '@/composables/useAssetMeta'

const props = defineProps<{
  bgAssetId?: string | null
  portraits: any[]
  fill?: boolean
}>()

const { signedFromId } = useAssetMeta()
const bg = ref<string | null>(null)

watch(
  () => props.bgAssetId,
  async (id) => {
    bg.value = id ? await signedFromId(id, true) : null
  },
  { immediate: true }
)
</script>
