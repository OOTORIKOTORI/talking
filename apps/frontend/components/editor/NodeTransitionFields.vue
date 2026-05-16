<script setup lang="ts">
interface Props {
  nodeDraft: any | null
  nextNodeLabel: string
  copyOpts: {
    bg: boolean
    chars: boolean
    bgm: boolean
    camera: boolean
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'open-node-picker'): void
  (e: 'clear-next-node'): void
}>()

function openNodePicker() {
  emit('open-node-picker')
}

function clearNextNode() {
  emit('clear-next-node')
}

function onNextNodeKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    openNodePicker()
    return
  }

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    openNodePicker()
  }
}
</script>

<template>
  <div class="space-y-3">
    <div>
      <label class="block text-sm font-medium mb-1">次ノードID</label>
      <div class="flex items-center gap-2">
        <div
          tabindex="0"
          class="flex-1 px-2 py-1 border border-gray-300 rounded bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
          @click="openNodePicker"
          @keydown="onNextNodeKeydown"
          title="クリックまたは Ctrl/⌘+K で選択"
        >
          {{ props.nextNodeLabel || '未設定' }}
        </div>
        <button class="px-2 py-1 text-sm bg-gray-100 border rounded hover:bg-gray-200" @click="openNodePicker">選択</button>
        <button
          v-if="props.nodeDraft?.nextNodeId"
          class="px-2 py-1 text-sm bg-gray-100 border rounded hover:bg-gray-200"
          @click="clearNextNode"
        >
          クリア
        </button>
      </div>
      <p class="text-xs text-gray-500 mt-1">次ノードID欄にフォーカス中は Ctrl/⌘+K でも選択できます</p>
    </div>

    <div class="border-t pt-3">
      <div class="text-sm font-medium mb-2">次ノード作成時のコピー対象</div>
      <div class="grid grid-cols-2 gap-2">
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="props.copyOpts.bg" class="rounded" />
          背景
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="props.copyOpts.chars" class="rounded" />
          キャラ
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="props.copyOpts.bgm" class="rounded" />
          BGM
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="props.copyOpts.camera" class="rounded" />
          カメラ
        </label>
      </div>
    </div>
  </div>
</template>
