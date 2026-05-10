<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[230] flex items-center justify-center bg-black/75 p-4"
      @click="emitClose"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="スタッフロール"
        class="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-xl border border-white/15 bg-slate-950 text-slate-100 shadow-2xl"
        @click.stop
      >
        <header class="border-b border-white/10 px-5 py-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-xl font-semibold tracking-wide">スタッフロール</h2>
              <p v-if="gameTitle" class="mt-1 text-sm text-slate-300">{{ gameTitle }}</p>
              <div class="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span
                  class="inline-flex items-center rounded-full border px-2.5 py-1 tracking-wide"
                  :class="playbackStatusClass"
                >
                  {{ playbackStatusLabel }}
                </span>
                <span class="text-slate-400">ホイール / タッチ操作で一時停止</span>
              </div>
            </div>
            <button
              type="button"
              class="inline-flex h-9 min-w-9 items-center justify-center rounded border border-white/20 px-2 text-sm hover:bg-white/10"
              aria-label="閉じる"
              @click="emitClose"
            >
              閉じる
            </button>
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="rounded border border-white/20 px-3 py-1.5 text-xs text-slate-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              :aria-pressed="isAutoScrolling"
              :disabled="!canAutoScroll"
              @click="toggleAutoScroll"
            >
              {{ isAutoScrolling ? '停止' : '再開' }}
            </button>
            <button
              type="button"
              class="rounded border border-white/20 px-3 py-1.5 text-xs text-slate-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!canAutoScroll"
              @click="scrollToTop"
            >
              先頭へ
            </button>
          </div>
        </header>

        <div class="relative">
          <div
            ref="scrollContainerRef"
            class="max-h-[calc(88vh-146px)] overflow-y-auto px-5 py-5"
            :class="isAutoScrolling ? 'staff-roll-scroll-hidden' : ''"
            @scroll.passive="onContainerScroll"
            @wheel.passive="onManualScrollIntent"
            @touchstart.passive="onManualScrollIntent"
            @pointerdown="onManualScrollIntent"
          >
            <div
              ref="creditsTrackRef"
              class="staff-roll-track"
              :style="creditsTrackStyle"
            >
              <div v-if="loading" class="mx-auto max-w-xl rounded-lg border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-slate-300">
                スタッフロールを読み込み中...
              </div>

              <div v-else-if="error" class="mx-auto max-w-xl space-y-3 rounded-lg border border-red-300/40 bg-red-950/40 px-4 py-4">
                <p class="text-sm text-red-100">{{ error }}</p>
                <button
                  type="button"
                  class="rounded border border-red-300/60 bg-red-900/40 px-3 py-1.5 text-xs text-red-100 hover:bg-red-900/60"
                  @click="$emit('retry')"
                >
                  再読み込み
                </button>
              </div>

              <div v-else-if="credits && credits.counts.total === 0" class="mx-auto max-w-xl rounded-lg border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-slate-300">
                クレジットはありません
              </div>

              <div v-else-if="credits" class="mx-auto w-full max-w-3xl space-y-10 text-center">
                <div class="min-h-[12vh]" aria-hidden="true" />

                <section class="space-y-3">
                  <h3 class="pt-1 text-center text-[11px] font-semibold tracking-[0.24em] text-slate-400">手動クレジット</h3>
                  <p v-if="credits.manualCredits.length === 0" class="text-sm text-slate-500">該当なし</p>
                  <ul v-else class="space-y-3">
                    <li
                      v-for="item in credits.manualCredits"
                      :key="item.id"
                      class="border-b border-white/10 px-1 pb-3"
                    >
                      <p class="mx-auto max-w-xl text-sm font-medium text-slate-100 break-words">{{ item.label }}</p>
                      <p v-if="item.manualRole" class="mt-1 text-xs text-slate-300">{{ item.manualRole }}</p>
                      <p v-if="item.manualNote" class="mx-auto mt-1.5 max-w-xl whitespace-pre-wrap break-words text-left text-xs text-slate-200">{{ item.manualNote }}</p>
                      <p v-if="item.manualUrl" class="mx-auto mt-1.5 max-w-xl text-left text-xs break-all">
                        <a
                          v-if="isHttpUrl(item.manualUrl)"
                          :href="item.manualUrl"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-sky-300 underline-offset-2 hover:underline"
                        >
                          {{ item.manualUrl }}
                        </a>
                        <span v-else class="text-slate-400">{{ item.manualUrl }}</span>
                      </p>
                    </li>
                  </ul>
                </section>

                <section class="space-y-3">
                  <h3 class="pt-1 text-center text-[11px] font-semibold tracking-[0.24em] text-slate-400">使用素材</h3>
                  <p v-if="credits.assetCredits.length === 0" class="text-sm text-slate-500">該当なし</p>
                  <ul v-else class="space-y-3">
                    <li
                      v-for="item in credits.assetCredits"
                      :key="item.assetId"
                      class="border-b border-white/10 px-1 pb-3"
                    >
                      <div class="flex flex-wrap items-center justify-center gap-2">
                        <p class="max-w-xl text-sm font-medium text-slate-100 break-words">{{ item.title }}</p>
                        <span
                          v-if="item.creditRequired"
                          class="rounded-full border border-amber-200/50 bg-amber-200/20 px-2 py-0.5 text-[11px] text-amber-100"
                        >
                          クレジット必須
                        </span>
                      </div>
                      <p class="mt-1 text-xs text-slate-300">
                        by {{ item.ownerDisplayName || item.ownerId || 'unknown' }}
                      </p>
                      <p v-if="item.usageTerms" class="mx-auto mt-1 max-w-xl whitespace-pre-wrap break-words text-left text-xs text-slate-200">{{ item.usageTerms }}</p>
                      <p class="mt-1 text-[11px] text-slate-400">使用数: {{ item.usageCount }}</p>
                    </li>
                  </ul>
                </section>

                <section class="space-y-3">
                  <h3 class="pt-1 text-center text-[11px] font-semibold tracking-[0.24em] text-slate-400">使用キャラクター</h3>
                  <p v-if="credits.characterCredits.length === 0" class="text-sm text-slate-500">該当なし</p>
                  <ul v-else class="space-y-3">
                    <li
                      v-for="item in credits.characterCredits"
                      :key="item.characterId"
                      class="border-b border-white/10 px-1 pb-3"
                    >
                      <div class="flex flex-wrap items-center justify-center gap-2">
                        <p class="max-w-xl text-sm font-medium text-slate-100 break-words">{{ item.displayName || item.name }}</p>
                        <span
                          v-if="item.creditRequired"
                          class="rounded-full border border-amber-200/50 bg-amber-200/20 px-2 py-0.5 text-[11px] text-amber-100"
                        >
                          クレジット必須
                        </span>
                      </div>
                      <p class="mt-1 text-xs text-slate-300">
                        by {{ item.ownerDisplayName || item.ownerId || 'unknown' }}
                      </p>
                      <p v-if="item.usageTerms" class="mx-auto mt-1 max-w-xl whitespace-pre-wrap break-words text-left text-xs text-slate-200">{{ item.usageTerms }}</p>
                      <p class="mt-1 text-[11px] text-slate-400">使用数: {{ item.usageCount }}</p>
                    </li>
                  </ul>
                </section>

                <div class="min-h-[20vh]" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div
            v-if="canAutoScroll"
            class="staff-roll-fade-top pointer-events-none absolute inset-x-5 top-0 h-14"
            aria-hidden="true"
          />
          <div
            v-if="canAutoScroll"
            class="staff-roll-fade-bottom pointer-events-none absolute inset-x-5 bottom-0 h-16"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { GameCreditsResult } from '@talking/types'

