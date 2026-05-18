<script setup lang="ts">
import MessageWindow from '@/components/game/MessageWindow.vue'
import StageCanvas from '@/components/game/StageCanvas.vue'
import NodePicker from '@/components/game/NodePicker.vue'
import AssetPicker from '@/components/pickers/AssetPicker.vue'
import CharacterPicker from '@/components/pickers/CharacterPicker.vue'
import CharacterImagePicker from '@/components/pickers/CharacterImagePicker.vue'
import MiniStage from '@/components/game/MiniStage.vue'
import MessageThemeModal from '@/components/game/MessageThemeModal.vue'
import NodeEffectsFields from '@/components/editor/NodeEffectsFields.vue'
import NodeTransitionFields from '@/components/editor/NodeTransitionFields.vue'
import NodeChoicesFields from '@/components/editor/NodeChoicesFields.vue'
import NodeBasicInfoFields from '@/components/editor/NodeBasicInfoFields.vue'
import NodeMaterialsFields from '@/components/editor/NodeMaterialsFields.vue'
import NodePortraitsFields from '@/components/editor/NodePortraitsFields.vue'
import NodeSaveActions from '@/components/editor/NodeSaveActions.vue'
import NodeDangerZone from '@/components/editor/NodeDangerZone.vue'
import EditorPublishCheckSummaryCard from '@/components/editor/EditorPublishCheckSummaryCard.vue'
import { getSignedGetUrl } from '@/composables/useSignedUrl'
import { useAssetMeta } from '@/composables/useAssetMeta'
import { useVisualEffects } from '@/composables/useVisualEffects'
import { resolveFallbackNodeId } from '@/utils/editorSelection'
import {
  runScenarioCheck,
  categorizeIssue,
  prepublishCategoryLabel,
  type ScenarioCheckIssue,
  type ScenarioCheckSeverity,
  type PrepublishIssueCategory,
} from '@/utils/scenarioCheck'
import type { VisualEffect } from '@talking/types'
const baseURL = useRuntimeConfig().public.apiBase
const { $api } = useNuxtApp()

definePageMeta({
  middleware: 'require-auth'
})

const route = useRoute()
const api = useGamesApi()
const { get: getAsset, signedFromId } = useAssetMeta()

// Declare all refs first before using them in computed/watch
const game = ref<any>(null)
const scenes = ref<any[]>([])
const nodes = ref<any[]>([])
const scene = ref<any>(null)
const node = ref<any>(null)
const nodeDraft = reactive<any>({})
const loading = ref(true)
const openBgPicker = ref(false)
const openMusicPicker = ref(false)
const openCharPicker = ref(false)
const openCharImagePicker = ref(false)
const openSfxPicker = ref(false)
const openNodePicker = ref(false)

const bgUrl = ref<string | null>(null)
const musicUrl = ref<string | null>(null)
const musicTitle = ref<string>('')
const sfxUrl = ref<string | null>(null)
const pendingIndex = ref<number | null>(null)
const saving = ref(false)
const sceneNameDraft = ref('')

// Reference diagnostics
const referenceDiagnostics = ref<any>(null)
const referenceDiagnosticsLoading = ref(false)
const referenceDiagnosticsError = ref<string | null>(null)

// ビジュアルエフェクト
const { effectState, playEffect } = useVisualEffects()

// コピー対象トグル（localStorage永続化）
const copyOpts = reactive({
  bg: true,
  chars: true,
  bgm: true,
  camera: true
})

const RIGHT_PANE_SECTIONS_STORAGE_KEY = 'talking.editor.rightPaneSections.v1'
const LAST_SELECTION_STORAGE_KEY_PREFIX = 'talking.editor.lastSelection.v1:'
const CREATION_GUIDE_HIDDEN_STORAGE_KEY_PREFIX = 'talking.editor.creationGuideHidden.v1:'
const PUBLISHED_EDIT_BANNER_COLLAPSED_STORAGE_KEY = 'talking.editor.publishedEditBannerCollapsed.v1'

const publishedEditBannerCollapsed = ref(false)

function setPublishedEditBannerCollapsed(next: boolean) {
  publishedEditBannerCollapsed.value = next
  if (!process.client) return
  localStorage.setItem(PUBLISHED_EDIT_BANNER_COLLAPSED_STORAGE_KEY, String(next))
}

type LastSelectionState = {
  sceneId: string | null
  nodeId: string | null
  updatedAt: number
}

const defaultSectionOpen = {
  basic: true,
  materials: true,
  effects: false,
  transitions: true,
  guide: true,
  scenarioCheck: true,
  dangerous: false
} as const

type SectionOpenKey = keyof typeof defaultSectionOpen
type SectionOpenState = Record<SectionOpenKey, boolean>

const sectionOpen = reactive<SectionOpenState>({ ...defaultSectionOpen })

function parseSectionOpen(value: unknown): Partial<SectionOpenState> {
  if (!value || typeof value !== 'object') return {}

  const parsed = value as Record<string, unknown>
  const nextState: Partial<SectionOpenState> = {}
  for (const key of Object.keys(defaultSectionOpen) as SectionOpenKey[]) {
    if (typeof parsed[key] === 'boolean') {
      nextState[key] = parsed[key] as boolean
    }
  }
  return nextState
}

function restoreSectionOpen() {
  if (!process.client) return

  const saved = localStorage.getItem(RIGHT_PANE_SECTIONS_STORAGE_KEY)
  if (!saved) {
    Object.assign(sectionOpen, defaultSectionOpen)
    return
  }

  try {
    const parsed = JSON.parse(saved)
    Object.assign(sectionOpen, defaultSectionOpen, parseSectionOpen(parsed))
  } catch (error) {
    console.warn('Failed to parse sectionOpen from localStorage', error)
    Object.assign(sectionOpen, defaultSectionOpen)
  }
}

function persistSectionOpen() {
  if (!process.client) return
  localStorage.setItem(RIGHT_PANE_SECTIONS_STORAGE_KEY, JSON.stringify(sectionOpen))
}

function resetSectionOpen() {
  Object.assign(sectionOpen, defaultSectionOpen)
}

const creationGuideHidden = ref(false)

function buildCreationGuideHiddenStorageKey(gameId: string) {
  return `${CREATION_GUIDE_HIDDEN_STORAGE_KEY_PREFIX}${gameId}`
}

function restoreCreationGuideHidden() {
  if (!process.client) return

  const gameId = normalizeNodeId(game.value?.id)
  if (!gameId) {
    creationGuideHidden.value = false
    return
  }

  creationGuideHidden.value = localStorage.getItem(buildCreationGuideHiddenStorageKey(gameId)) === 'true'
}

function setCreationGuideHidden(next: boolean) {
  creationGuideHidden.value = next
  if (!process.client) return

  const gameId = normalizeNodeId(game.value?.id)
  if (!gameId) return

  const storageKey = buildCreationGuideHiddenStorageKey(gameId)
  if (next) {
    localStorage.setItem(storageKey, 'true')
  } else {
    localStorage.removeItem(storageKey)
  }
}

function showCreationGuide() {
  sectionOpen.guide = true
  setCreationGuideHidden(false)
}

watch(
  () => game.value?.id,
  () => {
    restoreCreationGuideHidden()
  },
  { immediate: true }
)

function buildLastSelectionStorageKey(gameId: string) {
  return `${LAST_SELECTION_STORAGE_KEY_PREFIX}${gameId}`
}

function parseLastSelection(value: unknown): LastSelectionState | null {
  if (!value || typeof value !== 'object') return null

  const parsed = value as Record<string, unknown>
  const sceneId = normalizeNodeId(parsed.sceneId)
  const nodeId = normalizeNodeId(parsed.nodeId)
  const updatedAt = typeof parsed.updatedAt === 'number' && Number.isFinite(parsed.updatedAt)
    ? parsed.updatedAt
    : Date.now()

  if (!sceneId && !nodeId) return null

  return {
    sceneId,
    nodeId,
    updatedAt,
  }
}

function getSavedLastSelection(gameId: string): LastSelectionState | null {
  if (!process.client) return null

  const raw = localStorage.getItem(buildLastSelectionStorageKey(gameId))
  if (!raw) return null

  try {
    const parsed = parseLastSelection(JSON.parse(raw))
    if (!parsed) {
      clearLastSelection(gameId)
      return null
    }
    return parsed
  } catch (error) {
    console.warn('Failed to parse lastSelection from localStorage', error)
    clearLastSelection(gameId)
    return null
  }
}

function clearLastSelection(gameId: string) {
  if (!process.client) return
  localStorage.removeItem(buildLastSelectionStorageKey(gameId))
}

function persistLastSelection(sceneId: string | null, nodeId: string | null) {
  if (!process.client) return

  const gameId = normalizeNodeId(game.value?.id)
  if (!gameId) return

  const normalizedSceneId = normalizeNodeId(sceneId)
  const normalizedNodeId = normalizeNodeId(nodeId)
  if (!normalizedSceneId && !normalizedNodeId) {
    clearLastSelection(gameId)
    return
  }

  const payload: LastSelectionState = {
    sceneId: normalizedSceneId,
    nodeId: normalizedNodeId,
    updatedAt: Date.now(),
  }

  localStorage.setItem(buildLastSelectionStorageKey(gameId), JSON.stringify(payload))
}

function persistCurrentSelection() {
  persistLastSelection(scene.value?.id ?? null, node.value?.id ?? null)
}

async function restoreLastSelection(): Promise<boolean> {
  const gameId = normalizeNodeId(game.value?.id)
  if (!gameId) return false
  if (!Array.isArray(scenes.value) || scenes.value.length === 0) return false

  const saved = getSavedLastSelection(gameId)
  if (!saved) return false

  const sceneById = new Map(scenes.value.map((sceneItem: any) => [sceneItem.id, sceneItem]))
  let resolvedScene: any | null = null
  let resolvedNodeId: string | null = null
  let resolvedSceneNodes: any[] | null = null
  let shouldFallbackToSceneNode = false

  if (saved.nodeId) {
    const allSceneIds = scenes.value.map((sceneItem: any) => sceneItem.id)
    const searchOrder = saved.sceneId
      ? [saved.sceneId, ...allSceneIds.filter((sceneId: string) => sceneId !== saved.sceneId)]
      : allSceneIds

    for (const sceneId of searchOrder) {
      const sceneItem = sceneById.get(sceneId)
      if (!sceneItem) continue

      try {
        const sceneNodes = (await api.listNodes(sceneItem.id)) as any[]
        const found = sceneNodes.find((nodeItem: any) => nodeItem.id === saved.nodeId)
        if (found) {
          resolvedScene = sceneItem
          resolvedNodeId = found.id
          resolvedSceneNodes = sceneNodes
          break
        }
      } catch (error) {
        console.warn('Failed to search node for lastSelection restore:', error)
      }
    }
  }

  if (!resolvedScene && saved.sceneId) {
    resolvedScene = sceneById.get(saved.sceneId) ?? null
    shouldFallbackToSceneNode = Boolean(resolvedScene && saved.nodeId)
  }

  if (!resolvedScene) {
    clearLastSelection(gameId)
    return false
  }

  await selectScene(resolvedScene, {
    skipPersist: true,
    preloadedNodes: resolvedSceneNodes ?? undefined,
  })

  if (shouldFallbackToSceneNode && nodes.value.length > 0) {
    resolvedNodeId = resolveFallbackNodeId(resolvedScene, nodes.value)
  }

  if (resolvedNodeId) {
    const targetNode = nodes.value.find((nodeItem: any) => nodeItem.id === resolvedNodeId)
    if (targetNode) {
      selectNode(targetNode, { skipPersist: true })
    }
  }

  persistCurrentSelection()
  return true
}

async function selectInitialSceneAndNode() {
  if (!Array.isArray(scenes.value) || scenes.value.length === 0) return

  const startScene = (game.value?.startSceneId
    ? scenes.value.find((s: any) => s.id === game.value.startSceneId)
    : null) ?? scenes.value[0]

  if (!startScene) return

  await selectScene(startScene, { skipPersist: true })

  if (nodes.value.length > 0) {
    const startNodeId = resolveFallbackNodeId(startScene, nodes.value)
    const startNode = startNodeId
      ? nodes.value.find((n: any) => n.id === startNodeId)
      : null

    if (startNode) {
      selectNode(startNode, { skipPersist: true })
    }
  }

  persistCurrentSelection()
}

function buildTestPlayUrl(sceneId?: string | null, nodeId?: string | null): string | null {
  const gameId = normalizeNodeId(game.value?.id)
  if (!gameId) return null

  const query = new URLSearchParams({ testPlay: '1' })
  const normalizedSceneId = normalizeNodeId(sceneId)
  const normalizedNodeId = normalizeNodeId(nodeId)

  if (normalizedSceneId) {
    query.set('sceneId', normalizedSceneId)
  }
  if (normalizedNodeId) {
    query.set('nodeId', normalizedNodeId)
  }

  return `/games/${gameId}/play?${query.toString()}`
}

function openTestPlayUrl(sceneId?: string | null, nodeId?: string | null) {
  const url = buildTestPlayUrl(sceneId, nodeId)
  if (!url) return
  window.open(url, '_blank')
}

function resolveGameStartForTest() {
  const scenesForPicker = nodePickerScenes.value
  const projectStartSceneId = normalizeNodeId(game.value?.startSceneId)
  const startScene = projectStartSceneId
    ? scenesForPicker.find((sceneItem: any) => sceneItem.id === projectStartSceneId) ?? scenesForPicker[0] ?? null
    : scenesForPicker[0] ?? null

  if (!startScene) {
    return {
      sceneId: null,
      nodeId: null,
    }
  }

  const startNodeId = resolveFallbackNodeId(startScene, startScene.nodes ?? [])
  return {
    sceneId: normalizeNodeId(startScene.id),
    nodeId: normalizeNodeId(startNodeId),
  }
}

function resolveSelectedTestStart() {
  const selectedSceneId = normalizeNodeId(scene.value?.id)
  const selectedNodeId = normalizeNodeId(node.value?.id)

  if (selectedSceneId && selectedNodeId) {
    return {
      sceneId: selectedSceneId,
      nodeId: selectedNodeId,
    }
  }

  if (selectedSceneId) {
    const activeScene = nodePickerScenes.value.find((sceneItem: any) => sceneItem.id === selectedSceneId) ?? null
    if (activeScene) {
      return {
        sceneId: selectedSceneId,
        nodeId: normalizeNodeId(resolveFallbackNodeId(activeScene, activeScene.nodes ?? [])),
      }
    }
  }

  return resolveGameStartForTest()
}

// テストプレイを新しいタブで開く
function openSelectedTestPlay() {
  const start = resolveSelectedTestStart()
  openTestPlayUrl(start.sceneId, start.nodeId)
}

function openGameStartTestPlay() {
  const start = resolveGameStartForTest()
  openTestPlayUrl(start.sceneId, start.nodeId)
}

const openThemeModal = ref(false)

// v2デフォルト
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

const previewTheme = computed(() => game.value?.messageTheme ?? defaultThemeV2)
const isPublishedGame = computed(() => game.value?.isPublic === true)

function handleThemeSaved(v: any) {
  if (!game.value) return

  game.value.title = v.title ?? game.value.title
  game.value.summary = v.summary ?? game.value.summary ?? null
  game.value.coverAssetId = ('coverAssetId' in (v ?? {}))
    ? (v.coverAssetId ?? null)
    : (game.value.coverAssetId ?? null)
  game.value.messageTheme = v.messageTheme ?? v
  game.value.gameUiTheme = v.gameUiTheme
  game.value.backlogTheme = v.backlogTheme

  if ('staffRollEnabled' in (v ?? {})) {
    game.value.staffRollEnabled = v.staffRollEnabled !== false
  }
  if ('staffRollAutoOpenEnabled' in (v ?? {})) {
    game.value.staffRollAutoOpenEnabled = v.staffRollAutoOpenEnabled === true
  }
  if ('staffRollSpeedPreset' in (v ?? {})) {
    game.value.staffRollSpeedPreset = v.staffRollSpeedPreset ?? 'normal'
  }
  if ('staffRollSectionOrder' in (v ?? {})) {
    game.value.staffRollSectionOrder = v.staffRollSectionOrder ?? 'manual,assets,characters'
  }
  if ('staffRollEndBehavior' in (v ?? {})) {
    game.value.staffRollEndBehavior = v.staffRollEndBehavior ?? 'stop'
  }
}

