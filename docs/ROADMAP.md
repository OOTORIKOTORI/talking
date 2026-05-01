# Talking 開発ロードマップ

> 最終更新: 2026-05-02（Prisma Client同期手順の明確化）
> 用途: **進捗管理の正ドキュメント**。作業完了のたびに更新すること。
> `docs/handoff.md` は旧メモ・補助資料。進捗同期はこのファイルを正とする。

---

## 📍 現在地サマリ（2026-05-01）

ゲーム制作機能の基盤が整い、MVP級の編集・公開・プレイが一通り動く状態。

**実装済み（主要）**
- ゲーム制作・公開・共有フローMVP（公開一覧・API・公開切替・UI導線）
- ノード/シーン/ゲーム 削除MVP（削除前確認・参照解除・導線）
- NodePicker「シーン → ノード」二段階選択UI（キーボード操作・stale state修正・詳細プレビュー）
- ゲームプレイ画面キーボード操作MVP（Enter/Space・↑/↓/Enter・数字キー・Esc）
- 公開ギャラリー検索（/search/assets 接続、Meilisearch 障害時 Prisma fallback）
- 未ログイン公開ギャラリーで `/favorites` を呼ばない修正、公開ゲームのセーブ/ローUX補正
- シーンラベル・シーン管理性改善MVP（シーン名編集UI・一覧改善・NodePicker連携）

**直近の残課題（優先順）**
- NodePicker シーン一覧（左ペイン）のキーボード操作・フォーカス設計・スクロール保持
- ゲームエディタ edit画面の情報設計v2（右ペインセクション化MVP）
- キーコンフィグ・AUTO/Skip機能・プレイヤーごとのセーブデータ設計

---

## 🏗️ ビルド状態

| 日付 | 結果 | 備考 |
|------|------|------|
| 2026-05-01 | ✅ exit 0 | WARN: `@nuxt/icon` Nuxt 3.19.3 非互換（>=4.0.0 必要）、browserslist 7ヶ月古い（軽微） |
| 2026-05-02 | ✅ exit 0 | シーンラベル・シーン管理性改善MVP後。既知 WARN のみ（同上） |

---

## 🔎 今回の確認メモ（2026-05-02 / Prisma Client同期手順の明確化 + 選択肢追加UI改善）

### 実装した内容
- API（`apps/api/package.json`）
	- `build` を `pnpm prisma:generate && nest build` に変更
	- Prisma schema 更新後の Client 未同期による実行時不整合（`must not be null` 系）を起こしにくくする最小対策
- フロント（`apps/frontend/pages/my/games/[id]/edit.vue`）
	- 「選択肢追加」ボタンをノード操作の手前単体配置から、`選択肢` セクション見出し右側へ移動
	- 通常表示・全画面表示の両方で同じ配置に統一

### Prisma同期の運用手順（再発防止）
- Prisma schema を変更したら、以下を必ず同じ作業単位で実施する
	- `pnpm prisma migrate dev`（開発DB反映）
	- `pnpm prisma generate`（Client再生成）
	- API プロセス再起動（古い Client を掴んだままの常駐プロセスを避ける）
- migration 追加が不要な確認のみ行う場合は、`pnpm prisma migrate status` を使う

### 実行した確認
- `Set-Location apps/api; pnpm prisma migrate status`: ✅ Database schema is up to date
- `Set-Location apps/api; pnpm prisma generate`: ✅ Generated Prisma Client (v6.18.0)

### 補足
- `pnpm prisma migrate dev` 実行時に、意図しない migration（`users` テーブル drop）が一時生成されたため削除済み
- このため、状態確認用途では `migrate status` を優先する方針を明記

---

## 🔎 今回の確認メモ（2026-05-02 / GameChoice.targetNodeId null運用整理）

### 実装した内容
- Prisma
	- `GameChoice.targetNodeId` を nullable 化
	- migration `20260502090000targetnodeidnullable` を追加
	- 既存 `targetNodeId = ''` を `null` へ移行する SQL を追加
- API（`apps/api/src/games/games.service.ts`）
	- choice 作成/更新時に `targetNodeId` / `alternateTargetNodeId` を trim して空文字を `null` に正規化
	- ノード削除・シーン削除時の参照解除を `targetNodeId: null` に変更
	- `alternateTargetNodeId` の参照解除は従来どおり `null`
- 編集画面（`apps/frontend/pages/my/games/[id]/edit.vue`）
	- choice の通常遷移先未設定を `null` で扱うように変更
	- 未設定 choice に「遷移先未設定」バッジを表示
	- `nextNodeId` と表示可能 choice が両方ある場合に注意文を表示
	- choice 遷移先/分岐遷移先のクリア操作を `null` 設定に変更
	- シーン名編集欄ラベルを「選択中シーン名」に変更し、補足文を削除
- プレイ画面（`apps/frontend/utils/gameState.ts`, `apps/frontend/pages/games/[id]/play.vue`）
	- `targetNodeId` が未設定の choice を表示対象外に変更（MVP）
	- 表示可能 choice がある場合は choice 優先、ない場合のみ `nextNodeId` 進行の仕様に整合
	- 数字キー `1-9` は表示対象 choice のみを対象（既存実装を維持）

### 仕様整理（ドキュメント反映）
- 未設定表現は `null` に統一し、空文字 `''` 運用を廃止
- ノード削除・シーン削除時の `targetNodeId` / `alternateTargetNodeId` 参照解除は `null`
- プレイ時の遷移優先順位:
	- 表示可能 choice が1件以上: choice を表示し `nextNodeId` は使わない
	- 表示可能 choice が0件: `nextNodeId` があれば通常進行、なければ終了

### 実行した確認
- `pnpm -w build`: ✅ exit 0
	- 既知 WARN のみ（`@nuxt/icon` 非互換、browserslist 古い、baseline-browser-mapping 更新推奨、Node deprecation warning）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 2 files / 7 tests passed

### 今回未実行の確認と理由
- ブラウザ手動確認（NodePicker 実キー操作、プレイ画面の実操作E2E）
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

---

## 🔎 今回の確認メモ（2026-05-02 / シーンラベル・シーン管理性改善MVP）

### 実装した内容
- フロント（`apps/frontend/pages/my/games/[id]/edit.vue`）
  - `sceneNameDraft` ref を追加し、選択シーンが変わる（`scene.value?.id` 変化）たびにドラフトをリセット
  - `saveSceneName` 非同期関数を追加（`$api PATCH /games/scenes/:sceneId { name }` で永続化）
    - 空欄の場合は保存せずドラフトを現在名に戻す
    - 保存後: `scene.value`・`scenes.value[i]`・`game.value.scenes[i]` を即時同期
    - エラー時はドラフトを現在名に戻す
  - `sceneNodeCount` computed を追加（`nodePickerScenes` から `Map<sceneId, nodeCount>` を生成）
  - 左ペイン（シーン一覧）を改善
    - 各シーン行に Scene番号・シーン名・ノード数を表示
    - シーン名が空の場合は `Scene N` フォールバックを表示
    - 選択中シーンは `bg-blue-500 text-white` で視覚的強調（既存どおり）
  - 左ペイン上部に「シーン名」入力欄を追加（選択中シーンがある場合のみ表示）
    - Enter キーまたは blur で `saveSceneName` を呼び出し
    - `placeholder` に `Scene N` を表示

### `GameScene.name` の活用方針
- `GameScene.name` は Prisma schema に既存フィールド (`String` required)
- DB変更・マイグレーションなし
- API: `PATCH /games/scenes/:sceneId { name }` は既実装済み（`patchScene` in `games.service.ts`）
- フロントのみ変更でシーンラベル機能を実現

### 状態同期方針
- `scene.value?.id` の watch でシーン切り替え時にドラフトをリセット
- `scenes.value` watch（既存）が `game.value.scenes` を同期 → NodePicker へ連鎖
- シーン名変更後: `scene.value`・`scenes.value`・`game.value.scenes` を3箇所同期
- シーン追加後: `api.listScenes()` で `scenes.value` を再取得 → watch 連鎖で `game.value.scenes` も更新
- シーン削除後: 同様に再取得 → 自動同期
- NodePicker に渡す `nodePickerScenes` は `scenes.value` + `game.value.scenes` のマージ computed のため自動追従

### NodePicker の状態（変更なし）
- 左ペイン: `Scene N: name` 形式（名前空なら番号のみ）、ノード数、「現在のシーン」バッジ
- 検索結果: `Scene N: name` 表示
- 詳細プレビュー: `Scene N: name` 表示
- シーン名での検索対応
- 既存の二段階選択・キーボード操作・詳細プレビューは変更なし

