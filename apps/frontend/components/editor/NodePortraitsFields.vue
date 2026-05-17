<script setup lang="ts">
/**
 * NodePortraitsFields
 *
 * ノード編集画面の「表示・素材」セクション内、キャラクター配置UIを担当する共通コンポーネント。
 * 通常表示・全画面表示の両方で同一インスタンスを使用し、テンプレート重複を解消する。
 *
 * 担当範囲:
 *   - キャラクター配置ラベル + 追加ボタン
 *   - 未配置メッセージ
 *   - portrait 一覧（サムネイル・名前・画像変更ボタン・削除ボタン・X/Y/Scale/Z 入力）
 *
 * 「表示・素材」セクション見出し / 開閉は NodeMaterialsFields.vue が担当。
 * このコンポーネントは sectionOpen.materials が true のときだけ表示する。
 *
 * edit.vue 側が保持する責務:
 *   - nodeDraft 本体・sectionOpen 本体
 *   - addPortrait / changePortrait / removePortrait の実装
 *   - CharacterPicker / CharacterImagePicker 本体
 *   - pendingIndex / onCharPicked / onImagePicked
 *   - portraits の thumb 補完処理・保存処理
 */
defineProps<{
  nodeDraft: any
  sectionOpen: Record<string, boolean>
}>()

const emit = defineEmits<{
  'add-portrait': []
  'change-portrait': [index: number]
  'remove-portrait': [index: number]
}>()
</script>

<template>
  <div v-if="sectionOpen.materials" class="mt-3">
    <div class="flex items-center justify-between">
      <label class="block text-sm font-semibold">キャラクター配置</label>
      <button type="button" class="px-2 py-1 border rounded text-sm" @click="emit('add-portrait')">追加</button>
    </div>
    <div v-if="(nodeDraft.portraits||[]).length===0" class="text-xs text-gray-500 mt-1">未配置</div>
    <div v-for="(p, i) in (nodeDraft.portraits ||= [])" :key="i" class="mt-2 p-2 border rounded">
      <div class="flex items-center gap-2">
        <img v-if="p.thumb" :src="p.thumb" class="w-12 h-12 object-cover rounded-full border" />
        <span class="text-xs text-gray-700 truncate flex-1">{{ p.characterName || p.characterId }}</span>
        <button type="button" class="px-2 py-1 border rounded text-xs" @click="emit('change-portrait', Number(i))">画像変更</button>
        <button type="button" class="px-2 py-1 border rounded text-xs" @click="emit('remove-portrait', Number(i))">削除</button>
      </div>
      <div class="grid grid-cols-4 gap-2 mt-2">
        <label class="text-xs">X%<input type="number" v-model.number="p.x" class="w-full border rounded px-1 py-0.5" /></label>
        <label class="text-xs">Y%<input type="number" v-model.number="p.y" class="w-full border rounded px-1 py-0.5" /></label>
        <label class="text-xs">Scale%<input type="number" v-model.number="p.scale" class="w-full border rounded px-1 py-0.5" /></label>
        <label class="text-xs">Z<input type="number" v-model.number="p.z" class="w-full border rounded px-1 py-0.5" /></label>
      </div>
    </div>
  </div>
</template>
