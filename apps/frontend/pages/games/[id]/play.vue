<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <div v-if="loading" class="text-white text-center">
      <p class="text-xl">読み込み中...</p>
    </div>

    <div v-else-if="error" class="text-red-400 text-center">
      <p class="text-xl">エラー: {{ error }}</p>
      <NuxtLink to="/" class="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded">
        トップに戻る
      </NuxtLink>
    </div>

    <div v-else-if="game" class="w-[90vw] max-w-[1400px] mx-auto">
      <div class="rounded-lg overflow-hidden shadow-2xl bg-black relative">
        <!-- StageCanvasを使用して統一構造 (背景とキャラのみ) -->
        <StageCanvas 
          style="aspect-ratio: 16/9"
          :backgroundUrl="bgUrl"
          :characters="stageCharacters"
          :message="stageMessage"
          :theme="stageTheme"
          :camera="stageCamera"
          :effectState="effectState"
          :colorFilter="currentColorFilter"
        />
        
        <!-- UI オーバーレイ（StageCanvas の上に絶対配置） -->
        <div v-if="!fullscreen" class="absolute inset-0 pointer-events-none">
          <button class="absolute right-3 top-3 z-30 px-2 py-1 text-xs bg-black/50 text-white rounded pointer-events-auto" @click="openFs()">全画面</button>
          
          <!-- スタートオーバーレイ（showStartScreen が true のときのみ表示） -->
          <div v-if="showStartScreen" class="absolute inset-0 z-20 text-white flex items-center justify-center bg-black bg-opacity-50 pointer-events-auto">
            <div class="text-center">
              <h1 class="text-3xl font-bold mb-4">{{ game.title }}</h1>
              <p v-if="game.summary" class="text-gray-300 mb-6">{{ game.summary }}</p>
              <button
                @click="start"
                class="px-8 py-3 bg-blue-500 text-white rounded-lg text-xl hover:bg-blue-600 transition-colors"
              >
                スタート
              </button>
            </div>
          </div>

          <!-- whole-stage click to advance & to trigger BGM -->
          <button 
            v-if="current && !showStartScreen && !showEndScreen && !showChoices"
            class="absolute inset-0 z-10 pointer-events-auto" 
            @click="hasChoices ? (showChoices = true, ensureBgm()) : (advanceWithinNodeOrNext(), ensureBgm())" 
            aria-label="next"
          ></button>

          <!-- message window (only when current exists and not on start screen) -->
          <div v-if="current && !showStartScreen && !fullscreen">
            <!-- 選択肢がある場合（クリック後に表示） -->
            <div v-if="hasChoices && showChoices" class="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto">
              <div class="space-y-3 w-[min(600px,80vw)]">
                <button
                  v-for="ch in choices"
                  :key="ch.id"
                  class="w-full px-6 py-4 bg-gray-800/90 rounded-lg text-center hover:bg-gray-700 transition-colors text-white text-lg font-medium shadow-lg"
                  @click="selectChoice(ch)"
                >
                  {{ ch.label }}
                </button>
              </div>
            </div>

            <!-- 通常のメッセージウィンドウ（常に表示） -->
            <MessageWindow
              :key="`msg-${current?.id}`"
              :speaker="speaker"
              :text="displayedText"
              :accumulatedPrefix="prefixText"
              :theme="theme"
              :animate="true"
              :show-backlog-button="true"
              @backlog="backlog.open()"
              @complete="pushCurrentToBacklog()"
              @click="hasChoices ? (showChoices = true, ensureBgm()) : (advanceWithinNodeOrNext(), ensureBgm())"
            >
              <template #name-actions>
                <button
                  class="px-2 py-1 text-[11px] leading-none rounded transition-colors"
                  :style="uiQuickButtonStyle"
                  @click.stop="openSaveLoadModal('save')"
                >
                  SAVE
                </button>
                <button
                  class="px-2 py-1 text-[11px] leading-none rounded transition-colors"
                  :style="uiQuickButtonStyle"
                  @click.stop="openSaveLoadModal('load')"
                >
                  LOAD
                </button>
              </template>
            </MessageWindow>
          </div>
          
          <!-- 終了画面（showEndScreenがtrueの場合のみ） -->
          <div v-if="showEndScreen" class="absolute left-[7%] right-[7%] bottom-[5%] text-center pointer-events-auto z-[150]">
            <p class="text-white text-lg mb-4 bg-black bg-opacity-70 py-2 px-4 rounded">おわり</p>
            <button
              @click="restart(); ensureBgm()"
              class="px-6 py-2 bg-green-500 rounded hover:bg-green-600 transition-colors text-white"
            >
              最初から
            </button>
          </div>
        </div>
      </div>

      <!-- BGM/SFXはモード切替時にも継続させるため常時マウント -->
      <audio ref="bgmRef" :src="bgmUrl || undefined" :autoplay="soundOk" loop class="hidden" controls></audio>
      <audio ref="sfxRef" :src="sfxUrl || undefined" class="hidden" />
  
  <!-- Fullscreen Overlay -->
  <div v-if="fullscreen" class="fixed inset-0 z-50 bg-black">
    <div class="relative w-full h-full">
      <!-- フルスクリーンも StageCanvas で統一 (背景とキャラのみ) -->
      <StageCanvas 
        style="width: 100%; height: 100%"
        :backgroundUrl="bgUrl"
        :characters="stageCharacters"
        :message="stageMessage"
        :theme="stageTheme"
        :camera="stageCamera"
        :effectState="effectState"
        :colorFilter="currentColorFilter"
      />
      
      <!-- UI オーバーレイ（StageCanvas の上に絶対配置） -->
      <div class="absolute inset-0 pointer-events-none">
        <!-- スタートオーバーレイ（showStartScreen が true のときのみ表示） -->
        <div v-if="showStartScreen" class="absolute inset-0 z-20 text-white flex items-center justify-center bg-black bg-opacity-50 pointer-events-auto">
          <div class="text-center">
            <h1 class="text-3xl font-bold mb-4">{{ game.title }}</h1>
            <p v-if="game.summary" class="text-gray-300 mb-6">{{ game.summary }}</p>
            <button
              @click="start"
              class="px-8 py-3 bg-blue-500 text-white rounded-lg text-xl hover:bg-blue-600 transition-colors"
            >
              スタート
            </button>
          </div>
        </div>

        <!-- whole-stage click to advance & to trigger BGM -->
        <button 
          v-if="current && !showStartScreen && !showEndScreen && !showChoices"
          class="absolute inset-0 z-[5] pointer-events-auto" 
          @click="hasChoices ? (showChoices = true, ensureBgm()) : (advanceWithinNodeOrNext(), ensureBgm())" 
          aria-label="next"
        ></button>

        <!-- message window (only when current exists and not on start screen) -->
        <div v-if="current && !showStartScreen">
          <!-- 選択肢がある場合（クリック後に表示） -->
          <div v-if="hasChoices && showChoices" class="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto">
            <div class="space-y-3 w-[min(600px,80vw)]">
              <button
                v-for="ch in choices"
                :key="ch.id"
                class="w-full px-6 py-4 bg-gray-800/90 rounded-lg text-center hover:bg-gray-700 transition-colors text-white text-lg font-medium shadow-lg"
                @click="selectChoice(ch)"
              >
                {{ ch.label }}
              </button>
            </div>
          </div>

          <!-- 通常のメッセージウィンドウ（常に表示） -->
          <MessageWindow
            :key="`msg-${current?.id}`"
            :speaker="speaker"
            :text="displayedText"
            :accumulatedPrefix="prefixText"
            :theme="theme"
            :animate="true"
            :show-backlog-button="true"
            @backlog="backlog.open()"
            @complete="pushCurrentToBacklog()"
            @click="hasChoices ? (showChoices = true, ensureBgm()) : (advanceWithinNodeOrNext(), ensureBgm())"
          >
            <template #name-actions>
              <button
                class="px-2 py-1 text-[11px] leading-none rounded transition-colors"
                :style="uiQuickButtonStyle"
                @click.stop="openSaveLoadModal('save')"
              >
                SAVE
              </button>
              <button
                class="px-2 py-1 text-[11px] leading-none rounded transition-colors"
                :style="uiQuickButtonStyle"
                @click.stop="openSaveLoadModal('load')"
              >
                LOAD
              </button>
            </template>
          </MessageWindow>
        </div>
        
        <!-- 終了画面（showEndScreenがtrueの場合のみ） -->
        <div v-if="showEndScreen" class="absolute left-[7%] right-[7%] bottom-[5%] text-center pointer-events-auto z-[150]">
          <p class="text-white text-lg mb-4 bg-black bg-opacity-70 py-2 px-4 rounded">おわり</p>
          <button
            @click="restart(); ensureBgm()"
            class="px-6 py-2 bg-green-500 rounded hover:bg-green-600 transition-colors text-white"
          >
            最初から
          </button>
        </div>
      </div>
      
      <button class="absolute right-4 top-4 bg-white/10 text-white rounded px-3 py-2 z-[60]" @click="closeFs()">閉じる（Esc）</button>
    </div>
  </div>

      <!-- Save/Load Modal -->
      <div v-if="saveLoadOpen" class="fixed inset-0 z-[220] flex items-center justify-center p-4" :style="uiModalOverlayStyle">
        <div class="w-[min(980px,94vw)] max-h-[86vh] shadow-2xl overflow-hidden border" :style="uiModalBoxStyle">
          <div class="px-5 py-4 border-b flex items-center justify-between" :style="{ borderColor: uiModalBoxStyle.borderColor }">
            <div>
              <h3 class="text-lg font-semibold">セーブ / ロード</h3>
              <p class="text-xs opacity-70 mt-1">手動100・オート5・クイック1（合計106）</p>
            </div>
            <button class="px-3 py-1.5 text-sm rounded opacity-70 hover:opacity-100 transition-opacity border" :style="{ borderColor: uiModalBoxStyle.borderColor }" @click="closeSaveLoadModal">閉じる</button>
          </div>

          <div class="px-5 pt-4 flex items-center gap-2 border-b" :style="{ borderColor: uiModalBoxStyle.borderColor }">
            <button
              v-for="tab in slotTabs"
              :key="tab.key"
              class="px-3 py-2 text-sm rounded-t border transition-colors"
              :style="activeSlotType === tab.key
                ? { ...uiAccentStyle, borderColor: uiAccentStyle.backgroundColor, color: '#fff' }
                : { borderColor: 'transparent', opacity: '0.65' }"
              @click="activeSlotType = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="px-5 py-4 border-b flex items-center gap-3" :style="{ borderColor: uiModalBoxStyle.borderColor }">
            <label class="text-sm opacity-70">操作:</label>
            <button
              class="px-3 py-1.5 text-sm rounded border transition-colors"
              :style="modalMode === 'save' ? { ...uiAccentStyle, borderColor: uiAccentStyle.backgroundColor, color: '#000' } : { borderColor: uiModalBoxStyle.borderColor, opacity: '0.65' }"
              @click="modalMode = 'save'"
            >
              セーブ
            </button>
            <button
              class="px-3 py-1.5 text-sm rounded border transition-colors"
              :style="modalMode === 'load' ? { ...uiLoadAccentStyle, borderColor: uiLoadAccentStyle.backgroundColor, color: '#000' } : { borderColor: uiModalBoxStyle.borderColor, opacity: '0.65' }"
              @click="modalMode = 'load'"
            >
              ロード
            </button>
            <div class="text-xs opacity-50 ml-auto">{{ activeSlotTypeLabel }}: {{ activeLimit }} 枠</div>
          </div>

          <div class="px-5 py-4 overflow-auto max-h-[52vh]">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                v-for="slot in activeSlots"
                :key="`${slot.slotType}-${slot.slotIndex}`"
                class="w-full text-left rounded-lg border px-3 py-3 transition-colors"
                :style="selectedSlotKey === `${slot.slotType}-${slot.slotIndex}`
                  ? { borderColor: uiSlotSelectedBorder, backgroundColor: uiSlotFilledBg }
                  : { borderColor: uiModalBoxStyle.borderColor, backgroundColor: slot.record ? uiSlotFilledBg : uiSlotEmptyBg }"
                @click="selectedSlotKey = `${slot.slotType}-${slot.slotIndex}`"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium">{{ slotLabel(slot.slotType, slot.slotIndex) }}</span>
                  <span class="text-xs opacity-50">{{ slot.updatedAtLabel || 'EMPTY' }}</span>
                </div>
                <div class="mt-1 text-sm opacity-80 truncate">{{ slot.title || '未設定タイトル' }}</div>
                <div class="mt-1 text-xs opacity-50 truncate">{{ slot.preview || 'データなし' }}</div>
              </button>
            </div>
          </div>

          <div class="px-5 py-4 border-t flex items-center gap-2" :style="{ borderColor: uiModalBoxStyle.borderColor }">
            <button
              class="px-4 py-2 rounded text-sm font-medium transition-colors"
              :style="modalMode === 'save' ? uiAccentStyle : uiLoadAccentStyle"
              :disabled="savingOrLoading || !selectedSlot"
              @click="modalMode === 'save' ? saveToSelectedSlot() : loadFromSelectedSlot()"
            >
              {{ modalMode === 'save' ? 'この枠にセーブ' : 'この枠をロード' }}
            </button>
            <button
              class="px-4 py-2 rounded text-sm opacity-70 hover:opacity-100 border transition-colors"
              :style="{ borderColor: uiModalBoxStyle.borderColor }"
              :disabled="savingOrLoading || !selectedSlot || !selectedSlot.record"
              @click="deleteSelectedSlot()"
            >
              削除
            </button>
            <button
              class="px-4 py-2 rounded text-sm opacity-60 hover:opacity-100 border transition-colors"
              :style="{ borderColor: uiModalBoxStyle.borderColor }"
              :disabled="savingOrLoading"
              @click="refreshSaves()"
            >
              再読込
            </button>
            <span v-if="savingOrLoading" class="text-xs opacity-50 ml-2">処理中...</span>
            <span class="text-xs opacity-40 ml-auto">ロード成功時は自動で閉じます</span>
          </div>
        </div>
      </div>

      <BacklogModal
        :is-open="backlog.isOpen.value"
        :entries="backlog.entries.value"
        :theme="game?.backlogTheme ?? DEFAULT_BACKLOG_THEME"
        @close="backlog.close()"
      />

      <!-- 音声同意オーバーレイ -->
      <div v-if="!soundOk && (bgmUrl || sfxUrl)" class="fixed inset-0 z-50 grid place-items-center bg-black/60">
        <div class="rounded-xl bg-white p-6 shadow-xl w-[min(560px,90vw)]">
          <h2 class="font-semibold text-lg mb-2">音声の再生について</h2>
          <p class="text-sm text-gray-600 mb-4">
            このページでは BGM / 効果音が再生されます。再生を有効にしますか？
          </p>
          <div class="flex gap-3 justify-end">
            <button 
              class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              @click="denySound"
            >
              あとで
            </button>
            <button 
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              @click="allowSound"
            >
              有効にする
            </button>
          </div>
        </div>
      </div>

      <!-- デバッグ情報 (開発時のみ) -->
      <div v-if="isDev" class="mt-4 p-4 bg-gray-800 rounded text-xs text-gray-300">
        <p>Current Node: {{ current?.id }}</p>
        <p>Next Node: {{ nextNodeId }}</p>
        <p>Choices: {{ choices?.length || 0 }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, nextTick } from 'vue'
