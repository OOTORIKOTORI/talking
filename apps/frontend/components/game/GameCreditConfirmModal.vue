<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="border-b border-gray-200 px-6 py-4">
          <h2 class="text-xl font-bold text-gray-900">公開前にクレジットを確認</h2>
          <p class="text-sm text-gray-600 mt-1">
            このゲームで使用している素材・キャラクターのクレジットと利用条件を確認してください。<br />
            公開すると、現在のクレジット情報が公開時点の記録として固定されます。
          </p>
        </div>

        <!-- Content -->
        <div class="overflow-y-auto flex-1 px-6 py-4">
          <!-- Loading state -->
          <div v-if="loading" class="flex items-center justify-center py-8">
            <div class="text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p class="text-sm text-gray-600">クレジット情報を取得中...</p>
            </div>
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4">
            <p class="text-sm text-red-700 font-medium">{{ error }}</p>
            <button
              type="button"
              @click="$emit('retry')"
              class="mt-2 inline-flex items-center px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              再試行
            </button>
          </div>

          <!-- Content -->
          <template v-else-if="data">
            <!-- Asset Credits Section -->
            <section class="mb-6">
              <h3 class="font-semibold text-gray-900 mb-3">
                素材
                <span class="text-sm text-gray-600 font-normal ml-2">{{ data.counts.assets }}件</span>
              </h3>

              <div v-if="data.assetCredits.length === 0" class="text-sm text-gray-500 italic">
                現在、このゲームで参照されている素材はありません。
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="asset in data.assetCredits"
                  :key="asset.assetId"
                  class="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                >
                  <!-- Title & Status -->
                  <div class="flex items-start gap-2 mb-2">
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-gray-900 break-words">{{ asset.title }}</p>
                    </div>
                    <div class="flex gap-1 shrink-0 flex-wrap justify-end">
                      <span
                        v-if="asset.creditRequired"
                        class="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium bg-amber-100 text-amber-800"
                      >
                        クレジット必須
                      </span>
                      <span
                        v-else
                        class="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium bg-gray-100 text-gray-700"
                      >
                        クレジット任意
                      </span>
                      <span
                        v-if="asset.status === 'deleted'"
                        class="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium bg-red-100 text-red-800"
                      >
                        削除済み
                      </span>
                      <span
                        v-else-if="asset.status === 'missing'"
                        class="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium bg-red-100 text-red-800"
                      >
                        見つかりません
                      </span>
                    </div>
                  </div>

                  <!-- Author -->
                  <div class="text-sm text-gray-600 mb-2">
                    {{ asset.ownerDisplayName || `by ${asset.ownerId?.substring(0, 7) || '不明'}` }}
                  </div>

                  <!-- Usage Terms -->
                  <div v-if="asset.usageTerms" class="text-sm text-gray-700 bg-blue-50 border-l-2 border-blue-300 p-2 mb-2">
                    <span class="font-medium">利用条件: </span>
                    <span class="break-words">{{ asset.usageTerms }}</span>
                  </div>
                  <div v-else class="text-xs text-gray-400 italic mb-2">個別条件なし</div>

                  <!-- Fields -->
                  <div v-if="asset.fields.length > 0" class="text-xs text-gray-600">
                    <span class="font-medium">使用箇所:</span>
                    {{ asset.fields.map((f) => `${f.label}(${f.count})`).join(' / ') }}
                  </div>
                </div>
              </div>
            </section>

            <!-- Character Credits Section -->
            <section>
              <h3 class="font-semibold text-gray-900 mb-3">
                キャラクター
                <span class="text-sm text-gray-600 font-normal ml-2">{{ data.counts.characters }}件</span>
              </h3>

              <div v-if="data.characterCredits.length === 0" class="text-sm text-gray-500 italic">
                現在、このゲームで参照されているキャラクターはありません。
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="character in data.characterCredits"
                  :key="character.characterId"
                  class="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                >
                  <!-- Name & Status -->
                  <div class="flex items-start gap-2 mb-2">
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-gray-900 break-words">{{ character.displayName }}</p>
                    </div>
                    <div class="flex gap-1 shrink-0 flex-wrap justify-end">
                      <span
                        v-if="character.creditRequired"
                        class="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium bg-amber-100 text-amber-800"
                      >
                        クレジット必須
                      </span>
                      <span
                        v-else
                        class="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium bg-gray-100 text-gray-700"
                      >
                        クレジット任意
                      </span>
                      <span
                        v-if="character.status === 'deleted'"
                        class="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium bg-red-100 text-red-800"
                      >
                        削除済み
                      </span>
                      <span
                        v-else-if="character.status === 'missing'"
                        class="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium bg-red-100 text-red-800"
                      >
                        見つかりません
                      </span>
                      <span
                        v-else-if="character.status === 'private'"
                        class="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium bg-orange-100 text-orange-800"
                      >
                        非公開
                      </span>
                    </div>
                  </div>

                  <!-- Author -->
                  <div class="text-sm text-gray-600 mb-2">
                    {{ character.ownerDisplayName || `by ${character.ownerId?.substring(0, 7) || '不明'}` }}
                  </div>

                  <!-- Usage Terms -->
                  <div
                    v-if="character.usageTerms"
                    class="text-sm text-gray-700 bg-blue-50 border-l-2 border-blue-300 p-2 mb-2"
                  >
                    <span class="font-medium">利用条件: </span>
                    <span class="break-words">{{ character.usageTerms }}</span>
                  </div>
                  <div v-else class="text-xs text-gray-400 italic mb-2">個別条件なし</div>

                  <!-- Fields -->
                  <div v-if="character.fields.length > 0" class="text-xs text-gray-600">
                    <span class="font-medium">使用箇所:</span>
                    {{ character.fields.map((f) => `${f.label}(${f.count})`).join(' / ') }}
                  </div>
                </div>
              </div>
            </section>
          </template>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            type="button"
            @click="$emit('cancel')"
            :disabled="loading"
            class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            @click="$emit('confirm')"
            :disabled="loading || error || !data"
            class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            確認して公開
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { GameCreditsResult } from '@talking/types'

interface Props {
  open: boolean
  loading?: boolean
  data?: GameCreditsResult | null
  error?: string | null
}

defineProps<Props>()

defineEmits<{
  cancel: []
  confirm: []
  retry: []
}>()
</script>
