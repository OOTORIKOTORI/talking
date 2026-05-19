<script setup lang="ts">
/**
 * EditorPublishCheckFilters
 *
 * 公開前チェックパネルの severity filter / category filter ボタン列を担当するコンポーネント。
 * フィルター状態管理・issue算出は edit.vue 側に残置し、このコンポーネントは表示と emit のみ担当する。
 */
import type { ScenarioCheckSeverity, PrepublishIssueCategory } from '@talking/types'

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
  filterItems: FilterItem[]
  categoryFilterItems: CategoryFilterItem[]
  scenarioCheckFilter: ScenarioCheckFilter
  scenarioCategoryFilter: ScenarioCategoryFilter
}>()

const emit = defineEmits<{
  'select-check-filter': [filter: ScenarioCheckFilter]
  'select-category-filter': [key: ScenarioCategoryFilter]
}>()

function severityButtonClass(item: FilterItem): string {
  const active = props.scenarioCheckFilter === item.key
  if (item.key === 'error') {
    if (active) return 'border-red-300 bg-red-100 text-red-800'
    if (item.count > 0) return 'border-red-200 bg-red-50 text-red-700'
    return 'border-gray-200 bg-white text-gray-700'
  }
  if (item.key === 'warning') {
    if (active) return 'border-amber-300 bg-amber-100 text-amber-800'
    if (item.count > 0) return 'border-amber-200 bg-amber-50 text-amber-700'
    return 'border-gray-200 bg-white text-gray-700'
  }
  if (item.key === 'info') {
    if (active) return 'border-slate-300 bg-slate-100 text-slate-700'
    return 'border-gray-200 bg-white text-gray-500'
  }
  // 'all'
  if (active) return 'border-gray-300 bg-gray-100 text-gray-800'
  return 'border-gray-200 bg-white text-gray-700'
}

function categoryButtonClass(item: CategoryFilterItem): string {
  const active = props.scenarioCategoryFilter === item.key
  if (item.key === 'all') {
    if (active) return 'border-gray-300 bg-gray-100 text-gray-800'
    return 'border-gray-200 bg-white text-gray-700'
  }
  if (item.key === 'asset-reference') {
    if (active) return 'border-sky-300 bg-sky-100 text-sky-800'
    if (item.count > 0) return 'border-sky-200 bg-sky-50 text-sky-700'
    return 'border-gray-200 bg-white text-gray-500'
  }
  if (item.key === 'character-reference') {
    if (active) return 'border-violet-300 bg-violet-100 text-violet-800'
    if (item.count > 0) return 'border-violet-200 bg-violet-50 text-violet-700'
    return 'border-gray-200 bg-white text-gray-500'
  }
  // 'structure'
  if (active) return 'border-orange-300 bg-orange-100 text-orange-800'
  if (item.count > 0) return 'border-orange-200 bg-orange-50 text-orange-700'
  return 'border-gray-200 bg-white text-gray-500'
}
</script>

<template>
  <div>
    <div class="mb-1 flex flex-wrap gap-2">
      <button
        v-for="item in filterItems"
        :key="item.key"
        type="button"
        class="rounded border px-2 py-1 text-xs transition-colors"
        :class="severityButtonClass(item)"
        @click="emit('select-check-filter', item.key)"
      >
        {{ item.label }} {{ item.count }}
      </button>
    </div>
    <div class="mb-2 flex flex-wrap gap-1">
      <button
        v-for="item in categoryFilterItems"
        :key="item.key"
        type="button"
        class="rounded border px-2 py-0.5 text-[11px] transition-colors"
        :class="categoryButtonClass(item)"
        @click="emit('select-category-filter', item.key)"
      >
        {{ item.displayLabel }}
      </button>
    </div>
  </div>
</template>