### 今回未対応（将来課題）
- シーンのドラッグ&ドロップ並び替え
- シーン説明文フィールド（`GameScene.description`）
- シーンサムネイル
- フローチャート表示
- 3ペイン構造の大改修

### 実行した確認
- `pnpm -w build`: ✅ exit 0（既知 WARN のみ）
- `pnpm -C apps/frontend test`: ✅ exit 0（2 files / 6 tests passed）

### 今回未実行の確認と理由
- ブラウザ手動確認（シーン名編集・反映・NodePicker連携・キーボード操作の実操作）
  - 理由: この実行環境ではブラウザ手動E2Eを実施しておらず、CLIのbuild/testを優先したため

---

## 🔎 今回の確認メモ（2026-05-01 / PROJECT_SPEC.md ・ ROADMAP.md 整合更新）

### 目的
- PROJECT_SPEC.md と ROADMAP.md を最新コード基準で再同期
- 実装済み機能が未実装・将来課題扱いのまま残っていた箇所を修正

### 実装済み扱いに変更した主な項目（PROJECT_SPEC.md ・ ROADMAP.md 共通）
- ゲーム削除導線: `未実装（次タスク）` → `実装済み（/my/games から確認付き soft delete）`
- NodePicker二段階選択UI: `将来課題` → `実装済み`
- NodePicker キーボード操作・詳細プレビュー: `今後拡張予定` → `実装済み`
- ゲームプレイ画面キーボード操作MVP: `P2 将来課題` → `実装済み`

### 残課題として整理した項目
- NodePicker 左ペインのキーボード操作・フォーカス設計・スクロール保持・干渉防止改善
- ゲームプレイ関連: キーコンフィグ・AUTO/Skip機能・プレイヤーごとのセーブデータ設計・スマホ/タブレット対応
- 削除/参照整合: `GameChoice.targetNodeId` の nullable 化・将来課題ノード参照切れ警告・到達不能ノード検出
- edit画面: 右ペインのセクション化MVP・情報設計v2・折りたたみ保存・設定項目のコンポーネント分割

### 実行した確認
- 今回はドキュメント更新のみ。`pnpm -w build` ・ `pnpm -C apps/frontend test` は未実行（コード変更がないため不要）

---

## 🔎 今回の確認メモ（2026-05-01 / ゲームプレイ画面キーボード操作MVP実装）

### 実装した内容
- フロント（`apps/frontend/pages/games/[id]/play.vue`）
	- Enter / Space のプレイ操作を追加
		- スタート画面では開始
		- タイプライター表示中は全文表示
		- タイプライター完了後は、選択肢未表示なら選択肢を開く or 次へ進行
		- 選択肢表示中はハイライト中の選択肢を決定
	- ↑ / ↓ による選択肢ハイライト移動を追加（末尾/先頭でループ）
	- 数字キー `1` 〜 `9` による選択肢の直接選択を追加
	- Esc の優先順を整理
		1. セーブ/ロードモーダルを閉じる
		2. バックログを閉じる
		3. フルスクリーンを閉じる
	- モーダル表示中（セーブ/ロード・バックログ）は Esc 以外でゲーム進行しないよう制御
	- `input` / `textarea` / `select` / `button` / `[contenteditable]` フォーカス時はショートカットを無効化
	- IME変換中（`event.isComposing` / `key === 'Process'`）はキー操作を無効化
	- Space をプレイ操作として処理した際に `preventDefault()` してスクロール誤動作を防止
	- 通常画面/フルスクリーン両方の選択肢UIにハイライト表示を追加
- フロント（`apps/frontend/components/game/MessageWindow.vue`）
	- タイプライター制御の最小APIを追加
		- `defineExpose({ skip, isComplete })`
		- `complete` emit を明示的に完了時に送出
	- `play.vue` 側で `@complete` を受けて完了状態と連携

### タイプライター全文表示の実装状況
- 実装済み
	- Enter / Space / クリック時、タイプライター中なら `advanceWithinNodeOrNext()` ではなく全文表示のみ実行
	- 既に完了済みなら従来どおり進行

### 既存機能への影響
- クリックでの文章送り・選択肢表示・選択肢決定を維持
- スタート画面/終了画面/フルスクリーン/セーブロード/バックログ/音声同意オーバーレイ/BGM・SFX起動を維持
- 公開ゲーム/ownerゲームのセーブロード権限分岐は既存ロジックを維持

### 実行した確認
- `pnpm -w build`: ✅ exit 0
	- 既知 warn のみ（`@nuxt/icon` 非互換、browserslist 古い、Node deprecation warning）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 2 files / 6 tests passed

### 今回未実行の確認と理由
- ブラウザ手動確認（実キーボード操作、fullscreen実機確認、未ログイン公開ゲーム操作、owner/非ownerのセーブロード実UI確認）
	- 理由: この実行環境ではブラウザ手動E2Eを実施しておらず、CLI の build/test を優先したため

---

## 🔎 今回の確認メモ（2026-05-01 / NodePicker 残課題整理・ゲームプレイ画面キーボード操作将来課題追記）

### 目的
- NodePicker のキーボード操作MVP（右ペイン↑/↓/Enter）が完了した後の残課題を整理する
- ゲームプレイ画面のキーボード操作対応を将来課題として記録する

### 今回の変更（ドキュメントのみ）
- NodePicker のシーン一覧（左ペイン）キーボード操作・フォーカス設計・スクロール保持・干渉防止などの残課題を ROADMAP に追記
- ゲームプレイ画面のキーボード操作MVP案（Enter/Spaceで文章送り、↑/↓/Enterで選択肢操作）を P2 将来課題として ROADMAP に追記
- 注意点（フォーム入力・IME・モーダルとの干渉、ブラウザ標準Spaceスクロールとの干渉）を合わせて記録
- より高度なショートカット設定・キーコンフィグを P3 に追記

> 注: この確認メモは当時の状態。後続作業（2026-05-01 ゲームプレイ画面キーボード操作MVP実装）で実装済み。

### 実行した確認
- `docs/ROADMAP.md` を更新。機能実装・コード変更なし

### 今回未実行の確認と理由
- `pnpm -w build`
	- 理由: 今回はドキュメント更新のみで、実装コードやビルド対象に変更がないため
- `pnpm -C apps/frontend test`
	- 理由: 挙動変更を伴わないため

---

## 🔎 今回の確認メモ（2026-05-01 / NodePicker 退行復旧確認・キーボード操作安定化）

### 実装した内容
- フロント（`apps/frontend/components/game/NodePicker.vue`）
	- 二段階UI（左: シーン一覧 / 右: 選択中シーンノード一覧 / 検索時: 全シーン横断）を維持していることを再確認
	- `scenes` / `currentSceneId` / `currentId` props ベース実装を維持（`game` prop 依存へ戻さない）
	- キーボード操作の安定化として、モーダル本体に `tabindex="-1"` を追加し、検索欄フォーカス失敗時のフォールバックを追加
	- `Ctrl` / `Meta` / `Alt` 併用時は NodePicker キー処理をスキップし、他ショートカットとの衝突を回避
	- 既存の `↑` / `↓` / `Enter` / `Esc`、候補0件ガード、ハイライト表示、詳細プレビューを維持
- フロント（`apps/frontend/pages/my/games/[id]/edit.vue`）
	- NodePicker 呼び出しが `:scenes="nodePickerScenes"` と `:current-scene-id="scene?.id"` の props 連携であることを確認
	- `:game="..."` 依存に戻っていないことを確認

### 既存機能への影響
- nextNodeId 選択、choice 通常遷移先/特殊遷移先選択、現在シーン最新ノード反映、他シーン候補維持、検索時の全シーン横断は維持

### 実行した確認
- `pnpm -w build`: ✅ exit 0
	- 既知 warn のみ（`@nuxt/icon` Nuxt 3 非互換、browserslist 古い、Node deprecation warning、nuxt sourcemap-import warning）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 2 files / 6 tests passed

### 今回未実行の確認と理由
- ブラウザ手動確認（NodePicker の実キー操作、詳細プレビューの視認性、choice 編集導線での実操作）
	- 理由: この実行環境ではブラウザ手動E2Eを実施しておらず、CLI の build/test を優先したため

---

## 🔎 今回の確認メモ（2026-05-01 / NodePicker キーボード操作・詳細プレビューMVP）

