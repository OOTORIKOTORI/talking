<template>
  <div :class="[fill ? 'w-full h-full' : 'w-full aspect-[16/9]', 'bg-black relative overflow-hidden rounded']">
    <img v-if="bg" :src="bg" class="absolute inset-0 w-full h-full object-cover opacity-90" />
    <div v-for="(p, i) in portraits" :key="i"
         class="absolute will-change-transform"
         :style="{
           left: (p.x ?? 50) + '%',
           top:  (p.y ?? 90) + '%',
           height: scaleToHeight(p.scale) + '%',
           transform: 'translate(-50%,-100%)',
           zIndex: p.z || 0
         }">
      <img v-if="p.thumb" :src="p.thumb" class="h-full w-auto object-contain drop-shadow-lg" />
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

/**
 * 旧仕様は「固定pxベース × transform scale」。画面サイズで比率がズレた。
 * 新仕様は「ステージ高さに対する％」。既存データの scale=100~150 をだいたい
 * 同じ見た目に寄せるため、>60 は 1/3 に丸める（例: 150 → 50%）。
 */
function scaleToHeight(s: number | undefined) {
  if (s == null) return 30
  return s > 60 ? Math.round(s / 3) : s
}
</script>
