<script setup lang="ts">
/**
 * NodeBasicInfoFields
 *
 * ノード編集画面の「基本情報」セクションを担当する共通コンポーネント。
 * 通常表示・全画面表示の両方で同一インスタンスを使用し、テンプレート重複を解消する。
 *
 * 担当範囲:
 *   - 「基本情報」セクション見出し（開閉トグル付き）
 *   - 台詞 textarea
 *   - 前ノードのセリフを継続するチェックボックス
 *   - 話者キャラ 表示・変更・クリア
 *   - 話者表記 input
 *
 * edit.vue 側が保持する責務:
 *   - nodeDraft 本体・sectionOpen 本体
 *   - selectedCharLabel computed
 *   - openSpeakerCharPicker() / clearChar()
 *   - CharacterPicker・保存処理・その他ページ状態
 */
defineProps<{
  nodeDraft: any
  sectionOpen: Record<string, boolean>
  selectedCharLabel: string
}>()

const emit = defineEmits<{
  'open-char-picker': []
  'clear-char': []
}>()
</script>

<template>
  <!-- 基本情報セクション見出し -->
  <div class="editor-section-header" @click="sectionOpen.basic = !sectionOpen.basic">
    <span class="editor-section-title">
      <span class="editor-section-toggle">{{ sectionOpen.basic ? '▼' : '▶' }}</span>
      基本情報
    </span>
  </div>

  <!-- 台詞 -->
  <div v-if="sectionOpen.basic">
    <label class="block mb-1 text-sm font-medium">台詞</label>
    <textarea
      v-model="nodeDraft.text"
      class="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      rows="6"
      placeholder="ここに台詞を入力..."
    ></textarea>
  </div>

  <!-- 前ノードのセリフを継続 -->
  <div v-if="sectionOpen.basic">
    <label class="flex items-center gap-2 text-sm">
      <input type="checkbox" v-model="nodeDraft.continuesPreviousText" class="rounded" />
      <span class="font-medium">前ノードのセリフを消さずに続ける</span>
    </label>
    <p class="text-xs text-gray-500 mt-1 ml-6">
      チェックすると、前のノードのセリフを残したまま、このノードのセリフを追加表示します
    </p>
  </div>

  <!-- 話者キャラ -->
  <div v-if="sectionOpen.basic">
    <label class="block text-sm font-medium mb-1">話者キャラ</label>
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-700 truncate flex-1">{{ selectedCharLabel || '未選択' }}</span>
      <button type="button" class="px-2 py-1 border rounded text-sm" @click="emit('open-char-picker')">変更</button>
      <button v-if="nodeDraft.speakerCharacterId" type="button" class="px-2 py-1 border rounded text-sm" @click="emit('clear-char')">クリア</button>
    </div>
  </div>

  <!-- 話者表記（任意） -->
  <div v-if="sectionOpen.basic">
    <label class="block text-sm font-medium mb-1">話者表記（任意）</label>
    <input
      v-model="nodeDraft.speakerDisplayName"
      class="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="例: ??? / 田中 / あだ名"
    />
  </div>
</template>

<style scoped>
/* edit.vue の scoped スタイルと同定義。セクション見出しを NodeBasicInfoFields 内で使用するため複製 */
.editor-section-header {
  display: flex;
  cursor: pointer;
  margin: 1rem 0 0.75rem 0;
  border-top: 1px solid #e5e7eb;
  padding-top: 0.75rem;
  user-select: none;
}
.editor-section-header:hover {
  opacity: 0.8;
}
.editor-section-title {
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  color: #1f2937;
}
.editor-section-toggle {
  display: inline-block;
  width: 1.25rem;
  text-align: center;
  font-size: 0.75rem;
  transition: color 0.2s;
  color: #6b7280;
}
</style>