### 実装した内容
- フロント（`apps/frontend/components/game/NodePicker.vue`）
	- NodePicker を開いた直後に検索欄へフォーカスする挙動を追加
	- キーボード操作を追加
		- `↑` / `↓` で右ペイン候補のハイライト移動
		- `Enter` でハイライト中ノードを選択
		- `Esc` で NodePicker を閉じる
	- 通常モード（選択中シーン）と検索モード（全シーン横断）の両方で同じキーボード選択フローを利用
	- 候補0件時はハイライト対象を `null` として扱い、キー操作時に例外が出ないように防御
	- ハイライト中候補の視覚ラベル（`ハイライト中`）と背景色を追加
	- ハイライト移動時に候補行を自動スクロール追従
	- 右ペイン下部に詳細プレビューを追加
		- 所属シーン名
		- Node番号 / node id
		- 本文プレビュー
		- 選択肢数
		- `nextNodeId` 設定有無
		- 現在選択中ノードかどうか
		- 開始ノードかどうか

### 既存機能への影響
- `scenes` / `currentSceneId` / `currentId` ベースの props 設計は維持（`game.scenes` 直参照へは戻していない）
- nextNodeId 選択・choice 通常遷移先選択・choice 特殊遷移先選択・検索時の全シーン横断・現在シーン最新ノード反映・他シーン候補維持・close/select emit の既存挙動を維持

### ROADMAP 追記（将来課題）
- P3 に「スマホ/タブレット向けゲーム編集体験の再設計」を追加
- PC向け3ペインの単純縮小ではなく、タッチ操作・画面幅・プレビュー・NodePicker・削除確認の再設計を行う方針を記録

### 実行した確認
- `pnpm -w build`: ✅ exit 0
	- 既知 warn のみ（`@nuxt/icon` Nuxt 3 非互換、browserslist 古い、Node deprecation warning）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 2 files / 6 tests passed

### 今回未実行の確認と理由
- ブラウザ手動確認（NodePicker の検索欄初期フォーカス、↑/↓/Enter/Esc 実操作、検索中のキー操作、候補0件表示、詳細プレビューの視認性）
	- 理由: この実行環境ではブラウザ手動E2Eを実施しておらず、CLI の build/test を優先したため

---

## 🔎 今回の確認メモ（2026-05-01 / edit画面の削除ボタン誤認防止MVP）

### 実装した内容
- フロント（`apps/frontend/pages/my/games/[id]/edit.vue`）
	- シーン削除ボタンの文言を `シーン削除` から `このシーンを削除` に変更し、シーン操作領域での配置を維持
	- ノード削除ボタンを `選択肢追加` ボタン横から分離し、`ノード操作` セクションへ移動（通常表示・全画面表示の両方）
	- ノード削除ボタンの文言を `このノードを削除` に変更
	- 選択肢ごとの削除ボタン文言を `この選択肢を削除` に変更し、各選択肢行に配置したまま `aria-label` で対象を明示

### 既存機能への影響
- ノード削除・シーン削除・選択肢追加/削除・nextNode選択・choice遷移先選択・NodePicker・保存して次のノードへ・テストプレイ/公開ゲームプレイの既存ロジックは変更なし
- 今回は削除ボタンの情報設計改善のみを対象とし、3ペイン構造や全面的なUI刷新は未実施

### 今後の課題
- edit画面全体の情報設計見直し（危険操作の整理、セクション構造の再設計など）は継続課題として維持

### 実行した確認
- `pnpm -w build`: ✅ exit 0
	- 既知 warn のみ（`@nuxt/icon` Nuxt 3 非互換、browserslist 古い、Node deprecation warning）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 2 files / 6 tests passed

### 今回未実行の確認と理由
- ブラウザ手動確認（削除ボタンの見た目・配置・押下導線の実画面確認）
	- 理由: この実行環境ではブラウザ手動E2Eを行っておらず、CLIでの build/test を優先

---

## 🔎 今回の確認メモ（2026-05-01 / edit画面 情報設計v2の将来課題整理）

### 目的
- 機能追加で増えた設定項目を整理し、制作中に迷いにくくする
- 削除・公開・遷移などの重要操作を誤認しにくくする
- 画面全体を綺麗に作り直すのではなく、編集作業の見通しを良くする

### 方針（今回は実装しない）
- 今回はドキュメント更新のみ。機能実装・大規模UI変更・3ペイン刷新は行わない
- 既存の保存・プレビュー・NodePicker・削除機能を壊さない前提で段階的に進める
- 最初の着手候補は「右ペイン内のセクション化MVP」とする

### edit画面 情報設計v2（検討する分類例）
1. 基本情報
	- ノード名
	- 本文
	- 話者
	- メモ
	- ノード色
	- 開始ノード設定
2. 表示・素材
	- 背景
	- 立ち絵
	- BGM
	- SE
	- メッセージウィンドウ
3. 遷移・分岐
	- 次ノード
	- 選択肢
	- 条件分岐
	- 変数操作
4. 演出
	- カメラ
	- 揺れ
	- フラッシュ
	- カラーフィルター
	- 表示タイミング
5. プレビュー
	- 小プレビュー
	- 全画面プレビュー
	- テストプレイ導線
6. 危険操作
	- このノードを削除
	- このシーンを削除
	- 参照解除の警告

### 将来のUI方針
- セクションごとに見出しを付ける
- 必要に応じて折りたたみ可能にする
- よく使うセクションは初期展開する
- 高度な設定や演出は初期折りたたみも検討する
- 開閉状態は localStorage 保存を検討する
- セクション見出しに要約を表示する
	- 例: `選択肢: 3件`
	- 例: `背景: 設定済み`
	- 例: `演出: カメラあり`
- 危険操作は他の操作と混ざらない独立セクションにする
- 削除ボタンは必ず削除対象を文言で明示する

### 実行した確認
- `docs/ROADMAP.md` の優先度セクションと整合し、将来課題としての位置づけ（P2/P3）を追記

### 今回未実行の確認と理由
- `pnpm -w build`
	- 理由: 今回はドキュメント更新のみで、挙動変更を伴わないため
- `pnpm -C apps/frontend test`
	- 理由: UI実装やロジック変更を行っていないため

---

## 🔎 今回の確認メモ（2026-05-01 / ゲーム削除導線実装・削除済みゲーム遮断）

### 実装した内容
- API（`apps/api/src/games/games.service.ts`）
	- `assertGameOwner()` を拡張し、`deletedAt` を含む所有者チェックを共通化
	- ゲーム未存在（または削除済み）を `404`、owner 不一致を `403` として扱うよう整理
	- `softDelete()` は owner のみ実行可能とし、対象未存在時 `404`・owner 以外 `403` を保証
	- `update` / `upsertScene` / `listScenes` / `patchScene` / `listNodes` / `upsertNode` / save系 API で削除済みゲームを操作不可に統一
	- `getOwnedSceneOrThrow()` / `getOwnedNodeOrThrow()` でも親ゲームの `deletedAt` を検証し、削除済みゲームに紐づく scene/node 操作を遮断
- フロント（`apps/frontend/pages/my/games/index.vue`）
	- 各ゲームカードに削除ボタンを追加（公開/非公開トグルと分離した配置）
	- 削除前に確認ダイアログを表示し、ゲームタイトルを明示
	- 確認文に「公開一覧・編集画面から表示されなくなる」「元に戻せない可能性」を明記
	- 削除中はボタンを disabled にして二重送信防止
	- 削除成功時は一覧から即時除外、失敗時は toast で通知

### 既存機能への影響
- `/my/games` / `/games` / `/games/:id` / `/games/:id/play` / `/my/games/:id/edit` の既存導線は維持しつつ、削除済みゲームは表示・操作対象から除外
- ノード削除MVP・シーン削除MVPの既存挙動は維持

### 今後の課題
- ゲームエディタ edit画面の情報設計・ボタン配置見直し
	- 機能追加に伴いボタン/設定項目が増え、見通しが悪化
	- 削除ボタンの操作対象が分かりにくい箇所があり、誤認リスクがある
	- 特に「選択肢追加」付近の赤い削除ボタンが、選択肢削除と誤認される可能性がある
	- 観点: セクション見出し強化、危険操作ボタン配置ルール、削除対象の明示、右ペイン整理、折りたたみ/タブ/グルーピング、プレビューと編集フォームの視線整理
	- 今回は課題記録のみで、大規模UI刷新は行わない

### 実行した確認
- `pnpm -w build`: ✅ exit 0
	- 既知 warn のみ（`@nuxt/icon` Nuxt 3 非互換、browserslist 古い、Node deprecation warning）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 2 files / 6 tests passed

### 今回未実行の確認と理由
- ブラウザ手動確認（削除導線の画面操作、公開一覧/詳細/プレイ反映、owner/非owner API 実確認）
	- 理由: この実行環境ではブラウザ手動E2Eを行っておらず、CLIでの build/test を優先

---

## 🔎 今回の確認メモ（2026-05-01 / NodePicker「シーン → ノード」二段階選択UI実装）

