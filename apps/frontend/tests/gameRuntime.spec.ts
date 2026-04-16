import { describe, it, expect } from 'vitest'
import {
  appendBacklogEntry,
  applyChoiceEffects,
  evaluateChoiceCondition,
  filterVisibleChoices,
  resolveChoiceTarget,
} from '../utils/gameState'

describe('Game Runtime', () => {
  it('should advance to next node', () => {
    const target = resolveChoiceTarget({ targetNodeId: 'node-b' }, {})
    expect(target).toBe('node-b')
  })

  it('should handle choices correctly', () => {
    const state = applyChoiceEffects(
      { affection: 1 },
      [{ key: 'affection', op: 'add', value: 2 }],
    )

    expect(state.affection).toBe(3)
    expect(
      evaluateChoiceCondition(
        { key: 'affection', operator: 'gte', value: 3 },
        state,
      ),
    ).toBe(true)
  })

  it('should filter hidden special choices and branch to alternate node', () => {
    const choices = [
      { id: 'a', label: '通常', targetNodeId: 'normal' },
      {
        id: 'b',
        label: '特別',
        targetNodeId: 'normal',
        alternateTargetNodeId: 'secret',
        condition: { key: 'affection', operator: 'gte', value: 3 },
        alternateCondition: { key: 'affection', operator: 'gte', value: 5 },
      },
    ]

    const visible = filterVisibleChoices(choices, { affection: 4 })
    expect(visible).toHaveLength(2)
    expect(resolveChoiceTarget(choices[1], { affection: 5 })).toBe('secret')
  })

  it('should append one backlog entry and ignore duplicates', () => {
    const next = appendBacklogEntry([], {
      id: 'node-1',
      text: 'こんにちは',
      speakerDisplayName: '案内人',
    }, '前文')

    expect(next).toHaveLength(1)
    expect(next[0]).toEqual({
      nodeId: 'node-1',
      speakerName: '案内人',
      text: '前文こんにちは',
    })

    const deduped = appendBacklogEntry(next, {
      id: 'node-1',
      text: 'こんにちは',
      speakerDisplayName: '案内人',
    }, '前文')

    expect(deduped).toHaveLength(1)
  })
})
