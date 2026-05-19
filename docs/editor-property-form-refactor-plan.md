# edit画面プロパティフォーム共通化 設計メモMVP

最終更新: 2026-05-20（Phase 2-i 反映）
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
- ✅ 手動確認済み

### 当時の残課題（後続 Phase で対応済み）

Phase 1 実装時点での残課題として記録していた項目。現在はすべて後続 Phase で実装済み：
- ~~遷移・分岐系（nextNodeId、選択肢、コピー対象）~~ → Phase 2-a / 2-b-1 で完了
- ~~素材・キャラクター参照UI（背景、BGM、SE、キャラクター配置）~~ → Phase 2-d-1 / 2-d-2 で完了
- ~~保存・削除アクション周辺~~ → Phase 2-e で完了

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

## Phase 2-b-2 実装状況（2026-05-17）

**状態**: ✅ 実装完了（MVP）

### 実装内容

- `edit.vue` script 内に `buildNodePayloadForSave(draft: any): any` を追加。
- `saveNode` と `saveAndCreateNext` に重複していた保存前正規化処理（約30行）を同関数に一元化。

#### buildNodePayloadForSave が担当する正規化

| 処理 | 内容 |
| --- | --- |
| deep copy | `JSON.parse(JSON.stringify(draft))` で draft を複製 |
| portraits.thumb 除去 | 署名URL（TTL付き）をDBに保存しないよう thumb フィールドを除去 |
| choices 正規化 | 既存の `sanitizeChoicesForSave` を適用 |
| visualFx null 化 | 空オブジェクト / type 未設定なら null |
| colorFilter null 化 | type=none なら null |
| backgroundFilter clamp | blurPx を [0,24]、dimOpacity を [0,60] にクランプし、両方 0 なら null |

#### 変更ファイル

- `apps/frontend/pages/my/games/[id]/edit.vue`（script のみ、テンプレート変更なし）

### 保存payload生成結果の等価性

`saveNode` と `saveAndCreateNext` は従来それぞれ同一の正規化ブロックをコピーしていたため、どちらも同関数を呼ぶ形に変えても出力は変わらない。`buildNodePayloadForSave` は純粋に draft を受け取って正規化済みオブジェクトを返すだけであり、外部 ref / 副作用を持たない。

### 今回変更しなかった箇所

- `saveAndCreateNext` の **2) コピー元の抽出**（`src = JSON.parse(…)` / `inherit` / `copyOpts`）は別の目的（次ノードへの引き継ぎ）であり、今回は触らない。
- テンプレート、localStorage 責務、NodePicker、ScenarioCheck は一切変更なし。

## Phase 2-c 実装状況（2026-05-17）

**状態**: ✅ 実装完了（MVP）

### 実装内容

- `apps/frontend/components/editor/NodeBasicInfoFields.vue` を新規作成。
- 通常表示 / 全画面表示の「基本情報」セクション（重複 2 箇所）を同コンポーネントで統一。

#### このコンポーネントが担当する範囲

- 「基本情報」セクション見出し（開閉トグル付き）
- 台詞 textarea
- 前ノードのセリフを継続するチェックボックス
- 話者キャラ 表示欄・変更ボタン・クリアボタン
- 話者表記 input

#### edit.vue での使用箇所

- 全画面編集モード（fs-form）内の「基本情報セクション」
- 通常表示モード（pane-props）内の「基本情報セクション」

どちらも同じ `<NodeBasicInfoFields :node-draft="nodeDraft" :section-open="sectionOpen" ... />` で統一されている。

#### props / emits

| 種別 | 名前 | 役割 |
|---|---|---|
| prop | `nodeDraft` | `reactive` オブジェクト。`.text` / `.continuesPreviousText` / `.speakerCharacterId` / `.speakerDisplayName` を直接編集 |
| prop | `sectionOpen` | `reactive` オブジェクト。`.basic` を開閉トグルで直接変更（既存コンポーネントと同パターン） |
| prop | `selectedCharLabel` | 話者キャラの表示名（computed から渡す） |
| emit | `open-char-picker` | 「変更」ボタン押下時。edit.vue 側の `openSpeakerCharPicker()` を呼び出す |
| emit | `clear-char` | 「クリア」ボタン押下時。edit.vue 側の `clearChar()` を呼び出す |

#### CSS スタイルについて