### 実装した内容
- フロント（`apps/frontend/components/game/NodePicker.vue`）
  - 左右2カラムのモーダルUIに刷新
    - 左ペイン: シーン一覧（Scene番号・名前・ノード数・現在シーンラベル）
    - 右ペイン: 選択中シーンのノード一覧（Node番号・本文プレビュー・選択中ラベル）
  - 初期選択シーン: `currentSceneId` → `currentId` を含むシーン → 先頭シーン の優先順
  - 検索欄に文字を入力すると全シーン横断検索モードに切り替わり、シーン名・本文・node id をキーに横断検索
  - 検索クリア時は選択中シーンのノード一覧に戻る
  - 空状態: 「シーンがありません」「このシーンにはノードがありません」「一致するノードがありません」
  - props は `scenes` / `currentSceneId` / `currentId` ベースを維持
  - `game` prop 依存に戻さず、`nodePickerScenes` computed の構造を維持
  - 前回修正の stale state 対策（現在シーンのノードは `nodes.value` を使用、他シーンは `game.value.scenes[].nodes`）を維持
- `edit.vue` は変更なし（`nodePickerScenes` computed・NodePicker 呼び出しは現状維持）

### 既存機能への影響
- nextNodeId 選択・choice `targetNodeId` / `alternateTargetNodeId` 選択・`@select` emit・`@close` emit は変更なし
- ノード追加直後の反映・ノード削除後の反映・シーン削除後の反映は `nodePickerScenes` computed に依存しており維持

### 実行した確認
- `pnpm -w build`: ✅ exit 0
- `pnpm -C apps/frontend test`: ✅ exit 0（2 files / 6 tests passed）

### 今回未実行の確認と理由
- ブラウザ手動確認（各項目）
  - NodePickerを開くと現在シーンが初期選択される
  - 左のシーンを選ぶと右のノード一覧が切り替わる
  - 他シーンのノードを nextNodeId / choice 通常遷移 / choice 特殊遷移に指定できる
  - ノード追加直後・削除後の一覧反映
  - 検索の全シーン横断・結果からの選択・クリア後の復帰
  - 理由: この実行環境ではブラウザ手動E2Eを実施しておらず、CLI の build/test を優先したため

---

## 🔎 今回の確認メモ（2026-05-01 / NodePicker stale state 修正・他シーン候補維持の補正）

### 実装した内容
- ドキュメント
	- `docs/PROJECT_SPEC.md` のドメインモデル欄に残っていた古い `GameChoice { ..., order, nextNodeId? }` 表記を現行 schema に合わせて修正
	- `GameChoice { id, nodeId(FK), label, targetNodeId, condition?, effects?, alternateTargetNodeId?, alternateCondition? }` に更新
	- 既存の `GameChoice.targetNodeId` required / `''` 暫定運用 / nullable化検討の記述とは矛盾しない状態を維持
- フロント（`apps/frontend/components/game/NodePicker.vue`）
	- NodePicker の候補生成元を `game.scenes` 依存から `scenes` props 依存へ変更
	- `currentSceneId` を受け取り、現在シーンの候補が分かる表示を追加
	- 候補表示に `Scene番号: シーン名 / Node番号` と現在シーンラベルを追加
- フロント（`apps/frontend/pages/my/games/[id]/edit.vue`）
	- `nodePickerScenes` computed を追加し、現在シーンだけは常に最新の `nodes.value` をマージした `scenes` を NodePicker に渡すよう変更
	- NodePicker 呼び出しを `:scenes="nodePickerScenes"` / `:current-scene-id="scene?.id"` ベースへ変更
	- 次ノード表示ラベルと choice 遷移先表示ラベルも同じ最新データ源を参照するよう統一
	- 追加補正: `nodePickerScenes` は `scenes.value`（最新のシーン一覧）を基準にしつつ、他シーンの `nodes` は `game.value.scenes[].nodes` を補助データ源としてマージ
	- 追加補正: 現在シーンの `nodes` は常に `nodes.value` で上書きし、ノード追加/保存/削除直後の即時反映を維持
	- 追加補正: `scenes.value` 更新時に `game.value.scenes` を同じ方針で同期し、削除済みシーンを NodePicker 候補から除外しつつ他シーン候補を保持

### この修正で狙っている状態
- ノード追加直後に NodePicker を開くと、追加したノードが候補に表示される
- 「保存して次のノードへ」で作成されたノードが NodePicker に表示される
- ノード削除後、削除済みノードが NodePicker 候補に残らない
- シーン切り替え後、現在シーンの候補が最新 `nodes.value` ベースで表示される
- シーン削除後、削除済みシーン内ノードが NodePicker 候補に残らない
- 他シーンノードも NodePicker 候補として表示・選択できる（nextNode / choice 通常遷移 / choice 特殊遷移）

### 残課題
- NodePicker のキーボード操作（矢印キー移動・Enter確定）
- NodePicker の詳細プレビュー（選択前に本文や遷移先を把握しやすくする表示）
- NodePicker 二段階選択UIの使い勝手改善（フォーカス遷移・スクロール位置保持など）

### 実行した確認
- `pnpm -w build`: ✅ exit 0
	- 既知 warn のみ（`@nuxt/icon` Nuxt 3 非互換、browserslist 古い、Node の deprecation warning）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 2 files / 6 tests passed
- VS Code errors check（`NodePicker.vue`, `edit.vue`, `PROJECT_SPEC.md`）: ✅ no errors

### 今回未実行の確認と理由
- ブラウザ手動確認
	- ノード追加直後に NodePicker を開いたときの候補反映
	- 「保存して次のノードへ」後の候補反映
	- ノード削除後・シーン切替後・シーン削除後の候補更新
	- 通常 nextNode / choice 通常遷移 / choice 特殊遷移での実操作確認
	- 理由: この実行環境ではブラウザ操作の手動 E2E までは実施しておらず、今回はコード修正と build/test 検証を優先したため

---

## 🔎 今回の確認メモ（2026-05-01 / ゲームエディタのノード削除・シーン削除MVP実装）

### 実装した内容（MVP）
- API（`apps/api/src/games`）
	- ノード削除 `DELETE /games/nodes/:nodeId` を拡張
		- ノード未存在: `404`
		- owner 以外: `403`
		- 削除前に参照解除を明示実行
			- `GameScene.startNodeId == nodeId` → `null`
			- `GameNode.nextNodeId == nodeId` → `null`
			- `GameChoice.targetNodeId == nodeId` → `''`（※ schema 上 required のため null 不可）
			- `GameChoice.alternateTargetNodeId == nodeId` → `null`
	- シーン削除 `DELETE /games/scenes/:sceneId` を新規追加
		- シーン未存在: `404`
		- owner 以外: `403`
		- 最後の1シーンは削除不可（`400`）
		- 削除対象シーン内ノードを含めて削除（scene delete + cascade）
		- 削除前に外部参照を明示解除
			- `GameProject.startSceneId == sceneId` → `null`
			- `GameScene.startNodeId in sceneNodeIds` → `null`
			- `GameNode.nextNodeId in sceneNodeIds` → `null`
			- `GameChoice.targetNodeId in sceneNodeIds` → `''`
			- `GameChoice.alternateTargetNodeId in sceneNodeIds` → `null`
	- 削除確認用 summary API を追加
		- `GET /games/nodes/:nodeId/delete-summary`
		- `GET /games/scenes/:sceneId/delete-summary`
		- ノード/シーン削除前の参照件数を取得可能
- フロント（`apps/frontend/pages/my/games/[id]/edit.vue`）
	- ノード削除
		- 削除前確認ダイアログに参照件数（start/next/choice）を表示
		- 削除後に同一シーン内の別ノードを自動選択
		- ノードが0件になった場合「ノードなし」を表示
	- シーン削除
		- シーン一覧に削除ボタンを追加
		- 削除前確認ダイアログに削除ノード数・外部参照件数を表示
		- 最後の1シーン時は削除ボタンを disabled 化し理由表示
		- 削除後に別シーンを自動選択
- フロント API ラッパ（`apps/frontend/composables/useGames.ts`）
	- `delScene`
	- `getNodeDeleteSummary`
	- `getSceneDeleteSummary`

### 既存機能への影響
- シーン作成・ノード作成・ノード選択・nextNode選択・choice遷移先選択・start設定・テストプレイ・公開ゲーム導線は既存 API/画面構成を維持

### 残課題
- ゲーム削除導線（UI/確認/参照整合）は実装済み（2026-05-01）
- 手動E2E（owner/非owner/公開画面の実ブラウザ確認）は未実施
- `GameChoice.targetNodeId` は schema が required のため、解除値として `''` を採用
	- 将来、nullable 化 or 明示的な「未設定」表現へ移行検討

