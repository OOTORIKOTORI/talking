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

## Phase 1 実装状況（2026-05-15）

**状態**: ✅ 実装完了

### 実装内容

`apps/frontend/components/editor/NodeEffectsFields.vue` を新規作成。

#### このコンポーネントが担当する範囲

- カメラ（倍率、位置X/Y）
- カメラ演出（有効フラグ、モード、時間）
- ビジュアルエフェクト（種類、強度、プレビュー）
- カラーフィルター（種類、不透明度、フェード時間）
- 背景フィルター（ぼかし強度、暗さ）

#### edit.vue での使用箇所

- 全画面編集モード（fs-form）内の「演出セクション」
- 通常表示モード（pane-props）内の「演出セクション」

どちらも同じ `<NodeEffectsFields :node-draft="nodeDraft" />` で統一されている。

### 検証状況

- ✅ コンポーネント作成
- ✅ 全画面側に統合
- ✅ 通常表示側に統合
- ✅ frontend build 済み
- ⏳ 手動確認待ち

### 今後の課題（残課題）

Phase 2 以降で以下を継続的に共通化：
- 遷移・分岐系（nextNodeId、選択肢、コピー対象）
- 素材・キャラクター参照UI（背景、BGM、SE、キャラクター配置）
- 保存・削除アクション周辺

## Phase 2-a 実装状況（2026-05-16）

**状態**: ✅ 実装完了（MVP）

### 実装内容

- `apps/frontend/components/editor/NodeTransitionFields.vue` を新規作成。
- 通常表示 / 全画面表示の「遷移・分岐」セクション内で、以下を共通化。
	- 次ノードID表示・選択・クリア
	- 次ノード作成時のコピー対象（背景 / キャラ / BGM / カメラ）
- `Ctrl/⌘+K` は `NodeTransitionFields.vue` 内の次ノード欄フォーカス中のみで処理し、NodePicker起動体感を維持。

### 今回の責務分離

- `copyOpts` の localStorage 保存責務は `edit.vue` の既存 watch を維持。
- NodePicker 本体と選択処理（`@select` / `@close` / `:current-id`）は既存責務を維持。
- 選択肢UI / 条件分岐UI は Phase 2-b-1 で `NodeChoicesFields.vue` へ分離（詳細は下記）。

## Phase 2-b-1 実装状況（2026-05-16）

**状態**: ✅ 実装完了（MVP）

### 実装内容

- `apps/frontend/components/editor/NodeChoicesFields.vue` を新規作成。
- 通常表示 / 全画面表示の「遷移・分岐」セクション内で、選択肢UIを共通化。
	- 選択肢セクション見出し
	- 選択肢追加ボタン
	- 注意文（選択肢優先）
	- 選択肢なし表示
	- 選択肢リスト（表示テキスト / 削除）
	- 通常遷移先（表示 / 選択 / クリア / 未設定バッジ）
	- 状態操作（effects）
	- 特別選択肢条件（condition）
	- 条件分岐先（alternateCondition / 特殊遷移先の選択・クリア）

### 今回の責務分離

- `nodeDraft` 本体、`showChoiceNextPriorityNotice`、`getChoiceTargetLabel` などの表示ロジックは `edit.vue` 側に維持。
- `addChoice` / `removeChoice` / `addChoiceEffect` / `removeChoiceEffect` / `enableChoiceCondition` / `openChoiceNodePicker` は `edit.vue` 側責務を維持し、`NodeChoicesFields.vue` から emit で呼び出す。
- NodePicker 本体、open/close 状態、`editingChoiceIndex` / `editingChoiceTargetField`、保存処理、`normalizeChoiceDrafts` / `sanitizeChoicesForSave` は `edit.vue` 側に維持。
- 全画面側だけにあった「条件分岐先 > 特殊遷移先」クリアボタンを共通化後に統一した。

## 参照

- `docs/PROJECT_SPEC.md`
- `docs/ROADMAP.md`
- `docs/FEATURE_INVENTORY.md`
- `docs/IDEA_BACKLOG.md`
- `docs/file-map.md`