`editor-section-*` クラスは edit.vue の `<style scoped>` で定義されているため、NodeBasicInfoFields.vue 内に同内容を `<style scoped>` で再定義した。

#### edit.vue 側に残した責務

- `nodeDraft` 本体・`sectionOpen` 本体
- `selectedCharLabel` computed
- `openSpeakerCharPicker()` / `clearChar()` 実装
- `CharacterPicker` 本体・保存処理・その他ページ状態

### 検証状況

- ✅ コンポーネント作成
- ✅ 全画面側に統合
- ✅ 通常表示側に統合
- ✅ frontend build 済み
- ✅ 手動確認済み

### PR #3 追加修正（2026-05-17）

- `speakerCharacterId` が空のとき `selectedCharLabel` が「未選択」を返すよう修正。クリア後に話者キャラ欄の表示が空白になる問題を解消。
- `speakerDisplayName` は話者キャラのクリアに連動せず独立して保持する（既存挙動を維持）。

### 今後の課題（残課題）

Phase 2-d 以降で以下を継続的に共通化候補として検討：
- ~~素材・キャラクター参照UI（背景、BGM、SE）~~ → Phase 2-d-1 で完了
- ~~キャラクター配置~~ → Phase 2-d-2 で完了
- ~~保存・削除アクション周辺~~ → Phase 2-e で完了（`NodeSaveActions.vue` / `NodeDangerZone.vue`）

## Phase 2-d-1 実装状況（2026-05-17）

**状態**: ✅ 実装完了（MVP）

### 実装内容

- `apps/frontend/components/editor/NodeMaterialsFields.vue` を新規作成。
- 通常表示 / 全画面表示の「表示・素材」セクションのうち、背景 / BGM / SE（3項目）を共通化。
- キャラクター配置（portraits）は今回対象外。

#### このコンポーネントが担当する範囲

- 「表示・素材」セクション見出し（開閉トグル付き）
- 背景 サムネイル表示・変更ボタン・クリアボタン
- BGM タイトル表示・変更ボタン・クリアボタン・試聴 audio
- 効果音(SE) ID表示・変更ボタン・クリアボタン・試聴 audio

#### props / emits

| 種別 | 名前 | 役割 |
|---|---|---|
| prop | `nodeDraft` | `.bgAssetId` / `.musicAssetId` / `.sfxAssetId` の有無でクリアボタン表示を制御 |
| prop | `sectionOpen` | `.materials` を開閉トグルで直接変更 |
| prop | `bgUrl` | 署名済み背景画像URL（null = 未選択） |
| prop | `musicTitle` | BGMのタイトル文字列（未選択なら空文字） |
| prop | `musicUrl` | 署名済みBGM音声URL（null = 未選択） |
| prop | `sfxUrl` | 署名済みSE音声URL（null = 未選択） |
| emit | `open-bg-picker` | 背景「変更」ボタン押下 |
| emit | `open-music-picker` | BGM「変更」ボタン押下 |
| emit | `open-sfx-picker` | SE「変更」ボタン押下 |
| emit | `clear-bg` | 背景「クリア」ボタン押下 → edit.vue 側で `nodeDraft.bgAssetId=''` |
| emit | `clear-music` | BGM「クリア」ボタン押下 → edit.vue 側で `nodeDraft.musicAssetId=''` |
| emit | `clear-sfx` | SE「クリア」ボタン押下 → edit.vue 側で `nodeDraft.sfxAssetId=''` |

#### edit.vue 側に残した責務

- `nodeDraft` 本体・`sectionOpen` 本体
- `bgUrl` / `musicTitle` / `musicUrl` / `sfxUrl` の ref + watch
- `openBgPicker` / `openMusicPicker` / `openSfxPicker` の開閉フラグ
- `AssetPicker` 本体・保存処理（キャラクター配置UI は Phase 2-d-2 で `NodePortraitsFields.vue` へ移譲）

### 後続修正（2026-05-17）

PR #5 マージ後、`edit.vue` の `script setup` に `NodeMaterialsFields` の import が漏れていたため、表示・素材セクションが描画されない不具合が発生。
`import NodeMaterialsFields from '@/components/editor/NodeMaterialsFields.vue'` を追加するコミット（175e5cd）で修正済み。

### 検証状況