const fullscreen = ref(false)
function openFs(){ fullscreen.value = true; document.documentElement.classList.add('overflow-hidden') }
function closeFs(){ fullscreen.value = false; document.documentElement.classList.remove('overflow-hidden') }

// Escキーでフルスクリーンを閉じる
const onEscKey = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return
  if (saveLoadOpen.value) {
    closeSaveLoadModal()
    return
  }
  closeFs()
}

import StageCanvas from '@/components/game/StageCanvas.vue'
import MessageWindow from '@/components/game/MessageWindow.vue'
import BacklogModal from '@/components/game/BacklogModal.vue'
import { computed, ref, watch, onMounted } from 'vue'
import { DEFAULT_BACKLOG_THEME } from '@talking/types'
import { useAssetMeta } from '@/composables/useAssetMeta'
import { getSignedGetUrl } from '@/composables/useSignedUrl'
import { initAudioConsent, grantAudioConsent, audioConsent } from '@/composables/useAudioConsent'
import { useVisualEffects } from '@/composables/useVisualEffects'
import { useBacklog } from '@/composables/useBacklog'
import { useToast } from '@/composables/useToast'
import { applyChoiceEffects, filterVisibleChoices, resolveChoiceTarget } from '@/utils/gameState'

const { signedFromId } = useAssetMeta()

