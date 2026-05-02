export interface EditorSelectionSceneLike {
  startNodeId?: string | null
}

export interface EditorSelectionNodeLike {
  id?: string | null
}

export function resolveFallbackNodeId(
  scene: EditorSelectionSceneLike | null | undefined,
  nodes: EditorSelectionNodeLike[] | null | undefined,
): string | null {
  if (!Array.isArray(nodes) || nodes.length === 0) return null

  const startNodeId = typeof scene?.startNodeId === 'string'
    ? scene.startNodeId.trim()
    : ''

  if (startNodeId) {
    const startNode = nodes.find(nodeItem => nodeItem?.id === startNodeId)
    if (typeof startNode?.id === 'string' && startNode.id.trim().length > 0) {
      return startNode.id
    }
  }

  const firstNodeId = nodes[0]?.id
  return typeof firstNodeId === 'string' && firstNodeId.trim().length > 0
    ? firstNodeId
    : null
}