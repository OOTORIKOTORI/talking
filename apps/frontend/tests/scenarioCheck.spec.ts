import { describe, expect, it } from 'vitest'
import { runScenarioCheck } from '../utils/scenarioCheck'

// ── ヘルパー ──────────────────────────────────────────────────────────────────

function makeScene(id: string, nodes: any[], startNodeId?: string | null) {
  return {
    id,
    name: `シーン(${id})`,
    startNodeId: startNodeId !== undefined ? startNodeId : (nodes[0]?.id ?? null),
    nodes,
  }
}

function makeNode(id: string, opts: {
  text?: string
  nextNodeId?: string | null
  choices?: any[]
} = {}) {
  return {
    id,
    text: opts.text !== undefined ? opts.text : 'テキスト',
    nextNodeId: opts.nextNodeId ?? null,
    choices: opts.choices ?? [],
  }
}

function makeChoice(label: string, targetNodeId: string | null) {
  return { label, targetNodeId }
}

// ── チェック1: ノード本文が空 ─────────────────────────────────────────────────

describe('チェック1: ノード本文が空', () => {
  it('本文が空文字のノードは warning になる', () => {
    const nodeA = makeNode('node-a', { text: '' })
    const scene = makeScene('scene-1', [nodeA], 'node-a')
    const result = runScenarioCheck({ scenes: [scene], startSceneId: 'scene-1' })

    const emptyTextIssues = result.issues.filter(
      (i) => i.nodeId === 'node-a' && i.severity === 'warning' && i.message.includes('本文が空'),
    )
    expect(emptyTextIssues.length).toBeGreaterThan(0)
  })

  it('本文が空白のみのノードは warning になる', () => {
    const nodeA = makeNode('node-a', { text: '   ' })
    const scene = makeScene('scene-1', [nodeA], 'node-a')
    const result = runScenarioCheck({ scenes: [scene], startSceneId: 'scene-1' })

    const emptyTextIssues = result.issues.filter(
      (i) => i.nodeId === 'node-a' && i.severity === 'warning' && i.message.includes('本文が空'),
    )
    expect(emptyTextIssues.length).toBeGreaterThan(0)
  })

  it('本文が入力されているノードは本文空warningが出ない', () => {
    const nodeA = makeNode('node-a', { text: '本文あり' })
    const scene = makeScene('scene-1', [nodeA], 'node-a')
    const result = runScenarioCheck({ scenes: [scene], startSceneId: 'scene-1' })

    const emptyTextIssues = result.issues.filter(
      (i) => i.nodeId === 'node-a' && i.message.includes('本文が空'),
    )
    expect(emptyTextIssues.length).toBe(0)
  })

  it('空本文warningは error ではない（公開ブロックされない）', () => {
    const nodeA = makeNode('node-a', { text: '' })
    const scene = makeScene('scene-1', [nodeA], 'node-a')
    const result = runScenarioCheck({ scenes: [scene], startSceneId: 'scene-1' })

    const emptyTextErrors = result.issues.filter(
      (i) => i.nodeId === 'node-a' && i.severity === 'error' && i.message.includes('本文'),
    )
    expect(emptyTextErrors.length).toBe(0)
  })
})

// ── チェック2: 選択肢ラベルが空 ──────────────────────────────────────────────

describe('チェック2: 選択肢ラベルが空', () => {
  it('ラベルが空文字の選択肢は warning になる', () => {
    const nodeB = makeNode('node-b', { text: '次へ' })
    const nodeA = makeNode('node-a', {
      text: '分岐',
      choices: [makeChoice('', 'node-b')],
    })
    const scene = makeScene('scene-1', [nodeA, nodeB], 'node-a')
    const result = runScenarioCheck({ scenes: [scene], startSceneId: 'scene-1' })

    const emptyLabelIssues = result.issues.filter(
      (i) => i.nodeId === 'node-a' && i.severity === 'warning' && i.message.includes('ラベルが空'),
    )
    expect(emptyLabelIssues.length).toBeGreaterThan(0)
  })

  it('ラベルが空白のみの選択肢は warning になる', () => {
    const nodeB = makeNode('node-b', { text: '次へ' })
    const nodeA = makeNode('node-a', {
      text: '分岐',
      choices: [makeChoice('   ', 'node-b')],
    })
    const scene = makeScene('scene-1', [nodeA, nodeB], 'node-a')
    const result = runScenarioCheck({ scenes: [scene], startSceneId: 'scene-1' })

    const emptyLabelIssues = result.issues.filter(
      (i) => i.nodeId === 'node-a' && i.severity === 'warning' && i.message.includes('ラベルが空'),
    )
    expect(emptyLabelIssues.length).toBeGreaterThan(0)
  })

  it('ラベルが入力されている選択肢はラベル空warningが出ない', () => {
    const nodeB = makeNode('node-b', { text: '次へ' })
    const nodeA = makeNode('node-a', {
      text: '分岐',
      choices: [makeChoice('選択A', 'node-b')],
    })
    const scene = makeScene('scene-1', [nodeA, nodeB], 'node-a')
    const result = runScenarioCheck({ scenes: [scene], startSceneId: 'scene-1' })

    const emptyLabelIssues = result.issues.filter(
      (i) => i.nodeId === 'node-a' && i.message.includes('ラベルが空'),
    )
    expect(emptyLabelIssues.length).toBe(0)
  })

  it('targetNodeId=null の選択肢でもラベル空はwarningとして検出される', () => {
    const nodeA = makeNode('node-a', {
      text: '分岐',
      choices: [makeChoice('', null)],
    })
    const scene = makeScene('scene-1', [nodeA], 'node-a')
    const result = runScenarioCheck({ scenes: [scene], startSceneId: 'scene-1' })

    const emptyLabelIssues = result.issues.filter(
      (i) => i.nodeId === 'node-a' && i.severity === 'warning' && i.message.includes('ラベルが空'),
    )
    expect(emptyLabelIssues.length).toBeGreaterThan(0)
    // error ではないこと
    expect(result.counts.error).toBe(0)
  })
})