const route = useRoute()
const router = useRouter()
const api = useGamesApi()
const runtimeConfig = useRuntimeConfig()
const toast = useToast()
const backlog = useBacklog()

const game = ref<any>(null)
const map = new Map<string, any>()
const current = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// CameraFx 型定義
type Camera = { zoom: number; cx: number; cy: number }

type CameraPoint = {
  zoom?: number
  cx?: number
  cy?: number
}

type CameraFxMode = 'cut' | 'together' | 'pan-then-zoom' | 'zoom-then-pan'

type GameNodeCameraFx = {
  from?: CameraPoint
  to?: CameraPoint
  durationMs?: number
  mode?: CameraFxMode
}

function clampZoom(v: number): number {
  return Math.max(100, Math.min(300, v))
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(100, v))
}

// node.camera から Camera を解決（デフォルト＋クランプ）
function resolveNodeCamera(node: any | null | undefined): Camera {
  const cam = (node as any)?.camera ?? {}
  const zoomRaw = typeof cam.zoom === 'number' ? cam.zoom : 100
  const cxRaw = typeof cam.cx === 'number' ? cam.cx : 50
  const cyRaw = typeof cam.cy === 'number' ? cam.cy : 50
  return {
    zoom: clampZoom(zoomRaw),
    cx: clamp01(cxRaw),
    cy: clamp01(cyRaw),
  }
}

