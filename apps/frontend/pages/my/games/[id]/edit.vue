<script setup lang="ts">
import MessageWindow from '@/components/game/MessageWindow.vue'
import StageCanvas from '@/components/game/StageCanvas.vue'
import NodePicker from '@/components/game/NodePicker.vue'
import AssetPicker from '@/components/pickers/AssetPicker.vue'
import CharacterPicker from '@/components/pickers/CharacterPicker.vue'
import CharacterImagePicker from '@/components/pickers/CharacterImagePicker.vue'
import MiniStage from '@/components/game/MiniStage.vue'
import MessageThemeModal from '@/components/game/MessageThemeModal.vue'
import { getSignedGetUrl } from '@/composables/useSignedUrl'
import { useAssetMeta } from '@/composables/useAssetMeta'
import { useVisualEffects } from '@/composables/useVisualEffects'
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

// ビジュアルエフェクト
const { effectState, playEffect, stopEffect } = useVisualEffects()

// コピー対象トグル（localStorage永続化）
const copyOpts = reactive({
  bg: true,
  chars: true,
  bgm: true,
  camera: true
})

const sectionOpen = reactive({
  basic: true,
  materials: true,
  effects: false,
  transitions: true,
  dangerous: false
})

const cameraFxEnabled = computed({
  get() {
    const fx = (nodeDraft as any).cameraFx as any | undefined
    if (!fx) return false
    const duration = typeof fx.durationMs === 'number' ? fx.durationMs : 0
    // duration>0 かつ mode が cut 以外なら「有効」とみなす
    return duration > 0 && fx.mode !== 'cut'
  },
  set(enabled: boolean) {
    if (!enabled) {
      ;(nodeDraft as any).cameraFx = null
      return
    }
    const fx = ((nodeDraft as any).cameraFx ||= {}) as any
    if (typeof fx.durationMs !== 'number' || fx.durationMs <= 0) {
      fx.durationMs = 800
    }
    if (!fx.mode) {
      fx.mode = 'together'
    }
  },
})

// ビジュアルエフェクトのプレビュー
function previewVisualEffect() {
  if (nodeDraft.visualFx) {
    playEffect(nodeDraft.visualFx)
  }
}