- ✅ コンポーネント作成
- ✅ 全画面側に統合
- ✅ 通常表示側に統合
- ✅ frontend build 済み
- ✅ 手動確認済み（PR #5 + import修正コミット 175e5cd 適用後）

## Phase 2-d-2 実装状況（2026-05-17）

**状態**: ✅ 実装完了（MVP）

### 実装内容

- `apps/frontend/components/editor/NodePortraitsFields.vue` を新規作成。
- 通常表示 / 全画面表示の「表示・素材」セクション内キャラクター配置UI（2箇所）を共通化。
- `edit.vue` の `script setup` に `import NodePortraitsFields` を追加。
- 既存の全画面側 `changePortrait(Number(i))` / 通常側 `changePortrait(i)` の表記揺れを、コンポーネント側で `Number(i)` に統一。

#### このコンポーネントが担当する範囲

- キャラクター配置ラベル + 追加ボタン
- 未配置メッセージ
- portrait 一覧（サムネイル・名前・画像変更ボタン・削除ボタン・X/Y/Scale/Z 入力）
- `sectionOpen.materials` が false のときは非表示

「表示・素材」セクション見出し / 開閉は `NodeMaterialsFields.vue` が引き続き担当。

#### props / emits

| 種別 | 名前 | 役割 |
|---|---|---|
| prop | `nodeDraft` | `.portraits` 配列を直接 `v-model.number` で編集 |
| prop | `sectionOpen` | `.materials` が false のとき非表示 |
| emit | `add-portrait` | 「追加」ボタン押下 |
| emit | `change-portrait(index: number)` | 「画像変更」ボタン押下（index は Number に変換済み） |
| emit | `remove-portrait(index: number)` | 「削除」ボタン押下（index は Number に変換済み） |

#### edit.vue 側に残した責務

- `nodeDraft` 本体・`sectionOpen` 本体
- `addPortrait` / `changePortrait` / `removePortrait` の実装
- `CharacterPicker` / `CharacterImagePicker` 本体
- `pendingIndex` / `onCharPicked` / `onImagePicked`
- portraits の thumb 補完処理・保存処理

### 検証状況

- ✅ コンポーネント作成
- ✅ 全画面側に統合
- ✅ 通常表示側に統合
- ✅ frontend build 済み
- ✅ 手動確認済み

## Phase 2-e 実装状況（2026-05-17）

**状態**: ✅ 実装完了（MVP）

### 実装内容

- `apps/frontend/components/editor/NodeSaveActions.vue` を新規作成。
- `apps/frontend/components/editor/NodeDangerZone.vue` を新規作成。
- 通常表示 / 全画面表示の保存ボタン（2箇所）と危険操作セクション（2箇所）を共通化。
- `edit.vue` の `script setup` に `import NodeSaveActions` / `import NodeDangerZone` を追加。

#### NodeSaveActions が担当する範囲

- 保存ボタン・保存して次のノードへボタン（saving 状態の disabled + ラベル切り替え含む）

#### NodeDangerZone が担当する範囲

- 「危険操作」セクション見出し（開閉トグル付き）
- 「このノードを削除」ボタン

#### props / emits

| コンポーネント | 種別 | 名前 | 役割 |
|---|---|---|---|
| NodeSaveActions | prop | `saving` | ボタンの disabled + ラベル切り替え |
| NodeSaveActions | emit | `save` | 保存ボタン押下 |
| NodeSaveActions | emit | `save-and-create-next` | 保存して次へボタン押下 |
| NodeDangerZone | prop | `sectionOpen` | `.dangerous` で開閉制御 |
| NodeDangerZone | emit | `toggle-dangerous` | セクション見出しクリック |
| NodeDangerZone | emit | `delete-current-node` | 削除ボタン押下 |

#### edit.vue 側に残した責務

- `saving` ref 本体
- `saveNode` / `saveAndCreateNext` / `deleteCurrentNode` の実装
- `sectionOpen.dangerous` の状態管理

### 検証状況

- ✅ コンポーネント作成
- ✅ 全画面側に統合
- ✅ 通常表示側に統合
- ✅ frontend build 済み
- ✅ 手動確認済み

## Phase 2-f 実装状況（2026-05-18）

**状態**: ✅ 実装完了（MVP）

### 実装内容

