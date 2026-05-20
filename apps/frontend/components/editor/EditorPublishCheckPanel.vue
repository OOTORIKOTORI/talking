<script setup lang="ts">
/**
 * EditorPublishCheckPanel
 *
 * 公開前チェックセクションの外枠・見出し・折りたたみ・件数チップ・参照診断中/エラー表示を担当するコンポーネント。
 * 内部で EditorPublishCheckSummaryCard / EditorPublishCheckFilters / EditorPublishCheckIssueList を配置する。
 *
 * 担当範囲:
 *   - 外枠カード（mb-4 rounded-lg border border-gray-200 bg-gray-50）
 *   - ヘッダー（見出し・説明文・折りたたみ/展開ボタン）
 *   - 常時表示の件数チップ（エラー/警告/情報）
 *   - referenceDiagnosticsLoading の「素材・キャラクター参照を確認中...」表示
 *   - referenceDiagnosticsError の表示
 *   - open 時の中身（SummaryCard / Filters / IssueList）
 *
 * edit.vue 側が保持する責務:
 *   - scenario check API 処理
 *   - reference diagnostics API 処理
 *   - issue 算出 computed（scenarioCheckIssues / scenarioCheckFilteredIssues 等）
 *   - filter state（scenarioCheckFilter / scenarioCategoryFilter / scenarioCheckInfoOpen）
 *   - sectionOpen.scenarioCheck の実体
 *   - focusScenarioIssue / setScenarioIssueCardRef の実体
 */
import type { ScenarioCheckIssue, ScenarioCheckSeverity } from '@/utils/scenarioCheck'
import type { PrepublishIssueCategory } from '@talking/types'
import EditorPublishCheckSummaryCard from '@/components/editor/EditorPublishCheckSummaryCard.vue'
import EditorPublishCheckFilters from '@/components/editor/EditorPublishCheckFilters.vue'
import EditorPublishCheckIssueList from '@/components/editor/EditorPublishCheckIssueList.vue'

type ScenarioCheckFilter = 'all' | ScenarioCheckSeverity
type ScenarioCategoryFilter = 'all' | PrepublishIssueCategory

type FilterItem = {
  key: ScenarioCheckFilter
  label: string
  count: number
}

type CategoryFilterItem = {
  key: ScenarioCategoryFilter
  label: string
  count: number
  displayLabel: string
}

const props = defineProps<{
  open: boolean

  counts: { error: number; warning: number; info: number }
  totalCount: number
  categoryCounts: { structure: number; assetReference: number; characterReference: number }
  issues: Array<{ id: string; severity: string; message: string }>

  referenceDiagnosticsLoading: boolean
  referenceDiagnosticsError: string | null

  filterItems: FilterItem[]
  categoryFilterItems: CategoryFilterItem[]
  scenarioCheckFilter: ScenarioCheckFilter
  scenarioCategoryFilter: ScenarioCategoryFilter

  filteredIssues: any[]
  filteredInfoIssues: any[]
  visibleIssues: any[]
  scenarioCheckInfoOpen: boolean
  highlightedIssueId: string | null

  scenarioSeverityLabel: (severity: ScenarioCheckSeverity) => string
  scenarioSeverityClass: (severity: ScenarioCheckSeverity) => string
  issueCategoryLabel: (issue: any) => string
  issueCategoryClass: (issue: any) => string
  scenarioIssueLocation: (issue: ScenarioCheckIssue) => string
}>()

const emit = defineEmits<{
  'toggle-open': []
  'select-check-filter': [filter: ScenarioCheckFilter]
  'select-category-filter': [key: ScenarioCategoryFilter]
  'toggle-info-open': []
  'focus-issue': [issue: ScenarioCheckIssue]
  'set-issue-card-ref': [issueId: string, el: Element | null]
}>()
</script>

<template>
  <div class="mb-4 rounded-lg border border-gray-200 bg-gray-50">
    <div class="flex items-center justify-between gap-2 border-b border-gray-200 px-3 py-2">
      <div>
        <div class="font-semibold text-sm">公開前チェック</div>
        <div class="text-[11px] text-gray-500">ゲーム構成・素材参照・キャラクター参照を確認します。警告は公開をブロックしません。</div>
      </div>
      <button
        type="button"
        class="flex items-center gap-1 rounded border px-2 py-1 text-xs transition-colors"
        :class="open ? 'border-gray-400 bg-gray-100 text-gray-800' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'"
        @click="emit('toggle-open')"
      >
        {{ open ? '折りたたむ' : '展開' }}
        <span class="text-gray-400 transition-transform duration-150" :class="open ? 'rotate-180' : ''">▾</span>
      </button>
    </div>
    <div class="px-3 py-2">
      <div class="flex flex-wrap gap-2 text-xs">
        <span class="rounded border border-red-200 bg-red-50 px-2 py-1 font-semibold text-red-700">エラー {{ counts.error }}件</span>
        <span class="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700">警告 {{ counts.warning }}件</span>
        <span class="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">情報 {{ counts.info }}件</span>
      </div>
      <div v-if="referenceDiagnosticsLoading" class="mt-2 flex items-center gap-1 text-xs text-slate-500">
        <span class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500"></span>
        素材・キャラクター参照を確認中...
      </div>
      <div v-else-if="referenceDiagnosticsError" class="mt-2 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700">
        {{ referenceDiagnosticsError }} — 時間をおいて再読み込みしてください。
      </div>
    </div>
    <div v-if="open" class="border-t border-gray-200 px-3 py-2">
      <EditorPublishCheckSummaryCard
        :counts="counts"
        :total-count="totalCount"
        :category-counts="categoryCounts"
        :issues="issues"
        :reference-diagnostics-loading="referenceDiagnosticsLoading"
        :reference-diagnostics-error="referenceDiagnosticsError"
      />
      <EditorPublishCheckFilters
        :filter-items="filterItems"
        :category-filter-items="categoryFilterItems"
        :scenario-check-filter="scenarioCheckFilter"
        :scenario-category-filter="scenarioCategoryFilter"
        @select-check-filter="emit('select-check-filter', $event)"
        @select-category-filter="emit('select-category-filter', $event)"
      />
      <EditorPublishCheckIssueList
        :total-count="totalCount"
        :filtered-issues="filteredIssues"
        :filtered-info-issues="filteredInfoIssues"
        :visible-issues="visibleIssues"
        :scenario-check-filter="scenarioCheckFilter"
        :scenario-check-info-open="scenarioCheckInfoOpen"
        :highlighted-issue-id="highlightedIssueId"
        :scenario-severity-label="scenarioSeverityLabel"
        :scenario-severity-class="scenarioSeverityClass"
        :issue-category-label="issueCategoryLabel"
        :issue-category-class="issueCategoryClass"
        :scenario-issue-location="scenarioIssueLocation"
        @toggle-info-open="emit('toggle-info-open')"
        @focus-issue="emit('focus-issue', $event)"
        @set-issue-card-ref="(issueId, el) => emit('set-issue-card-ref', issueId, el)"
      />
    </div>
  </div>
</template>
