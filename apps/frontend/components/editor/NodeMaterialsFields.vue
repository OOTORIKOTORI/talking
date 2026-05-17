<script setup lang="ts">
/**
 * NodeMaterialsFields
 *
 * ノード編集画面の「表示・素材」セクション（背景・BGM・SE）を担当する共通コンポーネント。
 * 通常表示・全画面表示の両方で同一インスタンスを使用し、テンプレート重複を解消する。
 *
 * 担当範囲:
 *   - 「表示・素材」セクション見出し（開閉トグル付き）
 *   - 背景 サムネイル表示・変更・クリア
 *   - BGM タイトル表示・変更・クリア・試聴 audio
 *   - 効果音(SE) ID表示・変更・クリア・試聴 audio
 *
 * edit.vue 側が保持する責務:
 *   - nodeDraft 本体・sectionOpen 本体
 *   - bgUrl / musicTitle / musicUrl / sfxUrl
 *   - openBgPicker / openMusicPicker / openSfxPicker
 *   - AssetPicker 本体・保存処理（キャラクター配置UI は NodePortraitsFields.vue へ移譲済み）
 */
defineProps<{
  nodeDraft: any
  sectionOpen: Record<string, boolean>
  bgUrl: string | null
  musicTitle: string
  musicUrl: string | null
  sfxUrl: string | null
}>()

const emit = defineEmits<{
  'open-bg-picker': []
  'open-music-picker': []
  'open-sfx-picker': []
  'clear-bg': []
  'clear-music': []
  'clear-sfx': []
}>()
</script>

<template>
  <!-- 表示・素材セクション見出し -->
  <div class="editor-section-header" @click="sectionOpen.materials = !sectionOpen.materials">
    <span class="editor-section-title">
      <span class="editor-section-toggle">{{ sectionOpen.materials ? '▼' : '▶' }}</span>
      表示・素材
    </span>
  </div>

  <!-- 背景 -->
  <div v-if="sectionOpen.materials">
    <label class="block text-sm font-medium mb-1">背景</label>
    <div class="flex items-center gap-2">
      <img v-if="bgUrl" :src="bgUrl" class="w-16 h-10 object-cover rounded border" />
      <span v-else class="text-xs text-gray-500">未選択</span>
      <button type="button" class="px-2 py-1 border rounded text-sm" @click="emit('open-bg-picker')">変更</button>
      <button v-if="nodeDraft.bgAssetId" type="button" class="px-2 py-1 border rounded text-sm" @click="emit('clear-bg')">クリア</button>
    </div>
  </div>

  <!-- BGM -->
  <div v-if="sectionOpen.materials">
    <label class="block text-sm font-medium mb-1">BGM</label>
    <div class="flex items-center gap-2">
      <span class="text-xs text-gray-700 truncate flex-1">{{ musicTitle || '未選択' }}</span>
      <button type="button" class="px-2 py-1 border rounded text-sm" @click="emit('open-music-picker')">変更</button>
      <button v-if="nodeDraft.musicAssetId" type="button" class="px-2 py-1 border rounded text-sm" @click="emit('clear-music')">クリア</button>
    </div>
    <audio v-if="musicUrl" :src="musicUrl" controls preload="none" class="mt-1 w-full"></audio>
  </div>

  <!-- 効果音(SE) -->
  <div v-if="sectionOpen.materials">
    <label class="block text-sm font-medium mb-1">効果音(SE)</label>
    <div class="flex items-center gap-2">
      <span class="text-xs text-gray-700 truncate flex-1">{{ nodeDraft.sfxAssetId || '未選択' }}</span>
      <button type="button" class="px-2 py-1 border rounded text-sm" @click="emit('open-sfx-picker')">変更</button>
      <button v-if="nodeDraft.sfxAssetId" type="button" class="px-2 py-1 border rounded text-sm" @click="emit('clear-sfx')">クリア</button>
    </div>
    <audio v-if="sfxUrl" :src="sfxUrl" controls preload="none" class="mt-1 w-full"></audio>
  </div>
</template>

<style scoped>
/* edit.vue の scoped スタイルと同定義。セクション見出しを NodeMaterialsFields 内で使用するため複製 */
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