// ── チェック3: 表示可能な選択肢が0件なのに選択肢データがある ─────────────────

describe('チェック3: 表示可能な選択肢が0件のノード', () => {
  it('targetNodeId=null の選択肢だけを持つノードは warning になる', () => {
    const nodeA = makeNode('node-a', {
      text: '分岐',
      choices: [makeChoice('選択A', null), makeChoice('選択B', null)],
    })
    const scene = makeScene('scene-1', [nodeA], 'node-a')
    const result = runScenarioCheck({ scenes: [scene], startSceneId: 'scene-1' })

    const noDisplayableIssues = result.issues.filter(
      (i) => i.nodeId === 'node-a' && i.severity === 'warning' && i.message.includes('表示される選択肢がありません'),
    )
    expect(noDisplayableIssues.length).toBeGreaterThan(0)
  })

  it('表示可能な選択肢が1件以上あればこのwarningは出ない', () => {
    const nodeB = makeNode('node-b', { text: '次へ' })
    const nodeA = makeNode('node-a', {
      text: '分岐',
      choices: [makeChoice('選択A', 'node-b')],
    })
    const scene = makeScene('scene-1', [nodeA, nodeB], 'node-a')
    const result = runScenarioCheck({ scenes: [scene], startSceneId: 'scene-1' })

    const noDisplayableIssues = result.issues.filter(
      (i) => i.nodeId === 'node-a' && i.message.includes('表示される選択肢がありません'),
    )
    expect(noDisplayableIssues.length).toBe(0)
  })

  it('選択肢データがないノードはこのwarningが出ない', () => {
    const nodeA = makeNode('node-a', { text: '本文', choices: [] })
    const scene = makeScene('scene-1', [nodeA], 'node-a')
    const result = runScenarioCheck({ scenes: [scene], startSceneId: 'scene-1' })

    const noDisplayableIssues = result.issues.filter(
      (i) => i.message.includes('表示される選択肢がありません'),
    )
    expect(noDisplayableIssues.length).toBe(0)
  })

  it('targetNodeId=null のみの選択肢は error にならない', () => {
    const nodeA = makeNode('node-a', {
      text: '分岐',
      choices: [makeChoice('選択A', null)],
    })
    const scene = makeScene('scene-1', [nodeA], 'node-a')
    const result = runScenarioCheck({ scenes: [scene], startSceneId: 'scene-1' })

    expect(result.counts.error).toBe(0)
  })
})

// ── チェック5: 開始シーン以外の startNodeId 壊れチェック ─────────────────────