// CameraPoint と fallback Camera から最終 Camera を作る
function resolveCameraPoint(pt: CameraPoint | undefined, fallback: Camera): Camera {
  if (!pt) return fallback
  const zoom = typeof pt.zoom === 'number' ? pt.zoom : fallback.zoom
  const cx = typeof pt.cx === 'number' ? pt.cx : fallback.cx
  const cy = typeof pt.cy === 'number' ? pt.cy : fallback.cy
  return {
    zoom: clampZoom(zoom),
    cx: clamp01(cx),
    cy: clamp01(cy),
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
const isDev = ref(runtimeConfig.public.isDev || false)
const showStartScreen = ref(true) // スタート画面の表示制御
const showEndScreen = ref(false) // 終了画面の表示制御

// ゲームUI設定（セーブロード画面テーマ）
const gameUiTheme = computed(() => (game.value as any)?.gameUiTheme ?? {})

// セーブロードモーダルへ適用するスタイル（ユーザー設定 or デフォルト）
const uiModalOverlayStyle = computed(() => ({
  backgroundColor: gameUiTheme.value.modalOverlayColor || 'rgba(0,0,0,0.65)',
}))
const uiModalBoxStyle = computed(() => ({
  backgroundColor: gameUiTheme.value.modalBgColor || '#0f172a',
  color: gameUiTheme.value.modalTextColor || '#f1f5f9',
  borderColor: gameUiTheme.value.modalBorderColor || '#334155',
  borderRadius: `${gameUiTheme.value.modalRadius ?? 16}px`,
}))
const uiAccentStyle = computed(() => ({
  backgroundColor: gameUiTheme.value.modalAccentColor || '#10b981',
}))
const uiLoadAccentStyle = computed(() => ({
  backgroundColor: gameUiTheme.value.modalLoadAccentColor || '#38bdf8',
}))
const uiSlotFilledBg = computed(() => gameUiTheme.value.slotFilledBg || 'rgba(255,255,255,0.07)')
const uiSlotEmptyBg = computed(() => gameUiTheme.value.slotEmptyBg || 'rgba(255,255,255,0.04)')
const uiSlotSelectedBorder = computed(() => gameUiTheme.value.slotSelectedBorder || '#60a5fa')
const uiQuickButtonStyle = computed(() => ({
  backgroundColor: gameUiTheme.value.quickButtonBg || 'rgba(255,255,255,0.15)',
  color: gameUiTheme.value.quickButtonText || '#ffffff',
}))

// ビジュアルエフェクト
const { effectState, playEffect } = useVisualEffects()
const showChoices = ref(false) // 選択肢の表示制御
const gameState = ref<Record<string, any>>({})

type SaveSlotType = 'MANUAL' | 'AUTO' | 'QUICK'
type ModalMode = 'save' | 'load'

const slotTypeLabels: Record<SaveSlotType, string> = {
  MANUAL: '手動',
  AUTO: 'オート',
  QUICK: 'クイック',
}

const saveLoadOpen = ref(false)
const modalMode = ref<ModalMode>('save')
const activeSlotType = ref<SaveSlotType>('MANUAL')
const selectedSlotKey = ref<string>('MANUAL-1')
const saveListData = ref<any[]>([])
const saveLimits = ref({ manual: 100, auto: 5, quick: 1, total: 106 })
const savingOrLoading = ref(false)

const slotTabs = [
  { key: 'MANUAL' as SaveSlotType, label: '手動' },
  { key: 'AUTO' as SaveSlotType, label: 'オート' },
  { key: 'QUICK' as SaveSlotType, label: 'クイック' },
]

const activeLimit = computed(() => {
  if (activeSlotType.value === 'AUTO') return saveLimits.value.auto
  if (activeSlotType.value === 'QUICK') return saveLimits.value.quick
  return saveLimits.value.manual
})

const activeSlotTypeLabel = computed(() => slotTypeLabels[activeSlotType.value])

const recordsByKey = computed(() => {
  const m = new Map<string, any>()
  for (const r of saveListData.value) {
    m.set(`${r.slotType}-${r.slotIndex}`, r)
  }
  return m
})

const activeSlots = computed(() => {
  const slots: Array<{
    slotType: SaveSlotType
    slotIndex: number
    record: any | null
    title: string
    preview: string
    updatedAtLabel: string
  }> = []
  for (let i = 1; i <= activeLimit.value; i++) {
    const key = `${activeSlotType.value}-${i}`
    const rec = recordsByKey.value.get(key) ?? null
    const payload = rec?.payload ?? {}
    const preview = payload?.context?.textPreview ?? payload?.context?.speaker ?? ''
    slots.push({
      slotType: activeSlotType.value,
      slotIndex: i,
      record: rec,
      title: rec?.title ?? '',
      preview: typeof preview === 'string' ? preview : '',
      updatedAtLabel: rec?.updatedAt
        ? new Date(rec.updatedAt).toLocaleString('ja-JP', { hour12: false })
        : '',
    })
  }
  return slots
})

const selectedSlot = computed(() => {
  const [slotTypeRaw, slotIndexRaw] = selectedSlotKey.value.split('-')
  const slotType = (slotTypeRaw || activeSlotType.value) as SaveSlotType
  const slotIndex = Number(slotIndexRaw || 1)
  return activeSlots.value.find(s => s.slotType === slotType && s.slotIndex === slotIndex) ?? null
})

// 音声同意状態
const soundOk = audioConsent

// クエリパラメータを文字列に正規化(配列対応)
function qStr(v: unknown) {
  if (Array.isArray(v)) return v[0] as string | undefined
  return v as string | undefined
}

function slotLabel(slotType: SaveSlotType, slotIndex: number) {
  return `${slotTypeLabels[slotType]} ${slotIndex}`
}

watch(activeSlotType, (newType) => {
  selectedSlotKey.value = `${newType}-1`
})

function openSaveLoadModal(mode: ModalMode) {
  modalMode.value = mode
  saveLoadOpen.value = true
  void refreshSaves()
}

function closeSaveLoadModal() {
  saveLoadOpen.value = false
}

async function refreshSaves() {
  if (!game.value?.id) return
  try {
    const res: any = await api.listSaves(game.value.id)
    saveListData.value = Array.isArray(res?.saves) ? res.saves : []
    if (res?.limits) {
      saveLimits.value = {
        manual: Number(res.limits.manual ?? 100),
        auto: Number(res.limits.auto ?? 5),
        quick: Number(res.limits.quick ?? 1),
        total: Number(res.limits.total ?? 106),
      }
    }
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || 'セーブ一覧の取得に失敗しました')
  }
}

function findSceneIdByNodeId(nodeId: string | null | undefined) {
  if (!nodeId || !game.value?.scenes) return null
  for (const s of game.value.scenes) {
    if (s.nodes?.some((n: any) => n.id === nodeId)) return s.id
  }
  return null
}

function buildSavePayload() {
  return {
    schemaVersion: 2,
    progress: {
      nodeId: current.value?.id ?? null,
      accumulatedText: accumulatedText.value,
      showEndScreen: showEndScreen.value,
      colorFilter: currentColorFilter.value ?? null,
      state: { ...gameState.value },
    },
    context: {
      sceneId: findSceneIdByNodeId(current.value?.id),
      speaker: speaker.value,
      textPreview: (current.value?.text ?? '').slice(0, 120),
      savedAt: new Date().toISOString(),
    },
    ext: {},
  }
}

async function saveToSelectedSlot() {
  if (!game.value?.id || !selectedSlot.value) return
  savingOrLoading.value = true
  try {
    const rec = selectedSlot.value.record
    await api.upsertSave(game.value.id, {
      slotType: selectedSlot.value.slotType,
      slotIndex: selectedSlot.value.slotIndex,
      title: `${slotLabel(selectedSlot.value.slotType, selectedSlot.value.slotIndex)} / ${speaker.value || 'No Speaker'}`,
      payload: buildSavePayload(),
      expectedVersion: typeof rec?.version === 'number' ? rec.version : undefined,
    })
    await refreshSaves()
    toast.success(`${slotLabel(selectedSlot.value.slotType, selectedSlot.value.slotIndex)} にセーブしました`)
  } catch (e: any) {
    const status = e?.statusCode || e?.status || e?.data?.statusCode
    if (status === 409) {
      toast.warning('他端末更新と競合しました。最新状態を再読込してから再度セーブしてください')
    } else {
      toast.error(e?.data?.message || e?.message || 'セーブに失敗しました')
    }
  } finally {
    savingOrLoading.value = false
  }
}

async function loadFromSelectedSlot() {
  if (!game.value?.id || !selectedSlot.value) return
  savingOrLoading.value = true
  backlog.reset()
  try {
    const rec: any = await api.getSave(
      game.value.id,
      selectedSlot.value.slotType,
      selectedSlot.value.slotIndex,
    )
    const payload = rec?.payload ?? {}
    const progress = payload?.progress ?? {}
    const targetNodeId = progress?.nodeId
    if (!targetNodeId || !map.has(targetNodeId)) {
      throw new Error('保存先ノードが見つかりません')
    }

    const node = map.get(targetNodeId)
    accumulatedText.value = typeof progress?.accumulatedText === 'string' ? progress.accumulatedText : ''
    gameState.value = progress?.state && typeof progress.state === 'object'
      ? { ...progress.state }
      : {}
    showStartScreen.value = false
    showEndScreen.value = !!progress?.showEndScreen
    showChoices.value = false

    const prevNode = current.value
    current.value = node
    if (progress?.colorFilter !== undefined) {
      currentColorFilter.value = progress.colorFilter
    } else {
      currentColorFilter.value = node.colorFilter ?? null
    }

    applyCameraForNode(prevNode, node)
    await playSfxForCurrentNode()

    const sceneId = findSceneIdByNodeId(targetNodeId)
    if (sceneId) {
      await router.replace({
        name: route.name as string,
        params: route.params,
        query: { ...route.query, sceneId, nodeId: targetNodeId },
      })
    }

    closeSaveLoadModal()
    toast.success(`${slotLabel(selectedSlot.value.slotType, selectedSlot.value.slotIndex)} をロードしました`)
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || 'ロードに失敗しました')
  } finally {
    savingOrLoading.value = false
  }
}