interface Props {
  isOpen: boolean
  gameTitle?: string
  credits: GameCreditsResult | null
  loading?: boolean
  error?: string | null
  speedPreset?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  gameTitle: '',
  loading: false,
  error: null,
})

const emit = defineEmits<{
  close: []
  retry: []
}>()

type StaffRollSpeedPreset = 'slow' | 'normal' | 'fast'
function normalizeStaffRollSpeedPreset(value: unknown): StaffRollSpeedPreset {
  return value === 'slow' || value === 'fast' || value === 'normal' ? value : 'normal'
}
const autoScrollSpeedPxPerSec = computed(() => {
  const preset = normalizeStaffRollSpeedPreset(props.speedPreset)
  if (preset === 'slow') return 28
  if (preset === 'fast') return 64
  return 42
})

type PlaybackStatus = 'paused' | 'ended'

const scrollContainerRef = ref<HTMLElement | null>(null)
const creditsTrackRef = ref<HTMLElement | null>(null)
const isAutoScrolling = ref(false)
const shouldResetScrollOnReady = ref(false)
const autoScrollOffset = ref(0)
const playbackStatus = ref<PlaybackStatus>('paused')

let animationFrameId: number | null = null
let lastFrameTime = 0

const canAutoScroll = computed(() => {
  if (!props.isOpen) return false
  if (props.loading) return false
  if (props.error) return false
  return Boolean(props.credits && props.credits.counts.total > 0)
})