// テストプレイを新しいタブで開く
function openTestPlay() {
  if (!scene.value || !game.value) return

  const projectStartSceneId = normalizeNodeId(game.value.startSceneId)
  const startScene = nodePickerScenes.value.find((sceneItem: any) => sceneItem.id === projectStartSceneId) ?? scene.value
  // 開始ノードを決定（優先順: scene.startNodeId → 先頭ノード）
  const startId = startScene?.startNodeId || startScene?.nodes?.[0]?.id || (startScene?.id === scene.value.id ? nodes.value?.[0]?.id : null)

  // URLを構築
  const url = `/games/${game.value.id}/play?sceneId=${startScene.id}` +
    (startId ? `&nodeId=${startId}` : '')

  window.open(url, '_blank')
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
  return nodeDraft.speakerDisplayName || node.value?.speakerDisplayName || '未選択'
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

// 選択肢の遷移先ノードラベルを取得
function getChoiceTargetLabel(targetNodeId: string | null | undefined): string {
  return findNodeLabel(targetNodeId)
}

function normalizeChoiceTargetId(targetNodeId: unknown): string | null {
  if (typeof targetNodeId !== 'string') return null
  const trimmed = targetNodeId.trim()
  return trimmed ? trimmed : null
}

function hasConfiguredChoiceTarget(choice: any): boolean {
  return !!normalizeChoiceTargetId(choice?.targetNodeId)
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

type ScenarioCheckSeverity = 'error' | 'warning' | 'info'
type ScenarioCheckFilter = 'all' | ScenarioCheckSeverity

type ScenarioCheckIssue = {
  id: string
  severity: ScenarioCheckSeverity
  message: string
  sceneId: string | null
  sceneName: string
  sceneOrder: number | null
  nodeId: string | null
  nodeOrder: number | null
  nodePreview: string
}

const scenarioCheckOpen = ref(true)
const scenarioCheckFilter = ref<ScenarioCheckFilter>('all')
const scenarioCheckInfoOpen = ref(false)
const scenarioSeverityOrder: ScenarioCheckSeverity[] = ['error', 'warning', 'info']

function normalizeNodeId(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function buildNodePreview(text: unknown): string {
  const raw = typeof text === 'string' ? text : ''
  const normalized = raw.replace(/\s+/g, ' ').trim()
  if (!normalized) return '(本文なし)'
  return normalized.slice(0, 28) + (normalized.length > 28 ? '…' : '')
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
  const sceneList = scenarioCheckScenes.value
  const sceneById = new Map<string, { scene: any; sceneOrder: number }>()
  const nodeById = new Map<string, { scene: any; sceneOrder: number; node: any; nodeOrder: number }>()
  const issues: ScenarioCheckIssue[] = []
  let issueSeq = 0

  function pushIssue(payload: {
    severity: ScenarioCheckSeverity
    message: string
    sceneId?: string | null
    nodeId?: string | null
  }) {
    const sceneId = payload.sceneId ?? null
    const nodeId = payload.nodeId ?? null
    const sceneMeta = sceneId ? sceneById.get(sceneId) : null
    const nodeMeta = nodeId ? nodeById.get(nodeId) : null
    const baseScene = nodeMeta?.scene ?? sceneMeta?.scene ?? null
    const baseSceneOrder = nodeMeta?.sceneOrder ?? sceneMeta?.sceneOrder ?? null
    const baseNodeOrder = nodeMeta?.nodeOrder ?? null

    issues.push({
      id: `scenario-check-${++issueSeq}`,
      severity: payload.severity,
      message: payload.message,
      sceneId: baseScene?.id ?? sceneId,
      sceneName: baseScene?.name || '',
      sceneOrder: baseSceneOrder,
      nodeId,
      nodeOrder: baseNodeOrder,
      nodePreview: nodeMeta ? buildNodePreview(nodeMeta.node?.text) : '',
    })
  }

  for (let si = 0; si < sceneList.length; si++) {
    const sceneItem = sceneList[si]
    sceneById.set(sceneItem.id, { scene: sceneItem, sceneOrder: si + 1 })
    const sceneNodes = Array.isArray(sceneItem?.nodes) ? sceneItem.nodes : []
    for (let ni = 0; ni < sceneNodes.length; ni++) {
      const nodeItem = sceneNodes[ni]
      nodeById.set(nodeItem.id, {
        scene: sceneItem,
        sceneOrder: si + 1,
        node: nodeItem,
        nodeOrder: ni + 1,
      })
    }
  }

  for (const sceneItem of sceneList) {
    if ((sceneItem?.nodes?.length ?? 0) === 0) {
      pushIssue({
        severity: 'warning',
        sceneId: sceneItem.id,
        message: 'このシーンにはノードがありません。作成直後でなければ内容を追加してください。',
      })
    }
  }

  const startSceneId = normalizeNodeId(game.value?.startSceneId)
  let validStartNodeId: string | null = null

  if (!startSceneId) {
    pushIssue({
      severity: 'error',
      message: '開始シーンが未設定です。ゲーム全体の開始シーンを設定してください。',
    })
  } else {
    const startSceneMeta = sceneById.get(startSceneId)
    if (!startSceneMeta) {
      pushIssue({
        severity: 'error',
        message: '開始シーンが存在しないシーンIDを参照しています。開始シーンを再設定してください。',
      })
    } else {
      const startScene = startSceneMeta.scene
      const startSceneNodes = Array.isArray(startScene?.nodes) ? startScene.nodes : []
      if (startSceneNodes.length === 0) {
        pushIssue({
          severity: 'error',
          sceneId: startScene.id,
          message: '開始シーンにノードがありません。開始シーンとしてプレイできません。',
        })
      }

      const startNodeId = normalizeNodeId(startScene?.startNodeId)
      if (!startNodeId) {
        pushIssue({
          severity: 'error',
          sceneId: startScene.id,
          message: '開始シーンの開始ノードが未設定です。開始ノードを指定してください。',
        })
      } else {
        const startNodeMeta = nodeById.get(startNodeId)
        if (!startNodeMeta || startNodeMeta.scene.id !== startScene.id) {
          pushIssue({
            severity: 'error',
            sceneId: startScene.id,
            message: '開始シーンの開始ノードが存在しないノードIDを参照しています。開始ノードを再設定してください。',
          })
        } else {
          validStartNodeId = startNodeId
        }
      }
    }
  }

  for (const [, nodeMeta] of nodeById) {
    const nodeItem = nodeMeta.node
    const choices = Array.isArray(nodeItem?.choices) ? nodeItem.choices : []
    const displayableChoices = choices.filter((choice: any) => !!normalizeNodeId(choice?.targetNodeId))

    const nextNodeId = normalizeNodeId(nodeItem?.nextNodeId)
    if (nextNodeId && !nodeById.has(nextNodeId)) {
      pushIssue({
        severity: 'error',
        sceneId: nodeMeta.scene.id,
        nodeId: nodeItem.id,
        message: '通常遷移先(nextNodeId)が存在しないノードIDを参照しています。',
      })
    }

    if (displayableChoices.length > 0 && nextNodeId) {
      pushIssue({
        severity: 'info',
        sceneId: nodeMeta.scene.id,
        nodeId: nodeItem.id,
        message: 'このノードには選択肢と通常遷移先の両方があります。プレイ時は選択肢が優先され、表示可能な選択肢がない場合のみ通常遷移先が使われます。',
      })
    }

    choices.forEach((choice: any, choiceIndex: number) => {
      const choiceName = (typeof choice?.label === 'string' && choice.label.trim())
        ? choice.label.trim()
        : `#${choiceIndex + 1}`

      const targetNodeId = normalizeNodeId(choice?.targetNodeId)
      if (!targetNodeId) {
        pushIssue({
          severity: 'warning',
          sceneId: nodeMeta.scene.id,
          nodeId: nodeItem.id,
          message: `選択肢「${choiceName}」の通常遷移先が未設定です。プレイ時には表示されません。`,
        })
      } else if (!nodeById.has(targetNodeId)) {
        pushIssue({
          severity: 'error',
          sceneId: nodeMeta.scene.id,
          nodeId: nodeItem.id,
          message: `選択肢「${choiceName}」の通常遷移先が存在しないノードIDを参照しています。`,
        })
      }

      const alternateTargetNodeId = normalizeNodeId(choice?.alternateTargetNodeId)
      if (alternateTargetNodeId && !nodeById.has(alternateTargetNodeId)) {
        pushIssue({
          severity: 'error',
          sceneId: nodeMeta.scene.id,
          nodeId: nodeItem.id,
          message: `選択肢「${choiceName}」の条件分岐先が存在しないノードIDを参照しています。`,
        })
      }
    })
  }

  const reachableNodeIds = new Set<string>()
  if (validStartNodeId && nodeById.has(validStartNodeId)) {
    const stack = [validStartNodeId]
    while (stack.length > 0) {
      const nodeId = stack.pop() as string
      if (reachableNodeIds.has(nodeId)) continue
      reachableNodeIds.add(nodeId)

      const nodeMeta = nodeById.get(nodeId)
      if (!nodeMeta) continue

      const currentNode = nodeMeta.node
      const choices = Array.isArray(currentNode?.choices) ? currentNode.choices : []
      const displayableChoices = choices.filter((choice: any) => !!normalizeNodeId(choice?.targetNodeId))

      if (displayableChoices.length > 0) {
        for (const choice of displayableChoices) {
          const targetNodeId = normalizeNodeId(choice?.targetNodeId)
          if (targetNodeId && nodeById.has(targetNodeId)) {
            stack.push(targetNodeId)
          }

          const alternateTargetNodeId = normalizeNodeId(choice?.alternateTargetNodeId)
          if (alternateTargetNodeId && nodeById.has(alternateTargetNodeId)) {
            stack.push(alternateTargetNodeId)
          }
        }
      } else {
        const nextNodeId = normalizeNodeId(currentNode?.nextNodeId)
        if (nextNodeId && nodeById.has(nextNodeId)) {
          stack.push(nextNodeId)
        }
      }
    }
  }

  if (reachableNodeIds.size > 0) {
    for (const [nodeId, nodeMeta] of nodeById) {
      if (!reachableNodeIds.has(nodeId)) {
        pushIssue({
          severity: 'warning',
          sceneId: nodeMeta.scene.id,
          nodeId,
          message: 'このノードは開始ノードから到達できません。意図した未使用でなければ遷移を見直してください。',
        })
      }
    }

    for (const nodeId of reachableNodeIds) {
      const nodeMeta = nodeById.get(nodeId)
      if (!nodeMeta) continue
      const nodeItem = nodeMeta.node
      const choices = Array.isArray(nodeItem?.choices) ? nodeItem.choices : []
      const displayableChoices = choices.filter((choice: any) => !!normalizeNodeId(choice?.targetNodeId))
      const nextNodeId = normalizeNodeId(nodeItem?.nextNodeId)

      if (displayableChoices.length === 0 && !nextNodeId) {
        pushIssue({
          severity: 'info',
          sceneId: nodeMeta.scene.id,
          nodeId,
          message: 'このノードは終端です。エンディング用途なら問題ありません。',
        })
      }
    }
  }

  const counts = {
    error: issues.filter((issue) => issue.severity === 'error').length,
    warning: issues.filter((issue) => issue.severity === 'warning').length,
    info: issues.filter((issue) => issue.severity === 'info').length,
  }

  return {
    issues,
    counts,
  }
})

const scenarioCheckIssues = computed(() => {
  const issues = scenarioCheckResult.value.issues
  return scenarioSeverityOrder.flatMap((severity) => issues.filter((issue) => issue.severity === severity))
})
const scenarioCheckCounts = computed(() => scenarioCheckResult.value.counts)
const scenarioCheckTotalCount = computed(() => scenarioCheckIssues.value.length)

const scenarioCheckFilterItems = computed(() => {
  return [
    { key: 'all' as const, label: 'すべて', count: scenarioCheckTotalCount.value },
    { key: 'error' as const, label: 'エラー', count: scenarioCheckCounts.value.error },
    { key: 'warning' as const, label: '警告', count: scenarioCheckCounts.value.warning },
    { key: 'info' as const, label: '情報', count: scenarioCheckCounts.value.info },
  ]
})

const scenarioCheckFilteredIssues = computed(() => {
  if (scenarioCheckFilter.value === 'all') return scenarioCheckIssues.value
  return scenarioCheckIssues.value.filter((issue) => issue.severity === scenarioCheckFilter.value)
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
  
  // Ctrl/⌘+K で次ノードID欄からNodePicker起動
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    const el = nextNodeInputRef.value
    if (el && document.activeElement === el) {
      e.preventDefault()
      openNodePicker.value = true
    }
  }
}

const nextNodeInputRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  try {
    game.value = await api.getEdit(route.params.id as string)
    scenes.value = (await api.listScenes(game.value.id)) as any[]
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
  
  // グローバルキーボードイベントリスナー
  window.addEventListener('keydown', onGlobalKeydown)
})

// コピー対象トグルの変更を監視して保存
watch(copyOpts, (newVal) => {
  localStorage.setItem('talking_copy_opts_v1', JSON.stringify(newVal))
}, { deep: true })

async function selectScene(s: any) {
  scene.value = s
  try {
    nodes.value = (await api.listNodes(s.id)) as any[]
  } catch (error) {
    console.error('Failed to load nodes:', error)
  }
  node.value = null
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

  if (!confirm(buildSceneDeleteConfirmMessage(summary))) return

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
      return
    }

    const fallbackIndex = Math.min(currentIndex, scenes.value.length - 1)
    const nextScene = scenes.value[fallbackIndex]
    await selectScene(nextScene)
  } catch (error: any) {
    console.error('Failed to delete scene:', error)
    const message = error?.data?.message || error?.message || 'シーンの削除に失敗しました'
    alert(message)
  }
}

async function setSceneStartNode(id: string) {
  if (!scene.value) return
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

function selectNode(n: any) {
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
  // 既存データを開いたときに p.thumb を補完
  // watch が自動的に実行されるので明示的に呼ぶ必要はないが、
  // 互換性のため残しておく
  // hydratePortraitThumbs() は watch で自動実行される
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
  } catch (error) {
    console.error('Failed to add node:', error)
    alert('ノードの追加に失敗しました')
  }
}

