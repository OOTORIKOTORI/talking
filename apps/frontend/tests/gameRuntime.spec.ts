import { describe, it, expect } from 'vitest'
import {
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
})