- `apps/frontend/components/editor/EditorPublishCheckSummaryCard.vue` を新規作成。
- `edit.vue` 公開前チェックパネル内の「公開前チェックサマリーカード」（`<!-- ── 公開前チェックサマリーカード ── -->` 以下のカードブロック）を共通コンポーネント化。
- 以下の表示用 computed を `edit.vue` からコンポーネント側へ移譲:
  - `publishCheckStatus` / `publishCheckStatusLabel` / `publishCheckStatusMessage`
  - `publishCheckStatusCardClass` / `publishCheckStatusBadgeClass` / `publishCheckStatusTextClass`
  - `publishCheckTopIssues` / `publishCheckTopIssuesRemainder`

#### このコンポーネントが担当する範囲

- 状態バッジ（公開準備OK / 要修正 / 注意あり / チェック中…）
- 参照確認中スピナー表示
- issue一覧アンカーリンク（`href="#publish-check-issues"`）
- 状態メッセージ
- severity 別件数（要修正 / 注意 / 情報）
- カテゴリ別件数（構成 / 素材参照 / キャラクター参照）
- 優先して修正する問題（error 最大3件）と「ほか N件」

#### props

| 名前 | 型 | 役割 |
|---|---|---|
| `counts` | `{ error: number; warning: number; info: number }` | severity 別件数 |
| `totalCount` | `number` | 全件数（アンカーリンク表示制御） |
| `categoryCounts` | `{ structure: number; assetReference: number; characterReference: number }` | カテゴリ別件数 |
| `issues` | `Array<{ id: string; severity: string; message: string }>` | 優先問題抽出用 issue 一覧 |
| `referenceDiagnosticsLoading` | `boolean` | 参照確認中スピナー表示 |
| `referenceDiagnosticsError` | `string \| null` | 参照診断エラー（warning 状態への影響） |

#### edit.vue 側に残した責務

- `scenarioCheckIssues` / `scenarioCheckCounts` / `scenarioCategoryCounts` / `scenarioCheckTotalCount` の算出
- `referenceDiagnosticsLoading` / `referenceDiagnosticsError` の状態管理・参照診断 API 取得処理
- issue フィルタ / カテゴリフィルタ UI
- `focusScenarioIssue` / クエリパラメータからの公開前チェック誘導
- 公開前チェックパネル全体の開閉状態（`sectionOpen.scenarioCheck`）
- 公開前チェックパネル全体のコンポーネント化（フィルターUI・カテゴリフィルター・参照診断API処理まで: Phase 2-g 以降）

### 検証状況

- ✅ コンポーネント作成
- ✅ edit.vue への統合（import + テンプレート置き換え）
- ✅ frontend build 済み
- ✅ 手動確認済み

## Phase 2-g 実装状況（2026-05-19）

**状態**: ✅ 実装完了（MVP）

### 実装内容

- `apps/frontend/components/editor/EditorPublishCheckIssueList.vue` を新規作成。
- `edit.vue` 公開前チェックパネル内の `id="publish-check-issues"` 以下 issue 一覧表示ブロックを共通コンポーネント化。

#### このコンポーネントが担当する範囲

- issue 総数0件時:「問題は見つかりませんでした。」表示
- フィルター結果0件時:「この条件のチェック項目はありません。」表示
- info 項目折りたたみ表示（情報N件 / 情報を表示 / 情報を折りたたむ）
- issue カード一覧（severity / category / 対象へ移動ボタン / message / location / field / nodePreview / highlight ring）

#### props

| 名前 | 型 | 役割 |
|---|---|---|
| `totalCount` | `number` | 全件数（0件メッセージ制御） |
| `filteredIssues` | `any[]` | フィルター後 issue 一覧 |
| `filteredInfoIssues` | `any[]` | フィルター後 info 一覧（折りたたみ表示用） |
| `visibleIssues` | `any[]` | 表示対象 issue 一覧 |
| `scenarioCheckFilter` | `'all' \| ScenarioCheckSeverity` | 現在のフィルター（info 折りたたみ表示の条件分岐用） |
| `scenarioCheckInfoOpen` | `boolean` | info 折りたたみ開閉状態 |
| `highlightedIssueId` | `string \| null` | highlight 表示する issue ID |
| `scenarioSeverityLabel` | `(severity) => string` | 関数 prop |
| `scenarioSeverityClass` | `(severity) => string` | 関数 prop |
| `issueCategoryLabel` | `(issue) => string` | 関数 prop |
| `issueCategoryClass` | `(issue) => string` | 関数 prop |
| `scenarioIssueLocation` | `(issue) => string` | 関数 prop |

