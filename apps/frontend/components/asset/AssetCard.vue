<template>
  <NuxtLink
    :to="`/assets/${asset.id}`"
    class="block group relative rounded-2xl shadow-sm ring-1 ring-black/5 bg-white overflow-hidden hover:shadow-md transition"
  >
    <!-- 右上 お気に入り -->
    <button
      v-if="showFavorite"
      class="absolute top-2 right-2 z-10 rounded-full p-2 bg-white/80 backdrop-blur hover:bg-white transition"
      :class="{ 'text-red-500': isFav, 'text-gray-400': !isFav, 'opacity-50': toggling }"
      :aria-pressed="isFav ? 'true' : 'false'"
      :disabled="toggling"
      aria-label="お気に入り"
      title="お気に入り"
      @click="onToggleFav"
    >
      <!-- filled heart -->
      <svg v-if="isFav" viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor" aria-hidden="true">
        <path d="M12 21s-7.053-4.534-9.428-8.24C1.04 10.7 1.24 7.9 3.11 6.2 5.41 4.09 8.53 4.73 10 6.7c1.47-1.97 4.59-2.61 6.89-.5 1.87 1.7 2.07 4.5.54 6.56C19.053 16.466 12 21 12 21z"/>
      </svg>
      <!-- outline heart -->
      <svg v-else viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>

    <!-- サムネ or プレースホルダ -->
    <div class="aspect-[16/9] w-full bg-gray-100 overflow-hidden">
      <!-- 画像: 署名URL解決済みのみ描画、失敗時はスケルトン -->
      <img
        v-if="isImage && src"
        :src="src"
        :alt="asset.title || 'asset'"
        class="h-full w-full object-cover group-hover:scale-[1.02] transition"
        @error="onImgError"
      />
      <div v-else-if="isImage" class="h-full w-full animate-pulse bg-gray-200" />
      <div v-else class="h-full w-full grid place-items-center text-gray-500">
        <!-- 音声/その他の簡易アイコン -->
        <svg viewBox="0 0 24 24" class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M9 18V6l12-2v12"/>
          <path d="M6 10H2v4h4l5 4V6L6 10z"/>
        </svg>
        <p class="text-xs mt-1">MPEG</p>
      </div>
    </div>

    <!-- 本文 -->
    <div class="p-3">
      <h3 class="font-medium line-clamp-1">{{ asset.title || '（無題）' }}</h3>
      <p class="text-xs text-gray-500 line-clamp-2">{{ asset.description }}</p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { useAssetsApi } from '@/composables/useAssets'

const props = defineProps({
  asset: {
    type: Object,
    required: true,
  },
  showFavorite: {
    type: Boolean,
    default: false,
  },
});

const api = useAssetsApi()
const isFav = ref(!!props.asset?.isFavorited)
watch(() => props.asset?.isFavorited, v => isFav.value = !!v)

const toggling = ref(false)

const onToggleFav = async (e: MouseEvent) => {
  e.stopPropagation()
  e.preventDefault()
  if (toggling.value) return
  toggling.value = true
  const prev = isFav.value
  try {
    isFav.value = !prev
    if (isFav.value) {
      await api.favorite(props.asset.id)
    } else {
      await api.unfavorite(props.asset.id)
    }
    if (props.asset) props.asset.isFavorited = isFav.value
  } catch (err) {
    isFav.value = prev
    console.error('Failed to toggle favorite:', err)
  } finally {
    toggling.value = false
  }
}

const isImage = computed(() => props.asset.contentType?.startsWith('image/'))
const key = computed(() => props.asset.thumbKey || props.asset.key || '')

// 署名URLを短期キャッシュ（メモリ） ※キー: object key
const __cache = (globalThis as any).__signedGetCache ||= new Map<string, { url: string; exp: number }>()
const src = ref<string>('')
const loading = ref<boolean>(false)
const attempts = ref<number>(0)
const { $api } = useNuxtApp()

async function fetchSignedUrl(force = false) {
  const k = key.value
  if (!k) { src.value = ''; return }
  const now = Date.now()
  if (!force) {
    const hit = __cache.get(k)
    if (hit && hit.exp - now > 30_000) { // 有効期限まで30秒以上残ってたら再利用
      src.value = hit.url; return
    }
  }
  loading.value = true
  try {
    const res: any = await $api('/uploads/signed-get', { query: { key: k } })
    const url: string = res?.url ?? res
    // 期限推定: expiresAt(iso/epoch) or expiresIn(sec) or 60s
    let exp = now + 60_000
    if (res?.expiresAt) {
      const t = typeof res.expiresAt === 'number' ? res.expiresAt : Date.parse(res.expiresAt)
      if (!Number.isNaN(t)) exp = t
    } else if (res?.expiresIn) {
      exp = now + Number(res.expiresIn) * 1000
    }
    __cache.set(k, { url, exp })
    // キャッシュ破棄を避けつつブラウザキャッシュをバイパス
    src.value = url + (attempts.value ? `#r=${now}` : '')
  } catch (e) {
    // noop（スケルトン維持）
  } finally {
    loading.value = false
  }
}

watch(key, () => { attempts.value = 0; fetchSignedUrl(true) }, { immediate: true })

function onImgError() {
  // TTL切れなど。最大2回まで再取得
  attempts.value++
  if (attempts.value <= 2) fetchSignedUrl(true)
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 1;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}
</style>
