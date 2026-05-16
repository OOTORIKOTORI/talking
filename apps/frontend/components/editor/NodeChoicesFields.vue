<script setup lang="ts">
interface Props {
  nodeDraft: any | null
  showChoiceNextPriorityNotice: boolean
  getChoiceTargetLabel: (targetNodeId: string | null | undefined) => string
  hasConfiguredChoiceTarget: (
    choice: any,
    field?: 'targetNodeId' | 'alternateTargetNodeId'
  ) => boolean
  isUnaryChoiceOperator: (op: string | undefined) => boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'add-choice'): void
  (e: 'remove-choice', index: number | string): void
  (e: 'add-choice-effect', choice: any): void
  (e: 'remove-choice-effect', choice: any, effectIndex: number | string): void
  (e: 'enable-choice-condition', choice: any, field: 'condition' | 'alternateCondition'): void
  (e: 'clear-choice-target', choice: any, field?: 'targetNodeId' | 'alternateTargetNodeId'): void
  (e: 'open-choice-node-picker', index: number | string, field?: 'targetNodeId' | 'alternateTargetNodeId'): void
}>()

function addChoice() {
  emit('add-choice')
}

function removeChoice(index: number | string) {
  emit('remove-choice', index)
}

function addChoiceEffect(choice: any) {
  emit('add-choice-effect', choice)
}

function removeChoiceEffect(choice: any, effectIndex: number | string) {
  emit('remove-choice-effect', choice, effectIndex)
}

function enableChoiceCondition(choice: any, field: 'condition' | 'alternateCondition') {
  emit('enable-choice-condition', choice, field)
}

function clearChoiceTarget(choice: any, field: 'targetNodeId' | 'alternateTargetNodeId' = 'targetNodeId') {
  emit('clear-choice-target', choice, field)
}

function openChoiceNodePicker(index: number | string, field: 'targetNodeId' | 'alternateTargetNodeId' = 'targetNodeId') {
  emit('open-choice-node-picker', index, field)
}
</script>

