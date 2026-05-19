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
      <div
        v-if="visibleIssues.length === 0"
        class="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
      >
        情報項目は折りたたまれています。必要なら「情報を表示」を押してください。
      </div>
      <div v-else class="space-y-2 max-h-64 overflow-y-auto pr-1">
        <article
          v-for="issue in visibleIssues"
          :key="issue.id"
          :ref="(el) => emit('set-issue-card-ref', issue.id, el as Element | null)"
          class="rounded border px-2 py-2 text-xs"
          :class="[
            scenarioSeverityClass(issue.severity),
            highlightedIssueId === issue.id ? 'ring-2 ring-sky-300 border-sky-400 bg-sky-50/40' : ''
          ]"
        >
          <div class="mb-1 flex items-center justify-between gap-2">
            <span class="font-semibold">
              {{ scenarioSeverityLabel(issue.severity) }}
              <span class="font-normal opacity-70">·</span>
              <span :class="issueCategoryClass(issue)">{{ issueCategoryLabel(issue) }}</span>
            </span>
            <button
              v-if="issue.sceneId && issue.nodeId"
              type="button"
              class="rounded border border-gray-300 bg-white px-2 py-0.5 text-[11px] text-gray-700 hover:bg-gray-100"
              @click="emit('focus-issue', issue)"
            >
              対象へ移動
            </button>
          </div>
          <p class="leading-relaxed">{{ issue.message }}</p>
          <p class="mt-1 text-[11px] text-gray-600">{{ scenarioIssueLocation(issue) }}</p>
          <p v-if="issue.field" class="mt-1 text-[11px] text-gray-600">対象項目: {{ issue.field }}</p>
          <p v-if="issue.nodePreview" class="mt-1 text-[11px] text-gray-500">{{ issue.nodePreview }}</p>
        </article>
      </div>
    </div>
  </div>
</template>