async function deleteSelectedSlot() {
  if (!game.value?.id || !selectedSlot.value || !selectedSlot.value.record) return
  savingOrLoading.value = true
  try {
    await api.deleteSave(game.value.id, selectedSlot.value.slotType, selectedSlot.value.slotIndex)
    await refreshSaves()
    toast.success(`${slotLabel(selectedSlot.value.slotType, selectedSlot.value.slotIndex)} を削除しました`)
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || '削除に失敗しました')
  } finally {
    savingOrLoading.value = false
  }
}

// 開始シーン・ノードの強制解決（クエリパラメータがない場合はreplaceで追加）
async function ensureStartQuery() {
  const q = route.query
  const sceneIdQ = qStr(q.sceneId)
  const nodeIdQ = qStr(q.nodeId)
  
  // 既にクエリパラメータがあれば何もしない
  if (sceneIdQ && nodeIdQ) return

  // ゲームデータがない場合は何もしない
  if (!game.value) return

  const scenes = game.value.scenes
  if (!scenes?.length) return

  // 開始シーンを決定
  const scene = scenes.find((s: any) => s.id === sceneIdQ) ?? scenes[0]
  if (!scene) return

  // 開始ノードを決定(優先順: scene.startNodeId → 先頭ノード)
  let nodeId = scene.startNodeId
  if (!nodeId && scene.nodes?.length) {
    nodeId = scene.nodes[0].id
  }
  if (!nodeId) return

  // クエリパラメータをreplaceで追加
  await router.replace({
    name: route.name as string,
    params: route.params,
    query: { ...q, sceneId: scene.id, nodeId }
  })
}

// 開始シーン・ノードを優先順で解決する関数
function resolveStart(gameData: any) {
  if (!gameData?.scenes?.length) return { scene: undefined, node: undefined }

  const sceneIdQ = qStr(route.query.sceneId)
  const nodeIdQ  = qStr(route.query.nodeId)

  // 1. どのシーンから始めるか
  let scene = gameData.scenes.find((s: any) => s.id === sceneIdQ) ?? gameData.scenes[0]

  // 2. どのノードから始めるか (優先順: nodeId → scene.startNodeId → 先頭ノード)
  let node = scene?.nodes?.find((n: any) => n.id === nodeIdQ)
  if (!node && scene?.startNodeId) {
    node = scene.nodes?.find((n: any) => n.id === scene.startNodeId)
  }
  if (!node) {
    node = scene?.nodes?.[0]
  }

  return { scene, node }
}