async function saveNode() {
  if (!scene.value || !node.value) return
  saving.value = true
  try {
    // 署名URLはDBに保存しない(TTL切れ防止)
    const payload = JSON.parse(JSON.stringify(nodeDraft))
    if (Array.isArray(payload.portraits)) {
      payload.portraits = payload.portraits.map((p: any) => {
        const { thumb, ...rest } = p
        return rest
      })
    }
    if (Array.isArray(payload.choices)) {
      payload.choices = sanitizeChoicesForSave(payload.choices)
    }
    // visualFx が空オブジェクトまたは type が未設定なら null にする
    if (payload.visualFx && (!payload.visualFx.type || Object.keys(payload.visualFx).length === 0)) {
      payload.visualFx = null
    }
    // colorFilter が 'none' なら null にする
    if (payload.colorFilter && payload.colorFilter.type === 'none') {
      payload.colorFilter = null
    }
    await api.upsertNode(scene.value.id, payload)
    nodes.value = (await api.listNodes(scene.value.id)) as any[]
    // scenes.valueも更新して次ノードラベル表示を最新に
    scenes.value = (await api.listScenes(game.value.id)) as any[]
    // Update the current node
    const updated = nodes.value.find((n) => n.id === node.value.id)
    if (updated) {
      selectNode(updated)
    }
  } catch (error) {
    console.error('Failed to save node:', error)
    alert('ノードの保存に失敗しました')
  } finally {
    saving.value = false
  }
}

