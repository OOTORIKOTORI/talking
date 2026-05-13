<template>
  <div class="relative block group rounded-2xl overflow-hidden bg-white ring-1 ring-black/5 shadow-sm hover:shadow-md transition">
    <NuxtLink :to="`/characters/${character.id}`">
      <div class="aspect-[3/4] bg-gray-100">
        <CharacterImageThumb :keyOrThumb="thumbKey" :alt="character.name" />
      </div>
      <div class="p-3">
        <div class="font-semibold line-clamp-1">{{ character.displayName || character.name }}</div>
        <div v-if="character.displayName && character.displayName !== character.name" class="text-xs text-slate-500 line-clamp-1">{{ character.name }}</div>
        <p class="text-xs text-gray-500 line-clamp-2 min-h-[1.5em]">{{ character.description || '\u00A0' }}</p>

        <!-- タグ表示 -->
        <div v-if="character.tags && character.tags.length > 0" class="mt-2 flex flex-wrap gap-1">
          <span
            v-for="tag in character.tags.slice(0, 3)"
            :key="tag"
            class="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded"
          >
            {{ tag }}
          </span>
          <span v-if="character.tags.length > 3" class="inline-block px-2 py-0.5 text-xs text-gray-500">
            +{{ character.tags.length - 3 }}
          </span>
        </div>

        <!-- 作者 -->
        <div class="mt-2 text-xs text-gray-500">
          作者:
          <button
            v-if="character.ownerId"
            type="button"
            class="text-blue-600 hover:underline"
            @click.stop.prevent="goToProfile"
          >
            {{ formatCreatorLabel(character.ownerDisplayName, character.ownerId) }}
          </button>
          <span v-else>{{ formatCreatorLabel(character.ownerDisplayName, character.ownerId) }}</span>
        </div>

        <!-- クレジットバッジ -->
        <div class="mt-2 flex items-center gap-2">
          <span
            class="inline-block px-1.5 py-0.5 text-xs font-medium rounded-full"
            :class="character.creditRequired !== false ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'"
          >
            {{ character.creditRequired !== false ? 'クレジット必須' : 'クレジット任意' }}
          </span>
        </div>
      </div>
    </NuxtLink>
    <button
      v-if="showFavorite !== false"
      @click="onToggleFav"
      class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm transition"
      :class="{ 'text-red-500': isFav, 'text-gray-400': !isFav, 'opacity-50': toggling }"
      :disabled="toggling"
      :aria-pressed="isFav ? 'true' : 'false'"
      aria-label="お気に入り"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" :fill="isFav ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" class="w-5 h-5">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </button>
  </div>
</template>
<script setup lang="ts">
import type { Character } from '@talking/types'
import { useCharactersApi } from '@/composables/useCharacters'
import { useRouter } from 'vue-router'
import { formatCreatorLabel } from '@/utils/creatorDisplay'

const props = defineProps({
  character: { type: Object, required: true },
  showFavorite: { type: Boolean, default: true },
})
const thumbKey = computed(() => props.character.images?.[0]?.thumbKey || props.character.images?.[0]?.key || null)

const api = useCharactersApi()
const router = useRouter()
const isFav = ref(!!(props.character?.isFavorited ?? props.character?.isFavorite))
const toggling = ref(false)

const onToggleFav = async (e: MouseEvent) => {
  e.stopPropagation()
  e.preventDefault()
  if (toggling.value) return
  toggling.value = true
  const prev = isFav.value
  isFav.value = !prev
  try {
    if (prev) {
      await api.unfavorite(props.character.id)
    } else {
      await api.favorite(props.character.id)
    }
    // 成功したら親のcharacter.isFavoriteも更新
    props.character.isFavorite = isFav.value
    props.character.isFavorited = isFav.value
  } catch (err) {
    isFav.value = prev
    console.error('Failed to toggle favorite:', err)
  } finally {
    toggling.value = false
  }
}

// character.isFavoriteの変更を監視
watch(() => props.character?.isFavorited ?? props.character?.isFavorite, (newVal) => {
  isFav.value = !!newVal
}, { immediate: true })

function goToProfile() {
  if (!props.character?.ownerId) return
  router.push(`/profiles/${props.character.ownerId}`)
}
</script>