const playbackStatusLabel = computed(() => {
  if (isAutoScrolling.value) return '上映中'
  return playbackStatus.value === 'ended' ? '終了' : '一時停止中'
})

const playbackStatusClass = computed(() => {
  if (isAutoScrolling.value) {
    return 'border-emerald-300/40 bg-emerald-300/15 text-emerald-100'
  }
  if (playbackStatus.value === 'ended') {
    return 'border-sky-300/40 bg-sky-300/15 text-sky-100'
  }
  return 'border-amber-200/40 bg-amber-200/15 text-amber-100'
})

const creditsTrackStyle = computed(() => {
  if (!isAutoScrolling.value) return undefined
  return {
    transform: `translate3d(0, -${autoScrollOffset.value}px, 0)`,
  }
})

function emitClose() {
  emit('close')
}

function isHttpUrl(value: string | null | undefined): boolean {
  if (!value) return false
  return /^https?:\/\//i.test(value)
}

function cleanupAnimationFrame() {
  if (animationFrameId === null) return
  cancelAnimationFrame(animationFrameId)
  animationFrameId = null
}

function getMaxOffset(): number {
  const container = scrollContainerRef.value
  const track = creditsTrackRef.value
  if (!container || !track) return 0
  return Math.max(track.scrollHeight - container.clientHeight, 0)
}

function stopAutoScroll(options: { preservePosition?: boolean; ended?: boolean } = {}) {
  cleanupAnimationFrame()

  if (options.preservePosition) {
    const container = scrollContainerRef.value
    if (container) {
      const maxOffset = getMaxOffset()
      container.scrollTop = Math.min(autoScrollOffset.value, maxOffset)
    }
  }

  isAutoScrolling.value = false
  lastFrameTime = 0
  playbackStatus.value = options.ended ? 'ended' : 'paused'
}

function runAutoScrollFrame(timestamp: number) {
  if (!isAutoScrolling.value) return

  const container = scrollContainerRef.value
  const track = creditsTrackRef.value
  if (!container || !track) {
    stopAutoScroll()
    return
  }

  if (lastFrameTime === 0) {
    lastFrameTime = timestamp
  }

  const deltaSeconds = (timestamp - lastFrameTime) / 1000
  lastFrameTime = timestamp

  const maxOffset = getMaxOffset()
  if (maxOffset <= 0) {
    stopAutoScroll({ ended: true })
    return
  }

  autoScrollOffset.value = Math.min(
    autoScrollOffset.value + autoScrollSpeedPxPerSec.value * deltaSeconds,
    maxOffset,
  )

  if (autoScrollOffset.value >= maxOffset - 0.25) {
    stopAutoScroll({ preservePosition: true, ended: true })
    return
  }

  animationFrameId = requestAnimationFrame(runAutoScrollFrame)
}

