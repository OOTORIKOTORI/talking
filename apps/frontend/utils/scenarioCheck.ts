export type ScenarioCheckSeverity = 'error' | 'warning' | 'info'

export type ScenarioCheckIssue = {
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

type ScenarioCheckCounts = {
  error: number
  warning: number
  info: number
}

type ScenarioCheckResult = {
  issues: ScenarioCheckIssue[]
  counts: ScenarioCheckCounts
}

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

export function runScenarioCheck(payload: {
  scenes: any[]
  startSceneId: unknown
}): ScenarioCheckResult {
  const sceneList = Array.isArray(payload.scenes) ? payload.scenes : []
  const sceneById = new Map<string, { scene: any; sceneOrder: number }>()
  const nodeById = new Map<string, { scene: any; sceneOrder: number; node: any; nodeOrder: number }>()
  const issues: ScenarioCheckIssue[] = []
  let issueSeq = 0

  function pushIssue(input: {
    severity: ScenarioCheckSeverity
    message: string
    sceneId?: string | null
    nodeId?: string | null
  }) {
    const sceneId = input.sceneId ?? null
    const nodeId = input.nodeId ?? null
    const sceneMeta = sceneId ? sceneById.get(sceneId) : null
    const nodeMeta = nodeId ? nodeById.get(nodeId) : null
    const baseScene = nodeMeta?.scene ?? sceneMeta?.scene ?? null
    const baseSceneOrder = nodeMeta?.sceneOrder ?? sceneMeta?.sceneOrder ?? null
    const baseNodeOrder = nodeMeta?.nodeOrder ?? null

    issues.push({
      id: `scenario-check-${++issueSeq}`,
      severity: input.severity,
      message: input.message,
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

  const startSceneId = normalizeNodeId(payload.startSceneId)
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

  const counts: ScenarioCheckCounts = {
    error: issues.filter((issue) => issue.severity === 'error').length,
    warning: issues.filter((issue) => issue.severity === 'warning').length,
    info: issues.filter((issue) => issue.severity === 'info').length,
  }

  return {
    issues,
    counts,
  }
}