// 開始位置を適用する(データ読込後に必ず呼ぶ)
function applyStart() {
  const { scene, node } = resolveStart(game.value)
  if (node) {
    accumulatedText.value = ''
    current.value = node

    // カラーフィルターを初期化
    currentColorFilter.value = node.colorFilter || null

    // ノード開始時にカメラを適用（前ノードは無し）
    applyCameraForNode(null, node)

    // ここで効果音を再生
    void playSfxForCurrentNode()
    // クエリパラメータがある場合は自動開始
    if (route.query.sceneId || route.query.nodeId) {
      showStartScreen.value = false
    }
  } else if (scene) {
    error.value = '開始ノードがありません'
  } else {
    error.value = '開始シーンがありません'
  }
}

// 累積テキスト（前ノードのセリフを継続する場合に使用）
const accumulatedText = ref('')

// thumb のキャッシュ
const thumbCache = ref<Map<string, string>>(new Map())

// Resolve portraits (computed で常に最新の thumb を反映)
const portraitsResolved = computed(() => {
  const arr = current.value?.portraits ?? []
  return arr.map((p: any) => {
    const cacheKey = p.imageId || p.key
    return {
      ...p,
      thumb: p.thumb || thumbCache.value.get(cacheKey) || ''
    }
  })
})

// current.portraits が変化したら thumb を補完
watch(
  () => current.value?.portraits,
  async (list: any[] | undefined) => {
    if (!list || list.length === 0) return
    console.log('[play.vue] portraits changed, resolving thumbs...', list)
    
    for (const p of list) {
      const cacheKey = p.imageId || p.key
      if (!cacheKey) {
        console.warn('[play.vue] portrait has no imageId or key', p)
        continue
      }
      
      if (!thumbCache.value.has(cacheKey)) {
        try {
          let url: string | null = null
          
          // 優先順位: 1) p.key がある場合は直接署名URL取得、2) imageId から取得
          if (p.key) {
            url = await getSignedGetUrl(p.key)
            console.log('[play.vue] resolved thumb via key for', cacheKey, '→', url)
          } else if (p.imageId) {
            url = await signedFromId(p.imageId, true)
            console.log('[play.vue] resolved thumb via imageId for', cacheKey, '→', url)
          }
          
          if (url) {
            thumbCache.value.set(cacheKey, url)
          }
        } catch (e) {
          console.warn('[play.vue] thumb resolve failed for', p, e)
        }
      } else {
        console.log('[play.vue] using cached thumb for', cacheKey)
      }
    }
    console.log('[play.vue] thumbCache now has', thumbCache.value.size, 'entries', Array.from(thumbCache.value.keys()))
  },
  { immediate: true, deep: true }
)

// 背景画像URL
const bgUrl = ref<string | null>(null)
watch(
  () => current.value?.bgAssetId,
  async (id) => {
    bgUrl.value = id ? await signedFromId(id, true) : null
  },
  { immediate: true }
)

// ビジュアルエフェクトの自動再生
watch(
  current,
  (node) => {
    if (node?.visualFx) {
      playEffect(node.visualFx)
    }
  },
  { immediate: false }
)

// scaleToHeight: 旧仕様の scale 値を％に変換
function scaleToHeight(s: number | undefined) {
  if (s == null) return 30
  return s > 60 ? Math.round(s / 3) : s
}

// BGM wiring (click to start)
const bgmUrl = ref<string | null>(null)
const bgmRef = ref<HTMLAudioElement | null>(null)

// SFX (効果音) wiring: ノードごとに1回だけ鳴らすワンショット
const sfxUrl = ref<string | null>(null)
const sfxRef = ref<HTMLAudioElement | null>(null)

// 音声を有効にする
async function allowSound() {
  const media: HTMLMediaElement[] = []
  if (bgmRef.value) media.push(bgmRef.value)
  if (sfxRef.value) media.push(sfxRef.value)

  if (media.length > 0) {
    await grantAudioConsent(media)
  }
}

// 音声を後回しにする
function denySound() {
  // 何もしない（同意しない状態を維持）
}

// BGMを再生(soundOkの場合のみ)
function ensureBgm() {
  if (soundOk.value && bgmRef.value) {
    bgmRef.value.play().catch(() => {})
  }
}

// currentのmusicAssetIdが変化したらBGM URLを更新
watch(
  () => current.value?.musicAssetId,
  async (id) => { bgmUrl.value = id ? await signedFromId(id, false) : null },
  { immediate: true }
)

// currentのsfxAssetIdが変化したらSFX URLを更新
watch(
  () => current.value?.sfxAssetId,
  async (id) => {
    if (!id) {
      sfxUrl.value = null
      return
    }
    sfxUrl.value = await signedFromId(id, false)
  },
  { immediate: true }
)

// 効果音を実際に再生するヘルパー関数
async function playSfxForCurrentNode() {
  if (!soundOk.value) return
  const id = current.value?.sfxAssetId
  if (!id) return

  // URL は watch 側で通常解決されるが、保険としてここでも解決しておく
  if (!sfxUrl.value) {
    sfxUrl.value = await signedFromId(id, false)
  }

  await nextTick()
  const el = sfxRef.value
  if (!el) return

  try {
    el.currentTime = 0
    await el.play()
  } catch (e) {
    console.warn('[play.vue] failed to play sfx', e)
  }
}

// Message theme (project-level setting with fallback)
const defaultThemeV2 = {
  themeVersion: 2,
  rows: 3,
  scale: 'md',
  fontPreset: 5,
  windowPreset: 6,
  paddingPreset: 5,
  radiusPreset: 5,
  borderPreset: 3,
  shadowPreset: 4,
  typeSpeedPreset: 6,
  frameBg: { r: 20, g: 24, b: 36, a: 0.72 },
  frameBorder: { r: 255, g: 255, b: 255, a: 0.2 },
  nameBg: { r: 0, g: 0, b: 0, a: 0.55 },
  textColor: { r: 255, g: 255, b: 255, a: 1 },
  gradientDirection: 'none',
  gradientColor: { r: 40, g: 44, b: 52, a: 0.72 },
  fontWeight: 'normal',
  fontStyle: 'normal',
}
const theme = computed(() => (game.value as any)?.messageTheme ?? defaultThemeV2)