function startAutoScroll(options: { restartFromTop?: boolean } = {}) {
  if (!canAutoScroll.value) return
  if (isAutoScrolling.value) return

  const container = scrollContainerRef.value
  if (!container) return

  const maxOffset = getMaxOffset()
  if (maxOffset <= 0) {
    playbackStatus.value = 'ended'
    return
  }

  if (options.restartFromTop) {
    autoScrollOffset.value = 0
    container.scrollTop = 0
  } else {
    autoScrollOffset.value = Math.min(container.scrollTop, maxOffset)
    container.scrollTop = 0
  }

  cleanupAnimationFrame()
  isAutoScrolling.value = true
  playbackStatus.value = 'paused'
  lastFrameTime = 0
  animationFrameId = requestAnimationFrame(runAutoScrollFrame)
}

function scrollToTop() {
  const container = scrollContainerRef.value
  if (!container) return
  container.scrollTop = 0
  autoScrollOffset.value = 0
  startAutoScroll({ restartFromTop: true })
}

function toggleAutoScroll() {
  if (isAutoScrolling.value) {
    stopAutoScroll({ preservePosition: true })
    return
  }

  const maxOffset = getMaxOffset()
  if (maxOffset > 0 && autoScrollOffset.value >= maxOffset - 0.25) {
    scrollToTop()
    return
  }

  startAutoScroll()
}

function onManualScrollIntent() {
  if (!isAutoScrolling.value) return
  stopAutoScroll({ preservePosition: true })
}

function onContainerScroll() {
  if (isAutoScrolling.value) return
  const container = scrollContainerRef.value
  if (!container) return
  autoScrollOffset.value = container.scrollTop

  const maxOffset = getMaxOffset()
  if (maxOffset > 0 && container.scrollTop >= maxOffset - 0.5) {
    playbackStatus.value = 'ended'
    return
  }

  playbackStatus.value = 'paused'
}

async function resetAndStartAutoScroll() {
  if (!canAutoScroll.value) return
  await nextTick()
  const container = scrollContainerRef.value
  if (!container) return
  container.scrollTop = 0
  autoScrollOffset.value = 0
  playbackStatus.value = 'paused'
  startAutoScroll({ restartFromTop: true })
}

function onWindowKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  emitClose()
}

watch(
  () => props.isOpen,
  (open) => {
    if (!process.client) return
    if (open) {
      shouldResetScrollOnReady.value = true
      window.addEventListener('keydown', onWindowKeydown)
      if (canAutoScroll.value) {
        shouldResetScrollOnReady.value = false
        void resetAndStartAutoScroll()
      }
      return
    }
    window.removeEventListener('keydown', onWindowKeydown)
    shouldResetScrollOnReady.value = false
    stopAutoScroll()
    autoScrollOffset.value = 0
  },
  { immediate: true },
)

watch(
  canAutoScroll,
  (ready) => {
    if (!ready) {
      stopAutoScroll()
      autoScrollOffset.value = 0
      return
    }
    if (!props.isOpen) return
    if (!shouldResetScrollOnReady.value) return
    shouldResetScrollOnReady.value = false
    void resetAndStartAutoScroll()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (!process.client) return
  window.removeEventListener('keydown', onWindowKeydown)
  stopAutoScroll()
})
</script>

<style scoped>
.staff-roll-track {
  will-change: transform;
}

.staff-roll-scroll-hidden {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.staff-roll-scroll-hidden::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.staff-roll-fade-top {
  background: linear-gradient(to bottom, rgba(2, 6, 23, 0.96), rgba(2, 6, 23, 0));
}

.staff-roll-fade-bottom {
  background: linear-gradient(to top, rgba(2, 6, 23, 0.96), rgba(2, 6, 23, 0));
}
</style>
