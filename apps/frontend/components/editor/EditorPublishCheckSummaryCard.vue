<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  counts: { error: number; warning: number; info: number }
  totalCount: number
  categoryCounts: { structure: number; assetReference: number; characterReference: number }
  issues: Array<{ id: string; severity: string; message: string }>
  referenceDiagnosticsLoading: boolean
  referenceDiagnosticsError: string | null
}>()

const publishCheckStatus = computed((): 'loading' | 'error' | 'warning' | 'ok' => {
  if (props.counts.error > 0) return 'error'
  if (props.referenceDiagnosticsError) return 'warning'
  if (props.counts.warning > 0) return 'warning'
  if (props.referenceDiagnosticsLoading) return 'loading'
  return 'ok'
})

const publishCheckStatusLabel = computed(() => {
  switch (publishCheckStatus.value) {
    case 'loading': return 'チェック中…'
    case 'error': return '要修正'
    case 'warning': return '注意あり'
    default: return '公開準備OK'
  }
})

const publishCheckStatusMessage = computed(() => {
  switch (publishCheckStatus.value) {
    case 'loading': return '参照診断を確認しています。'
    case 'error': return '公開前に修正が必要な問題があります。対象の項目を確認してください。'
    case 'warning': return '公開は可能ですが、確認しておきたい項目があります。'
    default: return '重大な問題は見つかりませんでした。公開前に内容とクレジットを最終確認してください。'
  }
})

const publishCheckStatusCardClass = computed(() => {
  switch (publishCheckStatus.value) {
    case 'loading': return 'border-gray-200 bg-gray-50'
    case 'error': return 'border-red-200 bg-red-50'
    case 'warning': return 'border-amber-200 bg-amber-50'
    default: return 'border-emerald-200 bg-emerald-50'
  }
})

const publishCheckStatusBadgeClass = computed(() => {
  switch (publishCheckStatus.value) {
    case 'loading': return 'bg-gray-100 text-gray-600'
    case 'error': return 'bg-red-100 text-red-700'
    case 'warning': return 'bg-amber-100 text-amber-700'
    default: return 'bg-emerald-100 text-emerald-700'
  }
})

const publishCheckStatusTextClass = computed(() => {
  switch (publishCheckStatus.value) {
    case 'loading': return 'text-gray-600'
    case 'error': return 'text-red-700'
    case 'warning': return 'text-amber-700'
    default: return 'text-emerald-700'
  }
})

const publishCheckTopIssues = computed(() => {
  if (publishCheckStatus.value !== 'error') return []
  return props.issues.filter((i) => i.severity === 'error').slice(0, 3)
})

const publishCheckTopIssuesRemainder = computed(() => {
  if (publishCheckStatus.value !== 'error') return 0
  return Math.max(0, props.counts.error - 3)
})
</script>

<template>
  <div class="mb-3 rounded-lg border px-3 py-3 text-sm" :class="publishCheckStatusCardClass">
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="publishCheckStatusBadgeClass">
          {{ publishCheckStatusLabel }}
        </span>
        <span v-if="referenceDiagnosticsLoading" class="flex items-center gap-1 text-[11px] text-slate-500">
          <span class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500"></span>
          参照確認中…
        </span>
      </div>
      <a
        v-if="totalCount > 0"
        href="#publish-check-issues"
        class="shrink-0 text-[11px] text-slate-600 underline hover:text-slate-800"
      >
        {{ publishCheckStatus === 'error' ? '問題一覧を見る' : '注意項目を確認する' }}
      </a>
    </div>
    <p class="mt-1 text-[12px]" :class="publishCheckStatusTextClass">{{ publishCheckStatusMessage }}</p>
    <!-- 件数サマリー -->
    <div class="mt-2 flex flex-wrap gap-2 text-[11px]">
      <span v-if="counts.error > 0" class="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-red-700">要修正 {{ counts.error }}件</span>
      <span v-if="counts.warning > 0" class="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-700">注意 {{ counts.warning }}件</span>
      <span v-if="counts.info > 0" class="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-600">情報 {{ counts.info }}件</span>
    </div>
    <!-- カテゴリ別件数 -->
    <div v-if="totalCount > 0" class="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
      <span v-if="categoryCounts.structure > 0">構成 {{ categoryCounts.structure }}件</span>
      <span v-if="categoryCounts.assetReference > 0">素材参照 {{ categoryCounts.assetReference }}件</span>
      <span v-if="categoryCounts.characterReference > 0">キャラクター参照 {{ categoryCounts.characterReference }}件</span>
    </div>
    <!-- 優先問題 (要修正がある場合、最大3件) -->
    <div v-if="publishCheckTopIssues.length > 0" class="mt-2 space-y-1 border-t border-red-200 pt-2">
      <p class="text-[11px] font-semibold text-red-700">優先して修正する問題:</p>
      <ul class="space-y-0.5">
        <li v-for="issue in publishCheckTopIssues" :key="issue.id" class="flex items-start gap-1 text-[11px] text-red-700">
          <span class="mt-0.5 shrink-0">•</span>
          <span>{{ issue.message }}</span>
        </li>
      </ul>
      <p v-if="publishCheckTopIssuesRemainder > 0" class="text-[11px] text-slate-500">ほか {{ publishCheckTopIssuesRemainder }}件</p>
    </div>
  </div>
</template>
