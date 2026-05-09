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
        </header>

        <div class="max-h-[calc(88vh-86px)] overflow-y-auto px-5 py-5">
          <div v-if="loading" class="rounded-lg border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-slate-300">
            スタッフロールを読み込み中...
          </div>

          <div v-else-if="error" class="space-y-3 rounded-lg border border-red-300/40 bg-red-950/40 px-4 py-4">
            <p class="text-sm text-red-100">{{ error }}</p>
            <button
              type="button"
              class="rounded border border-red-300/60 bg-red-900/40 px-3 py-1.5 text-xs text-red-100 hover:bg-red-900/60"
              @click="$emit('retry')"
            >
              再読み込み
            </button>
          </div>

          <div v-else-if="credits && credits.counts.total === 0" class="rounded-lg border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-slate-300">
            クレジットはありません
          </div>

          <div v-else-if="credits" class="space-y-8 pb-2">
            <section class="space-y-3">
              <h3 class="text-sm font-semibold tracking-wider text-slate-300">手動クレジット</h3>
              <p v-if="credits.manualCredits.length === 0" class="text-sm text-slate-500">該当なし</p>
              <ul v-else class="space-y-3">
                <li
                  v-for="item in credits.manualCredits"
                  :key="item.id"
                  class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <p class="text-sm font-medium text-slate-100 break-words">{{ item.label }}</p>
                  <p v-if="item.manualRole" class="mt-1 text-xs text-slate-300">{{ item.manualRole }}</p>
                  <p v-if="item.manualNote" class="mt-1.5 whitespace-pre-wrap break-words text-xs text-slate-200">{{ item.manualNote }}</p>
                  <p v-if="item.manualUrl" class="mt-1.5 text-xs break-all">
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
              <h3 class="text-sm font-semibold tracking-wider text-slate-300">使用素材</h3>
              <p v-if="credits.assetCredits.length === 0" class="text-sm text-slate-500">該当なし</p>
              <ul v-else class="space-y-3">
                <li
                  v-for="item in credits.assetCredits"
                  :key="item.assetId"
                  class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="text-sm font-medium text-slate-100 break-words">{{ item.title }}</p>
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
                  <p v-if="item.usageTerms" class="mt-1 whitespace-pre-wrap break-words text-xs text-slate-200">{{ item.usageTerms }}</p>
                  <p class="mt-1 text-[11px] text-slate-400">使用数: {{ item.usageCount }}</p>
                </li>
              </ul>
            </section>

            <section class="space-y-3">
              <h3 class="text-sm font-semibold tracking-wider text-slate-300">使用キャラクター</h3>
              <p v-if="credits.characterCredits.length === 0" class="text-sm text-slate-500">該当なし</p>
              <ul v-else class="space-y-3">
                <li
                  v-for="item in credits.characterCredits"
                  :key="item.characterId"
                  class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="text-sm font-medium text-slate-100 break-words">{{ item.displayName || item.name }}</p>
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
                  <p v-if="item.usageTerms" class="mt-1 whitespace-pre-wrap break-words text-xs text-slate-200">{{ item.usageTerms }}</p>
                  <p class="mt-1 text-[11px] text-slate-400">使用数: {{ item.usageCount }}</p>
                </li>
              </ul>
            </section>
          </div>
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

function emitClose() {
  emit('close')
}

function isHttpUrl(value: string | null | undefined): boolean {
  if (!value) return false
  return /^https?:\/\//i.test(value)
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
      window.addEventListener('keydown', onWindowKeydown)
      return
    }
    window.removeEventListener('keydown', onWindowKeydown)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (!process.client) return
  window.removeEventListener('keydown', onWindowKeydown)
})
</script>