// StageCanvas はテーマをそのまま渡す（内部で v2 解決される）
const stageTheme = computed(() => theme.value)


// StageCanvas 用のキャラクター配列
const stageCharacters = computed(() => {
  return portraitsResolved.value.map((p: any) => {
    const cacheKey = p.imageId || p.key
    return {
      key: cacheKey || String(Math.random()),
      url: p.thumb || thumbCache.value.get(cacheKey) || '',
      x: p.x ?? 50,
      y: p.y ?? 80,
      scale: p.scale ?? 100,
      z: p.z ?? 0
    }
  })
})

// StageCanvas 用のメッセージ (play.vue では null - メッセージウィンドウは別で表示)
const stageMessage = computed(() => null)

// StageCanvas 用のカメラ（アニメーション対応）
const currentCamera = ref<Camera>({ zoom: 100, cx: 50, cy: 50 })

// StageCanvas 用のカラーフィルター（継続管理）
const currentColorFilter = ref<any>(null)

// StageCanvas に渡すカメラ（アニメの結果を反映）
const stageCamera = computed(() => currentCamera.value)

// カメラアニメーション管理
let cameraAnimId: number | null = null

function stopCameraAnimation() {
  if (cameraAnimId != null) {
    cancelAnimationFrame(cameraAnimId)
    cameraAnimId = null
  }
}

function applyCameraInstant(cam: Camera) {
  stopCameraAnimation()
  currentCamera.value = cam
}

function animateCamera(from: Camera, to: Camera, fx: GameNodeCameraFx) {
  stopCameraAnimation()

  const duration = fx.durationMs ?? 0
  if (duration <= 0) {
    applyCameraInstant(to)
    return
  }

  const mode: CameraFxMode = fx.mode ?? 'together'
  const start: Camera = { ...from }
  const end: Camera = { ...to }

  const startTime = performance.now()

  const step = (now: number) => {
    const elapsed = now - startTime
    const tRaw = duration <= 0 ? 1 : Math.min(1, elapsed / duration)
    const t = tRaw // ひとまず線形。必要なら ease を検討

    let zoom: number
    let cx: number
    let cy: number

    if (mode === 'pan-then-zoom') {
      const mid = 0.5
      if (t <= mid) {
        const tt = t / mid
        cx = lerp(start.cx, end.cx, tt)
        cy = lerp(start.cy, end.cy, tt)
        zoom = start.zoom
      } else {
        const tt = (t - mid) / (1 - mid)
        cx = end.cx
        cy = end.cy
        zoom = lerp(start.zoom, end.zoom, tt)
      }
    } else if (mode === 'zoom-then-pan') {
      const mid = 0.5
      if (t <= mid) {
        const tt = t / mid
        zoom = lerp(start.zoom, end.zoom, tt)
        cx = start.cx
        cy = start.cy
      } else {
        const tt = (t - mid) / (1 - mid)
        zoom = end.zoom
        cx = lerp(start.cx, end.cx, tt)
        cy = lerp(start.cy, end.cy, tt)
      }
    } else {
      // together / その他未知値はまとめて扱う
      zoom = lerp(start.zoom, end.zoom, t)
      cx = lerp(start.cx, end.cx, t)
      cy = lerp(start.cy, end.cy, t)
    }

    currentCamera.value = {
      zoom: clampZoom(zoom),
      cx: clamp01(cx),
      cy: clamp01(cy),
    }

    if (elapsed < duration) {
      cameraAnimId = requestAnimationFrame(step)
    } else {
      cameraAnimId = null
      currentCamera.value = {
        zoom: clampZoom(end.zoom),
        cx: clamp01(end.cx),
        cy: clamp01(end.cy),
      }
    }
  }

  cameraAnimId = requestAnimationFrame(step)
}

function applyCameraForNode(prevNode: any | null, node: any | null) {
  if (!node) return

  const fx = (node as any).cameraFx as GameNodeCameraFx | null | undefined

  // 終了カメラ（デフォルト: このノードの camera）
  const endBase = resolveNodeCamera(node)
  const endCam = resolveCameraPoint(fx?.to, endBase)

  // CameraFx 無し or cut / duration<=0 の場合は即座に適用
  if (!fx || fx.mode === 'cut' || !fx.durationMs || fx.durationMs <= 0) {
    applyCameraInstant(endCam)
    return
  }

  // 開始カメラ（デフォルト: 前ノード or 現在カメラ）
  let startBase: Camera
  if (fx.from) {
    // 明示指定
    const fallback = prevNode ? resolveNodeCamera(prevNode) : currentCamera.value
    startBase = resolveCameraPoint(fx.from, fallback)
  } else if (prevNode) {
    startBase = resolveNodeCamera(prevNode)
  } else {
    startBase = currentCamera.value
  }

  animateCamera(startBase, endCam, fx)
}

onMounted(async () => {
  // 音声同意を確認
  initAudioConsent()
  backlog.reset()
  
  // Escキーイベントリスナーを追加
  window.addEventListener('keydown', onEscKey)
  
  try {
    game.value = await api.get(route.params.id as string)
    
    // ノードマップを構築
    game.value.scenes.forEach((s: any) => {
      s.nodes.forEach((n: any) => {
        map.set(n.id, n)
      })
    })

    loading.value = false
    
    // クエリパラメータがない場合は自動的に追加
    await ensureStartQuery()
    
    // データ読込完了後に必ず開始位置を適用
    applyStart()
    
    // 音声同意済みかつBGMがあれば自動再生
    if (soundOk.value && bgmUrl.value && bgmRef.value) {
      bgmRef.value.play().catch(() => {})
    }
  } catch (err: any) {
    console.error('Failed to load game:', err)
    error.value = err.message || 'ゲームの読み込みに失敗しました'
    loading.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onEscKey)
  stopCameraAnimation()
})