function isEditingPublishedGame() {
  return isPublishedGame.value
}

function confirmPublishedStructureChange(message: string) {
  if (!isEditingPublishedGame()) return true
  if (!process.client) return true
  return window.confirm(message)
}

function confirmSavePublishedGame() {
  if (!isPublishedGame.value) return true
  if (!process.client) return true

  return window.confirm([
    'このゲームは公開中です。',
    '保存した変更は公開版にも反映されます。',
    '新しく追加された素材・キャラクターのクレジットは保存時点の情報として固定されます。',
    '保存を続行しますか？',
  ].join('\n'))
}

// StageCanvas はテーマをそのまま渡す（内部で v2 解決される）
const stageTheme = computed(() => previewTheme.value)

// StageCanvas 用のメッセージ（前ノードのテキストを累積表示）
const stageMessage = computed(() => {
  if (!nodeDraft.text) return null
  
  let displayText = nodeDraft.text || ''
  
  // continuesPreviousText が true の場合、前のノードのテキストを累積
  if (nodeDraft.continuesPreviousText && node.value) {
    // 現在のノードのインデックスを取得
    const currentIndex = nodes.value.findIndex(n => n.id === node.value.id)
    
    // 累積テキストを構築（前方向にさかのぼる）
    let accumulatedText = ''
    for (let i = currentIndex - 1; i >= 0; i--) {
      const prevNode = nodes.value[i]
      if (prevNode?.text) {
        accumulatedText = prevNode.text + accumulatedText
      }
      // 前のノードが continuesPreviousText = false なら、そこで累積を止める
      if (!prevNode?.continuesPreviousText) {
        break
      }
    }
    
    displayText = accumulatedText + displayText
  }
  
  return {
    speaker: nodeDraft.speakerDisplayName || '',
    text: displayText
  }
})


watch(
  () => nodeDraft.bgAssetId,
  async (id) => {
    bgUrl.value = id ? await signedFromId(id, true) : null
  },
  { immediate: false }
)

watch(
  () => nodeDraft.musicAssetId,
  async (id) => {
    if (!id) {
      musicUrl.value = null
      musicTitle.value = ''
      return
    }
    const meta = await getAsset(id)
    musicTitle.value = meta?.title || '(BGM)'
    musicUrl.value = await signedFromId(id, false)
  },
  { immediate: false }
)

watch(
  () => nodeDraft.sfxAssetId,
  async (id) => {
    sfxUrl.value = id ? await signedFromId(id, true) : null
  },
  { immediate: false }
)

// thumb のキャッシュ (portraitsResolved より先に定義)
const thumbCache = ref<Map<string, string>>(new Map())

// Resolve portraits for preview (computed で常に最新の thumb を反映)
const portraitsResolved = computed(() => {
  const arr = nodeDraft.portraits ?? []
  return arr.map((p: any) => {
    const cacheKey = p.imageId || p.key
    return {
      ...p,
      // thumb が既にあればそれを使用、なければ thumbCache から取得
      thumb: p.thumb || thumbCache.value.get(cacheKey) || ''
    }
  })
})

// ノード選択時に portraits の thumb を補完
watch(
  () => nodeDraft.portraits,
  async (list: any[] | undefined) => {
    if (!list || list.length === 0) return
    // thumb が無い portrait があれば補完
    for (const p of list) {
      // 既に thumbCache にある場合はスキップ
      const cacheKey = p.imageId || p.key
      if (!cacheKey) {
        console.warn('[edit.vue] portrait has no imageId or key', p)
        continue
      }
      
      if (!thumbCache.value.has(cacheKey)) {
        try {
          let url: string | null = null
          
          // 優先順位: 1) p.key がある場合は直接署名URL取得、2) imageId から取得
          if (p.key) {
            url = await getSignedGetUrl(p.key)
          } else if (p.imageId) {
            url = await signedFromId(p.imageId, true)
          }
          
          if (url) {
            thumbCache.value.set(cacheKey, url)
          }
        } catch (e) {
          console.warn('[edit.vue] thumb resolve failed for', p, e)
        }
      }
    }
  },
  { immediate: true, deep: true }
)

// StageCanvas 用のキャラクター配列 (thumbCache から取得)
const stageCharacters = computed(() => {
  return portraitsResolved.value.map((p: any) => {
    const cacheKey = p.imageId || p.key
    return {
      key: cacheKey || String(Math.random()),
      url: p.thumb || thumbCache.value.get(cacheKey) || '',
      x: p.x ?? 50,
      y: p.y ?? 100,
      scale: p.scale ?? 100,
      z: p.z ?? 0
    }
  })
})

// StageCanvas 用のカメラ（リアクティブに更新）
const stageCamera = computed(() => {
  return nodeDraft.camera ?? { zoom: 100, cx: 50, cy: 50 }
})

// scaleToHeight: 旧仕様の scale 値を％に変換
function scaleToHeight(s: number | undefined) {
  if (s == null) return 30
  return s > 60 ? Math.round(s / 3) : s
}

const selectedCharLabel = computed(() => {
  if (!nodeDraft.speakerCharacterId) return '未選択'
  return nodeDraft.speakerDisplayName || node.value?.speakerDisplayName || nodeDraft.speakerCharacterId
})

const nodePickerScenes = computed(() => {
  const currentSceneId = scene.value?.id ?? null
  const gameScenesById = new Map((game.value?.scenes ?? []).map((s: any) => [s.id, s]))

  return scenes.value.map((sceneItem: any) => {
    const fromGame = gameScenesById.get(sceneItem.id) as any | undefined
    const baseNodes = Array.isArray(fromGame?.nodes) ? fromGame.nodes : []

    return {
      ...fromGame,
      ...sceneItem,
      nodes:
        sceneItem.id === currentSceneId
          ? nodes.value.map((nodeItem: any) => ({ ...nodeItem }))
          : baseNodes.map((nodeItem: any) => ({ ...nodeItem })),
    }
  })
})

watch(
  () => scenes.value,
  (latestScenes) => {
    if (!game.value) return

    const currentSceneId = scene.value?.id ?? null
    const gameScenesById = new Map((game.value.scenes ?? []).map((s: any) => [s.id, s]))

    game.value.scenes = latestScenes.map((sceneItem: any) => {
      const fromGame = gameScenesById.get(sceneItem.id) as any | undefined
      const baseNodes = Array.isArray(fromGame?.nodes) ? fromGame.nodes : []

      return {
        ...fromGame,
        ...sceneItem,
        nodes:
          sceneItem.id === currentSceneId
            ? nodes.value.map((nodeItem: any) => ({ ...nodeItem }))
            : baseNodes.map((nodeItem: any) => ({ ...nodeItem })),
      }
    })
  },
  { deep: false }
)

// シーンごとのノード数 (nodePickerScenes から算出)
const sceneNodeCount = computed(() => {
  const map = new Map<string, number>()
  for (const sc of nodePickerScenes.value) {
    map.set(sc.id, sc.nodes?.length ?? 0)
  }
  return map
})

const currentSceneDisplayNumber = computed(() => {
  const currentSceneId = scene.value?.id
  if (!currentSceneId) return ''
  const index = scenes.value.findIndex((s: any) => s.id === currentSceneId)
  return index >= 0 ? index + 1 : ''
})

// 選択シーンが変わったら名前ドラフトをリセット
watch(
  () => scene.value?.id,
  () => {
    sceneNameDraft.value = scene.value?.name || ''
  }
)

async function saveSceneName() {
  if (!scene.value) return
  const newName = sceneNameDraft.value.trim()
  if (!newName) {
    // 空欄なら現在名に戻す
    sceneNameDraft.value = scene.value.name || ''
    return
  }
  if (newName === scene.value.name) return
  try {
    await $api(`/games/scenes/${scene.value.id}`, {
      method: 'PATCH',
      body: { name: newName },
    })
    // ローカル状態を同期
    scene.value = { ...scene.value, name: newName }
    const idx = scenes.value.findIndex((s: any) => s.id === scene.value!.id)
    if (idx >= 0) {
      scenes.value[idx] = { ...scenes.value[idx], name: newName }
    }
    if (game.value?.scenes) {
      const gIdx = game.value.scenes.findIndex((s: any) => s.id === scene.value!.id)
      if (gIdx >= 0) {
        game.value.scenes[gIdx] = { ...game.value.scenes[gIdx], name: newName }
      }
    }
  } catch (error) {
    console.error('Failed to save scene name:', error)
    sceneNameDraft.value = scene.value.name || ''
  }
}

function findNodeLabel(targetNodeId: string | null | undefined): string {
  if (!targetNodeId) return '未設定'

  let foundNode: any = null
  let sceneIndex = 0
  let nodeIndex = 0
  let sceneName = ''

  for (let si = 0; si < nodePickerScenes.value.length; si++) {
    const sceneItem = nodePickerScenes.value[si]
    for (let ni = 0; ni < (sceneItem.nodes?.length || 0); ni++) {
      const candidate = sceneItem.nodes[ni]
      if (candidate.id === targetNodeId) {
        foundNode = candidate
        sceneIndex = si + 1
        nodeIndex = ni + 1
        sceneName = sceneItem.name || ''
        break
      }
    }
    if (foundNode) break
  }

  if (!foundNode) return targetNodeId

  const preview = (foundNode.text || '').slice(0, 20) + ((foundNode.text || '').length > 20 ? '…' : '')
  const sceneLabel = sceneName ? `Scene ${sceneIndex}: ${sceneName}` : `Scene ${sceneIndex}`
  return `${sceneLabel} / #${nodeIndex} ${preview || '(無題)'}`
}

// 次ノードの表示名を取得
const nextNodeLabel = computed(() => {
  return findNodeLabel(nodeDraft.nextNodeId)
})

const effectsSummaryText = computed(() => {
  const cam = (nodeDraft as any).camera
  const cameraFx = (nodeDraft as any).cameraFx
  const cameraFxActive = !!cameraFx && Number(cameraFx.durationMs) > 0 && cameraFx.mode !== 'cut'
  const cameraChanged =
    Number(cam?.zoom) !== 100 || Number(cam?.cx) !== 50 || Number(cam?.cy) !== 50 || cameraFxActive

  const hasVisualFx = !!(nodeDraft as any).visualFx?.type

  const colorFilterActive =
    (nodeDraft as any).colorFilter?.type && (nodeDraft as any).colorFilter.type !== 'none'
  const dimActive = Number((nodeDraft as any).backgroundFilter?.dimOpacity) > 0
  const filterActive = colorFilterActive || dimActive

  const blurActive = Number((nodeDraft as any).backgroundFilter?.blurPx) > 0

  return [
    cameraChanged ? 'カメラ設定あり' : 'カメラ標準',
    hasVisualFx ? 'エフェクト1件' : 'エフェクトなし',
    filterActive ? 'フィルターあり' : 'フィルターなし',
    blurActive ? 'ぼかしあり' : 'ぼかしなし',
  ].join(' / ')
})

const transitionsSummaryText = computed(() => {
  const hasNext = !!normalizeChoiceTargetId(nodeDraft.nextNodeId)
  const choices: any[] = Array.isArray(nodeDraft.choices) ? nodeDraft.choices : []
  const choiceCount = choices.length

  const parts: string[] = []
  parts.push(hasNext ? '次ノードあり' : '次ノードなし')

  if (choiceCount === 0) {
    parts.push('選択肢なし')
  } else {
    parts.push(`選択肢${choiceCount}件`)
    const unsetCount = choices.filter((c) => !hasConfiguredChoiceTarget(c, 'targetNodeId')).length
    parts.push(`未設定${unsetCount}件`)
    const condCount = choices.filter(
      (c) => hasConfiguredChoiceTarget(c, 'alternateTargetNodeId') || !!c.alternateCondition,
    ).length
    parts.push(`条件分岐${condCount}件`)
  }

  return parts.join(' / ')
})

// 選択肢の遷移先ノードラベルを取得
function getChoiceTargetLabel(targetNodeId: string | null | undefined): string {
  return findNodeLabel(targetNodeId)
}

function normalizeChoiceTargetId(targetNodeId: unknown): string | null {
  if (typeof targetNodeId !== 'string') return null
  const trimmed = targetNodeId.trim()
  return trimmed ? trimmed : null
}

function hasConfiguredChoiceTarget(
  choice: any,
  field: 'targetNodeId' | 'alternateTargetNodeId' = 'targetNodeId',
): boolean {
  return !!normalizeChoiceTargetId(choice?.[field])
}

function clearChoiceTarget(
  choice: any,
  field: 'targetNodeId' | 'alternateTargetNodeId' = 'targetNodeId',
) {
  choice[field] = null
}

function normalizeChoiceDrafts() {
  if (!Array.isArray(nodeDraft.choices)) {
    nodeDraft.choices = []
    return
  }

  nodeDraft.choices = nodeDraft.choices.map((choice: any) => ({
    label: choice?.label ?? '',
    targetNodeId: normalizeChoiceTargetId(choice?.targetNodeId),
    effects: Array.isArray(choice?.effects) ? choice.effects : [],
    condition: choice?.condition && typeof choice.condition === 'object' ? choice.condition : null,
    alternateTargetNodeId: normalizeChoiceTargetId(choice?.alternateTargetNodeId),
    alternateCondition:
      choice?.alternateCondition && typeof choice.alternateCondition === 'object'
        ? choice.alternateCondition
        : null,
  }))
}

function sanitizeChoicesForSave(choices: any[] | undefined) {
  if (!Array.isArray(choices)) return []

  return choices.map((choice: any) => ({
    label: choice?.label ?? '',
    targetNodeId: normalizeChoiceTargetId(choice?.targetNodeId),
    effects: Array.isArray(choice?.effects)
      ? choice.effects.filter((effect: any) => effect?.key?.trim())
      : [],
    condition: choice?.condition?.key?.trim() ? choice.condition : null,
    alternateTargetNodeId: normalizeChoiceTargetId(choice?.alternateTargetNodeId),
    alternateCondition: choice?.alternateCondition?.key?.trim() ? choice.alternateCondition : null,
  }))
}

const hasDisplayableChoices = computed(() => {
  if (!Array.isArray(nodeDraft.choices)) return false
  return nodeDraft.choices.some((choice: any) => hasConfiguredChoiceTarget(choice))
})

const showChoiceNextPriorityNotice = computed(() => {
  return !!nodeDraft.nextNodeId && hasDisplayableChoices.value
})

type ScenarioCheckFilter = 'all' | ScenarioCheckSeverity

const scenarioCheckFilter = ref<ScenarioCheckFilter>('all')
const scenarioCategoryFilter = ref<'all' | PrepublishIssueCategory>('all')
const scenarioCheckInfoOpen = ref(false)
const scenarioSeverityOrder: ScenarioCheckSeverity[] = ['error', 'warning', 'info']
const highlightedScenarioIssueId = ref<string | null>(null)
const scenarioIssueCardRefs = ref<Record<string, HTMLElement | null>>({})

function setScenarioIssueCardRef(issueId: string, el: Element | null) {
  scenarioIssueCardRefs.value[issueId] = (el as HTMLElement | null)
}