### 実行した確認
- `pnpm -w build`: ✅ exit 0
	- 既知 warn のみ（`@nuxt/icon` Nuxt 3 非互換, browserslist 古い）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 2 files / 6 tests passed

### 今回未実行の確認と理由
- owner が実際にノード/シーン削除できることのブラウザ手動確認
	- 理由: 本作業では CLI の build/test を優先し、ブラウザ手動E2Eは未実施
- 非ownerの削除拒否（403）の実API叩き確認
	- 理由: 複数ユーザーセッションを使った統合確認をこの実行環境で行っていないため
- 公開ゲーム一覧/詳細/プレイの実ブラウザ回帰確認
	- 理由: コード変更は編集画面・games API の削除系中心であり、今回は自動テストとビルド検証を優先

---

## 🔎 今回の確認メモ（2026-05-01 / 公開ギャラリー未ログイン時の/favorites呼び出し抑止）

### 仕様固定（公開アセットギャラリー）
- 未ログインユーザー:
	- `/assets` は閲覧可能
	- 公開一覧取得として `/search/assets` は実行
	- `/favorites` は呼ばない
	- 一覧上の `isFavorited` は `false` 扱い
	- お気に入りボタン押下時のみ既存のログイン誘導を利用
- ログイン済みユーザー:
	- `/search/assets` で公開一覧を取得
	- `/favorites` でお気に入り状態を取得
	- `isFavorited` 反映とお気に入りトグルは既存挙動を維持

### 実装反映
- `apps/frontend/pages/assets/index.vue` で `performSearch()` のお気に入り付与処理を分岐
- `useSupabaseClient().auth.getSession()` によるログイン判定を追加
- 未ログイン時は `api.applyFavorites(base)` を呼ばず、`base.map(...isFavorited: false)` を適用
- ログイン済み時のみ従来どおり `api.applyFavorites(base)` を実行
- `api-auth.client.ts` の 401 リダイレクト処理と `/favorites` API の認証要件は変更なし

### 実行した確認
- `pnpm -w build`: ✅ exit 0
	- 既知警告のみ（`@nuxt/icon` Nuxt 3 非互換、browserslist 更新推奨）
- `pnpm -C apps/frontend test`: ✅ exit 0（2 files / 6 tests passed）

### 今回未実行の確認と理由
- ブラウザ手動確認（未ログインで `/assets` 表示時に `/login` へ遷移しないこと）
	- 理由: この実行環境ではブラウザを使った画面遷移の手動観測を実施していないため
- ブラウザ開発者ツールでのネットワーク確認（未ログイン時に `/favorites` が発火しないこと）
	- 理由: CLI 実行中心の検証で、ネットワークタブの実測は未実施のため
- 手動の機能確認（未ログイン/ログイン済みで favorite 表示・トグル導線が従来どおりか）
	- 理由: 今回はコード修正 + ビルド/テスト検証を優先し、手動E2Eを未実施のため

---

## 🔎 今回の確認メモ（2026-05-01 / ゲームエディタ管理性改善タスクの設計追記）

### 仕様整理
- 今回は機能実装を行わず、ゲームエディタの将来課題を `PROJECT_SPEC.md` とこの `ROADMAP.md` に記録した
- （当時の記録）現状のゲーム制作機能にはシーン・ノード編集基盤がある一方、**ゲーム削除 / シーン削除 / ノード削除**の管理導線、参照切れ警告、シーン管理表示は今後の整備対象と整理した
- NodePicker の **シーン → ノード** 二段階選択UIは後続で実装済みとなり、現在は操作性改善タスクを中心に整理している

> 注: ノード削除MVP・シーン削除MVPは後続作業で実装済み。現時点の残課題はゲーム削除導線と削除仕様の細部整理。

### 追記した論点
- P1（当時メモ）: ゲーム・シーン・ノード削除
	- 現在地: ノード削除MVP・シーン削除MVPは実装済み、ゲーム削除導線が残課題
	- 削除前確認
	- owner 限定操作
	- `startSceneId` / `startNodeId` / `nextNodeId` / choice 遷移先 `nodeId` / その他参照フィールドの整合確保
	- ノード削除時の参照件数警告
	- ソフトデリート / 物理削除 / 関連参照解除の設計比較
- P1: シーンラベル・シーン管理性改善
	- `GameScene.name` の活用、必要なら `label` / `title` 追加を将来課題化
	- 章・場面・管理ラベルとして一覧や picker で見分けやすくする
- P1（更新後）: NodePicker 二段階UIの操作性改善
	- キーボード操作（矢印キー移動・Enter確定）
	- 詳細プレビュー（選択前に本文や遷移先を確認）
	- 必要に応じた使い勝手改善（フォーカス遷移・スクロール保持）
- P2: ノード参照切れ警告・到達不能ノード検出
- P2以降: フローチャート表示

### 実行した確認
- `docs/PROJECT_SPEC.md` / `docs/ROADMAP.md` / `docs/HANDBOOK.md` を照合し、既存のゲーム制作仕様と用語の矛盾がないことを確認

### 今回未実行の確認と理由
- `pnpm -w build`
	- 理由: 今回はドキュメント更新のみで、実装コードやビルド対象に変更がないため
- `pnpm -C apps/frontend test`
	- 理由: 挙動変更を伴わないため、ドキュメント更新に対する直接の実行確認対象がないため

---

## 🔎 今回の確認メモ（2026-05-01 / 公開プレイ画面 セーブ・ロードUX入口判定補正）

### 仕様固定（公開ゲームMVPの追加補正）
- 未ログインユーザー:
	- 公開ゲームのプレイは可能
	- SAVE/LOAD ボタンは表示
	- SAVE/LOAD ボタン押下時点でモーダルを開かず、API を呼ばず、`セーブ・ロードにはログインが必要です。` を通知
- ログイン済み非ownerユーザー:
	- 公開ゲームのプレイは可能
	- SAVE/LOAD ボタンは表示
	- SAVE/LOAD ボタン押下時点でモーダルを開かず、API を呼ばず、`このゲームのセーブ・ロードは現在、作者本人のみ利用できます。` を通知
- ownerユーザー:
	- 既存どおり save/load API を利用可能
	- 既存の編集・テストプレイ導線を維持

### 実装反映
- `apps/frontend/pages/games/[id]/play.vue` でセーブ/ロードの共通アクセス判定を追加
- `openSaveLoadModal(mode)` の先頭で `ensureSaveLoadAccess()` を実行し、未ログイン/非ownerは即 return（モーダル非表示・セーブ一覧API未実行）
- `useSupabaseClient().auth.getSession()` で取得した `currentUserId` と `game.ownerId` を比較して owner 判定
- セーブ/ロード（および関連するセーブ一覧取得・削除）で同一ガードを使い、未ログイン/非ownerでは API 呼び出しを抑止し、文言を統一

### 将来課題
- プレイヤーごとのセーブデータ設計（owner限定ではなく、公開ゲームのプレイヤー単位で保存スコープを分離する設計）が未着手

### 実行した確認
- `pnpm -w build`: ✅ exit 0
	- 既知警告のみ（`@nuxt/icon` Nuxt 3 非互換、browserslist 更新推奨）
- `pnpm -C apps/frontend test`: ✅ exit 0（2 files / 6 tests passed）

### 今回未実行の確認と理由
- 手動ブラウザ確認（未ログイン/非owner/owner の3パターンで公開プレイ画面を実操作）
	- 理由: 今回は CLI でのビルド・テスト検証を優先し、ブラウザ手動E2Eは未実施
- API 呼び出しの実測確認（未ログイン/非owner押下時に save 一覧 API がネットワーク発火しないことのブラウザ開発者ツール確認）
	- 理由: この実行環境ではブラウザ手動観測まで実施していないため

---

## ✅ 実装済み

### アセット管理
- アップロード（画像・音声）、タグ・説明・primaryTag
- 公開ギャラリー表示（`/search/assets` API 経由で q / contentType / primaryTag / tags / sort を反映、Meilisearch 障害時は Prisma フォールバック）
- サムネイル自動生成（512px、AVIF/WebP 対応）
- 署名付き GET（期限切れ自動復旧）
- ソフトデリート（`deletedAt` + `purge` キューで遅延物理削除）
- お気に入り（登録・解除・一覧）

### キャラクター管理
- キャラクター作成・編集・公開切替
- 立ち絵画像管理（感情ラベル・パターン・表示ラベル・sortOrder）
- ドラッグ＆ドロップ並び替え
- 立ち絵拡大プレビュー（ライトボックス）
- お気に入り
- キャラクター削除: ソフトデリート（`remove`）/ 画像ハードデリート（`removeImage`）で整理済み