// クエリパラメータが変わったときも再解決(ゲームロード完了後のみ)
watch(
  () => [route.query.sceneId, route.query.nodeId, game.value?.scenes?.length],
  async () => {
    if (game.value && !loading.value) {
      await ensureStartQuery()
      applyStart()
    }
  },
  { deep: true }
)

function start() {
  // スタート画面を非表示にして開始
  accumulatedText.value = ''
  gameState.value = {}
  showStartScreen.value = false
  
  if (!current.value) {
    applyStart()
  }
  
  // 音声同意済みならBGMを再生
  ensureBgm()
}

function restart() {
  backlog.reset()
  accumulatedText.value = ''
  gameState.value = {}
  showStartScreen.value = true
  showEndScreen.value = false
  showChoices.value = false // 選択肢表示をリセット
  current.value = null
  currentColorFilter.value = null // カラーフィルターをリセット
  applyStart()
  ensureBgm()
}

function selectChoice(choice: any) {
  pushCurrentToBacklog()
  const nextState = applyChoiceEffects(gameState.value as any, choice?.effects)
  gameState.value = nextState
  showChoices.value = false
  showEndScreen.value = false
  go(resolveChoiceTarget(choice, nextState))
  ensureBgm()
}

function go(targetNodeId: string | null) {
  if (!targetNodeId) {
    current.value = null
    return
  }
  
  showEndScreen.value = false
  showChoices.value = false // 選択肢表示をリセット
  
  const nextNode = map.get(targetNodeId)
  if (nextNode) {
    console.log('[play.vue] go() - nextNode:', {
      id: nextNode.id,
      text: nextNode.text,
      continuesPreviousText: nextNode.continuesPreviousText
    })

    const prevNode = current.value
    
    // 次のノードが前のテキストを継続する場合、現在のテキストを累積に追加
    if (nextNode.continuesPreviousText) {
      // 現在の完全なテキスト（累積 + 現在のテキスト）を保存
      const newAccumulated = accumulatedText.value + (current.value?.text ?? '')
      console.log('[play.vue] go() -継続モード:', {
        before: accumulatedText.value,
        currentText: current.value?.text,
        after: newAccumulated
      })
      accumulatedText.value = newAccumulated
    } else {
      // 継続しない場合はリセット
      console.log('[play.vue] go() - リセット')
      accumulatedText.value = ''
    }
    current.value = nextNode

    // カラーフィルターの更新（次ノードで指定があればそれを使用、なければ現在のフィルターを継続）
    if (nextNode.colorFilter !== undefined) {
      currentColorFilter.value = nextNode.colorFilter
    }
    // colorFilter が undefined の場合は現在のフィルターを継続（何もしない）

    // ノード遷移時にカメラ演出を適用
    applyCameraForNode(prevNode, nextNode)

    // 遷移先ノードの効果音を再生
    void playSfxForCurrentNode()
  } else {
    console.warn('Node not found:', targetNodeId)
    current.value = null
  }
}

function advanceWithinNodeOrNext() {
  showChoices.value = false // 選択肢表示をリセット
  pushCurrentToBacklog()
  
  // 選択肢がある場合は選択肢を表示
  if (hasChoices.value) {
    showChoices.value = true
    return
  }
  
  // nextNodeIdがある場合はそれに従う
  if (current.value?.nextNodeId) {
    go(current.value.nextNodeId)
    return
  }
  
  // nextNodeIdも選択肢も無い場合は終了画面を表示
  showEndScreen.value = true
}

const speaker = computed(() => {
  if (!current.value) return ''
  return current.value.speakerDisplayName || ''
})

function pushCurrentToBacklog() {
  if (!current.value?.id || !current.value?.text) return

  const fullText = `${prefixText.value}${current.value.text}`
  const entry = {
    nodeId: current.value.id,
    speakerName: current.value.speakerDisplayName ?? null,
    text: fullText,
  }
  const last = backlog.entries.value[backlog.entries.value.length - 1]

  if (
    last?.nodeId === entry.nodeId &&
    last?.speakerName === entry.speakerName &&
    last?.text === entry.text
  ) {
    return
  }

  backlog.push(entry)
}

// 累積テキスト（即座に表示する部分）
const prefixText = computed(() => {
  const result = current.value?.continuesPreviousText ? accumulatedText.value : ''
  console.log('[play.vue] prefixText computed:', {
    continuesPreviousText: current.value?.continuesPreviousText,
    accumulatedText: accumulatedText.value,
    result
  })
  return result
})

// デバッグ用: prefixTextの変化を監視
watch(prefixText, (newVal) => {
  console.log('[play.vue] prefixText changed to:', newVal)
}, { immediate: true })

// 現在のノードのテキスト（タイプライター効果を適用する部分）
const displayedText = computed(() => {
  return current.value?.text ?? ''
})

const choices = computed(() => {
  if (!current.value) return []
  return filterVisibleChoices(current.value.choices || [], gameState.value as any)
})

const hasChoices = computed(() => choices.value.length > 0)

const nextNodeId = computed(() => {
  if (!current.value) return null
  return current.value.nextNodeId || null
})

// 終了ノードかどうかを判定（次のノードも選択肢もシーン内の次も無い）
const isEndNode = computed(() => {
  if (!current.value) return false
  
  // 選択肢がある場合は終了ではない
  if (current.value.choices && current.value.choices.length > 0) return false
  
  // nextNodeIdがある場合は終了ではない
  if (current.value.nextNodeId) return false
  
  // シーン内に次のノードがあるかチェック
  const scene = game.value?.scenes?.find((s: any) => 
    s.nodes?.some((n: any) => n.id === current.value.id)
  )
  if (scene) {
    const idx = scene.nodes?.findIndex((n: any) => n.id === current.value.id)
    if (idx !== undefined && idx >= 0 && scene.nodes[idx + 1]) {
      return false // 次のノードがある
    }
  }
  
  return true // すべての遷移先が無い = 終了
})

// プレイヤにカメラを反映（エディタと共通のカメラ座標系）
const camera = computed(() => (current.value?.camera ?? { zoom: 100, cx: 50, cy: 50 }))
</script>
