<template>
  <!-- ステージ外枠（表示領域） -->
  <div :class="[fill ? 'w-full h-full' : 'w-full aspect-[16/9]', 'bg-black relative overflow-hidden rounded']">
    <!-- ワールド（背景＋キャラ）にカメラ変換を適用 -->
    <div class="absolute inset-0 will-change-transform" :style="worldStyle">
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
  </div>
</template>

<script setup lang="ts">
import { useAssetMeta } from '@/composables/useAssetMeta'

const props = defineProps<{
  bgAssetId?: string | null
  portraits: any[]
  fill?: boolean
  camera?: { zoom?: number; cx?: number; cy?: number }  // 追加
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

// カメラ変換: zoom(%) と中心(cx,cy)(%) を world に適用
const worldStyle = computed(() => {
  const z = Math.max(100, Math.min(300, props.camera?.zoom ?? 100)) / 100
  const cx = props.camera?.cx ?? 50
  const cy = props.camera?.cy ?? 50
  // 50,50 なら translate(0,0)。％指定は要素サイズ基準なので world==stage なら綺麗に合う。
  const tx = 50 - cx
  const ty = 50 - cy
  return {
    transform: `translate(${tx}%, ${ty}%) scale(${z})`,
    transformOrigin: 'center center',
  }
})

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
