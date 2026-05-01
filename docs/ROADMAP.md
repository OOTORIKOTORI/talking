# Talking 開発ロードマップ

> 最終更新: 2026-05-01（NodePicker stale state 修正・PROJECT_SPEC整合）
> 用途: **進捗管理の正ドキュメント**。作業完了のたびに更新すること。
> `docs/handoff.md` は旧メモ・補助資料。進捗同期はこのファイルを正とする。

---

## 🏗️ ビルド状態

| 日付 | 結果 | 備考 |
|------|------|------|
| 2026-05-01 | ✅ exit 0 | WARN: `@nuxt/icon` Nuxt 3.19.3 非互換（>=4.0.0 必要）、browserslist 7ヶ月古い（軽微） |

---

## 🔎 今回の確認メモ（2026-05-01 / NodePicker stale state 修正・PROJECT_SPEC整合）

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

### この修正で狙っている状態
- ノード追加直後に NodePicker を開くと、追加したノードが候補に表示される
- 「保存して次のノードへ」で作成されたノードが NodePicker に表示される
- ノード削除後、削除済みノードが NodePicker 候補に残らない
- シーン切り替え後、現在シーンの候補が最新 `nodes.value` ベースで表示される
- シーン削除後、削除済みシーン内ノードが NodePicker 候補に残らない

### 残課題
- NodePicker の本格的な「シーン → ノード」二段選択 UI は未実装
	- 将来課題として継続。今回は stale state 解消と候補同期の安定化を優先

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
- ゲーム削除導線（UI/確認/参照整合）は未実装（次タスク）
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
- NodePicker は将来的に **シーン → ノード** の二段選択を基本 UX にする方針を明記した

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
- P1: NodePicker のシーン別選択
	- 現在シーンを初期選択
	- シーン内ノードの優先選択
	- 全シーン横断検索の補助導線維持
	- ノード名・本文・シーンラベル検索
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
	- ゲーム削除導線: 未実装
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
- NodePicker のキーボード操作・詳細プレビュー未実装
- ゲーム削除導線が未実装
- `GameChoice.targetNodeId` の nullable 化または未設定表現の整理が未着手
- target未設定の選択肢をプレイ時にどう扱うかの仕様整理が未着手
- シーンラベル・シーン管理性の改善が未着手
- NodePicker の「シーン → ノード」二段選択が未着手

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
- ゲーム削除導線（UI/確認/参照整合）を実装する
- `GameChoice.targetNodeId` の nullable 化、または明示的な未設定表現を設計する
- target未設定の選択肢をプレイ時にどう扱うか（停止/スキップ/エラー表示）を仕様化する
- 非owner削除拒否（403）の実API確認を行う
- 公開ゲーム一覧/詳細/プレイの回帰確認を行う

#### シーンラベル・シーン管理性改善
シーンを章・場面・管理ラベルとして扱いやすくし、編集画面で分かりやすく表示する。
- 既存の `GameScene.name` を活用し、足りなければ `label` または `title` の追加を検討する
- 例: 第1章 / プロローグ / 森の入口 / バトル前 / エンディングA
- シーン一覧、NodePicker、遷移先表示で同じラベル体系を使う

#### NodePicker のシーン別選択
次ノード選択時は、全シーン横断の一段リストではなく「シーン → ノード」の二段選択を基本にする。
- 現在のシーンを初期選択する
- 選択したシーン内のノードを優先表示する
- 必要に応じて全シーン横断検索も残す
- ノード名・本文・シーンラベルで検索できるようにする
- 選択時に、どのシーンのどのノードへ遷移するか分かる表示にする

#### NodePicker キーボード操作
現在はマウス操作のみ。矢印キー + Enter で選択・確定できるようにする。

#### キャラクター Meilisearch インデックス
現在はキャラクター検索が Prisma 直取得。アセットと同様に Meilisearch でインデックス化する。

#### `@nuxt/icon` の互換問題を解消
まずは Nuxt 3 系で使える `@nuxt/icon` のバージョン固定・設定見直し・代替実装を優先する。
Nuxt 4 移行は別タスクとして影響範囲を評価したうえで判断する。

### P2 — プレイ体験向上（優先度中）

#### ノード参照切れ警告・到達不能ノード検出
ノード削除や分岐編集に伴う整合崩れを減らすため、参照切れ警告と孤立ノード検出を追加する。
- ノード削除前に参照元件数を集計して警告する
- 保存時または一覧表示時に、どこからも到達できないノードを検出する
- 将来的な削除導線と合わせて管理画面に表示する

#### AUTO 再生機能
テキスト表示完了後に自動で次のノードへ進む。速度調整も可能にする。
- 難易度: 低

#### スキップ機能（既読高速送り）
既読ノードを高速スキップ。未読に差し掛かったら自動停止。
- 難易度: 中（既読フラグの管理が必要）

#### バックログからの場面ジャンプ
バックログのエントリをクリックしてその時点に戻る。
- 難易度: 高（変数スナップショットが必要）

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