function normalizeNodeId(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const scenarioCheckScenes = computed(() => {
  const activeSceneId = scene.value?.id ?? null
  const activeNodeId = node.value?.id ?? null
  return nodePickerScenes.value.map((sceneItem: any) => {
    const sceneNodes = Array.isArray(sceneItem?.nodes) ? sceneItem.nodes : []
    const nextNodes = sceneNodes.map((nodeItem: any) => {
      if (
        sceneItem.id === activeSceneId
        && activeNodeId
        && nodeItem?.id === activeNodeId
      ) {
        const draftCopy = JSON.parse(JSON.stringify(nodeDraft))
        return {
          ...nodeItem,
          ...draftCopy,
          id: nodeItem.id,
          sceneId: sceneItem.id,
        }
      }
      return {
        ...nodeItem,
        sceneId: sceneItem.id,
      }
    })
    return {
      ...sceneItem,
      nodes: nextNodes,
    }
  })
})

const scenarioCheckResult = computed(() => {
  return runScenarioCheck({
    scenes: scenarioCheckScenes.value,
    startSceneId: game.value?.startSceneId,
  })
})

const scenarioCheckIssues = computed(() => {
  const localIssues = scenarioCheckResult.value.issues
  const referenceIssues = referenceDiagnostics.value?.issues ?? []
  
  // Merge and sort by severity
  const allIssues = [
    ...localIssues,
    ...referenceIssues.map((issue: any) => ({
      ...issue,
      severity: 'warning' as const, // reference diagnostics are always warning
    }))
  ]
  
  return scenarioSeverityOrder.flatMap((severity) => allIssues.filter((issue) => issue.severity === severity))
})

const scenarioCheckCounts = computed(() => {
  const localCounts = scenarioCheckResult.value.counts
  const referenceCounts = referenceDiagnostics.value?.counts ?? { warning: 0 }
  
  return {
    error: localCounts.error,
    warning: localCounts.warning + referenceCounts.warning,
    info: localCounts.info,
  }
})
const scenarioCheckTotalCount = computed(() => scenarioCheckIssues.value.length)

const projectNodeCount = computed(() => {
  return scenarioCheckScenes.value.reduce((total, sceneItem: any) => {
    return total + (Array.isArray(sceneItem?.nodes) ? sceneItem.nodes.length : 0)
  }, 0)
})

const hasAnyNodeBackground = computed(() => {
  return scenarioCheckScenes.value.some((sceneItem: any) => {
    return (Array.isArray(sceneItem?.nodes) ? sceneItem.nodes : []).some((nodeItem: any) => normalizeNodeId(nodeItem?.bgAssetId))
  })
})

const hasAnyCharacterAttachment = computed(() => {
  return scenarioCheckScenes.value.some((sceneItem: any) => {
    return (Array.isArray(sceneItem?.nodes) ? sceneItem.nodes : []).some((nodeItem: any) => {
      if (normalizeNodeId(nodeItem?.speakerCharacterId)) return true
      return Array.isArray(nodeItem?.portraits) && nodeItem.portraits.some((portrait: any) => normalizeNodeId(portrait?.characterId))
    })
  })
})

type CreationGuideTone = 'error' | 'warning' | 'info' | 'ok'
type CreationGuideAction = 'focus-start' | 'add-node' | 'open-theme' | 'open-publish-check' | 'open-node-editor'

type CreationGuideItem = {
  id: string
  title: string
  description: string
  actionLabel: string
  action: CreationGuideAction
  tone: CreationGuideTone
}

function findCreationGuideIssue(predicate: (issue: ScenarioCheckIssue) => boolean) {
  return scenarioCheckIssues.value.find((issue) => predicate(issue)) ?? null
}

function findCreationGuideStartIssue() {
  return findCreationGuideIssue((issue) => {
    if (issue.severity !== 'error') return false
    return issue.message.includes('開始シーン') || issue.message.includes('開始ノード')
  })
}

function findCreationGuidePublishIssue() {
  return scenarioCheckIssues.value.find((issue) => issue.severity === 'error' || issue.severity === 'warning') ?? null
}

const creationGuideItems = computed<CreationGuideItem[]>(() => {
  const items: CreationGuideItem[] = []

  if (!normalizeNodeId(game.value?.startSceneId) || findCreationGuideStartIssue()) {
    items.push({
      id: 'start',
      title: '開始地点を決めよう',
      description: 'プレイヤーが最初に見るシーンとノードを設定しよう。',
      actionLabel: '開始設定を確認',
      action: 'focus-start',
      tone: 'error',
    })
  }

  if (projectNodeCount.value <= 1) {
    items.push({
      id: 'node-count',
      title: '会話ノードを増やそう',
      description: 'まずは2〜3個のノードをつないで、短い流れを作ってみよう。',
      actionLabel: 'ノード追加',
      action: 'add-node',
      tone: 'warning',
    })
  }

  if (!normalizeNodeId(game.value?.coverAssetId)) {
    items.push({
      id: 'cover',
      title: 'カバー画像を設定しよう',
      description: '公開ギャラリーで見つけてもらいやすくなります。',
      actionLabel: '全体設定を開く',
      action: 'open-theme',
      tone: 'info',
    })
  }

  if (scenarioCheckCounts.value.error > 0 || scenarioCheckCounts.value.warning > 0 || referenceDiagnosticsError.value) {
    items.push({
      id: 'publish-check',
      title: '公開前チェックを確認しよう',
      description: '構成・素材参照・キャラクター参照に確認項目があります。',
      actionLabel: 'チェックを見る',
      action: 'open-publish-check',
      tone: scenarioCheckCounts.value.error > 0 ? 'error' : 'warning',
    })
  }

  if (
    projectNodeCount.value >= 2
    && (!hasAnyNodeBackground.value || !hasAnyCharacterAttachment.value)
  ) {
    items.push({
      id: 'visuals',
      title: '背景やキャラを置いてみよう',
      description: '会話画面に素材を置くと、作品の雰囲気を出しやすくなります。',
      actionLabel: '編集欄を開く',
      action: 'open-node-editor',
      tone: 'info',
    })
  }

  return items
})

const creationGuideVisibleItems = computed(() => {
  return creationGuideItems.value.slice(0, 3)
})

const creationGuideRemainingCount = computed(() => {
  return Math.max(0, creationGuideItems.value.length - creationGuideVisibleItems.value.length)
})

const creationGuideActionToneClass: Record<CreationGuideTone, string> = {
  error: 'border-red-200 bg-red-50 text-red-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  info: 'border-sky-200 bg-sky-50 text-sky-700',
  ok: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

async function openCreationGuideStartSetting() {
  const issue = findCreationGuideStartIssue()
  if (!issue) {
    sectionOpen.scenarioCheck = true
    await nextTick()
    document.getElementById('publish-check-issues')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  sectionOpen.scenarioCheck = true
  scenarioCheckFilter.value = issue.severity
  scenarioCategoryFilter.value = categorizeIssue(issue as any)
  highlightedScenarioIssueId.value = issue.id

  if (issue.sceneId || issue.nodeId) {
    await focusScenarioIssue(issue)
  }

  await nextTick()
  scenarioIssueCardRefs.value[issue.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

async function openCreationGuidePublishCheck() {
  const issue = findCreationGuidePublishIssue()
  sectionOpen.scenarioCheck = true

  if (!issue) {
    await nextTick()
    document.getElementById('publish-check-issues')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  scenarioCheckFilter.value = issue.severity
  scenarioCategoryFilter.value = categorizeIssue(issue as any)
  highlightedScenarioIssueId.value = issue.id

  if (issue.sceneId || issue.nodeId) {
    await focusScenarioIssue(issue)
  }

  await nextTick()
  scenarioIssueCardRefs.value[issue.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function openCreationGuideNodeEditor() {
  sectionOpen.basic = true
  sectionOpen.materials = true
  sectionOpen.effects = true
  sectionOpen.transitions = true
}

async function handleCreationGuideAction(item: CreationGuideItem) {
  if (item.action === 'focus-start') {
    await openCreationGuideStartSetting()
    return
  }
  if (item.action === 'add-node') {
    if (scene.value) {
      await addNode()
    } else {
      await addScene()
    }
    return
  }
  if (item.action === 'open-theme') {
    openThemeModal.value = true
    return
  }
  if (item.action === 'open-publish-check') {
    await openCreationGuidePublishCheck()
    return
  }
  if (item.action === 'open-node-editor') {
    openCreationGuideNodeEditor()
  }
}

// ── 公開前チェックサマリー ─────────────────────────────────────────────────────
const scenarioCheckFilterItems = computed(() => {
  return [
    { key: 'all' as const, label: 'すべて', count: scenarioCheckTotalCount.value },
    { key: 'error' as const, label: 'エラー', count: scenarioCheckCounts.value.error },
    { key: 'warning' as const, label: '警告', count: scenarioCheckCounts.value.warning },
    { key: 'info' as const, label: '情報', count: scenarioCheckCounts.value.info },
  ]
})

const scenarioCategoryCounts = computed(() => {
  const all = scenarioCheckIssues.value
  return {
    structure: all.filter((i) => categorizeIssue(i as any) === 'structure').length,
    assetReference: all.filter((i) => categorizeIssue(i as any) === 'asset-reference').length,
    characterReference: all.filter((i) => categorizeIssue(i as any) === 'character-reference').length,
  }
})

const scenarioCategoryFilterItems = computed(() => [
  { key: 'all' as const, label: '全カテゴリ', count: scenarioCheckTotalCount.value },
  { key: 'structure' as const, label: '構成', count: scenarioCategoryCounts.value.structure },
  { key: 'asset-reference' as const, label: '素材参照', count: scenarioCategoryCounts.value.assetReference },
  { key: 'character-reference' as const, label: 'キャラクター参照', count: scenarioCategoryCounts.value.characterReference },
].map((item) => ({ ...item, displayLabel: `${item.label} ${item.count}件` })))

const scenarioCheckFilteredIssues = computed(() => {
  let result = scenarioCheckIssues.value
  if (scenarioCheckFilter.value !== 'all') {
    result = result.filter((issue) => issue.severity === scenarioCheckFilter.value)
  }
  if (scenarioCategoryFilter.value !== 'all') {
    const cat = scenarioCategoryFilter.value
    result = result.filter((issue) => categorizeIssue(issue as any) === cat)
  }
  return result
})

const scenarioCheckFilteredInfoIssues = computed(() => {
  return scenarioCheckFilteredIssues.value.filter((issue) => issue.severity === 'info')
})

const scenarioCheckVisibleIssues = computed(() => {
  if (scenarioCheckFilter.value !== 'all') return scenarioCheckFilteredIssues.value
  if (scenarioCheckInfoOpen.value) return scenarioCheckFilteredIssues.value
  return scenarioCheckFilteredIssues.value.filter((issue) => issue.severity !== 'info')
})

watch(scenarioCheckFilter, (nextFilter) => {
  if (nextFilter === 'info') {
    scenarioCheckInfoOpen.value = true
  }
})

function selectScenarioCheckFilter(filter: ScenarioCheckFilter) {
  scenarioCheckFilter.value = filter
}

function firstQueryString(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === 'string')
    return typeof first === 'string' ? first.trim() : ''
  }
  return ''
}

function findScenarioIssueFromQueryHint() {
  const issueId = firstQueryString(route.query.scenarioCheckIssueId)
  const refId = firstQueryString(route.query.scenarioCheckRefId)
  const field = firstQueryString(route.query.scenarioCheckField)
  const nodeId = firstQueryString(route.query.scenarioCheckNodeId)

  const issues = scenarioCheckIssues.value
  if (issueId) {
    const byIssueId = issues.find((issue) => issue.id === issueId)
    if (byIssueId) return byIssueId
  }
  if (refId && field) {
    const byRefAndField = issues.find((issue: any) => issue.refId === refId && issue.field === field)
    if (byRefAndField) return byRefAndField
  }
  if (refId) {
    const byRef = issues.find((issue: any) => issue.refId === refId)
    if (byRef) return byRef
  }
  if (nodeId) {
    const byNode = issues.find((issue) => issue.nodeId === nodeId)
    if (byNode) return byNode
  }
  return null
}

async function applyScenarioCheckQueryHint() {
  const requestedFilter = firstQueryString(route.query.scenarioCheckFilter)
  const requestedFocus = firstQueryString(route.query.focusScenarioCheck)
  const requestedCategory = firstQueryString(route.query.scenarioCheckCategory)

  if (requestedFocus === '1' || requestedFocus === 'true') {
    sectionOpen.scenarioCheck = true
  }

  if (
    requestedFilter === 'all'
    || requestedFilter === 'error'
    || requestedFilter === 'warning'
    || requestedFilter === 'info'
  ) {
    scenarioCheckFilter.value = requestedFilter
    if (requestedFilter !== 'all') {
      sectionOpen.scenarioCheck = true
    }
  }

  if (
    requestedCategory === 'asset-reference'
    || requestedCategory === 'character-reference'
    || requestedCategory === 'structure'
    || requestedCategory === 'all'
  ) {
    scenarioCategoryFilter.value = requestedCategory === 'all' ? 'all' : requestedCategory
    sectionOpen.scenarioCheck = true
  }

  const matchedIssue = findScenarioIssueFromQueryHint()
  if (!matchedIssue) {
    highlightedScenarioIssueId.value = null
    return
  }

  sectionOpen.scenarioCheck = true
  scenarioCheckFilter.value = matchedIssue.severity
  scenarioCategoryFilter.value = categorizeIssue(matchedIssue as any)
  highlightedScenarioIssueId.value = matchedIssue.id

  if (matchedIssue.sceneId || matchedIssue.nodeId) {
    await focusScenarioIssue(matchedIssue)
  }

  await nextTick()
  const issueCard = matchedIssue.id ? scenarioIssueCardRefs.value[matchedIssue.id] : null
  issueCard?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function scenarioFilterButtonClass(filter: ScenarioCheckFilter) {
  const active = scenarioCheckFilter.value === filter
  if (filter === 'error') {
    if (active) return 'border-red-300 bg-red-100 text-red-800'
    if (scenarioCheckCounts.value.error > 0) return 'border-red-200 bg-red-50 text-red-700'
    return 'border-gray-200 bg-white text-gray-700'
  }
  if (filter === 'warning') {
    if (active) return 'border-amber-300 bg-amber-100 text-amber-800'
    if (scenarioCheckCounts.value.warning > 0) return 'border-amber-200 bg-amber-50 text-amber-700'
    return 'border-gray-200 bg-white text-gray-700'
  }
  if (filter === 'info') {
    if (active) return 'border-slate-300 bg-slate-100 text-slate-700'
    return 'border-gray-200 bg-white text-gray-500'
  }
  if (active) return 'border-gray-300 bg-gray-100 text-gray-800'
  return 'border-gray-200 bg-white text-gray-700'
}

function scenarioCategoryFilterButtonClass(key: 'all' | PrepublishIssueCategory, count: number) {
  const active = scenarioCategoryFilter.value === key
  if (key === 'all') {
    if (active) return 'border-gray-300 bg-gray-100 text-gray-800'
    return 'border-gray-200 bg-white text-gray-700'
  }
  if (key === 'asset-reference') {
    if (active) return 'border-sky-300 bg-sky-100 text-sky-800'
    if (count > 0) return 'border-sky-200 bg-sky-50 text-sky-700'
    return 'border-gray-200 bg-white text-gray-500'
  }
  if (key === 'character-reference') {
    if (active) return 'border-violet-300 bg-violet-100 text-violet-800'
    if (count > 0) return 'border-violet-200 bg-violet-50 text-violet-700'
    return 'border-gray-200 bg-white text-gray-500'
  }
  // structure
  if (active) return 'border-orange-300 bg-orange-100 text-orange-800'
  if (count > 0) return 'border-orange-200 bg-orange-50 text-orange-700'
  return 'border-gray-200 bg-white text-gray-500'
}

function selectScenarioCategoryFilter(key: 'all' | PrepublishIssueCategory) {
  scenarioCategoryFilter.value = key
}

function issueCategoryLabel(issue: any): string {
  return prepublishCategoryLabel(categorizeIssue(issue))
}

function issueCategoryClass(issue: any): string {
  const cat = categorizeIssue(issue)
  if (cat === 'asset-reference') return 'text-sky-600'
  if (cat === 'character-reference') return 'text-violet-600'
  return 'text-orange-600'
}

function scenarioSeverityLabel(severity: ScenarioCheckSeverity) {
  if (severity === 'error') return 'エラー'
  if (severity === 'warning') return '警告'
  return '情報'
}

function scenarioSeverityClass(severity: ScenarioCheckSeverity) {
  if (severity === 'error') {
    return 'border-red-200 bg-red-50 text-red-700'
  }
  if (severity === 'warning') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  return 'border-slate-200 bg-slate-50 text-slate-600'
}

function scenarioIssueLocation(issue: ScenarioCheckIssue) {
  const sceneLabel = issue.sceneOrder
    ? `Scene ${issue.sceneOrder}${issue.sceneName ? `: ${issue.sceneName}` : ''}`
    : issue.sceneName || 'シーン未特定'
  if (issue.nodeOrder) {
    return `${sceneLabel} / Node ${issue.nodeOrder}`
  }
  return sceneLabel
}

async function focusScenarioIssue(issue: ScenarioCheckIssue) {
  if (!issue.sceneId) return
  const targetScene = scenes.value.find((sceneItem: any) => sceneItem.id === issue.sceneId)
  if (!targetScene) return

  if (scene.value?.id !== targetScene.id) {
    await selectScene(targetScene)
  }

  if (!issue.nodeId) return
  const targetNode = nodes.value.find((nodeItem: any) => nodeItem.id === issue.nodeId)
  if (!targetNode) return
  selectNode(targetNode)
}

async function refreshReferenceDiagnostics() {
  if (!game.value?.id) return
  
  referenceDiagnosticsLoading.value = true
  referenceDiagnosticsError.value = null
  
  try {
    const result = await api.getReferenceDiagnostics(game.value.id)
    referenceDiagnostics.value = result
  } catch (error) {
    console.warn('Failed to fetch reference diagnostics:', error)
    referenceDiagnosticsError.value = '参照診断の取得に失敗しました'
    referenceDiagnostics.value = null
  } finally {
    referenceDiagnosticsLoading.value = false
  }
}

function createEmptyChoiceCondition() {
  return { key: '', operator: 'gte', value: 1 }
}

function addChoiceEffect(choice: any) {
  if (!Array.isArray(choice.effects)) {
    choice.effects = []
  }
  choice.effects.push({ key: '', op: 'add', value: 1 })
}

function removeChoiceEffect(choice: any, effectIndex: number | string) {
  if (!Array.isArray(choice.effects)) return
  choice.effects.splice(Number(effectIndex), 1)
}

function enableChoiceCondition(choice: any, field: 'condition' | 'alternateCondition') {
  if (!choice[field]) {
    choice[field] = createEmptyChoiceCondition()
  }
}

function isUnaryChoiceOperator(op: string | undefined) {
  return op === 'truthy' || op === 'falsy'
}

// 選択肢のノード選択モーダル用
const editingChoiceIndex = ref<number | null>(null)
const editingChoiceTargetField = ref<'targetNodeId' | 'alternateTargetNodeId'>('targetNodeId')

function openChoiceNodePicker(index: number | string, field: 'targetNodeId' | 'alternateTargetNodeId' = 'targetNodeId') {
  editingChoiceIndex.value = Number(index)
  editingChoiceTargetField.value = field
  openNodePicker.value = true
}

function onChoiceNodeSelected(nodeId: string) {
  if (editingChoiceIndex.value !== null && nodeDraft.choices && nodeDraft.choices[editingChoiceIndex.value]) {
    nodeDraft.choices[editingChoiceIndex.value][editingChoiceTargetField.value] = nodeId
    editingChoiceIndex.value = null
    editingChoiceTargetField.value = 'targetNodeId'
  }
}

// ポートレート選択モードかどうか（nullなら話者選択モード）
const isPortraitMode = computed(() => pendingIndex.value !== null)

function clearChar() {
  nodeDraft.speakerCharacterId = ''
  if (!nodeDraft.speakerDisplayName) nodeDraft.speakerDisplayName = ''
}

function onCharPicked(c: any) {
  // ポートレートモードの場合
  if (isPortraitMode.value) {
    // キャラIDを一時保存して画像選択へ
    nodeDraft.speakerCharacterId = c.id
    if (!nodeDraft.speakerDisplayName) {
      nodeDraft.speakerDisplayName = c.displayName || c.name || ''
    }
    openCharImagePicker.value = true
  } else {
    // 話者選択モードの場合
    nodeDraft.speakerCharacterId = c.id
    if (!nodeDraft.speakerDisplayName) {
      nodeDraft.speakerDisplayName = c.displayName || c.name || ''
    }
  }
}

async function addPortrait() {
  if (!nodeDraft.portraits) nodeDraft.portraits = []
  // First select character
  pendingIndex.value = -1
  openCharPicker.value = true
}

function changePortrait(i: number | string) {
  pendingIndex.value = Number(i)
  openCharPicker.value = true
}

function removePortrait(i: number | string) {
  nodeDraft.portraits.splice(Number(i), 1)
}

// 話者キャラ選択を開く（ポートレートモードではない）
function openSpeakerCharPicker() {
  pendingIndex.value = null
  openCharPicker.value = true
}

async function onImagePicked(img: any) {
  const url = await getSignedGetUrl(img.thumbKey || img.key)
  
  // 既存ポートレートの場合は位置・サイズを保持
  let x = 50, y = 100, scale = 100, z = 0
  if (pendingIndex.value !== null && pendingIndex.value >= 0) {
    const existing = nodeDraft.portraits[pendingIndex.value]
    if (existing) {
      x = existing.x ?? 50
      y = existing.y ?? 100
      scale = existing.scale ?? 100
      z = existing.z ?? 0
    }
  }
  
  const entry = {
    characterId: nodeDraft.speakerCharacterId,
    imageId: img.id,
    key: img.key,
    thumb: url,
    x,
    y,
    scale,
    z,
    characterName: nodeDraft.speakerDisplayName
  }
  
  if (pendingIndex.value !== null && pendingIndex.value >= 0) {
    nodeDraft.portraits[pendingIndex.value] = entry
    pendingIndex.value = null
  } else if (pendingIndex.value === -1) {
    nodeDraft.portraits.push(entry)
    pendingIndex.value = null
  }
}

// Ctrl/⌘+Enter で「保存して次へ」
function onGlobalKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (!saving.value && node.value) {
      e.preventDefault()
      saveAndCreateNext()
    }
  }
}

onMounted(async () => {
  try {
    game.value = await api.getEdit(route.params.id as string)
    scenes.value = (await api.listScenes(game.value.id)) as any[]
    const restored = await restoreLastSelection()
    if (!restored) {
      await selectInitialSceneAndNode()
    }
    // Fetch reference diagnostics after loading game
    await refreshReferenceDiagnostics()
  } catch (error) {
    console.error('Failed to load game:', error)
    alert('ゲームの読み込みに失敗しました')
  } finally {
    loading.value = false
  }
  
  // コピー対象設定を復元
  const saved = localStorage.getItem('talking_copy_opts_v1')
  if (saved) {
    try {
      Object.assign(copyOpts, JSON.parse(saved))
    } catch (e) {
      console.warn('Failed to parse copyOpts from localStorage', e)
    }
  }

  restoreSectionOpen()
  await applyScenarioCheckQueryHint()

  // 公開中編集バナーの折りたたみ状態を復元
  publishedEditBannerCollapsed.value = localStorage.getItem(PUBLISHED_EDIT_BANNER_COLLAPSED_STORAGE_KEY) === 'true'

  // グローバルキーボードイベントリスナー
  window.addEventListener('keydown', onGlobalKeydown)
})

// コピー対象トグルの変更を監視して保存
watch(copyOpts, (newVal) => {
  localStorage.setItem('talking_copy_opts_v1', JSON.stringify(newVal))
}, { deep: true })

watch(sectionOpen, () => {
  persistSectionOpen()
}, { deep: true })

async function selectScene(s: any, options?: { skipPersist?: boolean; preloadedNodes?: any[] }) {
  scene.value = s
  try {
    if (Array.isArray(options?.preloadedNodes)) {
      nodes.value = options.preloadedNodes
    } else {
      nodes.value = (await api.listNodes(s.id)) as any[]
    }
  } catch (error) {
    console.error('Failed to load nodes:', error)
    nodes.value = []
  }
  node.value = null
  if (!options?.skipPersist) {
    persistCurrentSelection()
  }
}

function buildNodeDeleteConfirmMessage(summary: any | null) {
  if (!summary) {
    return [
      'このノードを削除しますか？',
      '',
      '削除時に、開始ノードや遷移先として参照されている設定は自動で解除されます。',
    ].join('\n')
  }

  return [
    'このノードを削除しますか？',
    '',
    `開始ノード参照: ${summary.startNodeRefCount}件`,
    `nextNode参照: ${summary.nextNodeRefCount}件`,
    `choice遷移先参照: ${summary.choiceTargetRefCount}件`,
    `choice分岐遷移先参照: ${summary.choiceAlternateRefCount}件`,
    '',
    'これらの参照は削除時に自動で解除されます。',
  ].join('\n')
}

function buildPublishedNodeDeleteConfirmMessage(summary: any | null) {
  if (!summary) {
    return [
      'このゲームは公開中です。',
      'このノードを削除すると、公開版の進行や選択肢が壊れる可能性があります。',
      '',
      '削除時に、開始ノードや遷移先として参照されている設定は自動で解除されます。',
      '削除しますか？',
    ].join('\n')
  }

  return [
    'このゲームは公開中です。',
    'このノードを削除すると、公開版の進行や選択肢が壊れる可能性があります。',
    '',
    `開始ノード参照: ${summary.startNodeRefCount}件`,
    `nextNode参照: ${summary.nextNodeRefCount}件`,
    `choice遷移先参照: ${summary.choiceTargetRefCount}件`,
    `choice分岐遷移先参照: ${summary.choiceAlternateRefCount}件`,
    '',
    'これらの参照は削除時に自動で解除されます。',
    '削除しますか？',
  ].join('\n')
}

function confirmNodeDeletion(summary: any | null) {
  if (isEditingPublishedGame()) {
    return confirmPublishedStructureChange(buildPublishedNodeDeleteConfirmMessage(summary))
  }

  return confirm(buildNodeDeleteConfirmMessage(summary))
}

function buildSceneDeleteConfirmMessage(summary: any | null) {
  if (!summary) {
    return [
      'このシーンを削除しますか？',
      '',
      'シーン内ノードも削除され、外部参照は自動で解除されます。',
    ].join('\n')
  }

  return [
    'このシーンを削除しますか？',
    '',
    `削除されるノード数: ${summary.nodeCount}件`,
    `このシーンへの開始シーン参照: ${summary.startSceneRefCount}件`,
    `シーン内ノードへの開始ノード参照: ${summary.startNodeRefCount}件`,
    `シーン外ノードからのnextNode参照: ${summary.externalNextNodeRefCount}件`,
    `シーン外choiceからの遷移先参照: ${summary.externalChoiceTargetRefCount}件`,
    `シーン外choiceからの分岐遷移先参照: ${summary.externalChoiceAlternateRefCount}件`,
    '',
    'これらの参照は削除時に自動で解除されます。',
  ].join('\n')
}

function buildPublishedSceneDeleteConfirmMessage(summary: any | null) {
  if (!summary) {
    return [
      'このゲームは公開中です。',
      'このシーンを削除すると、公開版の進行に影響する可能性があります。',
      '',
      'シーン内ノードも削除され、外部参照は自動で解除されます。',
      '削除しますか？',
    ].join('\n')
  }

  return [
    'このゲームは公開中です。',
    'このシーンを削除すると、公開版の進行に影響する可能性があります。',
    '',
    `削除されるノード数: ${summary.nodeCount}件`,
    `このシーンへの開始シーン参照: ${summary.startSceneRefCount}件`,
    `シーン内ノードへの開始ノード参照: ${summary.startNodeRefCount}件`,
    `シーン外ノードからのnextNode参照: ${summary.externalNextNodeRefCount}件`,
    `シーン外choiceからの遷移先参照: ${summary.externalChoiceTargetRefCount}件`,
    `シーン外choiceからの分岐遷移先参照: ${summary.externalChoiceAlternateRefCount}件`,
    '',
    'これらの参照は削除時に自動で解除されます。',
    '削除しますか？',
  ].join('\n')
}

function confirmSceneDeletion(summary: any | null) {
  if (isEditingPublishedGame()) {
    return confirmPublishedStructureChange(buildPublishedSceneDeleteConfirmMessage(summary))
  }

  return confirm(buildSceneDeleteConfirmMessage(summary))
}

async function addScene() {
  try {
    await api.upsertScene(game.value.id, {
      name: `Scene ${scenes.value.length + 1}`,
      order: scenes.value.length,
    })
    scenes.value = (await api.listScenes(game.value.id)) as any[]
  } catch (error) {
    console.error('Failed to add scene:', error)
    alert('シーンの追加に失敗しました')
  }
}

async function deleteCurrentScene() {
  if (!scene.value) return

  if (scenes.value.length <= 1) {
    alert('最後の1シーンは削除できません')
    return
  }

  const deletingSceneId = scene.value.id
  const currentIndex = scenes.value.findIndex((s) => s.id === deletingSceneId)
  let summary: any | null = null
  try {
    summary = await api.getSceneDeleteSummary(deletingSceneId)
  } catch (error) {
    console.warn('Failed to fetch scene delete summary:', error)
  }

  if (!confirmSceneDeletion(summary)) return

  try {
    await api.delScene(deletingSceneId)
    scenes.value = (await api.listScenes(game.value.id)) as any[]

    if (game.value?.startSceneId === deletingSceneId) {
      game.value.startSceneId = null
    }

    if (scenes.value.length === 0) {
      scene.value = null
      nodes.value = []
      node.value = null
      clearLastSelection(game.value.id)
      // Refresh reference diagnostics
      await refreshReferenceDiagnostics()
      return
    }

    const fallbackIndex = Math.min(currentIndex, scenes.value.length - 1)
    const nextScene = scenes.value[fallbackIndex]
    await selectScene(nextScene)
    // Refresh reference diagnostics
    await refreshReferenceDiagnostics()
  } catch (error: any) {
    console.error('Failed to delete scene:', error)
    const message = error?.data?.message || error?.message || 'シーンの削除に失敗しました'
    alert(message)
  }
}

async function setSceneStartNode(id: string) {
  if (!scene.value) return
  if (scene.value?.startNodeId === id) return
  if (!confirmPublishedStructureChange([
    'このゲームは公開中です。',
    '開始ノードを変更すると、公開版の開始位置が変わります。',
    '変更しますか？',
  ].join('\n'))) {
    return
  }

  await $api(`/games/scenes/${scene.value.id}`, {
    method: 'PATCH',
    body: { startNodeId: id },
  })
  await api.update(game.value.id, { startSceneId: scene.value.id })
  syncSceneStartNodeId(scene.value.id, id)
  syncProjectStartSceneId(scene.value.id)
}

function syncProjectStartSceneId(startSceneId: string | null) {
  if (!game.value) return
  game.value.startSceneId = startSceneId
}

function syncSceneStartNodeId(sceneId: string, startNodeId: string | null) {
  if (scene.value?.id === sceneId) {
    scene.value = {
      ...scene.value,
      startNodeId,
    }
  }

  const sceneIndex = scenes.value.findIndex((sceneItem: any) => sceneItem.id === sceneId)
  if (sceneIndex >= 0) {
    scenes.value[sceneIndex] = {
      ...scenes.value[sceneIndex],
      startNodeId,
    }
  }

  if (!Array.isArray(game.value?.scenes)) return
  const gameSceneIndex = game.value.scenes.findIndex((sceneItem: any) => sceneItem.id === sceneId)
  if (gameSceneIndex >= 0) {
    game.value.scenes[gameSceneIndex] = {
      ...game.value.scenes[gameSceneIndex],
      startNodeId,
    }
  }
}

function syncSceneNodes(sceneId: string, sceneNodes: any[]) {
  if (!Array.isArray(game.value?.scenes)) return
  const gameSceneIndex = game.value.scenes.findIndex((sceneItem: any) => sceneItem.id === sceneId)
  if (gameSceneIndex >= 0) {
    game.value.scenes[gameSceneIndex] = {
      ...game.value.scenes[gameSceneIndex],
      nodes: sceneNodes.map((nodeItem: any) => ({ ...nodeItem })),
    }
  }
}

async function setStartSceneFromScene(targetScene: any) {
  if (!game.value || !targetScene?.id) return

  if (!confirmPublishedStructureChange([
    'このゲームは公開中です。',
    '開始シーンを変更すると、公開版の開始位置が変わります。',
    '変更しますか？',
  ].join('\n'))) {
    return
  }

  const toast = useToast()
  const targetSceneId = targetScene.id as string
  const currentScene = nodePickerScenes.value.find((sceneItem: any) => sceneItem.id === targetSceneId)

  let targetNodes = Array.isArray(currentScene?.nodes) ? currentScene.nodes : []
  if (targetNodes.length === 0) {
    try {
      targetNodes = (await api.listNodes(targetSceneId)) as any[]
      syncSceneNodes(targetSceneId, targetNodes)
    } catch (error) {
      console.error('Failed to load scene nodes for start scene selection:', error)
      toast.error('シーンのノード取得に失敗しました')
      return
    }
  }

  if (targetNodes.length === 0) {
    toast.error('このシーンにはノードがありません。開始シーンにするには先にノードを追加してください。')
    return
  }

  const existingStartNodeId = normalizeNodeId(targetScene.startNodeId)
  const resolvedStartNodeId = existingStartNodeId ?? normalizeNodeId(targetNodes[0]?.id)
  if (!resolvedStartNodeId) {
    toast.error('このシーンにはノードがありません。開始シーンにするには先にノードを追加してください。')
    return
  }

  try {
    if (!existingStartNodeId) {
      await $api(`/games/scenes/${targetSceneId}`, {
        method: 'PATCH',
        body: { startNodeId: resolvedStartNodeId },
      })
      syncSceneStartNodeId(targetSceneId, resolvedStartNodeId)
    }

    await api.update(game.value.id, { startSceneId: targetSceneId })
    syncProjectStartSceneId(targetSceneId)
    toast.success('開始シーンを設定しました')
  } catch (error) {
    console.error('Failed to set start scene:', error)
    toast.error('開始シーンの設定に失敗しました')
  }
}

function selectNode(n: any, options?: { skipPersist?: boolean }) {
  node.value = n
  Object.assign(nodeDraft, JSON.parse(JSON.stringify(n)))
  if (!nodeDraft.choices) {
    nodeDraft.choices = []
  }
  normalizeChoiceDrafts()
  if (!nodeDraft.portraits) {
    nodeDraft.portraits = []
  }
  // camera デフォルト補完
  if (!nodeDraft.camera) {
    nodeDraft.camera = { zoom: 100, cx: 50, cy: 50 }
  }
  // cameraFx デフォルト補完
  if (!nodeDraft.cameraFx) {
    nodeDraft.cameraFx = null
  }
  // visualFx デフォルト補完
  if (!nodeDraft.visualFx) {
    nodeDraft.visualFx = {}
  }
  // colorFilter デフォルト補完
  if (!nodeDraft.colorFilter) {
    nodeDraft.colorFilter = { type: 'none', opacity: 50, durationMs: 500 }
  }
  // backgroundFilter デフォルト補完
  if (!nodeDraft.backgroundFilter) {
    nodeDraft.backgroundFilter = { blurPx: 0, dimOpacity: 0 }
  }
  // 既存データを開いたときに p.thumb を補完
  // watch が自動的に実行されるので明示的に呼ぶ必要はないが、
  // 互換性のため残しておく
  // hydratePortraitThumbs() は watch で自動実行される
  if (!options?.skipPersist) {
    persistCurrentSelection()
  }
}

// 既存 portraits のサムネ署名URLを補完する
async function hydratePortraitThumbs() {
  if (!nodeDraft.portraits) return
  for (const p of nodeDraft.portraits) {
    try {
      if (p.thumb) continue
      let key = p.key
      // key が無ければキャラ画像一覧から該当IDを引いて key/thumbKey を得る
      if (!key && p.characterId && p.imageId) {
        const list = await $api<any[]>(`/characters/${p.characterId}/images`)
          .catch(() => $api<any[]>(`/my/characters/${p.characterId}/images`))
        const hit = list?.find(x => x.id === p.imageId)
        key = hit?.thumbKey || hit?.key
      }
      if (key) {
        p.thumb = await getSignedGetUrl(key)
      }
    } catch (e) {
      console.warn('thumb hydrate failed', p, e)
    }
  }
}

async function addNode() {
  if (!scene.value) return
  try {
    await api.upsertNode(scene.value.id, { text: '...' })
    nodes.value = (await api.listNodes(scene.value.id)) as any[]
    // scenes.valueも更新して次ノードラベル表示を最新に
    scenes.value = (await api.listScenes(game.value.id)) as any[]
    // Refresh reference diagnostics
    await refreshReferenceDiagnostics()
  } catch (error) {
    console.error('Failed to add node:', error)
    alert('ノードの追加に失敗しました')
  }
}

function extractApiErrorMessage(error: any): string | null {
  const raw =
    error?.response?._data?.message ??
    error?.data?.message ??
    error?.message ??
    null
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  const errors = error?.response?._data?.errors ?? error?.data?.errors
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors.find((v: unknown) => typeof v === 'string')
    if (typeof first === 'string' && first.trim().length > 0) {
      return first.trim()
    }
  }

  return null
}

/**
 * nodeDraft を deep copy し、API 保存前の正規化処理をまとめて適用する。
 * - portraits の thumb（署名URL）を除去（TTL切れ防止）
 * - choices を sanitizeChoicesForSave で正規化
 * - visualFx が空オブジェクト / type 未設定なら null
 * - colorFilter type=none なら null
 * - backgroundFilter の blurPx/dimOpacity を clamp し、両方 0 なら null
 */
function buildNodePayloadForSave(draft: any): any {
  const payload = JSON.parse(JSON.stringify(draft))
  if (Array.isArray(payload.portraits)) {
    payload.portraits = payload.portraits.map((p: any) => {
      const { thumb, ...rest } = p
      return rest
    })
  }
  if (Array.isArray(payload.choices)) {
    payload.choices = sanitizeChoicesForSave(payload.choices)
  }
  if (payload.visualFx && (!payload.visualFx.type || Object.keys(payload.visualFx).length === 0)) {
    payload.visualFx = null
  }
  if (payload.colorFilter && payload.colorFilter.type === 'none') {
    payload.colorFilter = null
  }
  if (payload.backgroundFilter) {
    const blurPx = Math.max(0, Math.min(24, payload.backgroundFilter.blurPx ?? 0))
    const dimOpacity = Math.max(0, Math.min(60, payload.backgroundFilter.dimOpacity ?? 0))
    if (blurPx <= 0 && dimOpacity <= 0) {
      payload.backgroundFilter = null
    } else {
      payload.backgroundFilter = { blurPx, dimOpacity }
    }
  }
  return payload
}

async function saveNode() {
  if (!scene.value || !node.value) return
  if (!confirmSavePublishedGame()) return
  saving.value = true
  try {
    const payload = buildNodePayloadForSave(nodeDraft)
    await api.upsertNode(scene.value.id, payload)
    nodes.value = (await api.listNodes(scene.value.id)) as any[]
    // scenes.valueも更新して次ノードラベル表示を最新に
    scenes.value = (await api.listScenes(game.value.id)) as any[]
    // Update the current node
    const updated = nodes.value.find((n) => n.id === node.value.id)
    if (updated) {
      selectNode(updated)
    }
    // Refresh reference diagnostics
    await refreshReferenceDiagnostics()
  } catch (error) {
    console.error('Failed to save node:', error)
    const detail = extractApiErrorMessage(error)
    alert(detail ? `ノードの保存に失敗しました\n${detail}` : 'ノードの保存に失敗しました')
  } finally {
    saving.value = false
  }
}

// 保存して次のノードへ（連結して新規ノードを作成）
async function saveAndCreateNext() {
  if (!scene.value || !node.value) return
  if (!confirmSavePublishedGame()) return
  saving.value = true
  try {
    // 1) 現在ノードを保存
    const payload = buildNodePayloadForSave(nodeDraft)
    await api.upsertNode(scene.value.id, payload)

    // 2) コピー元の抽出（thumb除去）
    const src = JSON.parse(JSON.stringify(nodeDraft))
    const inherit: any = {}
    
    if (copyOpts.bg) {
      inherit.bgAssetId = src.bgAssetId || null
      // 背景を引き継ぐ場合、backgroundFilter も一緒に引き継ぐ
      if (src.backgroundFilter) {
        inherit.backgroundFilter = src.backgroundFilter
      }
    }
    if (copyOpts.bgm) inherit.musicAssetId = src.musicAssetId || null
    if (copyOpts.camera) inherit.camera = src.camera || null
    if (copyOpts.chars && Array.isArray(src.portraits)) {
      inherit.portraits = src.portraits.map((p: any) => {
        const { thumb, ...rest } = p
        return rest
      })
    }
    
    // 3) 新規ノードを作成（テキスト/スピーカー/選択肢は初期化）
    const newPayload = {
      text: '',
      speakerDisplayName: '',
      choices: [],
      ...inherit
    }
    const created = await api.upsertNode(scene.value.id, newPayload) as any
    
    // 4) 現在ノードの nextNodeId を新規に更新
    await api.upsertNode(scene.value.id, { 
      id: nodeDraft.id, 
      nextNodeId: created.id 
    })
    
    // 5) 一覧更新＆新規ノードへ遷移
    nodes.value = await api.listNodes(scene.value.id) as any[]
    // scenes.valueも更新して次ノードラベル表示を最新に
    scenes.value = (await api.listScenes(game.value.id)) as any[]
    const found = nodes.value.find(n => n.id === created.id) || created
    selectNode(found)
    
    // Refresh reference diagnostics
    await refreshReferenceDiagnostics()
    
    // トースト通知
    const toast = useToast()
    toast.success('次のノードを作成して連結しました')
  } catch (e) {
    console.error(e)
    const toast = useToast()
    const detail = extractApiErrorMessage(e)
    toast.error(detail ? `次ノードの作成に失敗しました: ${detail}` : '次ノードの作成に失敗しました')
  } finally {
    saving.value = false
  }
}

async function deleteCurrentNode() {
  if (!node.value) return

  const deletingNodeId = node.value.id
  const currentIndex = nodes.value.findIndex((n) => n.id === deletingNodeId)
  let summary: any | null = null
  try {
    summary = await api.getNodeDeleteSummary(deletingNodeId)
  } catch (error) {
    console.warn('Failed to fetch node delete summary:', error)
  }

  if (!confirmNodeDeletion(summary)) return

  try {
    await api.delNode(deletingNodeId)
    nodes.value = (await api.listNodes(scene.value.id)) as any[]
    scenes.value = (await api.listScenes(game.value.id)) as any[]

    const refreshedScene = scenes.value.find((s) => s.id === scene.value.id)
    if (refreshedScene) {
      scene.value = refreshedScene
    }

    if (nodes.value.length === 0) {
      node.value = null
      persistCurrentSelection()
      // Refresh reference diagnostics
      await refreshReferenceDiagnostics()
      return
    }

    const fallbackIndex = Math.min(currentIndex, nodes.value.length - 1)
    const nextNode = nodes.value[fallbackIndex]
    if (nextNode) {
      selectNode(nextNode)
      // Refresh reference diagnostics
      await refreshReferenceDiagnostics()
      return
    }

    node.value = null
    // Refresh reference diagnostics
    await refreshReferenceDiagnostics()
  } catch (error) {
    console.error('Failed to delete node:', error)
    alert('ノードの削除に失敗しました')
  }
}

function addChoice() {
  if (!nodeDraft.choices) {
    nodeDraft.choices = []
  }
  nodeDraft.choices.push({
    label: '',
    targetNodeId: null,
    effects: [],
    condition: null,
    alternateTargetNodeId: null,
    alternateCondition: null,
  })
}

function removeChoice(index: number | string) {
  nodeDraft.choices.splice(Number(index), 1)
}

// NodePicker のイベントハンドラ
function closeNodePicker() {
  openNodePicker.value = false
  editingChoiceIndex.value = null
  editingChoiceTargetField.value = 'targetNodeId'
}

function handleEditorEscape(e: KeyboardEvent) {
  if (openNodePicker.value) {
    closeNodePicker()
    e.preventDefault()
    e.stopPropagation()
    return
  }

  if (fullscreenProps.value) {
    fullscreenProps.value = false
    e.preventDefault()
  }
}

function onNodeSelected(nodeId: string) {
  if (editingChoiceIndex.value !== null) {
    // 選択肢の遷移先を設定
    onChoiceNodeSelected(nodeId)
  } else {
    // 次ノードIDを設定
    nodeDraft.nextNodeId = nodeId
  }
  closeNodePicker()
}

function openNextNodePicker() {
  openNodePicker.value = true
}

function clearNextNode() {
  nodeDraft.nextNodeId = null
}

// ---------- 3ペイン可変 & 全画面 ----------
const fullscreenProps = ref(false)
const wrap = ref<HTMLElement | null>(null)
const PANE_WIDTHS_STORAGE_KEY = 'gameEditorPaneWidths'
const defaultPaneWidths = { scenes: 280, nodes: 520, props: 640 }
const widths = useState(PANE_WIDTHS_STORAGE_KEY, () => ({ ...defaultPaneWidths }))
const min = { scenes: 200, nodes: 360, props: 360 }
const clampMin = { scenes: 160, nodes: 240, props: 280 }
const RESIZER_SIZE = 8
const RESIZER_COUNT = 2
const GRID_GAP = 16
const GRID_GAP_COUNT = 4
const gridStyle = computed(() => ({
  '--w-scenes': widths.value.scenes + 'px',
  '--w-nodes': widths.value.nodes + 'px',
  '--w-props': widths.value.props + 'px',
  '--sz-resizer': RESIZER_SIZE + 'px',
}) as any)

function clampNumber(value: unknown, fallback: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return value
}

function getEditorWrapWidth() {
  const wrapBoxWidth = wrap.value?.getBoundingClientRect().width ?? 0
  if (wrapBoxWidth > 0) return wrapBoxWidth
  if (process.client && window.innerWidth > 0) return Math.max(0, window.innerWidth - 32)
  return 0
}

function normalizePaneWidths(input: Partial<typeof defaultPaneWidths>, wrapBoxWidth: number) {
  let next = {
    scenes: clampNumber(input.scenes, defaultPaneWidths.scenes),
    nodes: clampNumber(input.nodes, defaultPaneWidths.nodes),
    props: clampNumber(input.props, defaultPaneWidths.props),
  }

  next.scenes = Math.max(clampMin.scenes, next.scenes)
  next.nodes = Math.max(clampMin.nodes, next.nodes)
  next.props = Math.max(clampMin.props, next.props)

  const chromeWidth = RESIZER_SIZE * RESIZER_COUNT + GRID_GAP * GRID_GAP_COUNT
  const available = Math.max(0, wrapBoxWidth - chromeWidth)
  if (available <= 0) return { ...defaultPaneWidths }

  const total = next.scenes + next.nodes + next.props
  if (total <= available) return next

  const baseline = {
    scenes: clampMin.scenes,
    nodes: clampMin.nodes,
    props: clampMin.props,
  }
  const baselineTotal = baseline.scenes + baseline.nodes + baseline.props

  if (baselineTotal >= available) {
    const ratio = available / baselineTotal
    return {
      scenes: Math.max(120, Math.floor(baseline.scenes * ratio)),
      nodes: Math.max(160, Math.floor(baseline.nodes * ratio)),
      props: Math.max(180, Math.floor(baseline.props * ratio)),
    }
  }

  const over = total - available
  const reducible = {
    scenes: Math.max(0, next.scenes - baseline.scenes),
    nodes: Math.max(0, next.nodes - baseline.nodes),
    props: Math.max(0, next.props - baseline.props),
  }
  const reducibleTotal = reducible.scenes + reducible.nodes + reducible.props
  if (reducibleTotal <= 0) {
    return { ...baseline }
  }

  const reduceScenes = Math.floor(over * (reducible.scenes / reducibleTotal))
  const reduceNodes = Math.floor(over * (reducible.nodes / reducibleTotal))
  const reduceProps = over - reduceScenes - reduceNodes

  return {
    scenes: Math.max(baseline.scenes, next.scenes - reduceScenes),
    nodes: Math.max(baseline.nodes, next.nodes - reduceNodes),
    props: Math.max(baseline.props, next.props - reduceProps),
  }
}

function applyWidthClamp(source: Partial<typeof defaultPaneWidths>, options: { persist?: boolean } = {}) {
  const normalized = normalizePaneWidths(source, getEditorWrapWidth())
  widths.value = normalized
  if (options.persist && process.client) {
    localStorage.setItem(PANE_WIDTHS_STORAGE_KEY, JSON.stringify(normalized))
  }
}

function onWindowResize() {
  applyWidthClamp(widths.value)
}

// 幅プリセット (プレビューペインの幅を変更)
function setPreviewWidth(w: number) {
  applyWidthClamp({ ...widths.value, props: w }, { persist: true })
}

function resetEditorViewState() {
  if (!process.client) return

  const ok = window.confirm(
    '編集画面の表示設定をリセットします。\n\n3ペイン幅、右ペインの開閉状態、制作ガイドの表示状態、このゲームの最後に選択したシーン/ノードを初期化します。ゲーム内容は変更されません。'
  )
  if (!ok) return

  const toast = useToast()

  try {
    localStorage.removeItem(PANE_WIDTHS_STORAGE_KEY)
    localStorage.removeItem(RIGHT_PANE_SECTIONS_STORAGE_KEY)

    const gameId = normalizeNodeId(game.value?.id)
    if (gameId) {
      clearLastSelection(gameId)
      localStorage.removeItem(buildCreationGuideHiddenStorageKey(gameId))
    }

    creationGuideHidden.value = false

    applyWidthClamp(defaultPaneWidths, { persist: true })
    resetSectionOpen()

    toast.success('編集画面の表示設定をリセットしました')
  } catch (error) {
    console.warn('Failed to reset editor view state', error)
    toast.error('表示設定のリセットに失敗しました')
  }
}

onMounted(() => {
  // 以前の幅を復元
  const saved = localStorage.getItem(PANE_WIDTHS_STORAGE_KEY)
  if (saved) {
    try {
      applyWidthClamp(JSON.parse(saved) as Partial<typeof defaultPaneWidths>, { persist: true })
    } catch {
      applyWidthClamp(defaultPaneWidths, { persist: true })
    }
  } else {
    applyWidthClamp(defaultPaneWidths)
  }
  // Fキーで切替
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', onWindowResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('keydown', onGlobalKeydown)
  window.removeEventListener('resize', onWindowResize)
})
function onKey(e: KeyboardEvent) {
  if (e.key.toLowerCase() === 'f') {
    e.preventDefault()
    fullscreenProps.value = !fullscreenProps.value
    return
  }

  if (e.key === 'Escape') {
    handleEditorEscape(e)
  }
}

let resizing: 'left' | 'right' | null = null
let startX = 0, startWidths = { scenes: 0, nodes: 0, props: 0 }, wrapWidth = 0
function startResize(side: 'left' | 'right', ev: PointerEvent) {
  resizing = side
  startX = ev.clientX
  startWidths = { ...widths.value }
  wrapWidth = wrap.value?.getBoundingClientRect().width ?? 0
  ;(ev.target as HTMLElement).setPointerCapture(ev.pointerId)
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp, { once: true })
}
function onMove(ev: PointerEvent) {
  if (!resizing) return
  const dx = ev.clientX - startX
  const w = { ...startWidths }
  if (resizing === 'left') {
    w.scenes = Math.max(min.scenes, startWidths.scenes + dx)
    w.nodes = Math.max(min.nodes, startWidths.nodes - dx)
  } else {
    w.nodes = Math.max(min.nodes, startWidths.nodes + dx)
    w.props = Math.max(min.props, startWidths.props - dx)
  }
  widths.value = normalizePaneWidths(w, wrapWidth)
}
function onUp() {
  resizing = null
  localStorage.setItem(PANE_WIDTHS_STORAGE_KEY, JSON.stringify(widths.value))
  window.removeEventListener('pointermove', onMove)
}

// ────────────────────────────────────────────────────────────────────────────
// AIレビュー用 台本Markdown Export
// ────────────────────────────────────────────────────────────────────────────

function markdownCodeBlock(value: unknown, lang = 'text') {
  const text = typeof value === 'string' ? value : ''
  const fence = text.includes('```') ? '````' : '```'
  return `${fence}${lang}\n${text || '(本文なし)'}\n${fence}`
}

function generateAiReviewMarkdown(): string {
  if (!game.value) {
    return ''
  }

  const gameId = game.value.id || 'unknown'
  const gameTitle = game.value.title || 'Untitled'
  const sceneCount = (scenarioCheckScenes.value ?? []).length
  const nodeCount = (scenarioCheckScenes.value ?? [])
    .reduce((acc: number, s: any) => acc + (Array.isArray(s.nodes) ? s.nodes.length : 0), 0)

  const startSceneId = game.value.startSceneId || '未設定'
  let startNodeId = '未設定'
  if (game.value.startSceneId) {
    const startScene = scenarioCheckScenes.value?.find((s: any) => s.id === game.value.startSceneId)
    if (startScene?.startNodeId) {
      startNodeId = startScene.startNodeId
    }
  }

  const exportedAt = new Date().toISOString()

  // ─── 1. ヘッダー ──
  let md = ''
  md += '# AI Review Script Export\n\n'
  md += `- Exported At: ${exportedAt}\n`
  md += `- Game Title: ${gameTitle}\n`
  md += `- Game ID: ${gameId}\n`
  md += `- Start Scene ID: ${startSceneId}\n`
  md += `- Start Node ID: ${startNodeId}\n`
  md += `- Scene Count: ${sceneCount}\n`
  md += `- Node Count: ${nodeCount}\n`
  md += '\n'

  // ─── 2. Export Note ──
  md += '## Export Note\n\n'
  md += 'このMarkdownはTalkingの編集画面から出力されたAIレビュー用の台本です。\n'
  md += '現在選択中のノードについては、未保存の編集内容が反映されている場合があります。\n'
  md += '公開前チェック結果（未到達警告・素材/キャラクター参照警告を含む）も同梱されます。\n'
  md += 'クレジット詳細、素材/キャラクター詳細情報、Import/JSON Export/独自DSLはこのMVPには含まれません。\n'
  md += '\n'

  // ─── 3. Summary ──
  md += '## Summary\n\n'
  md += `- Scenes: ${sceneCount}\n`
  md += `- Nodes: ${nodeCount}\n`

  // 使用素材IDを集計
  const assetIds = {
    bg: new Set<string>(),
    music: new Set<string>(),
    sfx: new Set<string>(),
    characterImage: new Set<string>(),
  }

  const characterIds = new Set<string>()

  for (const scene of scenarioCheckScenes.value ?? []) {
    for (const node of scene.nodes ?? []) {
      if (node.bgAssetId) assetIds.bg.add(node.bgAssetId)
      if (node.musicAssetId) assetIds.music.add(node.musicAssetId)
      if (node.sfxAssetId) assetIds.sfx.add(node.sfxAssetId)
      if (node.speakerCharacterId) characterIds.add(node.speakerCharacterId)

      if (Array.isArray(node.portraits)) {
        for (const portrait of node.portraits) {
          if (portrait.imageId) assetIds.characterImage.add(portrait.imageId)
          if (portrait.characterId) characterIds.add(portrait.characterId)
        }
      }
    }
  }

  md += '- Asset IDs:\n'
  md += assetIds.bg.size > 0 ? `  - BG: ${Array.from(assetIds.bg).join(', ')}\n` : '  - BG: なし\n'
  md += assetIds.music.size > 0 ? `  - BGM: ${Array.from(assetIds.music).join(', ')}\n` : '  - BGM: なし\n'
  md += assetIds.sfx.size > 0 ? `  - SFX: ${Array.from(assetIds.sfx).join(', ')}\n` : '  - SFX: なし\n'
  md += assetIds.characterImage.size > 0 ? `  - Character Image: ${Array.from(assetIds.characterImage).join(', ')}\n` : '  - Character Image: なし\n'

  md += '- Character IDs:\n'
  if (characterIds.size > 0) {
    md += `  - ${Array.from(characterIds).join(', ')}\n`
  } else {
    md += '  - なし\n'
  }
  md += '\n'

  // ─── 4. Pre-publish Check ──
  {
    const counts = scenarioCheckCounts.value
    const catCounts = scenarioCategoryCounts.value
    const issues = scenarioCheckIssues.value
    const loading = referenceDiagnosticsLoading.value
    const diagError = referenceDiagnosticsError.value

    const status = (() => {
      if (counts.error > 0) return '要修正'
      if (diagError) return '注意あり'
      if (counts.warning > 0) return '注意あり'
      if (loading) return 'チェック中'
      return '公開準備OK'
    })()

    md += '## Pre-publish Check\n\n'
    md += `- Status: ${status}\n`
    md += `- Total Issues: ${issues.length}\n`
    md += '- Counts:\n'
    md += `  - Error: ${counts.error}\n`
    md += `  - Warning: ${counts.warning}\n`
    md += `  - Info: ${counts.info}\n`
    md += '- Categories:\n'
    md += `  - 構成: ${catCounts.structure}\n`
    md += `  - 素材参照: ${catCounts.assetReference}\n`
    md += `  - キャラクター参照: ${catCounts.characterReference}\n`
    md += '- Reference Diagnostics:\n'
    if (loading) {
      md += '  - Status: Loading\n'
    } else if (diagError) {
      md += '  - Status: Error\n'
      md += `  - Message: ${diagError}\n`
    } else {
      md += '  - Status: OK\n'
    }
    md += '\n'

    if (issues.length === 0) {
      md += '公開前チェックで重大な問題は見つかりませんでした。\n'
    } else {
      md += '### Issues\n\n'
      for (let idx = 0; idx < issues.length; idx++) {
        const issue = issues[idx]
        const cat = categorizeIssue(issue as any)
        const catLabel = prepublishCategoryLabel(cat)
        const sceneLabel = issue.sceneOrder != null
          ? `Scene ${issue.sceneOrder}: ${issue.sceneName}`
          : '未設定'
        const nodeLabel = issue.nodeOrder != null ? `Node ${issue.nodeOrder}` : '未設定'
        md += `${idx + 1}. [${issue.severity}] ${catLabel}\n`
        md += `   - Message: ${issue.message}\n`
        md += `   - Scene: ${sceneLabel}\n`
        md += `   - Node: ${nodeLabel}\n`
        md += `   - Field: ${issue.field || '未設定'}\n`
        md += `   - Code: ${issue.code || '未設定'}\n`
        md += `   - Ref ID: ${issue.refId || '未設定'}\n`
        md += `   - Node Preview: ${issue.nodePreview || '未設定'}\n`
        md += '\n'
      }
    }
    md += '\n'
  }

  // ─── 5. Scene Index ──
  md += '## Scene Index\n\n'
  for (let si = 0; si < (scenarioCheckScenes.value ?? []).length; si++) {
    const scene = scenarioCheckScenes.value[si]
    const sceneNodeCount = Array.isArray(scene.nodes) ? scene.nodes.length : 0
    md += `${si + 1}. Scene ${si + 1}: ${scene.name || 'Untitled'}\n`
    md += `   - Scene ID: ${scene.id}\n`
    md += `   - Start Node ID: ${scene.startNodeId || '未設定'}\n`
    md += `   - Node Count: ${sceneNodeCount}\n`
  }
  md += '\n'

  // ─── 6. Script ──
  md += '## Script\n\n'
  for (let si = 0; si < (scenarioCheckScenes.value ?? []).length; si++) {
    const scene = scenarioCheckScenes.value[si]
    md += `### Scene ${si + 1}: ${scene.name || 'Untitled'}\n\n`
    md += `- Scene ID: ${scene.id}\n`
    md += `- Start Node ID: ${scene.startNodeId || '未設定'}\n`
    md += '\n'

    for (let ni = 0; ni < (scene.nodes ?? []).length; ni++) {
      const node = scene.nodes[ni]
      md += `#### Node ${si + 1}.${ni + 1}\n\n`
      md += `- Node ID: ${node.id}\n`
      md += `- Speaker: ${node.speakerDisplayName || '(話者なし)'}\n`
      md += `- Speaker Character ID: ${node.speakerCharacterId || '未設定'}\n`
      md += `- Next Node ID: ${node.nextNodeId || '未設定'}\n`
      md += `- BG Asset ID: ${node.bgAssetId || '未設定'}\n`
      md += `- BGM Asset ID: ${node.musicAssetId || '未設定'}\n`
      md += `- SFX Asset ID: ${node.sfxAssetId || '未設定'}\n`
      md += '\n'

      md += 'Text:\n\n'
      md += markdownCodeBlock(node.text) + '\n\n'

      if (Array.isArray(node.portraits) && node.portraits.length > 0) {
        md += 'Characters:\n\n'
        for (const portrait of node.portraits) {
          md += `- Character ID: ${portrait.characterId || '未設定'}\n`
          md += `  - Image ID: ${portrait.imageId || '未設定'}\n`
          md += `  - Name: ${portrait.characterName || '(名前なし)'}\n`
          md += `  - Position: x=${portrait.x ?? '未設定'}, y=${portrait.y ?? '未設定'}, scale=${portrait.scale ?? '未設定'}, z=${portrait.z ?? '未設定'}\n`
        }
        md += '\n'
      }

      if (Array.isArray(node.choices) && node.choices.length > 0) {
        md += 'Choices:\n\n'
        for (let ci = 0; ci < node.choices.length; ci++) {
          const choice = node.choices[ci]
          md += `${ci + 1}. ${choice.label || '(ラベルなし)'}\n`
          md += `   - Target Node ID: ${choice.targetNodeId || '未設定'}\n`
          md += `   - Condition: ${choice.condition ? JSON.stringify(choice.condition) : 'なし'}\n`
          if (choice.alternateTargetNodeId || choice.alternateCondition) {
            md += `   - Alternate Target Node ID: ${choice.alternateTargetNodeId || '未設定'}\n`
            md += `   - Alternate Condition: ${choice.alternateCondition ? JSON.stringify(choice.alternateCondition) : 'なし'}\n`
          }
        }
        md += '\n'
      }
    }
  }

  return md
}

async function copyAiReviewMarkdown() {
  if (!game.value) {
    const toast = useToast()
    toast.warning('出力できるゲーム情報がありません')
    return
  }

  try {
    const markdown = generateAiReviewMarkdown()
    await navigator.clipboard.writeText(markdown)
    const toast = useToast()
    toast.success('AIレビュー用Markdownをコピーしました')
  } catch (error) {
    console.error('Failed to copy markdown:', error)
    const toast = useToast()
    toast.error('Markdownのコピーに失敗しました')
  }
}

function downloadAiReviewMarkdown() {
  if (!game.value) {
    const toast = useToast()
    toast.warning('出力できるゲーム情報がありません')
    return
  }

  try {
    const markdown = generateAiReviewMarkdown()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const filename = `talking-ai-review-script-${game.value.id}-${timestamp}.md`

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    const toast = useToast()
    toast.success('AIレビュー用Markdownを保存しました')
  } catch (error) {
    console.error('Failed to download markdown:', error)
    const toast = useToast()
    toast.error('Markdownの保存に失敗しました')
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-4">
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">読み込み中...</p>
    </div>

    <div v-else-if="game" class="space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">{{ game.title }}</h1>
        <div class="flex flex-col items-end gap-1">
          <div v-if="game?.id" class="flex flex-wrap justify-end gap-2">
            <button
              @click="openSelectedTestPlay"
              class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              選択中からテスト
            </button>
            <button
              @click="openGameStartTestPlay"
              class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
            >
              最初からテスト
            </button>
          </div>
          <p class="text-[11px] text-gray-500">保存済み内容で再生（未保存の変更は反映されません）</p>
        </div>
      </div>

      <!-- 公開中編集バナー（全文表示） -->
      <div
        v-if="isPublishedGame && !publishedEditBannerCollapsed"
        class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      >
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <div class="font-semibold">このゲームは公開中です</div>
            <p class="mt-1 text-amber-800">
              保存した変更は公開版にも反映されます。新しく追加された素材・キャラクターのクレジットは、保存時に公開時点の情報として固定されます。
            </p>
            <p class="mt-1 text-amber-700 text-xs">
              大きく作り直す場合は、必要に応じてゲーム一覧から非公開にしてから編集してください。
            </p>
          </div>
          <button
            type="button"
            aria-expanded="true"
            class="shrink-0 text-xs text-amber-700 border border-amber-300 rounded px-2 py-1 hover:bg-amber-100 transition-colors"
            @click="setPublishedEditBannerCollapsed(true)"
          >小さく表示</button>
        </div>
      </div>
      <!-- 公開中編集バナー（省スペース表示） -->
      <div
        v-else-if="isPublishedGame && publishedEditBannerCollapsed"
        class="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 flex flex-wrap items-center justify-between gap-2"
      >
        <span>公開中: 保存した変更は公開版に反映されます。</span>
        <button
          type="button"
          aria-expanded="false"
          class="shrink-0 text-xs text-amber-700 border border-amber-300 rounded px-2 py-1 hover:bg-amber-100 transition-colors"
          @click="setPublishedEditBannerCollapsed(false)"
        >詳細を表示</button>
      </div>

      <div
        ref="wrap"
        class="editor-grid"
        :style="gridStyle"
        tabindex="0"
        @keydown.esc.prevent.stop="handleEditorEscape"
      >
        <!-- シーン一覧 (左) -->
        <aside v-show="!fullscreenProps" class="pane pane-scenes border border-gray-200 rounded-lg p-4 bg-white" aria-label="scenes">
          <h2 class="font-semibold mb-2 text-lg">シーン</h2>
          <!-- 選択中シーン名の編集 -->
          <div v-if="scene" class="mb-3 pb-3 border-b border-gray-200">
            <label class="block text-xs text-gray-500 mb-1">選択中シーン名</label>
            <input
              v-model="sceneNameDraft"
              class="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              :placeholder="`Scene ${currentSceneDisplayNumber}`"
              @keydown.enter.prevent="saveSceneName"
              @blur="saveSceneName"
            />
          </div>
          <ul class="space-y-2">
            <li
              v-for="(s, si) in scenes"
              :key="s.id"
              @click="selectScene(s)"
              :class="[
                'px-3 py-2 rounded cursor-pointer transition-colors',
                s.id === scene?.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 hover:bg-gray-100',
              ]"
            >
              <div class="text-[10px]" :class="s.id === scene?.id ? 'text-blue-100' : 'text-gray-400'">Scene {{ si + 1 }}</div>
              <div class="text-sm font-medium truncate">{{ s.name || `Scene ${si + 1}` }}</div>
              <div class="text-[11px]" :class="s.id === scene?.id ? 'text-blue-100' : 'text-gray-400'">{{ sceneNodeCount.get(s.id) ?? 0 }} nodes</div>
              <div class="mt-1 flex items-center gap-1">
                <button
                  type="button"
                  class="text-[10px] px-1.5 py-0.5 border rounded"
                  :class="s.id === scene?.id ? 'border-blue-200 text-blue-50 hover:bg-blue-400' : 'border-gray-300 text-gray-600 hover:bg-gray-100'"
                  :disabled="s.id === game?.startSceneId"
                  @click.stop="setStartSceneFromScene(s)"
                >
                  このシーンから開始
                </button>
                <span v-if="s.id === game?.startSceneId" class="text-[10px]" :class="s.id === scene?.id ? 'text-yellow-200' : 'text-yellow-600'">開始シーン</span>
              </div>
            </li>
          </ul>
          <button
            class="mt-4 w-full px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            @click="addScene"
          >
            + シーン追加
          </button>
          <button
            class="mt-2 w-full px-3 py-2 border border-red-300 text-red-700 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!scene || scenes.length <= 1"
            @click="deleteCurrentScene"
            title="最後の1シーンは削除できません"
          >
            このシーンを削除
          </button>
          <p v-if="scenes.length <= 1" class="mt-2 text-xs text-gray-500">最後の1シーンは削除できません</p>
        </aside>

        <!-- ノード一覧 (中央) -->
        <main v-show="!fullscreenProps" class="pane pane-nodes border border-gray-200 rounded-lg p-4 bg-white" aria-label="nodes">
          <h2 class="font-semibold mb-3 text-lg">ノード</h2>
          <div v-if="!scene" class="text-center py-12 text-gray-500">
            左からシーンを選択してください
          </div>
          <div v-else>
            <ul class="space-y-2">
              <li
                v-for="(n, ni) in nodes"
                :key="n.id"
                class="p-3 border border-gray-200 rounded cursor-pointer hover:shadow-md transition-shadow"
                :class="{ 'border-blue-500 bg-blue-50': n.id === node?.id }"
              >
                <div class="flex items-center" @click="selectNode(n)">
                  <div class="text-xs text-gray-500 mr-2">#{{ ni + 1 }}</div>
                  <div class="font-medium truncate text-sm flex-1">
                    {{ n.text || '(無題の台詞)' }}
                  </div>
                  <button class="ml-2 text-xs px-2 py-1 border rounded" @click.stop="setSceneStartNode(n.id)">▶このノードから開始</button>
                  <span v-if="scene?.startNodeId===n.id" class="ml-1 text-[10px] text-green-600">開始</span>
                </div>
                <div v-if="n.choices?.length" class="text-xs text-purple-600 mt-1">
                  選択肢 × {{ n.choices.length }}
                </div>
              </li>
            </ul>
            <div v-if="nodes.length === 0" class="mt-3 text-sm text-gray-500">ノードなし</div>
            <button
              class="mt-4 w-full px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              @click="addNode"
            >
              + 台詞追加
            </button>
          </div>
        </main>

        <!-- resizer between scenes & nodes -->
        <div v-show="!fullscreenProps" class="resizer resizer-left" aria-label="resize-left" @pointerdown="startResize('left', $event)"></div>
        <!-- resizer between nodes & props -->
        <div v-show="!fullscreenProps" class="resizer resizer-right" aria-label="resize-right" @pointerdown="startResize('right', $event)"></div>

        <!-- プロパティ (右) -->
        <section
          class="pane pane-props border border-gray-200 rounded-lg p-4 bg-white overflow-y-auto"
          :class="fullscreenProps ? 'props-fullscreen' : 'props-normal'"
        >
          <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
            <h2 class="font-semibold text-lg">プロパティ</h2>
            <div class="flex flex-wrap items-start gap-2">
              <div class="rounded border border-gray-200 bg-gray-50 px-2 py-1.5">
                <p class="mb-1 text-[10px] font-semibold text-gray-500">表示</p>
                <div class="flex flex-wrap items-center gap-1.5">
                  <!-- 幅プリセットボタン (通常表示のみ) -->
                  <div v-if="!fullscreenProps" class="flex items-center gap-1 rounded border bg-white px-1 py-0.5">
                    <button class="px-1.5 py-0.5 text-xs rounded hover:bg-gray-100" @click="setPreviewWidth(560)" title="やや広">S</button>
                    <button class="px-1.5 py-0.5 text-xs rounded hover:bg-gray-100" @click="setPreviewWidth(720)" title="ワイド">M</button>
                    <button class="px-1.5 py-0.5 text-xs rounded hover:bg-gray-100" @click="setPreviewWidth(900)" title="最大">L</button>
                  </div>
                  <button class="px-2 py-1 border rounded text-sm bg-white" @click="fullscreenProps=!fullscreenProps">
                    {{ fullscreenProps ? '通常表示' : '全画面' }}
                  </button>
                  <span class="text-[11px] text-gray-500">Fで切替 / Escで閉じる</span>
                </div>
              </div>

              <div class="rounded border border-gray-200 bg-gray-50 px-2 py-1.5">
                <p class="mb-1 text-[10px] font-semibold text-gray-500">設定</p>
                <div class="flex flex-wrap items-center gap-1">
                  <button
                    class="px-1.5 py-0.5 text-[11px] border rounded bg-white hover:bg-gray-50"
                    title="3ペイン幅・セクション開閉・制作ガイドの表示状態・このゲームの最後の選択位置をリセットします。ゲーム内容は変更されません。"
                    @click="resetEditorViewState"
                  >
                    リセット
                  </button>
                  <button
                    v-if="creationGuideHidden || !sectionOpen.guide"
                    class="px-1.5 py-0.5 text-[11px] border rounded bg-white hover:bg-gray-50"
                    @click="showCreationGuide"
                    title="制作ガイドを表示"
                  >
                    📋 ガイド
                  </button>
                  <button class="px-1.5 py-0.5 text-[11px] border rounded bg-white hover:bg-gray-50" @click="openThemeModal=true" title="全体設定">⚙️ 設定</button>
                </div>
              </div>

              <div class="rounded border border-gray-200 bg-gray-50 px-2 py-1.5">
                <p class="mb-1 text-[10px] font-semibold text-gray-500">出力</p>
                <div class="flex flex-wrap items-center gap-1.5">
                  <button
                    class="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50"
                    title="AIレビュー用の台本Markdownをクリップボードにコピーします"
                    @click="copyAiReviewMarkdown"
                  >
                    MDコピー
                  </button>
                  <button
                    class="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50"
                    title="AIレビュー用の台本Markdownを .md ファイルとして保存します"
                    @click="downloadAiReviewMarkdown"
                  >
                    MD保存
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!creationGuideHidden && sectionOpen.guide" class="mb-3 rounded-lg border border-slate-200 bg-white">
            <div class="flex items-start justify-between gap-2 border-b border-slate-200 px-3 py-1.5">
              <div>
                <div class="font-semibold text-xs">制作ガイド</div>
              </div>
              <button
                type="button"
                class="shrink-0 px-1.5 py-0.5 text-[11px] border border-slate-300 rounded bg-white hover:bg-slate-100"
                @click="sectionOpen.guide = false"
                title="折りたたむ"
              >
                ▲
              </button>
            </div>
            <div class="px-2 py-2">
              <div v-if="creationGuideVisibleItems.length > 0" class="space-y-1.5">
                <article
                  v-for="item in creationGuideVisibleItems"
                  :key="item.id"
                  class="rounded border px-2 py-1.5 text-[11px]"
                  :class="creationGuideActionToneClass[item.tone]"
                >
                  <div class="flex items-start justify-between gap-1.5">
                    <div class="min-w-0 flex-1">
                      <div class="font-semibold text-xs leading-tight">{{ item.title }}</div>
                      <p class="mt-0.5 text-[10px] leading-snug opacity-90">{{ item.description }}</p>
                    </div>
                    <button
                      type="button"
                      class="shrink-0 rounded border border-current/20 bg-white/70 px-1.5 py-0.5 text-[10px] font-medium hover:bg-white whitespace-nowrap"
                      @click="handleCreationGuideAction(item)"
                    >
                      {{ item.actionLabel }}
                    </button>
                  </div>
                </article>
              </div>
              <div v-else class="rounded border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[11px] text-emerald-700">
                基本項目はだいたい整っています。詳細は公開前チェックで確認できます。
              </div>
              <div class="mt-1.5 flex items-center justify-between gap-1">
                <p v-if="creationGuideRemainingCount > 0" class="text-[10px] text-slate-500">
                  ほか {{ creationGuideRemainingCount }} 件
                </p>
                <button
                  type="button"
                  class="text-[10px] text-slate-500 hover:text-slate-700 underline"
                  @click="setCreationGuideHidden(true)"
                  title="非表示にする"
                >
                  ✕ 非表示
                </button>
              </div>
            </div>
          </div>

          <div class="mb-4 rounded-lg border border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between gap-2 border-b border-gray-200 px-3 py-2">
              <div>
                <div class="font-semibold text-sm">公開前チェック</div>
                <div class="text-[11px] text-gray-500">ゲーム構成・素材参照・キャラクター参照を確認します。警告は公開をブロックしません。</div>
              </div>
              <button
                type="button"
                class="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100"
                @click="sectionOpen.scenarioCheck = !sectionOpen.scenarioCheck"
              >
                {{ sectionOpen.scenarioCheck ? '折りたたむ' : '展開' }}
              </button>
            </div>
            <div class="px-3 py-2">
              <div class="flex flex-wrap gap-2 text-xs">
                <span class="rounded border border-red-200 bg-red-50 px-2 py-1 font-semibold text-red-700">エラー {{ scenarioCheckCounts.error }}件</span>
                <span class="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700">警告 {{ scenarioCheckCounts.warning }}件</span>
                <span class="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">情報 {{ scenarioCheckCounts.info }}件</span>
              </div>
              <div v-if="referenceDiagnosticsLoading" class="mt-2 flex items-center gap-1 text-xs text-slate-500">
                <span class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500"></span>
                素材・キャラクター参照を確認中...
              </div>
              <div v-else-if="referenceDiagnosticsError" class="mt-2 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700">
                {{ referenceDiagnosticsError }} — 時間をおいて再読み込みしてください。
              </div>
            </div>
            <div v-if="sectionOpen.scenarioCheck" class="border-t border-gray-200 px-3 py-2">
              <!-- ── 公開前チェックサマリーカード ── -->
              <EditorPublishCheckSummaryCard
                :counts="scenarioCheckCounts"
                :total-count="scenarioCheckTotalCount"
                :category-counts="scenarioCategoryCounts"
                :issues="scenarioCheckIssues"
                :reference-diagnostics-loading="referenceDiagnosticsLoading"
                :reference-diagnostics-error="referenceDiagnosticsError"
              />
              <!-- ── フィルター ── -->
              <div class="mb-1 flex flex-wrap gap-2">
                <button
                  v-for="item in scenarioCheckFilterItems"
                  :key="item.key"
                  type="button"
                  class="rounded border px-2 py-1 text-xs transition-colors"
                  :class="scenarioFilterButtonClass(item.key)"
                  @click="selectScenarioCheckFilter(item.key)"
                >
                  {{ item.label }} {{ item.count }}
                </button>
              </div>
              <div class="mb-2 flex flex-wrap gap-1">
                <button
                  v-for="item in scenarioCategoryFilterItems"
                  :key="item.key"
                  type="button"
                  class="rounded border px-2 py-0.5 text-[11px] transition-colors"
                  :class="scenarioCategoryFilterButtonClass(item.key, item.count)"
                  @click="selectScenarioCategoryFilter(item.key)"
                >
                  {{ item.displayLabel }}
                </button>
              </div>
              <!-- ── issue一覧 ── -->
              <div id="publish-check-issues">
              <div v-if="scenarioCheckTotalCount === 0" class="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                問題は見つかりませんでした。
              </div>
              <div v-else-if="scenarioCheckFilteredIssues.length === 0" class="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                この条件のチェック項目はありません。
              </div>
              <div v-else class="space-y-2">
                <div
                  v-if="scenarioCheckFilter === 'all' && scenarioCheckFilteredInfoIssues.length > 0"
                  class="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
                >
                  <span>情報 {{ scenarioCheckFilteredInfoIssues.length }}件</span>
                  <button
                    type="button"
                    class="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-100"
                    @click="scenarioCheckInfoOpen = !scenarioCheckInfoOpen"
                  >
                    {{ scenarioCheckInfoOpen ? '情報を折りたたむ' : '情報を表示' }}
                  </button>
                </div>
                <div v-if="scenarioCheckVisibleIssues.length === 0" class="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  情報項目は折りたたまれています。必要なら「情報を表示」を押してください。
                </div>
                <div v-else class="space-y-2 max-h-64 overflow-y-auto pr-1">
                  <article
                    v-for="issue in scenarioCheckVisibleIssues"
                    :key="issue.id"
                    :ref="(el) => setScenarioIssueCardRef(issue.id, el)"
                    class="rounded border px-2 py-2 text-xs"
                    :class="[
                      scenarioSeverityClass(issue.severity),
                      highlightedScenarioIssueId === issue.id ? 'ring-2 ring-sky-300 border-sky-400 bg-sky-50/40' : ''
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
                        @click="focusScenarioIssue(issue)"
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
              </div><!-- /publish-check-issues -->
            </div>
          </div>

          <!-- ミニプレビュー -->
          <!-- 全画面は 2 カラムに分割：左=ステージ / 右=フォーム -->
          <div v-if="fullscreenProps && node" class="fs-grid">
            <div class="stage-outer">
              <div class="stage-inner">
                <!-- StageCanvas を使用して統一構造 -->
                <StageCanvas 
                  style="width: 100%; height: 100%"
                  :backgroundUrl="bgUrl"
                  :characters="stageCharacters"
                  :message="stageMessage"
                  :theme="stageTheme"
                  :camera="stageCamera"
                  :effectState="effectState"
                  :colorFilter="nodeDraft.colorFilter"
                  :backgroundFilter="nodeDraft.backgroundFilter"
                />
              </div>
            </div>
            <div class="fs-form">
              <div class="space-y-4">
                <!-- 基本情報セクション -->
                <NodeBasicInfoFields
                  :node-draft="nodeDraft"
                  :section-open="sectionOpen"
                  :selected-char-label="selectedCharLabel"
                  @open-char-picker="openSpeakerCharPicker"
                  @clear-char="clearChar"
                />

              <div class="space-y-3">
                <NodeMaterialsFields
                  :node-draft="nodeDraft"
                  :section-open="sectionOpen"
                  :bg-url="bgUrl"
                  :music-title="musicTitle"
                  :music-url="musicUrl"
                  :sfx-url="sfxUrl"
                  @open-bg-picker="openBgPicker=true"
                  @open-music-picker="openMusicPicker=true"
                  @open-sfx-picker="openSfxPicker=true"
                  @clear-bg="nodeDraft.bgAssetId=''"
                  @clear-music="nodeDraft.musicAssetId=''"
                  @clear-sfx="nodeDraft.sfxAssetId=''"
                />

                <NodePortraitsFields
                  :node-draft="nodeDraft"
                  :section-open="sectionOpen"
                  @add-portrait="addPortrait"
                  @change-portrait="changePortrait"
                  @remove-portrait="removePortrait"
                />

                <!-- 演出セクション -->
                <div class="editor-section-header" @click="sectionOpen.effects = !sectionOpen.effects">
                  <span class="editor-section-title">
                    <span class="editor-section-toggle">{{ sectionOpen.effects ? '▼' : '▶' }}</span>
                    演出
                  </span>
                </div>
                <div v-if="!sectionOpen.effects" class="text-xs text-gray-500 truncate mb-1">
                  {{ effectsSummaryText }}
                </div>

                <NodeEffectsFields
                  v-if="sectionOpen.effects"
                  :node-draft="nodeDraft"
                  :on-preview-visual-effect="playEffect"
                />

                <!-- 遷移・分岐セクション -->
                <div class="editor-section-header" @click="sectionOpen.transitions = !sectionOpen.transitions">
                  <span class="editor-section-title">
                    <span class="editor-section-toggle">{{ sectionOpen.transitions ? '▼' : '▶' }}</span>
                    遷移・分岐
                  </span>
                </div>
                <div v-if="!sectionOpen.transitions" class="text-xs text-gray-500 truncate mb-1">
                  {{ transitionsSummaryText }}
                </div>

                <div v-if="sectionOpen.transitions">
                  <NodeTransitionFields
                    :node-draft="nodeDraft"
                    :next-node-label="nextNodeLabel"
                    :copy-opts="copyOpts"
                    @open-node-picker="openNextNodePicker"
                    @clear-next-node="clearNextNode"
                  />

                  <NodeChoicesFields
                    :node-draft="nodeDraft"
                    :show-choice-next-priority-notice="showChoiceNextPriorityNotice"
                    :get-choice-target-label="getChoiceTargetLabel"
                    :has-configured-choice-target="hasConfiguredChoiceTarget"
                    :is-unary-choice-operator="isUnaryChoiceOperator"
                    @add-choice="addChoice"
                    @remove-choice="removeChoice"
                    @add-choice-effect="addChoiceEffect"
                    @remove-choice-effect="removeChoiceEffect"
                    @enable-choice-condition="enableChoiceCondition"
                    @clear-choice-target="clearChoiceTarget"
                    @open-choice-node-picker="openChoiceNodePicker"
                  />
                </div>
              </div>

              <NodeSaveActions
                :saving="saving"
                @save="saveNode"
                @save-and-create-next="saveAndCreateNext"
              />

              <NodeDangerZone
                :section-open="sectionOpen"
                @toggle-dangerous="sectionOpen.dangerous = !sectionOpen.dangerous"
                @delete-current-node="deleteCurrentNode"
              />

              </div>
            </div>
          </div>

          <!-- 通常表示の場合 -->
          <div v-if="!fullscreenProps">
            <div v-if="node" class="mb-3">
              <div class="relative">
                <StageCanvas 
                  style="width: 100%; aspect-ratio: 16/9"
                  :backgroundUrl="bgUrl"
                  :characters="stageCharacters"
                  :message="stageMessage"
                  :theme="stageTheme"
                  :camera="stageCamera"
                  :effectState="effectState"
                  :colorFilter="nodeDraft.colorFilter"
                  :backgroundFilter="nodeDraft.backgroundFilter"
                />
              </div>
            </div>

            <div v-if="node">
              <div class="space-y-4">
                <!-- 基本情報セクション -->
                <NodeBasicInfoFields
                  :node-draft="nodeDraft"
                  :section-open="sectionOpen"
                  :selected-char-label="selectedCharLabel"
                  @open-char-picker="openSpeakerCharPicker"
                  @clear-char="clearChar"
                />

                <div class="space-y-3">
                  <NodeMaterialsFields
                    :node-draft="nodeDraft"
                    :section-open="sectionOpen"
                    :bg-url="bgUrl"
                    :music-title="musicTitle"
                    :music-url="musicUrl"
                    :sfx-url="sfxUrl"
                    @open-bg-picker="openBgPicker=true"
                    @open-music-picker="openMusicPicker=true"
                    @open-sfx-picker="openSfxPicker=true"
                    @clear-bg="nodeDraft.bgAssetId=''"
                    @clear-music="nodeDraft.musicAssetId=''"
                    @clear-sfx="nodeDraft.sfxAssetId=''"
                  />

                  <NodePortraitsFields
                    :node-draft="nodeDraft"
                    :section-open="sectionOpen"
                    @add-portrait="addPortrait"
                    @change-portrait="changePortrait"
                    @remove-portrait="removePortrait"
                  />

                  <!-- 演出セクション -->
                  <div class="editor-section-header" @click="sectionOpen.effects = !sectionOpen.effects">
                    <span class="editor-section-title">
                      <span class="editor-section-toggle">{{ sectionOpen.effects ? '▼' : '▶' }}</span>
                      演出
                    </span>
                  </div>
                  <div v-if="!sectionOpen.effects" class="text-xs text-gray-500 truncate mb-1">
                    {{ effectsSummaryText }}
                  </div>

                  <NodeEffectsFields
                    v-if="sectionOpen.effects"
                    :node-draft="nodeDraft"
                    :on-preview-visual-effect="playEffect"
                  />

                  <!-- 遷移・分岐セクション -->
                  <div class="editor-section-header" @click="sectionOpen.transitions = !sectionOpen.transitions">
                    <span class="editor-section-title">
                      <span class="editor-section-toggle">{{ sectionOpen.transitions ? '▼' : '▶' }}</span>
                      遷移・分岐
                    </span>
                  </div>
                  <div v-if="!sectionOpen.transitions" class="text-xs text-gray-500 truncate mb-1">
                    {{ transitionsSummaryText }}
                  </div>
                  <div v-if="sectionOpen.transitions">
                    <NodeTransitionFields
                      :node-draft="nodeDraft"
                      :next-node-label="nextNodeLabel"
                      :copy-opts="copyOpts"
                      @open-node-picker="openNextNodePicker"
                      @clear-next-node="clearNextNode"
                    />

                    <NodeChoicesFields
                      :node-draft="nodeDraft"
                      :show-choice-next-priority-notice="showChoiceNextPriorityNotice"
                      :get-choice-target-label="getChoiceTargetLabel"
                      :has-configured-choice-target="hasConfiguredChoiceTarget"
                      :is-unary-choice-operator="isUnaryChoiceOperator"
                      @add-choice="addChoice"
                      @remove-choice="removeChoice"
                      @add-choice-effect="addChoiceEffect"
                      @remove-choice-effect="removeChoiceEffect"
                      @enable-choice-condition="enableChoiceCondition"
                      @clear-choice-target="clearChoiceTarget"
                      @open-choice-node-picker="openChoiceNodePicker"
                    />
                  </div>
                </div>

                <NodeSaveActions
                  :saving="saving"
                  @save="saveNode"
                  @save-and-create-next="saveAndCreateNext"
                />

                <NodeDangerZone
                  :section-open="sectionOpen"
                  @toggle-dangerous="sectionOpen.dangerous = !sectionOpen.dangerous"
                  @delete-current-node="deleteCurrentNode"
                />

              </div>
            </div>
            <div v-else class="text-center py-12 text-gray-500">
              ノードを選択してください
            </div>
          </div>
          <!-- Pickers -->
          <AssetPicker v-model:open="openBgPicker" type="image" @select="(a)=> nodeDraft.bgAssetId = a.id" />
          <AssetPicker v-model:open="openMusicPicker" type="audio" @select="(a)=> nodeDraft.musicAssetId = a.id" />
          <AssetPicker v-model:open="openSfxPicker" type="audio" @select="(a)=> nodeDraft.sfxAssetId = a.id" />
          <CharacterPicker v-model:open="openCharPicker" @select="onCharPicked" />
          <CharacterImagePicker v-model:open="openCharImagePicker" :character-id="nodeDraft.speakerCharacterId || ''" @select="onImagePicked" />
          <NodePicker
            v-if="openNodePicker"
            :scenes="nodePickerScenes"
            :current-scene-id="scene?.id"
            :current-id="editingChoiceIndex !== null ? nodeDraft.choices?.[editingChoiceIndex]?.[editingChoiceTargetField] : nodeDraft.nextNodeId"
            @close="closeNodePicker"
            @select="onNodeSelected"
          />
        </section>
      <!-- ...existing code... -->
      </div>

      <!-- 全体設定モーダル（テンプレート内に配置） -->
      <MessageThemeModal
        v-if="openThemeModal"
        :game-id="game?.id"
        :initial-title="game?.title"
        :initial-summary="game?.summary"
        :initial-cover-asset-id="game?.coverAssetId"
        :initial="game?.messageTheme"
        :initial-ui="game?.gameUiTheme"
        :initial-backlog="game?.backlogTheme"
        :initial-staff-roll-enabled="game?.staffRollEnabled"
        :initial-staff-roll-auto-open-enabled="game?.staffRollAutoOpenEnabled"
        :initial-staff-roll-speed-preset="game?.staffRollSpeedPreset"
        :initial-staff-roll-section-order="game?.staffRollSectionOrder"
        :initial-staff-roll-end-behavior="game?.staffRollEndBehavior"
        :is-public="game?.isPublic === true"
        @close="openThemeModal=false"
        @saved="handleThemeSaved"
      />
    </div>
  </div>
</template>

<style scoped>
.editor-grid{
  display: grid;
  grid-template-columns:
    var(--w-scenes,280px)
    var(--sz-resizer,8px)
    var(--w-nodes,1fr)
    var(--sz-resizer,8px)
    var(--w-props,640px);
  gap: 1rem;
  align-items: stretch;
  grid-template-rows: 1fr;          /* ← 行を1本に固定 */
  box-sizing: border-box;
}
.pane{ min-height: calc(100vh - 140px); grid-row: 1; }   /* ← どの pane も1行目に固定 */
.resizer{ grid-row: 1; }                                  /* ← リサイズバーも同じ行に固定 */
.pane-scenes { grid-column: 1; }
.pane-nodes  { grid-column: 3; }
.pane-props  { grid-column: 5; }
.props-normal{ position: sticky; top: 64px; }
.props-fullscreen{
  position: fixed; inset: 0; z-index: 50; background: #fff; /* 余白を廃止して全面使用 */
  padding: 16px; overflow: auto;
}
.resizer{
  width: var(--sz-resizer,8px); cursor: col-resize; background: transparent; user-select: none;
  align-self: stretch; /* 縦に伸ばす */
}
.resizer-left  { grid-column: 2; }
.resizer-right { grid-column: 4; }
.resizer:hover{ background: #e5e7eb; }
.resizer:active{ background: #cbd5e1; }

/* === 全画面レイアウト（左右2カラム） === */
.fs-grid{
  display: grid;
  grid-template-columns: minmax(640px, 1fr) minmax(360px, 440px);
  gap: 24px;
  align-items: start;
  height: calc(100vh - 80px); /* ヘッダー分を差し引いた高さ */
  overflow: hidden; /* グリッド全体のスクロールを防ぐ */
}
@media (max-width: 1200px){
  .fs-grid{ grid-template-columns: 1fr; }
}
/* 左カラムのステージは高さ基準でクランプして 16:9 維持 / 固定表示 */
.stage-outer{
  width: 100%;
  max-height: 72vh;
  display: flex; 
  justify-content: center; 
  align-items: flex-start;
  position: sticky; /* プレビューを固定 */
  top: 0;
}
.stage-inner{
  /* 画面が広ければ大きく、狭ければ縮む / 高さ72vh以内に収める */
  width: min(100%, calc(72vh * (16 / 9)));
  aspect-ratio: 16 / 9;
  height: auto;
}
/* 右カラムのフォームをスクロール可能に */
.fs-form{ 
  width: 100%; 
  overflow-y: auto;
  height: calc(100vh - 80px);
  padding-right: 8px;
}
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
