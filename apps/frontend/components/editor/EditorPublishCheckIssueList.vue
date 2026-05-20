<script setup lang="ts">
/**
 * EditorPublishCheckIssueList
 *
 * 公開前チェックパネルの issue 一覧表示を担当する共通コンポーネント。
 * 通常表示・全画面表示の両方で同一インスタンスを使用し、テンプレート重複を解消する。
 *
 * 担当範囲:
 *   - issue 総数0件時の「問題は見つかりませんでした。」表示
 *   - フィルター結果0件時の「この条件のチェック項目はありません。」表示
 *   - 表示中件数サマリー行（表示中 N件 / 全 M件）
 *   - info 項目折りたたみ表示（情報N件 / 情報を表示 / 情報を折りたたむ）
 *   - issue カード一覧（severity / category / 対象へ移動 / message / location / field / nodePreview / highlight ring）
 *
 * edit.vue 側が保持する責務:
 *   - scenario check API 処理
 *   - scenarioCheckFilter / scenarioCategoryFilter / scenarioCheckInfoOpen 状態管理
 *   - issue 算出 computed
 *   - focusScenarioIssue / setScenarioIssueCardRef
 *
 * フィルターボタン UI は EditorPublishCheckFilters.vue が担当。
 * 外枠・配置は EditorPublishCheckPanel.vue が担当。
 */
import { computed } from 'vue'
import type { ScenarioCheckIssue, ScenarioCheckSeverity } from '@/utils/scenarioCheck'

const props = defineProps<{
  totalCount: number
  filteredIssues: any[]
  filteredInfoIssues: any[]
  visibleIssues: any[]
  scenarioCheckFilter: 'all' | ScenarioCheckSeverity
  scenarioCheckInfoOpen: boolean
  highlightedIssueId: string | null
  scenarioSeverityLabel: (severity: ScenarioCheckSeverity) => string
  scenarioSeverityClass: (severity: ScenarioCheckSeverity) => string
  issueCategoryLabel: (issue: any) => string
  issueCategoryClass: (issue: any) => string
  scenarioIssueLocation: (issue: ScenarioCheckIssue) => string
}>()

const emit = defineEmits<{
  'toggle-info-open': []
  'focus-issue': [issue: ScenarioCheckIssue]
  'set-issue-card-ref': [issueId: string, el: Element | null]
}>()

const displayCountSummary = computed(() => {
  const visible = props.visibleIssues.length
  const total = props.totalCount
  if (visible === total) return `全 ${total}件`
  return `表示中 ${visible}件 / 全 ${total}件`
})

const infoCollapsedNote = computed(() => {
  if (
    props.scenarioCheckFilter === 'all' &&
    props.filteredInfoIssues.length > 0 &&
    !props.scenarioCheckInfoOpen
  ) {
    return `情報 ${props.filteredInfoIssues.length}件は折りたたみ中`
  }
  return null
})
</script>

<template>
  <div id="publish-check-issues">
    <div
      v-if="totalCount === 0"
      class="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
    >
      問題は見つかりませんでした。
    </div>
    <div
      v-else-if="filteredIssues.length === 0"
      class="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
    >
      この条件のチェック項目はありません。
    </div>
    <div v-else class="space-y-2">
      <!-- 表示中件数サマリー -->
      <div class="flex items-center justify-between text-[11px] text-slate-500">
        <span>{{ displayCountSummary }}</span>
        <span v-if="infoCollapsedNote" class="text-slate-400">{{ infoCollapsedNote }}</span>
      </div>
      <!-- 情報折りたたみトグル -->
      <div
        v-if="scenarioCheckFilter === 'all' && filteredInfoIssues.length > 0"
        class="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
      >
        <span>情報 {{ filteredInfoIssues.length }}件</span>
        <button
          type="button"
          class="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-100"
          @click="emit('toggle-info-open')"
        >
          {{ scenarioCheckInfoOpen ? '情報を折りたたむ' : '情報を表示' }}
        </button>
      </div>
      <!-- 情報折りたたみ中メッセージ -->
      <div
        v-if="visibleIssues.length === 0"
        class="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
      >
        情報項目は折りたたまれています。必要なら「情報を表示」を押してください。
      </div>
      <!-- issue カード一覧（スクロール上限付き） -->
      <div v-else class="max-h-[360px] space-y-2 overflow-y-auto pr-1">
        <article
          v-for="issue in visibleIssues"
          :key="issue.id"
          :ref="(el) => emit('set-issue-card-ref', issue.id, el as Element | null)"
          class="rounded border px-3 py-2.5 text-xs"
          :class="[
            scenarioSeverityClass(issue.severity),
            highlightedIssueId === issue.id
              ? 'ring-2 ring-sky-400 border-sky-500 bg-sky-50/60'
              : ''
          ]"
        >
          <div class="mb-1.5 flex items-center justify-between gap-2">
            <div class="flex min-w-0 items-center gap-1.5">
              <span class="shrink-0 font-semibold">{{ scenarioSeverityLabel(issue.severity) }}</span>
              <span class="shrink-0 text-gray-400">·</span>
              <span class="truncate" :class="issueCategoryClass(issue)">{{ issueCategoryLabel(issue) }}</span>
            </div>
            <button
              v-if="issue.sceneId && issue.nodeId"
              type="button"
              class="shrink-0 rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700 hover:bg-blue-100"
              @click="emit('focus-issue', issue)"
            >
              対象へ移動
            </button>
          </div>
          <p class="leading-relaxed text-gray-800">{{ issue.message }}</p>
          <p class="mt-1 text-[11px] text-gray-500">{{ scenarioIssueLocation(issue) }}</p>
          <p v-if="issue.field" class="mt-0.5 text-[11px] text-gray-500">対象項目: {{ issue.field }}</p>
          <p v-if="issue.nodePreview" class="mt-0.5 text-[11px] text-gray-400">{{ issue.nodePreview }}</p>
        </article>
      </div>
    </div>
  </div>
</template>