### ゲームエディタ
- シーン・ノード作成・編集・削除
	- ノード削除MVP: 実装済み（削除前確認・参照件数表示・参照解除・削除後の選択維持）
	- シーン削除MVP: 実装済み（最後の1シーン削除禁止・削除前確認・参照解除・削除後の選択維持）
	- ゲーム削除導線: 実装済み（`/my/games` から削除確認付きで soft delete）
- シーンラベル・シーン管理性改善MVP: 実装済み
	- `GameScene.name` をシーンラベルとして活用（DB変更なし）
	- 左ペインのシーン一覧にScene番号・シーン名・ノード数を表示
	- 選択中シーンの名前を入力欄で編集可能（`PATCH /games/scenes/:sceneId` で永続化）
	- シーン名が空の場合は `Scene N` フォールバック表示
	- シーン名変更後、シーン一覧・NodePicker・`findNodeLabel`（遷移先ラベル）に即時反映
	- `sceneNodeCount` computed でノード数をリアクティブに表示
- NodePicker の「シーン → ノード」二段階選択UI
	- 左ペインでシーンを選択
	- 右ペインで選択中シーンのノードを選択
	- 検索時は全シーン横断検索
	- 現在シーンの最新ノード反映と他シーン候補維持に対応
	- キーボード操作（検索欄初期フォーカス、`↑` / `↓` / `Enter` / `Esc`）に対応
	- 右ペイン下部に詳細プレビュー（所属シーン・Node情報・本文・選択肢数・nextNode設定有無・開始ノード表示）を追加
- ノードプロパティ: 台詞・話者キャラ・話者表記・背景・BGM・SE・カメラ・ビジュアルエフェクト
- 「前のセリフを消さずに続ける」（additive 表示）
- 選択肢（条件付き分岐・変数設定・ジャンプ先）
- カメラ演出（倍率・位置・アニメーション）
- ビジュアルエフェクト（揺れ・フラッシュなど）
- 開始ノード設定・ノードの色分け
- 複数立ち絵配置（`GameNode.portraits` Json 配列: characterId・imageId・座標・スケール・z 順）
- 画面全体カラーフィルター（`GameNode.colorFilter`: type・opacity・durationMs）

### ゲーム公開・共有フローMVP
- 公開ゲーム一覧 API（`GET /games`）を追加。`isPublic = true` かつ `deletedAt = null` のみ返却
- 公開ゲーム詳細 API（`GET /games/:id`）を未ログイン閲覧対応に整理（非公開は owner 以外に 404）
- 編集詳細 API（`GET /games/:id/edit`）を分離し、owner 専用の責務を明確化
- `GamesController` の guard を method-level に再設計（公開系: Optional、編集系: 必須認証）
- `/my/games` に公開/非公開トグル UI を追加（切替中状態・失敗時ロールバック付き）
- 公開ゲーム一覧ページ `/games` を追加（詳細リンク・プレイリンク・0件表示）
- 公開ゲーム詳細ページ `/games/[id]` を追加（作者表示・更新日表示・プレイ不可状態の明示）
- グローバルナビに `公開ゲーム` への導線を追加

### テストプレイ
- タイプライター演出・スキップ（クリックで全文表示）
- セーブ・ロード（手動 100 スロット・オート 5・クイック 1 / サーバーサイド永続化）
- バックログ（セッション内メモリ管理）
- 音声同意オーバーレイ
- **キーボード操作MVP**: Enter/Space で文章送り・全文表示、↑/↓/Enter で選択肢操作、数字キー 1～9 で選択肢直接選択、Esc でモーダル/バックログ/フルスクリーンを優先順に閉じる

### テーマ・UIカスタマイズ
- メッセージウィンドウ（8プリセット・色・フォント・縁取り・サイズ・上級設定）
- セーブ・ロード画面（プリセット・色・スロットカード）
- クイックボタン（LOG・SAVE・LOADの色、専用プレビュー付き）
- バックログ（プリセット・色・フォントサイズ）
- 文言設定（全ボタン・ラベルを世界観に合わせてカスタマイズ、7種の世界観プリセット）
- 全体テーマ一括設定

### インフラ・認証
- Supabase Auth（JWKS JWT 検証）
- MinIO（ストレージ）・Meilisearch（全文検索）
- BullMQ（サムネ生成・検索インデックス・purge キュー）

---

## 🚧 既知の課題・技術的負債

### 🔴 優先度高
- NodePicker の操作性改善（シーン一覧のキーボード操作・フォーカス設計・スクロール位置保持・キーボード操作と検索入力の干渉防止）
- ゲームエディタ edit画面の情報設計・ボタン配置見直し（危険操作の誤認防止）
- `GameChoice.targetNodeId` の nullable 化または未設定表現の整理が未着手
- target未設定の選択肢をプレイ時にどう扱うかの仕様整理が未着手

### 🟡 優先度中
- 非owner削除拒否（403）の実API確認が未実施
- 公開ゲーム一覧/詳細/プレイの回帰確認が未実施
- 到達不能ノード検出が未実装
- バックログからの場面ジャンプ未実装（変数スナップショットの設計が必要）
- キャラクター検索インデックス（Meilisearch）未実装（現在は Prisma で直接取得）
- E2E・ユニットテスト不足
- `@nuxt/icon` が Nuxt 3.x と非互換（>=4.0.0 要求）。まずは Nuxt 3 系でのバージョン固定・設定見直し・代替実装を優先し、Nuxt 4 移行は別途判断とする
- GitHub Actions は現状 best-effort（`.github/workflows/ci.yml` の build/typecheck が `|| echo "no build"` / `|| echo "no typecheck"`）で、厳密な品質ゲートとしては未整備

### 🟢 優先度低（警告レベル）
- browserslist / baseline-browser-mapping データが古い（動作には影響なし）
- `apps/api/src/main.ts` の起動ログ `console.log` は残存だが無害

---

## ✅ 解消済み課題（参考記録）

| 課題 | 解消確認日 |
|------|-----------|
| `play.vue` / `MessageWindow.vue` / `supabase-auth.guard.ts` に `console.log` 残存（JWT 出力含む） → 全削除済み | 2026-05-01 確認 |
| `prefixText` computed 内の `console.log` 残存 → 削除済み | 2026-05-01 確認 |
| `schema.prisma` の `thumbKeyWebp` / `thumbKeyAvif` インデント崩れ → 正常 | 2026-05-01 確認 |
| 公開ギャラリー検索の API 接続不整合（`/assets` 経由で検索条件未反映） → `/search/assets` 接続に統一し、Meilisearch 障害時は Prisma フォールバックを追加 | 2026-05-01 確認 |
| ゲーム公開・共有フロー未実装（公開一覧/公開詳細/UI導線欠如） → 公開一覧API・公開詳細API・`/games`・`/games/[id]`・公開切替UIを実装 | 2026-05-01 確認 |

---

## 🎯 次にやるべき作業（優先度付き）

### P0 — 必須（公開前ブロッカー）

#### ゲーム公開・共有フロー（MVP後の残件）
- 公開一覧の並び替え・検索（MVPでは未対応）
- 作者プロフィールページ連携（MVPでは ownerId 表示のみ）
- 公開ゲームのランキング/プレイ数集計（MVP対象外）
- 403/404時のUX統一（現状はページ別に個別メッセージ）

### P1 — 品質向上（次の作業候補）

#### 削除系の残課題（ノード/シーンMVP後）
ノード削除MVP・シーン削除MVPは実装済み。次は削除系の残仕様を整理する。
- `GameChoice.targetNodeId` の nullable 化、または明示的な未設定表現を設計する
- target未設定の選択肢をプレイ時にどう扱うか（停止/スキップ/エラー表示）を仕様化する
- 非ownerのゲーム削除拒否（403）を含む削除系APIの手動実操作確認を行う
- 公開ゲーム一覧/詳細/プレイの回帰確認を行う

#### シーンラベル・シーン管理性改善
実装済み（2026-05-02）。残る将来課題は以下。
- シーンのドラッグ＆ドロップ並び替え
- シーン説明文フィールド（`GameScene.description`）
- シーンサムネイル
- フローチャート表示
- シーン一覧カード内の inline rename（その場編集）
- シーン名編集の導線改善（鉛筆アイコン / 名前変更ボタン方式）

#### NodePicker 二段階UIの操作性改善
「シーン → ノード」の二段階選択UIは実装済み。右ペイン（ノード一覧）の `↑` / `↓` / `Enter` / `Esc` キーボード操作も実装済み。今後は操作性をさらに改善する（P2/P3 候補）。
- シーン一覧（左ペイン）のキーボード操作
- `←` / `→` または `Ctrl+↑` / `Ctrl+↓` によるシーン切り替え
- Tab 移動時のフォーカス設計
- スクロール位置保持
- キーボード操作と検索入力の干渉防止

