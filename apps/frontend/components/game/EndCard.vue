<template>
  <section class="rounded-3xl border border-white/15 bg-slate-950/95 p-5 text-slate-100 shadow-2xl sm:p-8">
    <div class="space-y-4 text-center">
      <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">End Card</p>
      <h2 class="text-2xl font-bold tracking-wide sm:text-3xl">読了ありがとう！</h2>
      <div class="space-y-1 text-sm text-slate-300">
        <p class="font-medium text-slate-100">{{ gameTitle || '（タイトルなし）' }}</p>
        <p>
          作者:
          <span class="font-medium text-slate-100">{{ creatorLabel || 'unknown' }}</span>
        </p>
      </div>
      <p class="text-sm leading-6 text-slate-300">
        ここからは、作品詳細・プロフィール・クレジット・公開ゲーム一覧へ回れます。
      </p>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        type="button"
        class="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
        @click="$emit('restart')"
      >
        もう一度遊ぶ
      </button>
      <button
        type="button"
        class="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        @click="$emit('goDetail')"
      >
        作品詳細へ戻る
      </button>
      <button
        v-if="ownerId"
        type="button"
        class="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        @click="$emit('goProfile')"
      >
        作者プロフィールを見る
      </button>
      <button
        v-if="showStaffRoll"
        type="button"
        class="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        @click="$emit('openCredits')"
      >
        クレジットを見る
      </button>
      <NuxtLink
        v-else
        :to="creditsTo"
        class="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:col-span-2"
      >
        クレジットを見る
      </NuxtLink>
      <button
        type="button"
        class="rounded-xl border border-sky-400/40 bg-sky-500/15 px-4 py-3 text-sm font-semibold text-sky-100 transition-colors hover:bg-sky-500/25 sm:col-span-2"
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