#### emits

| イベント | 役割 |
|---|---|
| `toggle-info-open` | info 折りたたみ切り替え |
| `focus-issue` | 対象へ移動ボタン押下 |
| `set-issue-card-ref` | issue カードの ref を親へ渡す |

#### edit.vue 側に残した責務

- scenario check API 処理
- `scenarioCheckFilter` / `scenarioCategoryFilter` / `scenarioCheckInfoOpen` の状態管理
- フィルターボタン・カテゴリフィルターボタン UI
- `scenarioCheckCounts` / `scenarioCategoryCounts` / `scenarioCheckTotalCount` の算出
- `scenarioCheckFilteredIssues` / `scenarioCheckFilteredInfoIssues` / `scenarioCheckVisibleIssues` の算出
- `EditorPublishCheckSummaryCard`
- `focusScenarioIssue` / `setScenarioIssueCardRef`
- 公開前チェックパネル全体のコンポーネント化は未完了（残課題）

### 検証状況

- ✅ コンポーネント作成
- ✅ edit.vue への統合（import + テンプレート置き換え）
- ✅ frontend build 済み
- ✅ 手動確認済み

## Phase 2-h 実装状況（2026-05-20）

**状態**: ✅ 実装完了（MVP）

### 実装内容

- `apps/frontend/components/editor/EditorPublishCheckFilters.vue` を新規作成。
- `edit.vue` 公開前チェックパネル内の severity filter ボタン列・category filter ボタン列を共通コンポーネント化。
- `scenarioFilterButtonClass` / `scenarioCategoryFilterButtonClass` 関数を `edit.vue` から削除し、コンポーネント内部に移動。

#### このコンポーネントが担当する範囲

- severity filter ボタン列（すべて / エラー / 警告 / 情報）
- category filter ボタン列（全カテゴリ / 構成 / 素材参照 / キャラクター参照）
- ボタンの active スタイル / count > 0 スタイルの算出

#### props

| 名前 | 型 | 役割 |
|---|---|---|
| `filterItems` | `FilterItem[]` | severity filter 選択肢（key / label / count） |
| `categoryFilterItems` | `CategoryFilterItem[]` | category filter 選択肢（key / label / count / displayLabel） |
| `scenarioCheckFilter` | `'all' \| ScenarioCheckSeverity` | 現在の severity filter（active スタイル判定用） |
| `scenarioCategoryFilter` | `'all' \| PrepublishIssueCategory` | 現在の category filter（active スタイル判定用） |

#### emits

| イベント | 役割 |
|---|---|
| `select-check-filter` | severity filter ボタン押下 |
| `select-category-filter` | category filter ボタン押下 |

#### edit.vue 側に残した責務

- scenario check API 処理
- `scenarioCheckFilter` / `scenarioCategoryFilter` / `scenarioCheckInfoOpen` の状態管理
- `scenarioCheckFilterItems` / `scenarioCategoryFilterItems` の算出 computed
- `scenarioCheckCounts` / `scenarioCategoryCounts` / `scenarioCheckTotalCount` の算出
- `scenarioCheckFilteredIssues` / `scenarioCheckFilteredInfoIssues` / `scenarioCheckVisibleIssues` の算出
- `selectScenarioCheckFilter` / `selectScenarioCategoryFilter` 関数
- 公開前チェックパネル全体の開閉（`sectionOpen.scenarioCheck`）
- 公開前チェックパネル外枠は Phase 2-i で `EditorPublishCheckPanel.vue` へ移譲

### 検証状況

- ✅ コンポーネント作成
- ✅ edit.vue への統合（import + テンプレート置き換え）
- ✅ `scenarioFilterButtonClass` / `scenarioCategoryFilterButtonClass` を edit.vue から削除
- ✅ frontend build 済み
- ✅ 手動確認済み（通常表示 / 全画面表示）

## Phase 2-i 実装状況（2026-05-20）

**状態**: ✅ 実装完了（MVP）

### 実装内容

- `apps/frontend/components/editor/EditorPublishCheckPanel.vue` を新規作成。
- `edit.vue` 公開前チェックセクションの外枠全体（見出し・説明文・折りたたみボタン・件数チップ・参照診断中/エラー表示・open時コンテンツ）を共通コンポーネント化。
- `EditorPublishCheckSummaryCard` / `EditorPublishCheckFilters` / `EditorPublishCheckIssueList` をパネル内部に収め、`edit.vue` からの直接 import を削除。

