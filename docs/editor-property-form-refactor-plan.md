# edit画面プロパティフォーム共通化 設計メモMVP

最終更新: 2026-05-15
対象: `apps/frontend/pages/my/games/[id]/edit.vue`

## 背景

- `edit.vue` のプロパティフォームは、通常表示と全画面表示で同種UIが二重実装されている。
- この構造により、片方だけ更新される差分漏れが繰り返し起きやすい。
- 2026-05-15 の背景フィルター / 背景ぼかしMVPで、通常表示側だけUIが追加され、全画面側に漏れる実害が発生した。
- 将来、ライブ編集などで第3の編集UIが増えると、差分漏れリスクはさらに上がる。
- ただし `edit.vue` 全体を一括で大改造するとリスクが高いため、段階的な切り出しで進める。

## 現状の重複箇所（棚卸）

以下は `apps/frontend/pages/my/games/[id]/edit.vue` 実装の確認結果。

| 項目 | 通常表示フォーム | 全画面フォーム | 備考 |
| --- | --- | --- | --- |
| StageCanvas 呼び出し | あり | あり | どちらも `colorFilter` / `backgroundFilter` 等を渡す |
| 公開前チェック周辺 | 右ペイン上部に1系統 | 右ペイン上部に1系統 | フォーム重複ではなく共通パネル |
| ノード基本情報 | あり | あり | `台詞` / `continuesPreviousText` / `話者` |
| 参照素材/キャラクター | あり | あり | 背景/BGM/SE/キャラクター配置 |
| カメラ | あり | あり | `nodeDraft.camera.*` |
| カメラ演出 | あり | あり | `cameraFxEnabled` + `nodeDraft.cameraFx.*` |
| ビジュアルエフェクト | あり | あり | `nodeDraft.visualFx.*` |
| カラーフィルター | あり | あり | `nodeDraft.colorFilter.*` |
| 背景フィルター | あり | あり | `nodeDraft.backgroundFilter.*`（今回の漏れ再発領域） |
| 遷移・分岐 | あり | あり | `nextNodeId` / 選択肢群 |
| 次ノード作成時コピー対象 | あり | あり | `copyOpts` |
| 選択肢 | あり | あり | 条件・分岐先・状態操作 |
| 保存/保存して次へ | あり | あり | `saveNode` / `saveAndCreateNext` |
| 危険操作 | あり | あり | `deleteCurrentNode` |

## 再発した問題

- 背景フィルター / 背景ぼかしMVP時に、通常表示側フォームへ先にUI追加し、全画面側への同等反映が漏れた。
- 現在は修正済みだが、二重実装構造のままでは同種事故が再発しうる。

## 共通化方針（段階的移行）

一括置換ではなく、影響範囲が比較的閉じる領域から順に切り出す。

### Phase 1: 演出系フォームの小さな共通化（最初のMVP）

対象:
- カメラ
- カメラ演出
- ビジュアルエフェクト
- カラーフィルター
- 背景フィルター

候補コンポーネント:
- `NodeCameraFields.vue`
- `NodeVisualEffectFields.vue`
- `NodeBackgroundFilterFields.vue`
- または統合して `NodeEffectsFields.vue`

### Phase 2: 遷移・分岐系の共通化

対象:
- 遷移・分岐
- 次ノード作成時コピー対象
- 選択肢

候補コンポーネント:
- `NodeTransitionFields.vue`
- `NodeCopyOptionsFields.vue`
- `NodeChoicesFields.vue`

### Phase 3: 素材・キャラクター参照UIの共通化

対象:
- 背景/BGM/SE
- キャラクター配置

候補コンポーネント:
- `NodeAssetReferenceFields.vue`
- `NodeCharacterReferenceFields.vue`

### Phase 4: アクション/周辺パネル整理

対象:
- 保存ボタン / 保存して次へ
- 危険操作
- 公開前チェック周辺

候補コンポーネント:
- `NodeSaveActions.vue`
- `NodeDangerZone.vue`
- `EditorScenarioCheckPanel.vue`

## 最初に実装するならどこが安全か

推奨は Phase 1（演出系フォーム共通化MVP）。

理由:
- 今回の実害（背景フィルター漏れ）が演出系で発生している。
- 入出力が `nodeDraft` 周辺に閉じやすい。
- 保存処理/削除処理に比べて副作用が小さい。
- 通常表示と全画面表示で見た目と挙動の一致を確認しやすい。

## 実装時の注意点

- `v-model` と computed setter（例: `cameraFxEnabled`）の責務を明確化する。
- `nodeDraft` が `null` 相当のタイミングを許容するガードを置く。
- `range` / `number` 入力は `.number` を維持し、数値型を崩さない。
- `backgroundFilter` の `null` 正規化方針（0/0 なら `null`）は既存保存責務を維持する。
- 既存 localStorage key（`talking.editor.rightPaneSections.v1` など）を増やさない。
- StageCanvas props とフォームUI責務を混同しない。
- 保存payload正規化は `edit.vue` と API 側既存責務を崩さない。
- 最初は props/emits を明示した小さなコンポーネントから始める。

## 今回やらないこと（明示）

- `edit.vue` 実装リファクタ
- 新規 Vue コンポーネント作成
- UI挙動変更
- DB/API/Prisma変更
- 保存処理変更
- StageCanvas変更
- 背景フィルター仕様変更
- 既存フォーム削除
- ライブ編集機能実装

## 参照

- `docs/PROJECT_SPEC.md`
- `docs/ROADMAP.md`
- `docs/FEATURE_INVENTORY.md`
- `docs/IDEA_BACKLOG.md`
- `docs/file-map.md`
