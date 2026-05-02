import { describe, expect, it } from 'vitest'
import { resolveFallbackNodeId } from '../utils/editorSelection'

describe('editorSelection', () => {
  it('uses scene startNodeId when the node exists', () => {
    const resolved = resolveFallbackNodeId(
      { startNodeId: 'node-start' },
      [{ id: 'node-a' }, { id: 'node-start' }],
    )

    expect(resolved).toBe('node-start')
  })

  it('falls back to the first node when startNodeId is missing', () => {
    const resolved = resolveFallbackNodeId(
      { startNodeId: 'node-missing' },
      [{ id: 'node-a' }, { id: 'node-b' }],
    )

    expect(resolved).toBe('node-a')
  })

  it('returns null when the scene has no nodes', () => {
    const resolved = resolveFallbackNodeId({ startNodeId: 'node-start' }, [])

    expect(resolved).toBeNull()
  })
})