#### このコンポーネントが担当する範囲

- 外枠カード（`mb-4 rounded-lg border border-gray-200 bg-gray-50`）
- ヘッダー（見出し「公開前チェック」・説明文・折りたたみ/展開ボタン）
- 常時表示の件数チップ（エラー N件 / 警告 N件 / 情報 N件）
- `referenceDiagnosticsLoading` の「素材・キャラクター参照を確認中...」表示
- `referenceDiagnosticsError` の表示
- open 時の中身（`EditorPublishCheckSummaryCard` / `EditorPublishCheckFilters` / `EditorPublishCheckIssueList`）

#### props

| 名前 | 型 | 役割 |
|---|---|---|
| `open` | `boolean` | 展開/折りたたみ状態 |
| `counts` | `{ error: number; warning: number; info: number }` | 件数チップ表示 + SummaryCard へ渡す |
| `totalCount` | `number` | SummaryCard / IssueList へ渡す |
| `categoryCounts` | `{ structure: number; assetReference: number; characterReference: number }` | SummaryCard へ渡す |
| `issues` | `Array<{ id: string; severity: string; message: string }>` | SummaryCard へ渡す |
| `referenceDiagnosticsLoading` | `boolean` | ローディング表示 + SummaryCard へ渡す |
| `referenceDiagnosticsError` | `string \| null` | エラー表示 + SummaryCard へ渡す |
| `filterItems` | `FilterItem[]` | Filters へ渡す |
| `categoryFilterItems` | `CategoryFilterItem[]` | Filters へ渡す |
| `scenarioCheckFilter` | `ScenarioCheckFilter` | Filters / IssueList へ渡す |
| `scenarioCategoryFilter` | `ScenarioCategoryFilter` | Filters へ渡す |
| `filteredIssues` | `any[]` | IssueList へ渡す |
| `filteredInfoIssues` | `any[]` | IssueList へ渡す |
| `visibleIssues` | `any[]` | IssueList へ渡す |
| `scenarioCheckInfoOpen` | `boolean` | IssueList へ渡す |
| `highlightedIssueId` | `string \| null` | IssueList へ渡す |
| `scenarioSeverityLabel` | `(severity) => string` | IssueList へ渡す |
| `scenarioSeverityClass` | `(severity) => string` | IssueList へ渡す |
| `issueCategoryLabel` | `(issue) => string` | IssueList へ渡す |
| `issueCategoryClass` | `(issue) => string` | IssueList へ渡す |
| `scenarioIssueLocation` | `(issue) => string` | IssueList へ渡す |

#### emits

| イベント | 役割 |
|---|---|
| `toggle-open` | 折りたたみ/展開ボタン押下 |
| `select-check-filter` | severity filter ボタン押下（Filters から中継） |
| `select-category-filter` | category filter ボタン押下（Filters から中継） |
| `toggle-info-open` | info 折りたたみ切り替え（IssueList から中継） |
| `focus-issue` | 対象へ移動ボタン押下（IssueList から中継） |
| `set-issue-card-ref` | issue カード ref（IssueList から中継） |

#### edit.vue 側に残した責務

- scenario check API 処理
- reference diagnostics API 処理
- `scenarioCheckFilter` / `scenarioCategoryFilter` / `scenarioCheckInfoOpen` の状態管理
- issue 算出 computed（`scenarioCheckIssues` / `scenarioCheckFilteredIssues` 等）
- `sectionOpen.scenarioCheck` の実体
- `focusScenarioIssue` / `setScenarioIssueCardRef` の実体

### 検証状況

- ✅ コンポーネント作成
- ✅ edit.vue への統合（import 差し替え + テンプレート置き換え）
- ✅ `EditorPublishCheckSummaryCard` / `EditorPublishCheckFilters` / `EditorPublishCheckIssueList` の直接 import を edit.vue から削除
- ✅ frontend build 済み
- ✅ 手動確認済み（通常表示 / 全画面表示）

## 参照

- `docs/PROJECT_SPEC.md`
- `docs/ROADMAP.md`
- `docs/FEATURE_INVENTORY.md`
- `docs/IDEA_BACKLOG.md`
- `docs/file-map.md`
