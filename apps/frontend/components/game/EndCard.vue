<template>
  <section class="rounded-3xl border border-white/15 bg-slate-950/95 p-4 sm:p-6 text-slate-100 shadow-2xl">
    <div class="space-y-3 text-center">
      <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">End Card</p>
      <h2 class="text-xl font-bold tracking-wide sm:text-2xl">読了ありがとう！</h2>
      <div class="space-y-0.5 text-xs sm:text-sm text-slate-300">
        <p class="font-medium text-slate-100">{{ gameTitle || '（タイトルなし）' }}</p>
        <p>
          作者:
          <span class="font-medium text-slate-100">{{ creatorLabel || 'unknown' }}</span>
        </p>
      </div>
      <p class="text-xs sm:text-sm leading-5 text-slate-300">
        ここからは、作品詳細・プロフィール・クレジット・公開ゲーム一覧へ回れます。
      </p>
    </div>

    <div class="mt-4 flex flex-col gap-2">
      <button
        type="button"
        class="rounded-lg bg-emerald-500 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 w-full"
        @click="$emit('restart')"
      >
        もう一度遊ぶ
      </button>
      <button
        type="button"
        class="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-white/10 w-full"
        @click="$emit('goDetail')"
      >
        作品詳細へ戻る
      </button>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          v-if="ownerId"
          type="button"
          class="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-white/10"
          @click="$emit('goProfile')"
        >
          作者プロフィール
        </button>
        <button
          v-if="showStaffRoll"
          type="button"
          class="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-white/10"
          @click="$emit('openCredits')"
        >
          クレジットを見る
        </button>
        <NuxtLink
          v-else
          :to="creditsTo"
          class="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-center text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-white/10 col-span-1"
        >
          クレジットを見る
        </NuxtLink>
      </div>
      <button
        type="button"
        class="rounded-lg border border-sky-400/40 bg-sky-500/15 px-3 py-2 text-xs sm:text-sm font-semibold text-sky-100 transition-colors hover:bg-sky-500/25 w-full"
        @click="$emit('goExplore')"
      >
        公開ゲームを探す
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  gameTitle?: string
  creatorLabel?: string
  ownerId?: string | null
  showStaffRoll?: boolean
  creditsTo?: string
}

withDefaults(defineProps<Props>(), {
  gameTitle: '',
  creatorLabel: '',
  ownerId: null,
  showStaffRoll: true,
  creditsTo: '',
})

defineEmits<{
  restart: []
  openCredits: []
  goDetail: []
  goProfile: []
  goExplore: []
}>()
</script>
