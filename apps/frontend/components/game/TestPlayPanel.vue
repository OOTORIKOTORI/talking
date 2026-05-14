<template>
  <div
    :class="[
      'test-play-scrollbar overflow-y-auto rounded-xl border border-emerald-300/35 bg-slate-950/80 text-[11px] text-emerald-50 shadow-2xl backdrop-blur-sm',
      isFullscreen ? 'w-[min(400px,92vw)] max-h-[70vh]' : 'w-[min(340px,80vw)] max-h-[50vh]'
    ]"
  >
    <div :class="['flex items-start justify-between gap-3 border-b border-emerald-200/15', isFullscreen ? 'px-3 py-2.5' : 'px-2.5 py-2']">
      <div class="space-y-1">
        <span class="inline-flex items-center rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-100">テストプレイ</span>
        <p class="text-[10px] text-emerald-100/70">作者本人の testPlay=1 のみ表示</p>
      </div>
      <button
        class="rounded border border-emerald-200/30 px-2 py-1 text-[10px] hover:bg-emerald-500/20"
        @click="emit('update:collapsed', !collapsed)"
      >
        {{ collapsed ? '展開' : '折りたたみ' }}
      </button>
    </div>

    <div v-if="!collapsed" :class="[isFullscreen ? 'space-y-2.5 px-3 py-3' : 'space-y-2 px-2.5 py-2.5']">
      <section :class="['rounded-lg border border-emerald-200/15 bg-black/20', isFullscreen ? 'p-2.5' : 'p-2']">
        <h4 class="text-[10px] font-semibold tracking-[0.16em] text-emerald-100/90">現在地</h4>
        <dl :class="['grid gap-1.5 sm:grid-cols-3', isFullscreen ? 'mt-2 gap-2' : 'mt-1.5']">
          <div :class="['rounded-md bg-white/5', isFullscreen ? 'px-2 py-1.5' : 'px-1.5 py-1']">
            <dt class="text-[10px] uppercase tracking-[0.12em] text-emerald-100/55">現在シーン</dt>
            <dd class="mt-1 text-[11px] text-emerald-50/95">{{ currentSceneLabel }}</dd>
          </div>
          <div :class="['rounded-md bg-white/5', isFullscreen ? 'px-2 py-1.5' : 'px-1.5 py-1']">
            <dt class="text-[10px] uppercase tracking-[0.12em] text-emerald-100/55">現在ノード</dt>
            <dd class="mt-1 text-[11px] text-emerald-50/95">{{ currentNodeLabel }}</dd>
          </div>
          <div :class="['rounded-md bg-white/5', isFullscreen ? 'px-2 py-1.5' : 'px-1.5 py-1']">
            <dt class="text-[10px] uppercase tracking-[0.12em] text-emerald-100/55">次ノード</dt>
            <dd class="mt-1 text-[11px] text-emerald-50/95">{{ nextNodeLabel }}</dd>
          </div>
        </dl>
      </section>

      <section :class="['rounded-lg border border-emerald-200/15 bg-black/20', isFullscreen ? 'p-2.5' : 'p-2']">
        <h4 class="text-[10px] font-semibold tracking-[0.16em] text-emerald-100/90">操作</h4>
        <div :class="['flex flex-wrap', isFullscreen ? 'mt-2 gap-2' : 'mt-1.5 gap-1.5']">
          <button
            :class="[
              'min-w-0 flex-1 rounded-lg border border-emerald-200/35 bg-emerald-400/20 text-[10px] font-semibold text-emerald-50 transition-colors hover:bg-emerald-400/28 sm:flex-none',
              isFullscreen ? 'px-2.5 py-2' : 'px-2 py-1.5'
            ]"
            @click="emit('skip-to-next-choice')"
          >
            選択肢までスキップ
          </button>
          <button
            :class="[
              'min-w-0 flex-1 rounded-lg border text-[10px] font-semibold transition-colors sm:flex-none',
              isFullscreen ? 'px-2.5 py-2' : 'px-2 py-1.5',
              fastConfirmMode ? 'border-amber-200/60 bg-amber-300/20 text-amber-50' : 'border-amber-200/25 bg-amber-300/10 text-amber-50 hover:bg-amber-300/16'
            ]"
            @click="emit('toggle-fast-confirm')"
          >
            {{ fastConfirmMode ? '高速確認中' : '高速確認 ON' }}
          </button>
          <button
            :class="[
              'min-w-0 flex-1 rounded-lg border border-cyan-200/25 bg-cyan-300/10 text-[10px] font-semibold text-cyan-50 transition-colors hover:bg-cyan-300/16 sm:flex-none',
              isFullscreen ? 'px-2.5 py-2' : 'px-2 py-1.5'
            ]"
            @click="emit('reveal-current-text')"
          >
            全文表示
          </button>
          <NuxtLink
            :to="returnToEditorTo"
            :class="[
              'min-w-0 flex-1 rounded-lg border border-slate-200/20 bg-white/5 text-center text-[10px] font-semibold text-emerald-50 transition-colors hover:bg-white/10 sm:flex-none',
              isFullscreen ? 'px-2.5 py-2' : 'px-2 py-1.5'
            ]"
          >
            編集へ戻る
          </NuxtLink>
        </div>
      </section>

      <section :class="['rounded-lg border border-emerald-200/15 bg-black/20', isFullscreen ? 'p-2.5' : 'p-2']">
        <h4 class="text-[10px] font-semibold tracking-[0.16em] text-emerald-100/90">ノード情報</h4>
        <div :class="['grid gap-1.5 sm:grid-cols-2', isFullscreen ? 'mt-2 gap-2' : 'mt-1.5']">
          <div :class="['rounded-md bg-white/5', isFullscreen ? 'px-2 py-1.5' : 'px-1.5 py-1']">
            <p class="text-[10px] uppercase tracking-[0.12em] text-emerald-100/55">選択肢数</p>
            <p class="mt-1 text-[11px] text-emerald-50/95">{{ choiceCount }}</p>
          </div>
          <div :class="['rounded-md bg-white/5', isFullscreen ? 'px-2 py-1.5' : 'px-1.5 py-1']">
            <p class="text-[10px] uppercase tracking-[0.12em] text-emerald-100/55">使用キャラクター</p>
            <p class="mt-1 text-[11px] text-emerald-50/95">{{ materialSummary.characterCount }} 人</p>
          </div>
          <div :class="['rounded-md bg-white/5 sm:col-span-2', isFullscreen ? 'px-2 py-1.5' : 'px-1.5 py-1']">
            <p class="text-[10px] uppercase tracking-[0.12em] text-emerald-100/55">選択肢遷移先</p>
            <p v-if="choiceTransitions.length === 0" class="mt-1 text-[11px] text-emerald-50/65">なし</p>
            <ul v-else class="mt-1 space-y-1">
              <li
                v-for="line in choiceTransitions"
                :key="line"
                class="rounded-md border border-emerald-200/10 bg-black/20 px-2 py-1.5 text-[11px] text-emerald-50/92"
              >
                {{ line }}
              </li>
            </ul>
          </div>
          <div :class="['rounded-md bg-white/5 sm:col-span-2', isFullscreen ? 'px-2 py-1.5' : 'px-1.5 py-1']">
            <p class="text-[10px] uppercase tracking-[0.12em] text-emerald-100/55">使用素材</p>
            <div class="mt-1 grid gap-1 text-[11px] text-emerald-50/92 sm:grid-cols-3">
              <p>BG: {{ materialSummary.bgAssetId }}</p>
              <p>BGM: {{ materialSummary.musicAssetId }}</p>
              <p>SFX: {{ materialSummary.sfxAssetId }}</p>
            </div>
          </div>
        </div>
      </section>

      <section :class="['rounded-lg border border-emerald-200/15 bg-black/20', isFullscreen ? 'p-2.5' : 'p-2']">
        <div :class="['flex items-center justify-between flex-wrap', isFullscreen ? 'gap-2' : 'gap-1.5']">
          <h4 class="text-[10px] font-semibold tracking-[0.16em] text-emerald-100/90">遷移ログ</h4>
          <div :class="['flex flex-wrap', isFullscreen ? 'gap-2' : 'gap-1.5']">
            <button
              :disabled="transitionLogs.length === 0"
              :class="[
                'rounded border text-[10px] px-2 py-1 transition-colors',
                transitionLogs.length === 0
                  ? 'border-emerald-200/15 text-emerald-50/50 cursor-not-allowed'
                  : 'border-emerald-200/25 text-emerald-50/90 hover:bg-emerald-500/20'
              ]"
              @click="emit('copy-transition-logs')"
              title="遷移ログをテキストでコピー"
            >
              コピー
            </button>
            <button
              :disabled="transitionLogs.length === 0"
              :class="[
                'rounded border text-[10px] px-2 py-1 transition-colors',
                transitionLogs.length === 0
                  ? 'border-emerald-200/15 text-emerald-50/50 cursor-not-allowed'
                  : 'border-emerald-200/25 text-emerald-50/90 hover:bg-emerald-500/20'
              ]"
              @click="emit('export-transition-logs-json')"
              title="遷移ログをJSONで保存"
            >
              JSON保存
            </button>
            <button
              :disabled="transitionLogs.length === 0"
              :class="[
                'rounded border text-[10px] px-2 py-1 transition-colors',
                transitionLogs.length === 0
                  ? 'border-emerald-200/15 text-emerald-50/50 cursor-not-allowed'
                  : 'border-emerald-200/25 text-emerald-50/90 hover:bg-emerald-500/20'
              ]"
              @click="emit('clear-transition-logs')"
            >
              ログクリア
            </button>
          </div>
        </div>
        <p :class="['text-[10px] text-emerald-100/60', isFullscreen ? 'mt-2' : 'mt-1.5']">最大30件をメモリ保持。最新ログは下に追加されます。</p>
        <p
          v-if="transitionLogs.length === 0"
          :class="[
            'rounded-md border border-dashed border-emerald-200/15 bg-black/15 text-[11px] text-emerald-50/65',
            isFullscreen ? 'mt-2 px-2 py-2' : 'mt-1.5 px-1.5 py-1.5'
          ]"
        >
          まだ遷移はありません
        </p>
        <ul
          v-else
          :class="[
            'test-play-scrollbar space-y-1 overflow-y-auto pr-1',
            isFullscreen ? 'mt-2 max-h-[clamp(9rem,18vh,14rem)]' : 'mt-1.5 max-h-[clamp(7rem,15vh,11rem)]'
          ]"
        >
          <li
            v-for="log in transitionLogs"
            :key="`${variant}-${log.seq}`"
            class="rounded-md border border-emerald-200/10 bg-black/25 px-2.5 py-2"
          >
            <div class="flex items-start gap-2">
              <span class="inline-flex shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-50/80">{{ log.kind }}</span>
              <p :title="log.toNodeId || undefined" class="min-w-0 flex-1 leading-tight text-emerald-50/95">{{ formatTransitionLogLine(log) }}</p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'