#### キャラクター Meilisearch インデックス
現在はキャラクター検索が Prisma 直取得。アセットと同様に Meilisearch でインデックス化する。

#### `@nuxt/icon` の互換問題を解消
まずは Nuxt 3 系で使える `@nuxt/icon` のバージョン固定・設定見直し・代替実装を優先する。
Nuxt 4 移行は別タスクとして影響範囲を評価したうえで判断する。

### P2 — プレイ体験向上（優先度中）

#### edit画面 情報設計v2
機能追加で増えた設定項目を整理し、制作中の見通しと誤操作耐性を高める。
- まずは右ペイン内のセクション化MVPから着手する
- セクション見出し・表示/非表示切り替え・危険操作の独立配置を段階的に適用する
- この段階では全面的なデザイン刷新や3ペイン構造の変更は行わない

#### 右ペインのセクション化MVP
既存の編集フローを維持したまま、右ペインの情報をカテゴリ別に整理する。
- 分類案: 基本情報 / 表示・素材 / 遷移・分岐 / 演出 / プレビュー / 危険操作
- 危険操作は通常操作と分離し、削除対象を文言で常時明示する
- 保存・プレビュー・NodePicker・削除機能の既存動作を壊さないことを前提に進める

#### ノード参照切れ警告・到達不能ノード検出
ノード削除や分岐編集に伴う整合崩れを減らすため、参照切れ警告と孤立ノード検出を追加する。
- ノード削除前に参照元件数を集計して警告する
- 保存時または一覧表示時に、どこからも到達できないノードを検出する
- 将来的な削除導線と合わせて管理画面に表示する

#### ゲームプレイ画面のキーボード操作

> 注: 下記の MVP 案は 2026-05-01 時点の将来課題メモ。後続作業（2026-05-01 ゲームプレイ画面キーボード操作MVP実装）で**実装済み**。✅ 実装済みセクションのテストプレイ欄を参照。

残課題（キーボードMVP実装後）:
- キーコンフィグ（Enter/Space/矢印キーのリマップ）
- AUTO / Skip 機能
- プレイヤーごとのセーブデータ設計
- スマホ/タブレット向けプレイ操作最適化

#### AUTO 再生機能
テキスト表示完了後に自動で次のノードへ進む。速度調整も可能にする。
- 難易度: 低

#### スキップ機能（既読高速送り）
既読ノードを高速スキップ。未読に差し掛かったら自動停止。
- 難易度: 中（既読フラグの管理が必要）

#### バックログからの場面ジャンプ
バックログのエントリをクリックしてその時点に戻る。
- 難易度: 高（変数スナップショットが必要）

### P3 — 構造改善（中長期）

#### 折りたたみ状態の保存
edit画面の各セクションの開閉状態を保存し、再訪時の作業再開をしやすくする。
- 初期候補は localStorage 保存
- よく使うセクションは初期展開、高度な設定は初期折りたたみを検討する

#### 設定項目のコンポーネント分割
右ペインの責務を段階的に分割し、保守性と拡張性を高める。
- 既存挙動を維持しながら、小さい単位で分割を進める
- 分割時も保存・プレビュー・NodePicker・削除機能の回帰を必須にする

#### 3ペイン構造そのものの再設計（P3以降）
レイアウトの根本見直しは別設計として扱い、情報設計v2とは分離して計画する。
- 現行3ペインの大規模変更は、右ペイン内のセクション化と回帰確認が安定した後に検討する

#### スマホ/タブレット向けゲーム編集体験の再設計
主要機能が一通り揃った後に、編集画面全体のレスポンシブ/タッチ最適化として検討する。
- PC向け3ペイン編集画面は、そのまま縮小するだけではスマホ操作に不向き
- スマホ/タブレットではタッチ操作・画面幅・プレビュー表示・NodePicker・削除確認の再設計が必要
- スマホでは「シーン一覧 / ノード一覧 / 編集フォーム / プレビュー / テストプレイ」をタブまたはステップ表示に分ける構成を検討
- タブレットではPCに近い2ペイン/簡易3ペインを検討
- PC向けUIとスマホ向けUIの完全共通化は前提にしない
- 実装優先度は P3 以降（または主要機能が一通り揃った後）

#### キーボードショートカットの高度な設定・キーコンフィグ
ゲームプレイ画面・ゲームエディタの双方でキー割り当てをカスタマイズできるようにする。
- プレイヤーが `Enter`/`Space`/矢印キー等を好みにリマップできる設計を検討
- NodePicker やエディタショートカットのキーコンフィグも将来的に整理
- 実装前提として、各ショートカットが定義として一元管理されている状態が必要
- 実装優先度は P3 以降（ゲームプレイキーボード操作MVPが安定した後）

---

## 📋 実装予定・検討中の機能

### 🎬 演出・ビジュアル系

#### キャラクターの登場・退場演出
フェードイン・フェードアウト・スライドインなどをノードプロパティで設定できるようにする。
- 難易度: 中

#### 揺れエフェクトなどの永続化
現在のビジュアルエフェクトはノード単位でリセットされるが、永続エフェクトを別レイヤーで管理する。
- 難易度: 中
- 検討点: 永続エフェクトを解除するノードの設定方法

#### 任意位置への画像・アニメーション表示
画面の任意位置に日付テロップ・アイテム画像・エフェクト画像などを表示・アニメーションさせる。
- 難易度: 高
- 検討点: キャラクターとして扱う運用で代替可能か要評価

#### 人物のシルエット表示
立ち絵に黒い overlay を被せてシルエット化する。
- 難易度: 低〜中（CSS `brightness(0)` または Canvas 描画処理）

### 🎮 プレイ体験系

#### AUTO 再生機能
テキスト表示完了後に自動で次のノードへ進む。速度調整も可能にする。
- 難易度: 低

#### スキップ機能
既読ノードを高速スキップ。未読に差し掛かったら自動停止。
- 難易度: 中（既読フラグの管理が必要）

#### バックログからの場面ジャンプ
バックログのエントリをクリックしてその時点に戻る。
- 難易度: 高（変数スナップショットが必要）

### 🖼️ キャラクター・アセット系

#### メッセージウィンドウへの顔アイコン表示
話者キャラの立ち絵から顔部分を切り抜いてウィンドウ横に表示する。
- 難易度: 中〜高
- 検討点: `CharacterImage` に `faceRect: { x, y, w, h }` を追加する設計が現実的

#### キャラクターの顔切り抜き機能
キャラ編集画面で立ち絵から顔領域を指定してサムネ化。顔アイコン機能の前提。
- 難易度: 中

### 🎨 エディタ・制作ツール系

#### 選択肢デザインのカスタマイズ
選択肢ボタンの色・フォント・形状をシナリオ全体設定で変更できるようにする。
- 難易度: 低〜中（`GameUiTheme` に選択肢テーマを追加）

#### シナリオのテキストエクスポート・インポート
シナリオをCSV・JSON等でエクスポートし、一括編集後にインポートできる。
- 難易度: 中

#### シナリオのフローチャート表示
ノードとその繋がりをビジュアルで確認できる。
- 難易度: 高（グラフ描画ライブラリの導入）
- 優先度: P2以降（削除導線・参照警告・シーン管理性改善の後）

#### タイトル画面の作成機能
ゲームにタイトル画面を追加し、背景・タイトルロゴ・開始ボタンを配置できる。
- 難易度: 中〜高

#### タイトル画像からサムネイル生成
タイトル画面の画像をゲームのサムネイルとして自動設定。
- 難易度: 低（既存の Worker を流用）
- 前提: タイトル画面機能の実装後

### 🌐 コミュニティ・プラットフォーム系

#### コメント機能
公開アセット・ゲームに対してコメントを投稿できる。
- 難易度: 中

#### ランキング機能
お気に入り数・コメント数・プレイ時間などを集計してランキング表示。
- 難易度: 中〜高（プレイ時間計測・集計バッチが必要）

---

## 💡 検討中のアイデア（優先度未定）

- BGM・SE のフェードイン／アウト（難易度: 低）
- ノードのコメント・メモ機能（難易度: 低）
- プレイ統計ダッシュボード（制作者向け）（難易度: 高）
- シナリオのバージョン管理（難易度: 高）
- ゲームのコレクション・プレイリスト機能（難易度: 中）
- 多言語対応 i18n（難易度: 高・要件整理が先）

---

## 📝 更新ルール（運用）

