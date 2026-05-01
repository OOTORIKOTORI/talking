import type { BacklogEntry } from '@talking/types'

export type GameStateValue = string | number | boolean | null
export type GameState = Record<string, GameStateValue>

export type ChoiceEffectOp = 'set' | 'add' | 'sub'
export type ChoiceConditionOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'truthy' | 'falsy'

export interface GameChoiceEffect {
  key: string
  op?: ChoiceEffectOp
  value?: GameStateValue
}

export interface GameChoiceCondition {
  key: string
  operator?: ChoiceConditionOperator
  value?: GameStateValue
}

function coerceValue(value: unknown): GameStateValue {
  if (value === null || value === undefined) return null
  if (typeof value === 'number' || typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return ''
    const lower = trimmed.toLowerCase()
    if (lower === 'true') return true
    if (lower === 'false') return false
    const num = Number(trimmed)
    if (!Number.isNaN(num)) return num
    return value
  }
  return String(value)
}

function toNumber(value: unknown): number {
  const coerced = coerceValue(value)
  if (typeof coerced === 'number') return coerced
  if (typeof coerced === 'boolean') return coerced ? 1 : 0
  const parsed = Number(coerced)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function evaluateChoiceCondition(
  condition: GameChoiceCondition | null | undefined,
  state: GameState,
): boolean {
  const key = condition?.key?.trim()
  if (!key) return true

  const operator = condition?.operator ?? 'eq'
  const left = coerceValue(state[key])
  const right = coerceValue(condition?.value)

  switch (operator) {
    case 'truthy':
      return Boolean(left)
    case 'falsy':
      return !left
    case 'ne':
      return left !== right
    case 'gt':
      return toNumber(left) > toNumber(right)
    case 'gte':
      return toNumber(left) >= toNumber(right)
    case 'lt':
      return toNumber(left) < toNumber(right)
    case 'lte':
      return toNumber(left) <= toNumber(right)
    case 'eq':
    default:
      return left === right
  }
}

export function applyChoiceEffects(
  state: GameState,
  effects: GameChoiceEffect[] | null | undefined,
): GameState {
  const nextState: GameState = { ...state }

  if (!Array.isArray(effects)) return nextState

  for (const effect of effects) {
    const key = effect?.key?.trim()
    if (!key) continue

    const op = effect?.op ?? 'set'
    if (op === 'add') {
      nextState[key] = toNumber(nextState[key]) + toNumber(effect?.value)
      continue
    }
    if (op === 'sub') {
      nextState[key] = toNumber(nextState[key]) - toNumber(effect?.value)
      continue
    }

    nextState[key] = coerceValue(effect?.value)
  }

  return nextState
}

export function resolveChoiceTarget(choice: any, state: GameState): string | null {
  const alternateTarget = typeof choice?.alternateTargetNodeId === 'string'
    ? choice.alternateTargetNodeId.trim()
    : ''

  if (alternateTarget) {
    const altCondition = choice?.alternateCondition
    if (altCondition?.key?.trim() && evaluateChoiceCondition(altCondition, state)) {
      return alternateTarget
    }
  }

  const normalTarget = typeof choice?.targetNodeId === 'string'
    ? choice.targetNodeId.trim()
    : ''

  return normalTarget || null
}

function hasNormalTarget(choice: Record<string, any>): boolean {
  return typeof choice?.targetNodeId === 'string' && choice.targetNodeId.trim().length > 0
}

export function filterVisibleChoices<T extends Record<string, any>>(
  choices: T[] | null | undefined,
  state: GameState,
): T[] {
  if (!Array.isArray(choices)) return []
  return choices.filter(choice =>
    hasNormalTarget(choice) &&
    evaluateChoiceCondition(
      (choice as { condition?: GameChoiceCondition | null }).condition,
      state,
    ),
  )
}

export function appendBacklogEntry(
  entries: BacklogEntry[],
  node: { id?: string | null; text?: string | null; speakerDisplayName?: string | null } | null | undefined,
  prefixText = '',
): BacklogEntry[] {
  if (!node?.id || !node?.text) return entries

  const entry: BacklogEntry = {
    nodeId: node.id,
    speakerName: node.speakerDisplayName ?? null,
    text: `${prefixText}${node.text}`,
  }

  const last = entries[entries.length - 1]
  if (
    last?.nodeId === entry.nodeId &&
    last?.speakerName === entry.speakerName &&
    last?.text === entry.text
  ) {
    return entries
  }

  return [...entries, entry]
}