// 保存して次のノードへ（連結して新規ノードを作成）
async function saveAndCreateNext() {
  if (!scene.value || !node.value) return
  saving.value = true
  try {
    // 1) 現在ノードを保存
    const payload = JSON.parse(JSON.stringify(nodeDraft))
    if (Array.isArray(payload.portraits)) {
      payload.portraits = payload.portraits.map((p: any) => {
        const { thumb, ...rest } = p
        return rest
      })
    }
    if (Array.isArray(payload.choices)) {
      payload.choices = sanitizeChoicesForSave(payload.choices)
    }
    // visualFx が空オブジェクトまたは type が未設定なら null にする
    if (payload.visualFx && (!payload.visualFx.type || Object.keys(payload.visualFx).length === 0)) {
      payload.visualFx = null
    }
    // colorFilter が 'none' なら null にする
    if (payload.colorFilter && payload.colorFilter.type === 'none') {
      payload.colorFilter = null
    }
    await api.upsertNode(scene.value.id, payload)
    
    // 2) コピー元の抽出（thumb除去）
    const src = JSON.parse(JSON.stringify(nodeDraft))
    const inherit: any = {}
    
    if (copyOpts.bg) inherit.bgAssetId = src.bgAssetId || null
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
    
    // トースト通知
    const toast = useToast()
    toast.success('次のノードを作成して連結しました')
  } catch (e) {
    console.error(e)
    const toast = useToast()
    toast.error('次ノードの作成に失敗しました')
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

  if (!confirm(buildNodeDeleteConfirmMessage(summary))) return

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
      return
    }

    const fallbackIndex = Math.min(currentIndex, nodes.value.length - 1)
    const nextNode = nodes.value[fallbackIndex]
    if (nextNode) {
      selectNode(nextNode)
      return
    }

    node.value = null
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

// ---------- 3ペイン可変 & 全画面 ----------
const fullscreenProps = ref(false)
const wrap = ref<HTMLElement | null>(null)
const widths = useState('gameEditorPaneWidths', () => ({ scenes: 280, nodes: 520, props: 640 })) // px (デフォルト幅を640に拡大)
const min = { scenes: 200, nodes: 360, props: 360 }
const gridStyle = computed(() => ({
  '--w-scenes': widths.value.scenes + 'px',
  '--w-nodes': widths.value.nodes + 'px',
  '--w-props': widths.value.props + 'px',
  '--sz-resizer': '8px',
}) as any)

// 幅プリセット (プレビューペインの幅を変更)
function setPreviewWidth(w: number) {
  widths.value.props = w
  localStorage.setItem('gameEditorPaneWidths', JSON.stringify(widths.value))
}

onMounted(() => {
  // 以前の幅を復元
  const saved = localStorage.getItem('gameEditorPaneWidths')
  if (saved) {
    try { Object.assign(widths.value, JSON.parse(saved)) } catch {}
  }
  // Fキーで切替
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('keydown', onGlobalKeydown)
})
function onKey(e: KeyboardEvent) {
  if (e.key.toLowerCase() === 'f') { e.preventDefault(); fullscreenProps.value = !fullscreenProps.value }
  if (e.key === 'Escape') { fullscreenProps.value = false }
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
  // wrap 幅にリサイズバー(×2)とギャップ(×4)を考慮
  const RES = 8, GAP = 16
  const maxSum = Math.max(0, wrapWidth - 2*RES - 4*GAP)
  const sum = w.scenes + w.nodes + w.props
  if (sum > maxSum) {
    const over = sum - maxSum
    if (resizing === 'left') w.nodes = Math.max(min.nodes, w.nodes - over)
    else w.props = Math.max(min.props, w.props - over)
  }
  widths.value = w
}
function onUp() {
  resizing = null
  localStorage.setItem('gameEditorPaneWidths', JSON.stringify(widths.value))
  window.removeEventListener('pointermove', onMove)
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
        <button
          v-if="game?.id"
          @click="openTestPlay"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          テストプレイ
        </button>
      </div>

      <div
        ref="wrap"
        class="editor-grid"
        :style="gridStyle"
        tabindex="0"
        @keydown.esc.prevent.stop="fullscreenProps=false"
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
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold text-lg">プロパティ</h2>
            <div class="flex items-center gap-2">
              <!-- 幅プリセットボタン (通常表示のみ) -->
              <div v-if="!fullscreenProps" class="flex items-center gap-1 border rounded px-1">
                <button class="px-1.5 py-0.5 text-xs rounded hover:bg-gray-100" @click="setPreviewWidth(560)" title="やや広">S</button>
                <button class="px-1.5 py-0.5 text-xs rounded hover:bg-gray-100" @click="setPreviewWidth(720)" title="ワイド">M</button>
                <button class="px-1.5 py-0.5 text-xs rounded hover:bg-gray-100" @click="setPreviewWidth(900)" title="最大">L</button>
              </div>
              <button class="px-2 py-1 border rounded text-sm" @click="fullscreenProps=!fullscreenProps">
                {{ fullscreenProps ? '通常表示' : '全画面' }}
              </button>
              <button class="ml-2 px-2 py-1 text-xs border rounded hover:bg-gray-50" @click="openThemeModal=true">全体設定</button>
              <span class="text-xs text-gray-500 hidden md:inline">Fで切替 / Escで閉じる</span>
            </div>
          </div>

          <div class="mb-4 rounded-lg border border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between gap-2 border-b border-gray-200 px-3 py-2">
              <div class="font-semibold text-sm">シナリオチェック</div>
              <button
                type="button"
                class="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100"
                @click="scenarioCheckOpen = !scenarioCheckOpen"
              >
                {{ scenarioCheckOpen ? '折りたたむ' : '展開' }}
              </button>
            </div>
            <div class="px-3 py-2">
              <div class="flex flex-wrap gap-2 text-xs">
                <span class="rounded border border-red-200 bg-red-50 px-2 py-1 font-semibold text-red-700">エラー {{ scenarioCheckCounts.error }}件</span>
                <span class="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700">警告 {{ scenarioCheckCounts.warning }}件</span>
                <span class="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">情報 {{ scenarioCheckCounts.info }}件</span>
              </div>
            </div>
            <div v-if="scenarioCheckOpen" class="border-t border-gray-200 px-3 py-2">
              <div class="mb-2 flex flex-wrap gap-2">
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
                    class="rounded border px-2 py-2 text-xs"
                    :class="scenarioSeverityClass(issue.severity)"
                  >
                    <div class="mb-1 flex items-center justify-between gap-2">
                      <span class="font-semibold">{{ scenarioSeverityLabel(issue.severity) }}</span>
                      <button
                        v-if="issue.sceneId"
                        type="button"
                        class="rounded border border-gray-300 bg-white px-2 py-0.5 text-[11px] text-gray-700 hover:bg-gray-100"
                        @click="focusScenarioIssue(issue)"
                      >
                        対象へ移動
                      </button>
                    </div>
                    <p class="leading-relaxed">{{ issue.message }}</p>
                    <p class="mt-1 text-[11px] text-gray-600">{{ scenarioIssueLocation(issue) }}</p>
                    <p v-if="issue.nodePreview" class="mt-1 text-[11px] text-gray-500">{{ issue.nodePreview }}</p>
                  </article>
                </div>
              </div>
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
                />
              </div>
            </div>
            <div class="fs-form">
              <div class="space-y-4">
                <!-- 基本情報セクション -->
                <div class="editor-section-header" @click="sectionOpen.basic = !sectionOpen.basic">
                  <span class="editor-section-title">
                    <span class="editor-section-toggle">{{ sectionOpen.basic ? '▼' : '▶' }}</span>
                    基本情報
                  </span>
                </div>

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

              <div class="space-y-3">
                <div v-if="sectionOpen.basic">
                  <label class="block text-sm font-medium mb-1">話者キャラ</label>
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-700 truncate flex-1">{{ selectedCharLabel || '未選択' }}</span>
                    <button type="button" class="px-2 py-1 border rounded text-sm" @click="openSpeakerCharPicker()">変更</button>
                    <button v-if="nodeDraft.speakerCharacterId" type="button" class="px-2 py-1 border rounded text-sm" @click="clearChar">クリア</button>
                  </div>
                </div>
                <div v-if="sectionOpen.basic">
                  <label class="block text-sm font-medium mb-1">話者表記（任意）</label>
                  <input
                    v-model="nodeDraft.speakerDisplayName"
                    class="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: ??? / 田中 / あだ名"
                  />
                </div>

                <!-- 表示・素材セクション -->
                <div class="editor-section-header" @click="sectionOpen.materials = !sectionOpen.materials">
                  <span class="editor-section-title">
                    <span class="editor-section-toggle">{{ sectionOpen.materials ? '▼' : '▶' }}</span>
                    表示・素材
                  </span>
                </div>

                <div v-if="sectionOpen.materials">
                  <label class="block text-sm font-medium mb-1">背景</label>
                  <div class="flex items-center gap-2">
                    <img v-if="bgUrl" :src="bgUrl" class="w-16 h-10 object-cover rounded border" />
                    <span v-else class="text-xs text-gray-500">未選択</span>
                    <button type="button" class="px-2 py-1 border rounded text-sm" @click="openBgPicker=true">変更</button>
                    <button v-if="nodeDraft.bgAssetId" type="button" class="px-2 py-1 border rounded text-sm" @click="nodeDraft.bgAssetId=''">クリア</button>
                  </div>
                </div>
                <div v-if="sectionOpen.materials">
                  <label class="block text-sm font-medium mb-1">BGM</label>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-700 truncate flex-1">{{ musicTitle || '未選択' }}</span>
                    <button type="button" class="px-2 py-1 border rounded text-sm" @click="openMusicPicker=true">変更</button>
                    <button v-if="nodeDraft.musicAssetId" type="button" class="px-2 py-1 border rounded text-sm" @click="nodeDraft.musicAssetId=''">クリア</button>
                  </div>
                  <audio v-if="musicUrl" :src="musicUrl" controls preload="none" class="mt-1 w-full"></audio>
                </div>
                <div v-if="sectionOpen.materials">
                  <label class="block text-sm font-medium mb-1">効果音(SE)</label>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-700 truncate flex-1">{{ nodeDraft.sfxAssetId || '未選択' }}</span>
                    <button type="button" class="px-2 py-1 border rounded text-sm" @click="openSfxPicker=true">変更</button>
                    <button v-if="nodeDraft.sfxAssetId" type="button" class="px-2 py-1 border rounded text-sm" @click="nodeDraft.sfxAssetId=''">クリア</button>
                  </div>
                  <audio v-if="sfxUrl" :src="sfxUrl" controls preload="none" class="mt-1 w-full"></audio>
                </div>

                <!-- 演出セクション -->
                <div class="editor-section-header" @click="sectionOpen.effects = !sectionOpen.effects">
                  <span class="editor-section-title">
                    <span class="editor-section-toggle">{{ sectionOpen.effects ? '▼' : '▶' }}</span>
                    演出
                  </span>
                </div>

                <!-- カメラ -->
                <div v-if="sectionOpen.effects">
                  <div class="font-semibold mb-1">カメラ</div>
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm w-14">倍率</span>
                    <input type="range" min="100" max="300" step="5"
                           v-model.number="nodeDraft.camera.zoom" class="flex-1" />
                    <input type="number" min="100" max="300" step="5"
                           v-model.number="nodeDraft.camera.zoom"
                           class="w-20 border rounded px-2 py-1 text-right" />
                    <span class="text-sm">%</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm w-14">位置</span>
                    <span class="text-xs text-gray-500">X</span>
                    <input type="number" min="0" max="100" step="1"
                           v-model.number="nodeDraft.camera.cx"
                           class="w-20 border rounded px-2 py-1 text-right" />
                    <span class="text-xs text-gray-500">Y</span>
                    <input type="number" min="0" max="100" step="1"
                           v-model.number="nodeDraft.camera.cy"
                           class="w-20 border rounded px-2 py-1 text-right" />
                    <span class="text-xs text-gray-500">（中心%）</span>
                  </div>
                </div>

                <!-- カメラ演出 (MVP) -->
                <div v-if="sectionOpen.effects" class="mt-3 border-t pt-3">
                  <div class="flex items-center justify-between mb-2">
                    <div class="font-semibold">カメラ演出</div>
                    <label class="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        v-model="cameraFxEnabled"
                        class="rounded"
                      />
                      有効
                    </label>
                  </div>

                  <div v-if="cameraFxEnabled" class="space-y-2 text-sm">
                    <div class="flex items-center gap-2">
                      <span class="w-20">モード</span>
                      <select
                        v-model="nodeDraft.cameraFx.mode"
                        class="border rounded px-2 py-1 flex-1"
                      >
                        <option value="together">ズーム＋パン同時</option>
                        <option value="pan-then-zoom">パン → ズーム</option>
                        <option value="zoom-then-pan">ズーム → パン</option>
                        <option value="cut">カット切替</option>
                      </select>
                    </div>

                    <div class="flex items-center gap-2">
                      <span class="w-20">時間</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        v-model.number="nodeDraft.cameraFx.durationMs"
                        class="w-28 border rounded px-2 py-1 text-right"
                      />
                      <span class="text-xs text-gray-500">ms</span>
                    </div>

                    <p class="text-xs text-gray-500">
                      開始位置は「前ノードのカメラ」または cameraFx.from、終了位置は「このノードのカメラ」または cameraFx.to になります。
                    </p>
                  </div>
                </div>

                <!-- ビジュアルエフェクト -->
                <div v-if="sectionOpen.effects" class="mt-3 border-t pt-3">
                  <div class="font-semibold mb-2">ビジュアルエフェクト</div>
                  <div class="space-y-2">
                    <div>
                      <label class="block text-xs font-medium mb-1">種類</label>
                      <select
                        v-model="nodeDraft.visualFx.type"
                        class="w-full border rounded px-2 py-1 text-sm"
                      >
                        <option :value="undefined">なし</option>
                        <option value="shake">画面揺れ</option>
                        <option value="flash">フラッシュ</option>
                      </select>
                    </div>
                    <div v-if="nodeDraft.visualFx?.type">
                      <label class="block text-xs font-medium mb-1">強度</label>
                      <div class="flex gap-2">
                        <label class="flex items-center gap-1 text-sm">
                          <input
                            type="radio"
                            v-model="nodeDraft.visualFx.intensity"
                            value="small"
                            class="rounded"
                          />
                          小
                        </label>
                        <label class="flex items-center gap-1 text-sm">
                          <input
                            type="radio"
                            v-model="nodeDraft.visualFx.intensity"
                            value="medium"
                            class="rounded"
                          />
                          中
                        </label>
                        <label class="flex items-center gap-1 text-sm">
                          <input
                            type="radio"
                            v-model="nodeDraft.visualFx.intensity"
                            value="large"
                            class="rounded"
                          />
                          大
                        </label>
                      </div>
                    </div>
                    <button
                      v-if="nodeDraft.visualFx?.type"
                      class="w-full px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      @click="previewVisualEffect"
                    >
                      プレビュー
                    </button>
                  </div>
                </div>

                <!-- カラーフィルター -->
                <div v-if="sectionOpen.effects" class="mt-3 border-t pt-3">
                  <div class="font-semibold mb-2">カラーフィルター（画面全体）</div>
                  <div class="space-y-2">
                    <div>
                      <label class="block text-xs font-medium mb-1">フィルター</label>
                      <select
                        v-model="nodeDraft.colorFilter.type"
                        class="w-full border rounded px-2 py-1 text-sm"
                      >
                        <option value="none">なし</option>
                        <option value="sepia">セピア（回想）</option>
                        <option value="monochrome">モノクロ</option>
                        <option value="dark">暗転</option>
                        <option value="night">夜</option>
                        <option value="dream">夢</option>
                      </select>
                    </div>
                    <div v-if="nodeDraft.colorFilter?.type !== 'none'">
                      <label class="block text-xs font-medium mb-1">不透明度: {{ nodeDraft.colorFilter.opacity }}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        v-model.number="nodeDraft.colorFilter.opacity"
                        class="w-full"
                      />
                    </div>
                    <div v-if="nodeDraft.colorFilter?.type !== 'none'">
                      <label class="block text-xs font-medium mb-1">フェード時間</label>
                      <div class="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="100"
                          v-model.number="nodeDraft.colorFilter.durationMs"
                          class="w-24 border rounded px-2 py-1 text-right text-sm"
                        />
                        <span class="text-xs text-gray-500">ms</span>
                      </div>
                    </div>
                    <p class="text-xs text-gray-500">
                      フィルターは次ノードで解除するまで継続されます
                    </p>
                  </div>
                </div>

                <!-- 立ち絵（複数配置） -->
                <div v-if="sectionOpen.materials" class="mt-3">
                  <div class="flex items-center justify-between">
                    <label class="block text-sm font-semibold">キャラクター配置</label>
                    <button type="button" class="px-2 py-1 border rounded text-sm" @click="addPortrait">追加</button>
                  </div>
                  <div v-if="(nodeDraft.portraits||[]).length===0" class="text-xs text-gray-500 mt-1">未配置</div>
                  <div v-for="(p, i) in (nodeDraft.portraits ||= [])" :key="i" class="mt-2 p-2 border rounded">
                    <div class="flex items-center gap-2">
                      <img v-if="p.thumb" :src="p.thumb" class="w-12 h-12 object-cover rounded-full border" />
                      <span class="text-xs text-gray-700 truncate flex-1">{{ p.characterName || p.characterId }}</span>
                      <button type="button" class="px-2 py-1 border rounded text-xs" @click="changePortrait(Number(i))">画像変更</button>
                      <button type="button" class="px-2 py-1 border rounded text-xs" @click="removePortrait(Number(i))">削除</button>
                    </div>
                    <div class="grid grid-cols-4 gap-2 mt-2">
                      <label class="text-xs">X%<input type="number" v-model.number="p.x" class="w-full border rounded px-1 py-0.5" /></label>
                      <label class="text-xs">Y%<input type="number" v-model.number="p.y" class="w-full border rounded px-1 py-0.5" /></label>
                      <label class="text-xs">Scale%<input type="number" v-model.number="p.scale" class="w-full border rounded px-1 py-0.5" /></label>
                      <label class="text-xs">Z<input type="number" v-model.number="p.z" class="w-full border rounded px-1 py-0.5" /></label>
                    </div>
                  </div>
                </div>

                <!-- 遷移・分岐セクション -->
                <div class="editor-section-header" @click="sectionOpen.transitions = !sectionOpen.transitions">
                  <span class="editor-section-title">
                    <span class="editor-section-toggle">{{ sectionOpen.transitions ? '▼' : '▶' }}</span>
                    遷移・分岐
                  </span>
                </div>

                <div v-if="sectionOpen.transitions">
                  <label class="block text-sm font-medium mb-1">次ノードID</label>
                  <div class="flex items-center gap-2">
                    <div
                      ref="nextNodeInputRef"
                      tabindex="0"
                      class="flex-1 px-2 py-1 border border-gray-300 rounded bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
                      @click="openNodePicker=true"
                      @keydown.enter.prevent="openNodePicker=true"
                      title="クリックまたは Ctrl/⌘+K で選択"
                    >
                      {{ nextNodeLabel }}
                    </div>
                    <button class="px-2 py-1 text-sm bg-gray-100 border rounded hover:bg-gray-200" @click="openNodePicker=true">選択</button>
                    <button v-if="nodeDraft.nextNodeId" class="px-2 py-1 text-sm bg-gray-100 border rounded hover:bg-gray-200" @click="nodeDraft.nextNodeId=null">クリア</button>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">次ノードID欄にフォーカス中は Ctrl/⌘+K でも選択できます</p>

                  <div class="border-t pt-3 mt-3">
                    <div class="text-sm font-medium mb-2">次ノード作成時のコピー対象</div>
                    <div class="grid grid-cols-2 gap-2">
                      <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" v-model="copyOpts.bg" class="rounded" />
                        背景
                      </label>
                      <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" v-model="copyOpts.chars" class="rounded" />
                        キャラ
                      </label>
                      <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" v-model="copyOpts.bgm" class="rounded" />
                        BGM
                      </label>
                      <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" v-model="copyOpts.camera" class="rounded" />
                        カメラ
                      </label>
                    </div>
                  </div>

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
                      v-if="showChoiceNextPriorityNotice"
                      class="mb-2 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800"
                    >
                      このノードには選択肢と通常遷移先の両方が設定されています。プレイ時は選択肢が優先され、通常遷移先は表示可能な選択肢がない場合のみ使われます。
                    </p>
                    <div v-if="!nodeDraft.choices || nodeDraft.choices.length === 0" class="text-sm text-gray-500">
                      選択肢はありません
                    </div>
                    <div v-else class="space-y-2">
                      <div
                        v-for="(c, i) in nodeDraft.choices"
                        :key="i"
                        class="p-2 bg-gray-50 rounded space-y-2"
                      >
                        <div class="flex gap-2 items-center">
                          <input
                            v-model="c.label"
                            class="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                            placeholder="表示テキスト"
                          />
                          <button
                            type="button"
                            class="px-2 py-1 bg-red-400 text-white rounded text-xs hover:bg-red-500"
                            @click="removeChoice(i)"
                            :aria-label="`この選択肢を削除 (${i + 1})`"
                          >
                            この選択肢を削除
                          </button>
                        </div>

                        <div class="flex gap-2 items-center">
                          <div class="flex-1 px-2 py-1 border border-gray-300 rounded bg-white text-sm text-gray-700">
                            {{ getChoiceTargetLabel(c.targetNodeId) }}
                          </div>
                          <button class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200" @click="openChoiceNodePicker(i)">通常遷移先</button>
                          <button v-if="hasConfiguredChoiceTarget(c)" class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200" @click="clearChoiceTarget(c)">クリア</button>
                          <span v-if="!hasConfiguredChoiceTarget(c)" class="px-2 py-1 text-[11px] bg-amber-100 text-amber-800 border border-amber-300 rounded">遷移先未設定</span>
                        </div>

                        <div class="border-t pt-2">
                          <div class="flex items-center justify-between mb-2">
                            <div class="text-xs font-semibold text-gray-700">状態操作</div>
                            <button class="px-2 py-1 text-xs bg-emerald-100 border rounded hover:bg-emerald-200" @click="addChoiceEffect(c)">追加</button>
                          </div>
                          <div v-if="!c.effects || c.effects.length === 0" class="text-xs text-gray-500">なし</div>
                          <div v-else class="space-y-1">
                            <div v-for="(effect, ei) in c.effects" :key="ei" class="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                              <input v-model="effect.key" class="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="変数名" />
                              <select v-model="effect.op" class="border border-gray-300 rounded px-2 py-1 text-sm">
                                <option value="set">代入</option>
                                <option value="add">加算</option>
                                <option value="sub">減算</option>
                              </select>
                              <input v-model="effect.value" class="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="値" />
                              <button class="px-2 py-1 bg-red-400 text-white rounded text-xs hover:bg-red-500" @click="removeChoiceEffect(c, ei)">削除</button>
                            </div>
                          </div>
                        </div>

                        <div class="border-t pt-2">
                          <div class="flex items-center justify-between mb-2">
                            <div class="text-xs font-semibold text-gray-700">特別選択肢条件</div>
                            <div class="flex gap-1">
                              <button class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200" @click="enableChoiceCondition(c, 'condition')">設定</button>
                              <button v-if="c.condition" class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200" @click="c.condition = null">クリア</button>
                            </div>
                          </div>
                          <p v-if="!c.condition" class="text-xs text-gray-500">未設定なら常に表示</p>
                          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <input v-model="c.condition.key" class="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="変数名" />
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
                            <input v-if="!isUnaryChoiceOperator(c.condition.operator)" v-model="c.condition.value" class="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="基準値" />
                            <div v-else class="text-xs text-gray-500 flex items-center px-2">値不要</div>
                          </div>
                        </div>

                        <div class="border-t pt-2">
                          <div class="flex items-center justify-between mb-2">
                            <div class="text-xs font-semibold text-gray-700">条件分岐先</div>
                            <div class="flex gap-1">
                              <button class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200" @click="enableChoiceCondition(c, 'alternateCondition')">設定</button>
                              <button v-if="c.alternateCondition || c.alternateTargetNodeId" class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200" @click="c.alternateCondition = null; clearChoiceTarget(c, 'alternateTargetNodeId')">クリア</button>
                            </div>
                          </div>
                          <p v-if="!c.alternateCondition" class="text-xs text-gray-500">未設定なら通常遷移のみ</p>
                          <div v-else class="space-y-2">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <input v-model="c.alternateCondition.key" class="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="変数名" />
                              <select v-model="c.alternateCondition.operator" class="border border-gray-300 rounded px-2 py-1 text-sm">
                                <option value="eq">一致</option>
                                <option value="ne">不一致</option>
                                <option value="gt">より大きい</option>
                                <option value="gte">以上</option>
                                <option value="lt">より小さい</option>
                                <option value="lte">以下</option>
                                <option value="truthy">ON</option>
                                <option value="falsy">OFF</option>
                              </select>
                              <input v-if="!isUnaryChoiceOperator(c.alternateCondition.operator)" v-model="c.alternateCondition.value" class="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="基準値" />
                              <div v-else class="text-xs text-gray-500 flex items-center px-2">値不要</div>
                            </div>
                            <div class="flex gap-2 items-center">
                              <div class="flex-1 px-2 py-1 border border-gray-300 rounded bg-white text-sm text-gray-700">
                                {{ getChoiceTargetLabel(c.alternateTargetNodeId) }}
                              </div>
                              <button class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200" @click="openChoiceNodePicker(i, 'alternateTargetNodeId')">特殊遷移先</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex gap-2 border-t pt-3">
                <button
                  class="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                  :disabled="saving"
                  @click="saveNode"
                >
                  {{ saving ? '保存中...' : '保存' }}
                </button>
                <button
                  class="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400"
                  :disabled="saving"
                  @click="saveAndCreateNext"
                >
                  {{ saving ? '保存中...' : '保存して次のノードへ' }}
                </button>
              </div>

              <!-- 危険操作セクション -->
              <div class="editor-section-header" @click="sectionOpen.dangerous = !sectionOpen.dangerous">
                <span class="editor-section-title">
                  <span class="editor-section-toggle">{{ sectionOpen.dangerous ? '▼' : '▶' }}</span>
                  危険操作
                </span>
              </div>

              <div v-if="sectionOpen.dangerous" class="border-t pt-3">
                <div class="text-sm font-medium mb-2 text-gray-700">ノード操作</div>
                <button
                  class="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  @click="deleteCurrentNode"
                  aria-label="このノードを削除"
                >
                  このノードを削除
                </button>
              </div>

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
                />
              </div>
            </div>

            <div v-if="node">
              <div class="space-y-4">
                <!-- 基本情報セクション -->
                <div class="editor-section-header" @click="sectionOpen.basic = !sectionOpen.basic">
                  <span class="editor-section-title">
                    <span class="editor-section-toggle">{{ sectionOpen.basic ? '▼' : '▶' }}</span>
                    基本情報
                  </span>
                </div>
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

                <div class="space-y-3">
                  <div v-if="sectionOpen.basic">
                    <label class="block text-sm font-medium mb-1">話者キャラ</label>
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-gray-700 truncate flex-1">{{ selectedCharLabel || '未選択' }}</span>
                      <button type="button" class="px-2 py-1 border rounded text-sm" @click="openSpeakerCharPicker()">変更</button>
                      <button v-if="nodeDraft.speakerCharacterId" type="button" class="px-2 py-1 border rounded text-sm" @click="clearChar">クリア</button>
                    </div>
                  </div>
                  <div v-if="sectionOpen.basic">
                    <label class="block text-sm font-medium mb-1">話者表記（任意）</label>
                    <input
                      v-model="nodeDraft.speakerDisplayName"
                      class="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: ??? / 田中 / あだ名"
                    />
                  </div>

                  <!-- 表示・素材セクション -->
                  <div class="editor-section-header" @click="sectionOpen.materials = !sectionOpen.materials">
                    <span class="editor-section-title">
                      <span class="editor-section-toggle">{{ sectionOpen.materials ? '▼' : '▶' }}</span>
                      表示・素材
                    </span>
                  </div>
                  <div v-if="sectionOpen.materials">
                    <label class="block text-sm font-medium mb-1">背景</label>
                    <div class="flex items-center gap-2">
                      <img v-if="bgUrl" :src="bgUrl" class="w-16 h-10 object-cover rounded border" />
                      <span v-else class="text-xs text-gray-500">未選択</span>
                      <button type="button" class="px-2 py-1 border rounded text-sm" @click="openBgPicker=true">変更</button>
                      <button v-if="nodeDraft.bgAssetId" type="button" class="px-2 py-1 border rounded text-sm" @click="nodeDraft.bgAssetId=''">クリア</button>
                    </div>
                  </div>
                  <div v-if="sectionOpen.materials">
                    <label class="block text-sm font-medium mb-1">BGM</label>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-700 truncate flex-1">{{ musicTitle || '未選択' }}</span>
                      <button type="button" class="px-2 py-1 border rounded text-sm" @click="openMusicPicker=true">変更</button>
                      <button v-if="nodeDraft.musicAssetId" type="button" class="px-2 py-1 border rounded text-sm" @click="nodeDraft.musicAssetId=''">クリア</button>
                    </div>
                    <audio v-if="musicUrl" :src="musicUrl" controls preload="none" class="mt-1 w-full"></audio>
                  </div>
                  <div v-if="sectionOpen.materials">
                    <label class="block text-sm font-medium mb-1">効果音(SE)</label>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-700 truncate flex-1">{{ nodeDraft.sfxAssetId || '未選択' }}</span>
                      <button type="button" class="px-2 py-1 border rounded text-sm" @click="openSfxPicker=true">変更</button>
                      <button v-if="nodeDraft.sfxAssetId" type="button" class="px-2 py-1 border rounded text-sm" @click="nodeDraft.sfxAssetId=''">クリア</button>
                    </div>
                    <audio v-if="sfxUrl" :src="sfxUrl" controls preload="none" class="mt-1 w-full"></audio>
                  </div>

                  <!-- 演出セクション -->
                  <div class="editor-section-header" @click="sectionOpen.effects = !sectionOpen.effects">
                    <span class="editor-section-title">
                      <span class="editor-section-toggle">{{ sectionOpen.effects ? '▼' : '▶' }}</span>
                      演出
                    </span>
                  </div>
                  <!-- カメラ -->
                  <div v-if="sectionOpen.effects">
                    <div class="font-semibold mb-1">カメラ</div>
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-sm w-14">倍率</span>
                      <input type="range" min="100" max="300" step="5"
                             v-model.number="nodeDraft.camera.zoom" class="flex-1" />
                      <input type="number" min="100" max="300" step="5"
                             v-model.number="nodeDraft.camera.zoom"
                             class="w-20 border rounded px-2 py-1 text-right" />
                      <span class="text-sm">%</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm w-14">位置</span>
                      <span class="text-xs text-gray-500">X</span>
                      <input type="number" min="0" max="100" step="1"
                             v-model.number="nodeDraft.camera.cx"
                             class="w-20 border rounded px-2 py-1 text-right" />
                      <span class="text-xs text-gray-500">Y</span>
                      <input type="number" min="0" max="100" step="1"
                             v-model.number="nodeDraft.camera.cy"
                             class="w-20 border rounded px-2 py-1 text-right" />
                      <span class="text-xs text-gray-500">（中心%）</span>
                    </div>
                  </div>

                  <!-- カメラ演出 (MVP) -->
                  <div v-if="sectionOpen.effects" class="mt-3 border-t pt-3">
                    <div class="flex items-center justify-between mb-2">
                      <div class="font-semibold">カメラ演出</div>
                      <label class="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          v-model="cameraFxEnabled"
                          class="rounded"
                        />
                        有効
                      </label>
                    </div>

                    <div v-if="cameraFxEnabled" class="space-y-2 text-sm">
                      <div class="flex items-center gap-2">
                        <span class="w-20">モード</span>
                        <select
                          v-model="nodeDraft.cameraFx.mode"
                          class="border rounded px-2 py-1 flex-1"
                        >
                          <option value="together">ズーム＋パン同時</option>
                          <option value="pan-then-zoom">パン → ズーム</option>
                          <option value="zoom-then-pan">ズーム → パン</option>
                          <option value="cut">カット切替</option>
                        </select>
                      </div>

                      <div class="flex items-center gap-2">
                        <span class="w-20">時間</span>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          v-model.number="nodeDraft.cameraFx.durationMs"
                          class="w-28 border rounded px-2 py-1 text-right"
                        />
                        <span class="text-xs text-gray-500">ms</span>
                      </div>

                      <p class="text-xs text-gray-500">
                        開始位置は「前ノードのカメラ」または cameraFx.from、終了位置は「このノードのカメラ」または cameraFx.to になります。
                      </p>
                    </div>
                  </div>

                  <!-- ビジュアルエフェクト -->
                  <div v-if="sectionOpen.effects" class="mt-3 border-t pt-3">
                    <div class="font-semibold mb-2">ビジュアルエフェクト</div>
                    <div class="space-y-2">
                      <div>
                        <label class="block text-xs font-medium mb-1">種類</label>
                        <select
                          v-model="nodeDraft.visualFx.type"
                          class="w-full border rounded px-2 py-1 text-sm"
                        >
                          <option :value="undefined">なし</option>
                          <option value="shake">画面揺れ</option>
                          <option value="flash">フラッシュ</option>
                        </select>
                      </div>
                      <div v-if="nodeDraft.visualFx?.type">
                        <label class="block text-xs font-medium mb-1">強度</label>
                        <div class="flex gap-2">
                          <label class="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              v-model="nodeDraft.visualFx.intensity"
                              value="small"
                              class="rounded"
                            />
                            小
                          </label>
                          <label class="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              v-model="nodeDraft.visualFx.intensity"
                              value="medium"
                              class="rounded"
                            />
                            中
                          </label>
                          <label class="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              v-model="nodeDraft.visualFx.intensity"
                              value="large"
                              class="rounded"
                            />
                            大
                          </label>
                        </div>
                      </div>
                      <button
                        v-if="nodeDraft.visualFx?.type"
                        class="w-full px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        @click="previewVisualEffect"
                      >
                        プレビュー
                      </button>
                    </div>
                  </div>

                  <!-- カラーフィルター -->
                  <div v-if="sectionOpen.effects" class="mt-3 border-t pt-3">
                    <div class="font-semibold mb-2">カラーフィルター（画面全体）</div>
                    <div class="space-y-2">
                      <div>
                        <label class="block text-xs font-medium mb-1">フィルター</label>
                        <select
                          v-model="nodeDraft.colorFilter.type"
                          class="w-full border rounded px-2 py-1 text-sm"
                        >
                          <option value="none">なし</option>
                          <option value="sepia">セピア（回想）</option>
                          <option value="monochrome">モノクロ</option>
                          <option value="dark">暗転</option>
                          <option value="night">夜</option>
                          <option value="dream">夢</option>
                        </select>
                      </div>
                      <div v-if="nodeDraft.colorFilter?.type !== 'none'">
                        <label class="block text-xs font-medium mb-1">不透明度: {{ nodeDraft.colorFilter.opacity }}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          v-model.number="nodeDraft.colorFilter.opacity"
                          class="w-full"
                        />
                      </div>
                      <div v-if="nodeDraft.colorFilter?.type !== 'none'">
                        <label class="block text-xs font-medium mb-1">フェード時間</label>
                        <div class="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="100"
                            v-model.number="nodeDraft.colorFilter.durationMs"
                            class="w-24 border rounded px-2 py-1 text-right text-sm"
                          />
                          <span class="text-xs text-gray-500">ms</span>
                        </div>
                      </div>
                      <p class="text-xs text-gray-500">
                        フィルターは次ノードで解除するまで継続されます
                      </p>
                    </div>
                  </div>

                  <!-- 立ち絵（複数配置） -->
                  <div v-if="sectionOpen.materials" class="mt-3">
                    <div class="flex items-center justify-between">
                      <label class="block text-sm font-semibold">キャラクター配置</label>
                      <button type="button" class="px-2 py-1 border rounded text-sm" @click="addPortrait">追加</button>
                    </div>
                    <div v-if="(nodeDraft.portraits||[]).length===0" class="text-xs text-gray-500 mt-1">未配置</div>
                    <div v-for="(p, i) in (nodeDraft.portraits ||= [])" :key="i" class="mt-2 p-2 border rounded">
                      <div class="flex items-center gap-2">
                        <img v-if="p.thumb" :src="p.thumb" class="w-12 h-12 object-cover rounded-full border" />
                        <span class="text-xs text-gray-700 truncate flex-1">{{ p.characterName || p.characterId }}</span>
                        <button type="button" class="px-2 py-1 border rounded text-xs" @click="changePortrait(i)">画像変更</button>
                        <button type="button" class="px-2 py-1 border rounded text-xs" @click="removePortrait(i)">削除</button>
                      </div>
                      <div class="grid grid-cols-4 gap-2 mt-2">
                        <label class="text-xs">X%<input type="number" v-model.number="p.x" class="w-full border rounded px-1 py-0.5" /></label>
                        <label class="text-xs">Y%<input type="number" v-model.number="p.y" class="w-full border rounded px-1 py-0.5" /></label>
                        <label class="text-xs">Scale%<input type="number" v-model.number="p.scale" class="w-full border rounded px-1 py-0.5" /></label>
                        <label class="text-xs">Z<input type="number" v-model.number="p.z" class="w-full border rounded px-1 py-0.5" /></label>
                      </div>
                    </div>
                  </div>

                  <!-- 遷移・分岐セクション -->
                  <div class="editor-section-header" @click="sectionOpen.transitions = !sectionOpen.transitions">
                    <span class="editor-section-title">
                      <span class="editor-section-toggle">{{ sectionOpen.transitions ? '▼' : '▶' }}</span>
                      遷移・分岐
                    </span>
                  </div>
                  <div v-if="sectionOpen.transitions">
                    <label class="block text-sm font-medium mb-1">次ノードID</label>
                    <div class="flex items-center gap-2">
                      <div 
                        ref="nextNodeInputRef"
                        tabindex="0"
                        class="flex-1 px-2 py-1 border border-gray-300 rounded bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
                        @click="openNodePicker=true"
                        @keydown.enter.prevent="openNodePicker=true"
                        title="クリックまたは Ctrl/⌘+K で選択"
                      >
                        {{ nextNodeLabel }}
                      </div>
                      <button class="px-2 py-1 text-sm bg-gray-100 border rounded hover:bg-gray-200" @click="openNodePicker=true">選択</button>
                      <button v-if="nodeDraft.nextNodeId" class="px-2 py-1 text-sm bg-gray-100 border rounded hover:bg-gray-200" @click="nodeDraft.nextNodeId=null">クリア</button>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">次ノードID欄にフォーカス中は Ctrl/⌘+K でも選択できます</p>

                    <div class="border-t pt-3 mt-3">
                      <div class="text-sm font-medium mb-2">次ノード作成時のコピー対象</div>
                      <div class="grid grid-cols-2 gap-2">
                        <label class="flex items-center gap-2 text-sm">
                          <input type="checkbox" v-model="copyOpts.bg" class="rounded" />
                          背景
                        </label>
                        <label class="flex items-center gap-2 text-sm">
                          <input type="checkbox" v-model="copyOpts.chars" class="rounded" />
                          キャラ
                        </label>
                        <label class="flex items-center gap-2 text-sm">
                          <input type="checkbox" v-model="copyOpts.bgm" class="rounded" />
                          BGM
                        </label>
                        <label class="flex items-center gap-2 text-sm">
                          <input type="checkbox" v-model="copyOpts.camera" class="rounded" />
                          カメラ
                        </label>
                      </div>
                    </div>

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
                        v-if="showChoiceNextPriorityNotice"
                        class="mb-2 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800"
                      >
                        このノードには選択肢と通常遷移先の両方が設定されています。プレイ時は選択肢が優先され、通常遷移先は表示可能な選択肢がない場合のみ使われます。
                      </p>
                      <div v-if="!nodeDraft.choices || nodeDraft.choices.length === 0" class="text-sm text-gray-500">
                        選択肢はありません
                      </div>
                      <div v-else class="space-y-2">
                        <div
                          v-for="(c, i) in nodeDraft.choices"
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
                              @click="removeChoice(i)"
                              :aria-label="`この選択肢を削除 (${i + 1})`"
                            >
                              この選択肢を削除
                            </button>
                          </div>
                          <div class="flex gap-2 items-center">
                            <div class="flex-1 px-2 py-1 border border-gray-300 rounded bg-white text-sm text-gray-700">
                              {{ getChoiceTargetLabel(c.targetNodeId) }}
                            </div>
                            <button class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200" @click="openChoiceNodePicker(i)">通常遷移先</button>
                            <button v-if="hasConfiguredChoiceTarget(c)" class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200" @click="clearChoiceTarget(c)">クリア</button>
                            <span v-if="!hasConfiguredChoiceTarget(c)" class="px-2 py-1 text-[11px] bg-amber-100 text-amber-800 border border-amber-300 rounded">遷移先未設定</span>
                          </div>

                          <div class="border-t pt-2">
                            <div class="flex items-center justify-between mb-2">
                              <div class="text-xs font-semibold text-gray-700">状態操作</div>
                              <button class="px-2 py-1 text-xs bg-emerald-100 border rounded hover:bg-emerald-200" @click="addChoiceEffect(c)">追加</button>
                            </div>
                            <div v-if="!c.effects || c.effects.length === 0" class="text-xs text-gray-500">なし</div>
                            <div v-else class="space-y-1">
                              <div v-for="(effect, ei) in c.effects" :key="ei" class="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                                <input v-model="effect.key" class="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="変数名" />
                                <select v-model="effect.op" class="border border-gray-300 rounded px-2 py-1 text-sm">
                                  <option value="set">代入</option>
                                  <option value="add">加算</option>
                                  <option value="sub">減算</option>
                                </select>
                                <input v-model="effect.value" class="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="値" />
                                <button class="px-2 py-1 bg-red-400 text-white rounded text-xs hover:bg-red-500" @click="removeChoiceEffect(c, ei)">削除</button>
                              </div>
                            </div>
                          </div>

                          <div class="border-t pt-2">
                            <div class="flex items-center justify-between mb-2">
                              <div class="text-xs font-semibold text-gray-700">特別選択肢条件</div>
                              <div class="flex gap-1">
                                <button class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200" @click="enableChoiceCondition(c, 'condition')">設定</button>
                                <button v-if="c.condition" class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200" @click="c.condition = null">クリア</button>
                              </div>
                            </div>
                            <p v-if="!c.condition" class="text-xs text-gray-500">未設定なら常に表示</p>
                            <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <input v-model="c.condition.key" class="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="変数名" />
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
                              <input v-if="!isUnaryChoiceOperator(c.condition.operator)" v-model="c.condition.value" class="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="基準値" />
                              <div v-else class="text-xs text-gray-500 flex items-center px-2">値不要</div>
                            </div>
                          </div>

                          <div class="border-t pt-2">
                            <div class="flex items-center justify-between mb-2">
                              <div class="text-xs font-semibold text-gray-700">条件分岐先</div>
                              <div class="flex gap-1">
                                <button class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200" @click="enableChoiceCondition(c, 'alternateCondition')">設定</button>
                                <button v-if="c.alternateCondition || c.alternateTargetNodeId" class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200" @click="c.alternateCondition = null; clearChoiceTarget(c, 'alternateTargetNodeId')">クリア</button>
                              </div>
                            </div>
                            <p v-if="!c.alternateCondition" class="text-xs text-gray-500">未設定なら通常遷移のみ</p>
                            <div v-else class="space-y-2">
                              <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <input v-model="c.alternateCondition.key" class="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="変数名" />
                                <select v-model="c.alternateCondition.operator" class="border border-gray-300 rounded px-2 py-1 text-sm">
                                  <option value="eq">一致</option>
                                  <option value="ne">不一致</option>
                                  <option value="gt">より大きい</option>
                                  <option value="gte">以上</option>
                                  <option value="lt">より小さい</option>
                                  <option value="lte">以下</option>
                                  <option value="truthy">ON</option>
                                  <option value="falsy">OFF</option>
                                </select>
                                <input v-if="!isUnaryChoiceOperator(c.alternateCondition.operator)" v-model="c.alternateCondition.value" class="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="基準値" />
                                <div v-else class="text-xs text-gray-500 flex items-center px-2">値不要</div>
                              </div>
                              <div class="flex gap-2 items-center">
                                <div class="flex-1 px-2 py-1 border border-gray-300 rounded bg-white text-sm text-gray-700">
                                  {{ getChoiceTargetLabel(c.alternateTargetNodeId) }}
                                </div>
                                <button class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200" @click="openChoiceNodePicker(i, 'alternateTargetNodeId')">特殊遷移先</button>
                                <button v-if="c.alternateTargetNodeId" class="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200" @click="clearChoiceTarget(c, 'alternateTargetNodeId')">クリア</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex gap-2 border-t pt-3">
                  <button
                    class="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                    :disabled="saving"
                    @click="saveNode"
                  >
                    {{ saving ? '保存中...' : '保存' }}
                  </button>
                  <button
                    class="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400"
                    :disabled="saving"
                    @click="saveAndCreateNext"
                  >
                    {{ saving ? '保存中...' : '保存して次のノードへ' }}
                  </button>
                </div>

                <!-- 危険操作セクション -->
                <div class="editor-section-header" @click="sectionOpen.dangerous = !sectionOpen.dangerous">
                  <span class="editor-section-title">
                    <span class="editor-section-toggle">{{ sectionOpen.dangerous ? '▼' : '▶' }}</span>
                    危険操作
                  </span>
                </div>
                <div v-if="sectionOpen.dangerous" class="border-t pt-3">
                  <div class="text-sm font-medium mb-2 text-gray-700">ノード操作</div>
                  <button
                    class="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    @click="deleteCurrentNode"
                    aria-label="このノードを削除"
                  >
                    このノードを削除
                  </button>
                </div>

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
        :initial="game?.messageTheme"
        :initial-ui="game?.gameUiTheme"
        :initial-backlog="game?.backlogTheme"
        @close="openThemeModal=false"
        @saved="(v)=>{ if (game) { game.messageTheme=v.messageTheme ?? v; game.gameUiTheme=v.gameUiTheme; game.backlogTheme=v.backlogTheme } }"
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