- **このファイルが進捗管理の正（single source of truth）**。ハンドオフ文書ではなくここを見れば現在地がわかる状態を保つ。
- 実装完了した項目は `📋 実装予定` から `✅ 実装済み` に移動する
- 解消した既知課題は `🚧 既知の課題` から削除し、`✅ 解消済み課題` テーブルに記録する
- 新しい課題を発見したら `🚧 既知の課題` に追記する
- 作業後は `最終更新` 日付と `🏗️ ビルド状態` 表を更新する
- 作業完了時の確認コマンドと、未実行の確認があればその理由をこのファイルに残す
- P0/P1/P2 の優先度は状況に応じて見直す

---

## 🔎 今回の確認メモ（2026-05-01 / ゲーム公開・共有フローMVP実装）

### 変更概要
- API:
	- `GET /games`（公開一覧）を追加
	- `GET /games/:id` を公開詳細（プレイ用途）として整理
	- `GET /games/:id/edit` を編集詳細（owner専用）として追加
	- `GamesController` を method-level guard へ移行し、公開系と編集系の認可境界を分離
- Frontend:
	- `/my/games` に公開/非公開トグルUIを追加
	- `/games` 公開一覧ページを追加
	- `/games/[id]` 公開詳細ページを追加
	- ナビゲーションに `公開ゲーム` リンクを追加

### 実行した確認
- `pnpm -w build`: ✅ exit 0
	- 警告のみ（`@nuxt/icon` Nuxt 3 非互換、browserslist 更新推奨）
- `pnpm -C apps/frontend test`: ✅ exit 0（2 files / 6 tests passed）

### 今回未実行の確認と理由
- 手動ブラウザ確認（未ログイン/owner/非ownerの全導線）
	- 理由: 本作業ではCLIでのビルド・テスト検証を優先し、ブラウザ手動E2Eは未実施

### 残課題・リスク
- 公開一覧はMVPとして `limit/offset` のみで、検索・並び替えUIは未実装
- 非公開ゲームアクセス時のエラーメッセージはページ単位で差があり、統一余地あり

---

## 🔎 今回の確認メモ（2026-05-01 / ROADMAP整合更新）

### 実行した確認
- ドキュメント整合確認: PowerShell `Select-String` で `docs/ROADMAP.md` / `README.md` / `docs/README.md` / `docs/workflow.md` の古い記述と新しい導線を確認
- Prisma 利用箇所確認: PowerShell `Select-String` で `apps/api/src/characters/characters.service.ts` と `apps/api/scripts/*.mjs` の `new PrismaClient` 使用箇所を確認
- 現行 scripts 確認: `package.json` / `apps/api/package.json` / `apps/frontend/package.json` / `apps/worker/package.json` を参照
- 公開ギャラリー接続確認: `apps/frontend/composables/useAssets.ts` の `listPublic -> /assets`、`apps/api/src/assets/dto/query-assets.dto.ts` の受け付け項目、`apps/api/src/search/search.controller.ts` の Meilisearch 検索 API (`/search/assets`) を照合
- ゲーム公開 API / guard 確認: `apps/api/src/games/games.controller.ts` の class level `SupabaseAuthGuard` と `GET /games/:id` の method level `OptionalSupabaseAuthGuard` の併用状態を確認
- CI 設定確認: `.github/workflows/ci.yml` の build/typecheck が best-effort（失敗時 `echo`）であることを確認

### 今回未実行の確認と理由
- `pnpm -w build`: ドキュメント修正のみでコード変更がなく、今回の目的は記述整合の是正だったため未実行
- `pnpm -C apps/frontend test`: ドキュメント修正のみで挙動変更がなく、README / workflow の運用更新に対する直接的な検証対象ではないため未実行

### 追記方針
- 本更新では機能実装は行わず、現コードとの差分を ROADMAP の「実装済み / 既知課題 / 次タスク」に反映した

---

## 🔎 今回の確認メモ（2026-05-01 / 公開ギャラリー検索接続修正）

### 変更概要
- フロント公開ギャラリーの API 接続を `listPublic -> /search/assets` に変更
- `GET /search/assets` に Meilisearch 失敗時の Prisma フォールバックを追加
- 検索条件 `q / contentType / primaryTag / tags / sort` を Prisma 側でも反映する条件式を実装
- `GET /search/assets` の DB 取得時に `deletedAt: null` を追加し、削除済みの混入を防止

### 実行した確認
- `pnpm -w build`: ✅ exit 0
	- 既知警告: `@nuxt/icon` の Nuxt 3 非互換警告、browserslist 系データ更新警告
- `pnpm -C apps/frontend test`: ✅ exit 0（2 files / 6 tests passed）

### 今回未実行の確認と理由
- `/assets` 画面での手動確認（検索条件変更・クリア・お気に入りトグル・署名URL表示）
	- 理由: この作業ではブラウザ起動済みの実画面 E2E 確認を実施していないため。ビルド・テストは成功

### 残課題・リスク
- Meilisearch インデックス未同期時はフォールバックで一覧取得できるが、Meili 検索時と完全一致しない検索順位になる場合がある

---

## 🔎 今回の確認メモ（2026-05-01 / 公開ギャラリー検索 追加確認・補正）

### 調査結果（5点確認）

#### 1. Asset の公開条件
- Asset モデルに `isPublic` / `visibility` / `status` フィールドは存在しない
- `deletedAt: null` が唯一かつ正しい公開フィルタ（既存 `/assets` findAll と同一仕様）
- Character・GameProject の `isPublic` とは無関係
- **結論**: `deletedAt: null` は要件を満たしており、追加修正不要

#### 2. `req.user` のフィールド統一（`userId` vs `sub`）
- `SupabaseAuthGuard` と `OptionalSupabaseAuthGuard` の両方が `request.user = { userId: payload.sub, email }` をセット
- `req.user?.userId` は正しい。`req.user?.sub` は存在しないフィールドで旧コードのバグだった
- 旧 `searchMyAssets` が `req.user?.sub` を使っていたため、ログイン時も owner フィルタが undefined になっていた
- **修正内容**: 全検索 API で `req.user?.userId` に統一済み（前回修正で既に対応）

#### 3. ページング互換
- フロント `/assets` 画面は `offset / total` ベースで動作（`ref(0)` + `ref(0)` + `assets.value.length < total`）
- 旧 `/assets` の返す `{ items, nextCursor }` と比べ、`total` が undefined になり「もっと見る」が非表示になっていた（旧来バグ）
- `/search/assets` の `{ items, limit, offset, total }` は完全に適合しており、ページングが正しく動作する
- **結論**: フロント修正不要

#### 4. `searchMyAssets` の Meilisearch 利用
- 前回変更で `searchMyAssets` が Prisma 固定になっていたのは意図しない変更だった
- **修正内容**: `searchWithMeiliAndFallback` 共通メソッドを抽出し、`searchMyAssets` も Meilisearch 優先 + Prisma fallback に戻した
- `searchMyAssets` は `owner: userId`（実際の userId）を dto に設定して呼び出す方式に変更。`owner: 'me'` の特殊ケース処理をバイパスして安全に実装

#### 5. Prisma fallback の sort 対応
- UI が送る sort 値: `createdAt:desc`（デフォルト）と `createdAt:asc` の 2 種のみ
- `parseSort` は両方に対応済み。未知の値は `createdAt: 'desc'` にデフォルト化
- Meilisearch 正常時 / fallback 時で sort の挙動は同一
- **結論**: 追加修正不要。sort 未対応値は安全にデフォルト化されている

### 変更概要（追加補正）
- `searchWithMeiliAndFallback` private メソッドを導入し、`searchAssets` と `searchMyAssets` の Meilisearch + Prisma fallback 処理を統一
- `searchMyAssets` を Meilisearch + Prisma fallback 構成に修正（前回の Prisma 固定を是正）

### 実行した確認
- `pnpm -w build`: ✅ exit 0（既知警告のみ）
- `pnpm -C apps/frontend test`: ✅ exit 0（2 files / 6 tests passed）

### 今回未実行の確認と理由
- `/assets` 画面での手動確認（ブラウザを起動した実画面確認）: この作業ではブラウザ画面の直接操作は未実施。ビルド・テストは通過
- 非公開アセットの境界テスト（実際に非公開アセットを作成して漏洩確認）: Asset に `isPublic` がないため、全非削除アセットが公開扱いになる設計上の前提として対象外

### 残課題・リスク
- **任意 owner 指定のアクセス制御**: `GET /search/assets?owner=userId` は未認証ユーザーが任意 userId のアセットを取得できる。これは旧 `GET /assets?ownerId=xxx` と同一の既存仕様であり、Asset に `isPublic` がない設計に由来する。将来 Asset に `isPublic` を追加する場合は、Meilisearch filter と Prisma fallback の両方に反映が必要
- **Meilisearch インデックス未同期**: fallback 時は Prisma LIKE 検索のため、Meilisearch 時より全文検索の精度・速度が下がる可能性がある