type TestPlayMaterialSummary = {
  characterCount: number
  bgAssetId: string
  musicAssetId: string
  sfxAssetId: string
}

type TestPlayTransitionLogEntry = {
  seq: number
  kind: 'start' | 'next' | 'choice' | 'end' | 'missing'
  fromNodeId: string | null
  toNodeId: string | null
  fromLabel: string
  toLabel: string
  choiceIndex?: number
  choicePreview?: string
  occurredAt: number
}

const props = withDefaults(defineProps<{
  variant: 'normal' | 'fullscreen'
  collapsed: boolean
  currentSceneLabel: string
  currentNodeLabel: string
  nextNodeLabel: string
  choiceCount: number
  fastConfirmMode: boolean
  materialSummary: TestPlayMaterialSummary
  choiceTransitions: string[]
  transitionLogs: TestPlayTransitionLogEntry[]
  returnToEditorTo: Record<string, any>
  formatTransitionLogLine: (log: TestPlayTransitionLogEntry) => string
}>(), {
  variant: 'normal',
})

const emit = defineEmits<{
  (e: 'skip-to-next-choice'): void
  (e: 'toggle-fast-confirm'): void
  (e: 'reveal-current-text'): void
  (e: 'copy-transition-logs'): void
  (e: 'export-transition-logs-json'): void
  (e: 'clear-transition-logs'): void
  (e: 'update:collapsed', value: boolean): void
}>()

const isFullscreen = computed(() => props.variant === 'fullscreen')

const {
  variant,
  collapsed,
  currentSceneLabel,
  currentNodeLabel,
  nextNodeLabel,
  choiceCount,
  fastConfirmMode,
  materialSummary,
  choiceTransitions,
  transitionLogs,
  returnToEditorTo,
  formatTransitionLogLine,
} = toRefs(props)
</script>

<style scoped>
.test-play-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(45, 212, 191, 0.42) rgba(15, 23, 42, 0.22);
}

.test-play-scrollbar::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.test-play-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.2);
  border-radius: 9999px;
}

.test-play-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(45, 212, 191, 0.38);
  border: 2px solid transparent;
  border-radius: 9999px;
  background-clip: padding-box;
}

.test-play-scrollbar:hover::-webkit-scrollbar-thumb {
  background: rgba(45, 212, 191, 0.58);
  background-clip: padding-box;
}
</style>