describe('チェック5: 開始シーン以外の壊れた startNodeId', () => {
  it('開始シーン以外のシーンでstartNodeIdが存在しないノードを指している場合は warning', () => {
    const nodeA = makeNode('node-a', { text: 'テキスト' })
    const nodeB = makeNode('node-b', { text: 'テキスト' })
    const scene1 = makeScene('scene-1', [nodeA], 'node-a') // 開始シーン
    const scene2 = makeScene('scene-2', [nodeB], 'node-missing') // 壊れたstartNodeId

    const result = runScenarioCheck({ scenes: [scene1, scene2], startSceneId: 'scene-1' })

    const brokenStartIssues = result.issues.filter(
      (i) => i.sceneId === 'scene-2' && i.severity === 'warning' && i.message.includes('開始ノードが存在しません'),
    )
    expect(brokenStartIssues.length).toBeGreaterThan(0)
  })

  it('開始シーン以外のシーンでstartNodeIdが正常の場合はこのwarningが出ない', () => {
    const nodeA = makeNode('node-a', { text: 'テキスト' })
    const nodeB = makeNode('node-b', { text: 'テキスト' })
    const scene1 = makeScene('scene-1', [nodeA], 'node-a')
    const scene2 = makeScene('scene-2', [nodeB], 'node-b')

    const result = runScenarioCheck({ scenes: [scene1, scene2], startSceneId: 'scene-1' })

    const brokenStartIssues = result.issues.filter(
      (i) => i.sceneId === 'scene-2' && i.message.includes('開始ノードが存在しません'),
    )
    expect(brokenStartIssues.length).toBe(0)
  })

  it('開始シーン以外のシーンでstartNodeIdが未設定(null)でもwarningは出ない', () => {
    const nodeA = makeNode('node-a', { text: 'テキスト' })
    const nodeB = makeNode('node-b', { text: 'テキスト' })
    const scene1 = makeScene('scene-1', [nodeA], 'node-a')
    const scene2 = makeScene('scene-2', [nodeB], null) // 未設定は許容

    const result = runScenarioCheck({ scenes: [scene1, scene2], startSceneId: 'scene-1' })

    const brokenStartIssues = result.issues.filter(
      (i) => i.sceneId === 'scene-2' && i.message.includes('開始ノードが存在しません'),
    )
    expect(brokenStartIssues.length).toBe(0)
  })

  it('壊れたstartNodeIdは error にならない（公開ブロックされない）', () => {
    const nodeA = makeNode('node-a', { text: 'テキスト' })
    const nodeB = makeNode('node-b', { text: 'テキスト' })
    const scene1 = makeScene('scene-1', [nodeA], 'node-a')
    const scene2 = makeScene('scene-2', [nodeB], 'node-missing')

    const result = runScenarioCheck({ scenes: [scene1, scene2], startSceneId: 'scene-1' })

    const errors = result.issues.filter(
      (i) => i.sceneId === 'scene-2' && i.severity === 'error',
    )
    expect(errors.length).toBe(0)
  })
})

// ── 既存チェックの後退テスト ──────────────────────────────────────────────────

describe('既存チェック: 後退防止', () => {
  it('開始シーン未設定は error', () => {
    const nodeA = makeNode('node-a', { text: 'テキスト' })
    const scene = makeScene('scene-1', [nodeA], 'node-a')
    const result = runScenarioCheck({ scenes: [scene], startSceneId: null })

    const startSceneErrors = result.issues.filter(
      (i) => i.severity === 'error' && i.message.includes('開始シーンが未設定'),
    )
    expect(startSceneErrors.length).toBeGreaterThan(0)
  })

  it('存在しないノードへの参照は error', () => {
    const nodeA = makeNode('node-a', { text: 'テキスト', nextNodeId: 'node-nonexistent' })
    const scene = makeScene('scene-1', [nodeA], 'node-a')
    const result = runScenarioCheck({ scenes: [scene], startSceneId: 'scene-1' })

    const refErrors = result.issues.filter(
      (i) => i.severity === 'error' && i.message.includes('nextNodeId'),
    )
    expect(refErrors.length).toBeGreaterThan(0)
  })

  it('到達不能ノードは warning', () => {
    const nodeA = makeNode('node-a', { text: 'テキスト' })
    const nodeB = makeNode('node-b', { text: '到達不能' }) // nodeAからの遷移なし
    const scene = makeScene('scene-1', [nodeA, nodeB], 'node-a')
    const result = runScenarioCheck({ scenes: [scene], startSceneId: 'scene-1' })

    const unreachableIssues = result.issues.filter(
      (i) => i.nodeId === 'node-b' && i.severity === 'warning' && i.message.includes('到達できません'),
    )
    expect(unreachableIssues.length).toBeGreaterThan(0)
  })

  it('終端ノードは info', () => {
    const nodeA = makeNode('node-a', { text: 'テキスト', nextNodeId: null, choices: [] })
    const scene = makeScene('scene-1', [nodeA], 'node-a')
    const result = runScenarioCheck({ scenes: [scene], startSceneId: 'scene-1' })

    const terminalIssues = result.issues.filter(
      (i) => i.nodeId === 'node-a' && i.severity === 'info' && i.message.includes('終端'),
    )
    expect(terminalIssues.length).toBeGreaterThan(0)
  })

  it('warningのみでは counts.error が 0 のまま', () => {
    const nodeA = makeNode('node-a', { text: '' }) // 本文空 → warning
    const scene = makeScene('scene-1', [nodeA], 'node-a')
    const result = runScenarioCheck({ scenes: [scene], startSceneId: 'scene-1' })

    expect(result.counts.error).toBe(0)
    expect(result.counts.warning).toBeGreaterThan(0)
  })
})