<template>
  <div>
    <div class="mb-2 flex items-center justify-between gap-2">
      <div class="font-semibold">選択肢</div>
      <button
        class="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        @click="addChoice"
      >
        選択肢追加
      </button>
    </div>
    <p
      v-if="props.showChoiceNextPriorityNotice"
      class="mb-2 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800"
    >
      このノードには選択肢と通常遷移先の両方が設定されています。プレイ時は選択肢が優先され、通常遷移先は表示可能な選択肢がない場合のみ使われます。
    </p>
    <div
      v-if="!props.nodeDraft?.choices || props.nodeDraft.choices.length === 0"
      class="text-sm text-gray-500"
    >
      選択肢はありません
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="(c, i) in props.nodeDraft.choices"
        :key="i"
        class="p-2 bg-gray-50 rounded space-y-2"
      >
        <div class="flex gap-2 items-center mb-2">
          <input
            v-model="c.label"
            class="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
            placeholder="表示テキスト"
          />
          <button
            type="button"
            class="px-2 py-1 bg-red-400 text-white rounded text-xs hover:bg-red-500"
            :aria-label="`この選択肢を削除 (${i + 1})`"
            @click="removeChoice(i)"
          >
            この選択肢を削除
          </button>
        </div>

        <div class="flex gap-2 items-center">
          <div class="flex-1 px-2 py-1 border border-gray-300 rounded bg-white text-sm text-gray-700">
            {{ props.getChoiceTargetLabel(c.targetNodeId) }}
          </div>
          <button
            class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200"
            @click="openChoiceNodePicker(i)"
          >
            通常遷移先
          </button>
          <button
            v-if="props.hasConfiguredChoiceTarget(c, 'targetNodeId')"
            class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200"
            @click="clearChoiceTarget(c)"
          >
            クリア
          </button>
          <span
            v-if="!props.hasConfiguredChoiceTarget(c, 'targetNodeId')"
            class="px-2 py-1 text-[11px] bg-amber-100 text-amber-800 border border-amber-300 rounded"
          >
            遷移先未設定
          </span>
        </div>

        <div class="border-t pt-2">
          <div class="flex items-center justify-between mb-2">
            <div class="text-xs font-semibold text-gray-700">状態操作</div>
            <button
              class="px-2 py-1 text-xs bg-emerald-100 border rounded hover:bg-emerald-200"
              @click="addChoiceEffect(c)"
            >
              追加
            </button>
          </div>
          <div v-if="!c.effects || c.effects.length === 0" class="text-xs text-gray-500">なし</div>
          <div v-else class="space-y-1">
            <div
              v-for="(effect, ei) in c.effects"
              :key="ei"
              class="grid grid-cols-1 md:grid-cols-4 gap-2 items-center"
            >
              <input
                v-model="effect.key"
                class="border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="変数名"
              />
              <select v-model="effect.op" class="border border-gray-300 rounded px-2 py-1 text-sm">
                <option value="set">代入</option>
                <option value="add">加算</option>
                <option value="sub">減算</option>
              </select>
              <input
                v-model="effect.value"
                class="border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="値"
              />
              <button
                class="px-2 py-1 bg-red-400 text-white rounded text-xs hover:bg-red-500"
                @click="removeChoiceEffect(c, ei)"
              >
                削除
              </button>
            </div>
          </div>
        </div>

        <div class="border-t pt-2">
          <div class="flex items-center justify-between mb-2">
            <div class="text-xs font-semibold text-gray-700">特別選択肢条件</div>
            <div class="flex gap-1">
              <button
                class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200"
                @click="enableChoiceCondition(c, 'condition')"
              >
                設定
              </button>
              <button
                v-if="c.condition"
                class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200"
                @click="c.condition = null"
              >
                クリア
              </button>
            </div>
          </div>
          <p v-if="!c.condition" class="text-xs text-gray-500">未設定なら常に表示</p>
          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              v-model="c.condition.key"
              class="border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="変数名"
            />
            <select v-model="c.condition.operator" class="border border-gray-300 rounded px-2 py-1 text-sm">
              <option value="eq">一致</option>
              <option value="ne">不一致</option>
              <option value="gt">より大きい</option>
              <option value="gte">以上</option>
              <option value="lt">より小さい</option>
              <option value="lte">以下</option>
              <option value="truthy">ON</option>
              <option value="falsy">OFF</option>
            </select>
            <input
              v-if="!props.isUnaryChoiceOperator(c.condition.operator)"
              v-model="c.condition.value"
              class="border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="基準値"
            />
            <div v-else class="text-xs text-gray-500 flex items-center px-2">値不要</div>
          </div>
        </div>

        <div class="border-t pt-2">
          <div class="flex items-center justify-between mb-2">
            <div class="text-xs font-semibold text-gray-700">条件分岐先</div>
            <div class="flex gap-1">
              <button
                class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200"
                @click="enableChoiceCondition(c, 'alternateCondition')"
              >
                設定
              </button>
              <button
                v-if="c.alternateCondition || c.alternateTargetNodeId"
                class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200"
                @click="c.alternateCondition = null; clearChoiceTarget(c, 'alternateTargetNodeId')"
              >
                クリア
              </button>
            </div>
          </div>
          <p v-if="!c.alternateCondition" class="text-xs text-gray-500">未設定なら通常遷移のみ</p>
          <div v-else class="space-y-2">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                v-model="c.alternateCondition.key"
                class="border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="変数名"
              />
              <select
                v-model="c.alternateCondition.operator"
                class="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="eq">一致</option>
                <option value="ne">不一致</option>
                <option value="gt">より大きい</option>
                <option value="gte">以上</option>
                <option value="lt">より小さい</option>
                <option value="lte">以下</option>
                <option value="truthy">ON</option>
                <option value="falsy">OFF</option>
              </select>
              <input
                v-if="!props.isUnaryChoiceOperator(c.alternateCondition.operator)"
                v-model="c.alternateCondition.value"
                class="border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="基準値"
              />
              <div v-else class="text-xs text-gray-500 flex items-center px-2">値不要</div>
            </div>
            <div class="flex gap-2 items-center">
              <div class="flex-1 px-2 py-1 border border-gray-300 rounded bg-white text-sm text-gray-700">
                {{ props.getChoiceTargetLabel(c.alternateTargetNodeId) }}
              </div>
              <button
                class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200"
                @click="openChoiceNodePicker(i, 'alternateTargetNodeId')"
              >
                特殊遷移先
              </button>
              <button
                v-if="props.hasConfiguredChoiceTarget(c, 'alternateTargetNodeId')"
                class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200"
                @click="clearChoiceTarget(c, 'alternateTargetNodeId')"
              >
                クリア
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
