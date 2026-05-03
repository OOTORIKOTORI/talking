# Talking 開発ロードマップ

> 最終更新: 2026-05-04（ゲームカバー画像選択UI MVP）
> 用途: **進捗管理の正ドキュメント**。作業完了のたびに更新すること。
> `docs/handoff.md` は旧メモ・補助資料。進捗同期はこのファイルを正とする。

---

## 📍 現在地サマリ（2026-05-04）

ゲーム制作機能の基盤が整い、MVP級の編集・公開・プレイが一通り動く状態。

**実装済み（主要）**
- アセットお気に入り数表示MVP（`favoriteCount` 表示、公開一覧/詳細、楽観更新+ロールバック）
- ゲーム制作・公開・共有フローMVP（公開一覧・API・公開切替・UI導線）
- ノード/シーン/ゲーム 削除MVP（削除前確認・参照解除・導線）
- NodePicker「シーン → ノード」二段階選択UI（キーボード操作・stale state修正・詳細プレビュー）
- シナリオチェックMVP（整合性チェック一覧・error/warning/info分類・対象ジャンプ）
- シナリオチェック追加MVP（空本文/空ラベル/表示可能選択肢0件/開始シーン以外のstartNodeId壊れ → warning）
- ゲーム公開前チェックMVP（フロント事前チェック + API最終防衛線。error時は公開ブロック・warning時は確認）
- 公開ゲーム一覧 `/games` 検索・並び替えMVP（`q` + `sort` + URL同期 + API側検索/ソート）
- 自作ゲーム管理 `/my/games` 検索・並び替え・公開状態フィルタMVP（`q` + `sort` + `status` + URL同期 + API側検索/ソート/フィルタ）
- 自作ゲーム管理 `/my/games` ゲーム複製MVP（owner限定、確認ダイアログ、複製後編集画面遷移）
- ゲーム基本情報編集MVP（`/my/games/:id/edit` で `title` / `summary` 編集、保存状態表示、複製後タイトル変更導線）
- ゲームカバー画像選択UI MVP（ゲーム全体設定 > 基本情報タブで `coverAssetId` 選択/解除、公開一覧/詳細・自作一覧への反映）
- 公開ゲーム閲覧数/プレイ数 集計MVP（`viewCount` / `playCount` + 明示カウントAPI + 一覧/詳細表示）
- 開始地点設定導線の拡張（ノード側に加えてシーン側から開始シーン設定）
- ゲームプレイ画面キーボード操作MVP（Enter/Space・↑/↓/Enter・数字キー・Esc）
- ゲームプレイ画面 BGMフェードMVP（停止フェードアウト・切替時直列フェード・同一BGM継続）
- 公開ギャラリー検索（/search/assets 接続、Meilisearch 障害時 Prisma fallback）
- 未ログイン公開ギャラリーで `/favorites` を呼ばない修正、公開ゲームのセーブ/ローUX補正
- シーンラベル・シーン管理性改善MVP（シーン名編集UI・一覧改善・NodePicker連携）
- ゲームエディタ edit画面の情報設計v2（右ペインセクション化MVP）
	- 通常表示・ノード全画面表示の両方に反映済み
	- セクション見出しと折りたたみ範囲を一致化
	- 危険操作を独立セクション化
	- 分類整理: キャラクター配置は「表示・素材」、カメラ/カメラ演出/ビジュアルエフェクト/カラーフィルターは「演出」
- 右ペインセクション開閉状態の localStorage 保存
	- キー: `talking.editor.rightPaneSections.v1`（現状は全ゲーム共通）
	- 通常表示/全画面表示で同じ開閉状態を共有
	- 保存値破損時は既定値にフォールバック、未定義キーは既定値で補完
- edit画面の最後の選択位置（シーン/ノード）の localStorage 保存・復元MVP
	- キー: `talking.editor.lastSelection.v1:${gameId}`（ゲームごとに分離）
	- シーン選択/ノード選択時に `sceneId` / `nodeId` を更新し、再訪時に復元
	- 保存済み scene/node が削除済み・不正な場合は安全にフォールバック
	- 右ペイン開閉状態保存（`talking.editor.rightPaneSections.v1`）とは別キーで共存

**直近の残課題（優先順）**
- アセット閲覧数 `viewCount` のMVP導入（`/assets/:id` のみカウント、一覧/管理画面は非対象）
- アセット使用数 `usedInGameCount` の定義と集計方針（公開/非公開、削除時扱い）
- アセット指標ソート・ランキング（お気に入り順/閲覧数順/使用数順/人気順）
- アセット指標の検索連携（タグ検索との複合、Meilisearch連携）
- 指標基盤強化（`favoriteCount` カラム化、ユニーク閲覧、イベントログ、作者ダッシュボード）
- NodePicker シーン一覧（左ペイン）のキーボード操作・フォーカス設計・スクロール保持
- edit画面プロパティフォームの共通コンポーネント化（通常表示/全画面表示の二重実装解消）
- 右ペインセクションの要約表示（閉じた状態での情報把握）の強化
- edit画面全体の本格的な情報設計v2
- スマホ/タブレット向け編集体験の再設計
- 3ペイン構造そのものの再設計
- キーコンフィグ・AUTO/Skip高度化・プレイヤーごとのセーブデータ設計
- 作業位置保存のリセット導線（例: 「最後の選択位置をリセット」）
- 公開ゲーム一覧の拡張（ページネーション / 無限スクロール / 人気順・プレイ数順 / タグ検索 / 作者検索）

---

## 🏗️ ビルド状態

| 日付 | 結果 | 備考 |
|------|------|------|
| 2026-05-01 | ✅ exit 0 | WARN: `@nuxt/icon` Nuxt 3.19.3 非互換（>=4.0.0 必要）、browserslist 7ヶ月古い（軽微） |
| 2026-05-02 | ✅ exit 0 | シーンラベル・シーン管理性改善MVP後。既知 WARN のみ（同上） |
| 2026-05-02 | ✅ exit 0 | 右ペインセクション化MVP後。既知 WARN のみ（同上） |
| 2026-05-02 | ❌ exit 1 | 右ペイン開閉状態 localStorage 保存後。`apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（ファイルロック） |
| 2026-05-02 | ✅ exit 0 | ゲーム別の作業位置復元MVP後。既知 WARN のみ（`@nuxt/icon` Nuxt 4要件、browserslist更新推奨、Nuxt依存deprecation） |
| 2026-05-02 | ✅ exit 0 (frontend only) | 作業位置復元MVPfrontend フォールバック強化後。pnpm -C apps/api build は EPERM (DLLロック) で失敗だがフロントエンドビルド・全テストは exit 0 |
| 2026-05-03 | ✅ exit 0 | 公開前チェックMVP後。`pnpm -w build` は成功（既知 WARN のみ） |
| 2026-05-03 | ✅ exit 0 | BGMフェードMVP後。`pnpm -w build` は成功（既知 WARN のみ） |
| 2026-05-03 | ✅ exit 0 (frontend only) | シナリオチェック追加MVP後。`pnpm -C apps/frontend build` は成功。`pnpm -w build` は `apps/api prisma:generate` で EPERM（DLLロック）のため frontend のみ確認。全テスト(4 files / 31 tests)は ✅ exit 0 |
| 2026-05-03 | ❌ exit 1 | 公開ゲーム一覧 検索・並び替えMVP後。`pnpm -w build` は `apps/api prisma:generate` で EPERM（DLLロック） |
| 2026-05-03 | ✅ exit 0 (frontend only) | 公開ゲーム一覧 検索・並び替えMVP後。`pnpm -C apps/frontend build` は成功（既知 WARN のみ） |
| 2026-05-03 | ✅ exit 0 | 公開ゲーム一覧 検索・並び替えMVP後。`pnpm -C apps/frontend test` は 4 files / 31 tests passed |
| 2026-05-03 | ❌ exit 1 | 公開ゲーム閲覧数/プレイ数MVP後。`pnpm -w build` は `apps/api prisma:generate` で EPERM（DLLロック） |
| 2026-05-03 | ❌ exit 1 | 公開ゲーム閲覧数/プレイ数MVP後。`pnpm -C apps/api build` も同様に `prisma:generate` で EPERM |
| 2026-05-03 | ✅ exit 0 (frontend only) | 公開ゲーム閲覧数/プレイ数MVP後。`pnpm -C apps/frontend build` は成功（既知 WARN のみ） |
| 2026-05-03 | ✅ exit 0 | 公開ゲーム閲覧数/プレイ数MVP後。`pnpm -C apps/frontend test` は 4 files / 31 tests passed |
| 2026-05-03 | ❌ exit 1 | アセットお気に入り数表示MVP後。`pnpm -w build` は `apps/api prisma:generate` の EPERM（DLLロック） |
| 2026-05-03 | ❌ exit 1 | アセットお気に入り数表示MVP後。`pnpm -C apps/api build` は `prisma:generate` の EPERM（DLLロック） |
| 2026-05-03 | ✅ exit 0 | アセットお気に入り数表示MVP後。`pnpm -C apps/frontend test` は 4 files / 31 tests passed |
| 2026-05-03 | ❌ exit 1 | `/my/games` 検索・並び替え・公開状態フィルタMVP後。`pnpm -w build` は `apps/api prisma:generate` で EPERM（DLLロック） |
| 2026-05-03 | ❌ exit 1 | `/my/games` 検索・並び替え・公開状態フィルタMVP後。`pnpm -C apps/api build` は `prisma:generate` で EPERM（DLLロック） |
| 2026-05-03 | ✅ exit 0 (frontend only) | `/my/games` 検索・並び替え・公開状態フィルタMVP後。`pnpm -C apps/frontend build` は成功（既知 WARN のみ） |
| 2026-05-03 | ✅ exit 0 | `/my/games` 検索・並び替え・公開状態フィルタMVP後。`pnpm -C apps/frontend test` は 4 files / 31 tests passed |
| 2026-05-04 | ❌ exit 1 | ゲーム複製MVP後。`pnpm -w build` は `apps/api prisma:generate` で EPERM（DLLロック） |
| 2026-05-04 | ❌ exit 1 | ゲーム複製MVP後。`pnpm -C apps/api build` は `prisma:generate` で EPERM（DLLロック） |
| 2026-05-04 | ✅ exit 0 | ゲーム複製MVP後。`pnpm -C apps/frontend test` は 4 files / 31 tests passed |
| 2026-05-04 | ❌ exit 1 | ゲーム基本情報編集MVP後。`pnpm -w build` は `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に EPERM（DLLロック） |
| 2026-05-04 | ✅ exit 0 | ゲーム基本情報編集MVP後。`pnpm -C apps/frontend test` は 4 files / 31 tests passed |
| 2026-05-04 | ❌ exit 1 | ゲーム基本情報編集MVP後。`pnpm -C apps/api run test` は `ERR_PNPM_NO_SCRIPT`（test script未定義） |
| 2026-05-04 | ❌ exit 1 | ゲームカバー画像選択UI MVP後。`pnpm -w build` は `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に EPERM（DLLロック） |
| 2026-05-04 | ✅ exit 0 | ゲームカバー画像選択UI MVP後。`pnpm -C apps/frontend test` は 4 files / 31 tests passed |
| 2026-05-04 | ❌ exit 1 | ゲームカバー画像選択UI MVP後。`pnpm -C apps/api build` は `prisma:generate` で EPERM（DLLロック） |
| 2026-05-04 | ❌ exit 1 | ゲームカバー画像選択UI MVP後。`pnpm -C apps/api run test` は `ERR_PNPM_NO_SCRIPT`（test script未定義） |

---

## 🔎 今回の確認メモ（2026-05-04 / ゲームカバー画像選択UI MVP）

### 実装した内容
- 既存状態の確認
	- `GameProject.coverAssetId` は既存カラムを利用（migration 追加なし）
	- `PATCH /games/:id` は既存更新経路を流用し、`coverAssetId` 更新を追加
	- `GET /games` / `GET /games/:id` / `GET /games/my` は既に `coverAssetId` を返却
	- ゲーム複製時の `coverAssetId` 参照維持（既存実装）を確認
- フロント（`apps/frontend/components/game/MessageThemeModal.vue`）
	- ゲーム全体設定 > 基本情報タブにカバー画像欄を追加
	- 現在のプレビュー / 未設定表示 / `カバー画像を選択` / `クリア` を追加
	- 画像選択は既存 `AssetPicker` を流用し `type="image"` で音声を除外
	- 署名付きGETは既存 `useAssetMeta().signedFromId()` を利用
	- 保存時に `title` / `summary` / `coverAssetId` / 各テーマを同時 PATCH
	- キャンセル/閉じる時は保存しないため、未保存のカバー変更は破棄
- フロント（`apps/frontend/pages/my/games/[id]/edit.vue`）
	- モーダルに `initialCoverAssetId` を渡す
	- `saved` 受信で `game.coverAssetId` を即時反映
- フロント（`apps/frontend/pages/my/games/index.vue`）
	- 自作ゲーム一覧カードにカバー画像サムネイル（小型）を追加
	- 未設定時は既存プレースホルダー表示
	- 検索/並び替え/公開状態フィルタ導線は維持
- API（`apps/api/src/games/games.service.ts`）
	- `coverAssetId` 更新時にサーバ側バリデーションを追加
		- 画像（`contentType` が `image/`）のみ許可
		- 削除済みアセット不可
		- owner本人アセット、またはログイン中ユーザーがお気に入り済みの画像アセットを許可
		- お気に入りしていない他人アセットは拒否
		- `null` による解除を許可
	- `isPublic: true` を含む更新時のみ公開前チェックを実行する既存挙動を維持
	- `coverAssetId` 更新のみでは公開前チェックを再実行しない
- 公開側（`apps/frontend/pages/games/index.vue`, `apps/frontend/pages/games/[id]/index.vue`）
	- 既存のカバー表示経路（`coverAssetId` + 署名URL）を継続利用
	- プレースホルダー、`viewCount` / `playCount` 表示、検索/並び替えへの影響なし

### 将来課題として記録
- カバー画像アップロード導線
- トリミング/クロップ
- 推奨サイズ/縦横比チェック
- OGP画像生成
- カバー画像ギャラリー
- タグ/ジャンル編集
- slug/URL編集
- 画像最適化/圧縮

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に EPERM（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api build`: ❌ exit 1
	- `prisma:generate` で EPERM（DLLロック）
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動E2E（画像選択/クリアの実操作・公開画面反映）
	- 理由: この実行環境ではブラウザ手動検証を実施していないため

---

## 🔎 今回の確認メモ（2026-05-04 / ゲーム基本情報編集MVP）

### 追加反映（ゲーム全体設定モーダル統合）
- フロント（`apps/frontend/pages/my/games/[id]/edit.vue`）
	- `/my/games/:id/edit` 上部の常時表示「ゲーム基本情報フォーム」を撤去
	- 画面上部はゲームタイトル表示のみとし、編集導線は「全体設定」モーダルへ統一
- フロント（`apps/frontend/components/game/MessageThemeModal.vue`）
	- 見出しを `シナリオ全体設定` → `ゲーム全体設定` に変更
	- タブ先頭に `基本情報`（`meta`）を追加
	- `title` / `summary` の編集・バリデーション・文字数表示を追加
		- `title`: 必須、空白のみ不可、120文字以内
		- `summary`: 任意、500文字以内
	- 保存時 `PATCH /games/:id` に `title` / `summary` / `messageTheme` / `gameUiTheme` / `backlogTheme` を同時送信
	- `saved` イベントで親画面へ `title` / `summary` を含めて返却し、ヘッダー表示へ即時反映
	- 「全体テーマを一括設定」は `基本情報` タブ以外でのみ表示
- 将来課題（基本情報タブ拡張）
	- `coverAssetId` / タグ / ジャンル / 注意書き / slug などの追加検討

### 実装した内容
- フロント（`apps/frontend/pages/my/games/[id]/edit.vue`）
	- `/my/games/:id/edit` 上部にゲーム基本情報フォームを追加（`title`, `summary`）
	- 現在のゲーム情報を初期表示し、保存後はヘッダータイトル表示も即時更新
	- 保存ボタンは「未変更」「保存中」「入力エラー」で無効化し、二重送信を防止
	- 保存成功時はトースト通知、保存失敗時はトースト + 画面内エラーメッセージ表示
	- 複製直後の `元タイトル のコピー` を同画面で自然に変更可能
- API（`apps/api/src/games/games.service.ts`, `apps/api/src/games/dto/update-game.dto.ts`）
	- `PATCH /games/:id` の owner制御・削除済み制御を維持
	- `title` / `summary` 更新時の入力検証を追加
		- `title`: 必須、空白のみ不可、最大120文字
		- `summary`: 任意、空可、最大500文字
	- `isPublic: true` 時のみ公開前チェックを行う既存挙動を維持
	- `title` / `summary` 更新のみでは公開前チェックを再実行しない

### カバー画像（今回の扱い）
- 方針Aを採用
	- 今回は `title` / `summary` 編集のみをMVP対象とした
	- `coverAssetId` の本格編集UIは将来課題として維持

### 将来課題として記録
- カバー画像選択UI
- ゲームタグ/ジャンル編集
- 作者コメント/あとがき
- 年齢制限/注意書き
- 公開設定詳細
- slug/URL編集
- 編集履歴/変更履歴
- 自動保存
- 公開済みゲーム変更時の通知

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に EPERM（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動E2E（複製 → editでリネーム → `/my/games`・`/games`・`/games/:id`・`/games/:id/play` 反映確認）
	- 理由: この実行環境ではブラウザ手動検証を実施していないため

---

## 🔎 今回の確認メモ（2026-05-04 / ゲーム複製MVP）

### 実装した内容
- API（`apps/api/src/games/games.controller.ts`, `apps/api/src/games/games.service.ts`）
	- `POST /games/:id/duplicate` を追加
	- owner 本人のみ複製可能（他人は `403`、削除済みは `404`）
	- DBトランザクションで複製処理を実行し、途中失敗時の中途半端データ残存を防止
	- 複製対象: `GameProject` / `GameScene` / `GameNode` / `GameChoice`
	- ID再マップを実装
		- 旧 `sceneId` → 新 `sceneId`
		- 旧 `nodeId` → 新 `nodeId`
		- `startSceneId` / `startNodeId` / `nextNodeId` / `targetNodeId` / `alternateTargetNodeId` を新IDへ変換
		- 壊れた参照は `null` に安全化
	- 複製先ゲームは必ず `isPublic = false`
	- `viewCount` / `playCount` は 0 で初期化
	- セーブデータ・履歴・お気に入り等の周辺データは複製しない
	- アセット実体は複製せず、素材ID参照は維持
	- 複製先タイトルは `元タイトル のコピー` 基本、重複時は `... のコピー 2` 形式で採番
- フロント（`apps/frontend/composables/useGames.ts`, `apps/frontend/pages/my/games/index.vue`）
	- `useGamesApi` に `duplicate(id)` を追加
	- `/my/games` のカードに「ゲームを複製」ボタンを追加
	- 複製前に確認ダイアログを表示
	- 成功時は一覧再取得し、複製先IDが取れた場合 `/my/games/:newId/edit` へ遷移
	- 失敗時はトーストでエラー表示
	- 既存の検索/並び替え/公開状態フィルタ、公開切替、削除導線は維持

### 将来課題として記録
- シーン複製（シーン内ノード/選択肢一括複製、シーン内参照の再マッピング）
- ノード複製（`nextNodeId` / choice遷移先の扱い方針）
- ノード移動（別シーン移動時のID/参照維持方針と `startNodeId` 影響整理）
- シーン間ノードコピー（コピー先で新nodeId採番、参照ポリシー整理）
- 付随課題: undo/redo、操作前確認ダイアログ、コピー先選択UI、大量ノード操作、シーン/ノードテンプレート化、シナリオImport/Export連携

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に EPERM（DLLロック）
- `pnpm -C apps/api build`: ❌ exit 1
	- 同上（`prisma:generate` で EPERM）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed

### 未実行の確認と理由
- `pnpm -C apps/api test`
	- 理由: `apps/api/package.json` に test script が未定義（`pnpm --dir apps/api run test` は `ERR_PNPM_NO_SCRIPT`）
- ブラウザ手動E2E（owner/非owner/削除済みの実操作確認）
	- 理由: この実行環境ではブラウザ手動検証を実施していないため

---

## 🔎 今回の確認メモ（2026-05-03 / 自作ゲーム管理 `/my/games` 検索・並び替え・公開状態フィルタMVP）

### 実装した内容
- フロント（`apps/frontend/pages/my/games/index.vue`）
	- 管理画面に検索欄・検索ボタンを追加（検索対象: タイトル・概要）
	- 並び替えを追加（`updated` / `created` / `title` / `public`）
	- 公開状態フィルタを追加（`all` / `public` / `private`）
	- 入力中キーワードと適用済み検索条件を分離（検索ボタン/Enterで確定）
	- 空白のみ検索は検索なし扱い（trim後空なら `q` 除去）
	- 検索0件時の空状態文言を追加（`条件に一致する自作ゲームはありません。`）
	- URLクエリ同期を追加（`q`, `sort`, `status`）
		- 不正な `sort` / `status` は `updated` / `all` に正規化
		- `sort=updated` / `status=all` / 空 `q` はURLから省略
		- リロード復元、戻る/進む復元に対応
	- 既存導線（新規作成・編集遷移・公開/非公開切替・公開前チェック・削除）を維持
- フロント API 層（`apps/frontend/composables/useGames.ts`）
	- `my()` のクエリ型を拡張（`q`, `sort`, `status`）
- API（`apps/api/src/games/games.controller.ts`, `apps/api/src/games/games.service.ts`）
	- `GET /games/my?q=...&sort=...&status=...` に対応
	- ログイン中ユーザーのゲームのみ、`deletedAt = null` を維持
	- `q` は `title` / `summary` の部分一致検索（trim後、case-insensitive）
	- `sort` に応じて orderBy を切替
		- `updated`: `updatedAt desc`
		- `created`: `createdAt desc`
		- `title`: `title asc`（同値時は `updatedAt desc`）
		- `public`: `isPublic desc`（同値時は `updatedAt desc`）
	- `status` に応じて `isPublic` を絞り込み
		- `all`: 絞り込みなし
		- `public`: `isPublic = true`
		- `private`: `isPublic = false`
	- 不正な `sort` / `status` は `updated` / `all` として扱う

### 将来課題として記録
- ページネーション / 無限スクロール
- 人気順 / プレイ数順
- 閲覧数順
- タグ検索
- 高度な全文検索
- Meilisearch 連携
- 最近編集したゲームの別枠表示
- 一括操作
- ゲーム複製（2026-05-04 実装済み）
- `/games` と `/my/games` の検索UI共通コンポーネント化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に EPERM（DLLロック）
- `pnpm -C apps/api build`: ❌ exit 1
	- 同上（`prisma:generate` で EPERM）
- `pnpm -C apps/frontend build`: ✅ exit 0
	- 既知 WARN のみ（`@nuxt/icon` Nuxt 4要件、browserslist更新推奨、Nuxt依存deprecation）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed

### 未実行の確認と理由
- `pnpm -C apps/api test`
	- 理由: `apps/api/package.json` に test script が未定義
- ブラウザ手動E2E（URL戻る/進む、検索0件UI、日本語検索）
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

### 禁止・注意（今回の運用）
- 公開/非公開切替、公開前チェック、削除導線を壊さない
- `/games` 側の検索・並び替え仕様を壊さない
- 大規模UI刷新、Meilisearch導入に脱線しない

---

## 🔎 今回の確認メモ（2026-05-03 / アセットお気に入り数表示MVP）

### 実装した内容
- API（`apps/api/src/search/search.controller.ts`）
	- `GET /search/assets` の返却 `items[*]` に `favoriteCount` を追加
	- Prisma の `_count.favorites` を使用
	- Meilisearch経由取得時も同様に `favoriteCount` を付与
- API（`apps/api/src/assets/assets.service.ts`）
	- `GET /assets/:id` の返却に `favoriteCount` を追加
	- 既存のお気に入り状態付与（`isFavorite`）は維持
	- `GET /assets` 系返却にも `favoriteCount` を付与（互換維持）
- API（`apps/api/src/favorites/favorites.service.ts`）
	- `GET /favorites` 返却にも `favoriteCount` を付与（カード共通化時の自然表示を担保）
- フロント（`apps/frontend/components/asset/AssetCard.vue`）
	- 公開一覧カードに `お気に入り n` を表示
	- `favoriteCount` が未定義でも `0` 扱い
	- お気に入りトグル時に件数を楽観更新（+1 / -1、0未満防止）、失敗時ロールバック
- フロント（`apps/frontend/pages/assets/[id].vue`）
	- 詳細画面にお気に入り件数表示とトグル導線を追加
	- 未ログインでも件数表示、トグル操作時のログイン導線は既存仕様を維持
- フロント（`apps/frontend/composables/useFavoriteToggle.ts`, `apps/frontend/composables/useAssets.ts`）
	- `isFavorite` / `isFavorited` の両方を同期
	- `favoriteCount` の楽観更新・ロールバックに対応
	- 正規化処理で `favoriteCount` を数値化し、未定義は `0`
- 型（`packages/types/src/index.ts`）
	- `Asset` 型に `favoriteCount?: number`, `isFavorited?: boolean` を追加

### 今回の方針
- DB migration 追加なし
- `favoriteCount` カラム追加なし
- 既存 relation の `_count` を利用

### 将来課題として整理
- アセット閲覧数 `viewCount`
	- `/assets/:id` のみカウント対象
	- `/assets` 一覧、`/my/assets` は非対象
	- MVPではリロード増加を許容、ユニーク閲覧は将来課題
- アセットお気に入り数の高度化
	- 高負荷時は `favoriteCount` カラム化を検討
	- favorite/unfavorite 時カウンタ増減
	- お気に入り順 / 人気順ソート
- アセット使用数 `usedInGameCount`
	- 背景/BGM/SE/キャラクター素材別の集計
	- 公開ゲームのみ対象にするか、非公開を含めるかの方針決定
	- ゲーム削除/非公開化時の集計ルール整理
	- 使用数順ソートへの活用
- ランキング / 検索連携
	- お気に入り順、閲覧数順、使用数順、人気順
	- タグ検索との組み合わせ
	- Meilisearch / 高度検索連携
- 指標基盤
	- 作者ダッシュボード
	- ユニーク閲覧数
	- イベントログテーブル

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で DLL rename 時に EPERM
- `pnpm -C apps/api build`: ❌ exit 1
	- 同上（`prisma:generate` で EPERM）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed

### 未実行の確認と理由
- `pnpm -C apps/api test`
	- 理由: `apps/api/package.json` に test script が未定義

---

## 🔎 今回の確認メモ（2026-05-03 / 公開ゲーム 閲覧数・プレイ数 集計MVP）

### 実装した内容
- DB（`apps/api/prisma/schema.prisma`）
	- `GameProject` に `viewCount Int @default(0)` / `playCount Int @default(0)` を追加
	- 既存データは既定値 0 で扱う
- Migration（`apps/api/prisma/migrations/20260503100000addgamecounters/migration.sql`）
	- `game_projects` へ `viewCount` / `playCount` カラムを追加
- API（`apps/api/src/games/games.controller.ts`, `apps/api/src/games/games.service.ts`）
	- `POST /games/:id/view` を追加
		- 公開かつ未削除ゲームのみ `viewCount + 1`
	- `POST /games/:id/play` を追加
		- 公開かつ未削除ゲームのみ `playCount + 1`
	- `GET /games` の返却に `viewCount` / `playCount` を追加
	- 一覧取得(`GET /games`)ではカウント増加しない
- フロント（`apps/frontend/composables/useGames.ts`）
	- `countView(id)` / `countPlay(id)` を追加
- フロント（`apps/frontend/pages/games/[id]/index.vue`）
	- 詳細ロード後に `countView` を実行（失敗時は表示を継続）
	- 詳細画面に `閲覧数` / `プレイ数` を表示
- フロント（`apps/frontend/pages/games/[id]/play.vue`）
	- プレイ画面ロード時に `countPlay` を実行（失敗時はプレイ継続）
- フロント（`apps/frontend/pages/games/index.vue`）
	- 一覧カードに `閲覧 n / プレイ n` を追加
	- `undefined` は `0` 扱いで表示

### 仕様メモ（MVP）
- `viewCount`
	- 増加タイミング: 公開ゲーム詳細ページ `/games/:id` 表示時（フロントから `POST /games/:id/view`）
	- 非公開/削除済みは加算しない
- `playCount`
	- 増加タイミング: 公開ゲームプレイページ `/games/:id/play` 初期表示時（`POST /games/:id/play`）
	- セーブ/ロードやノード進行では加算しない
	- 非公開/削除済みは加算しない
- 重複除外
	- 今回は未実装（リロードで増える）
- 人気順/プレイ数順ソート
	- 今回は未実装（将来課題）

### タグ/ジャンル機能（将来課題として記録）
- ゲームタグ/ジャンル設定（`/my/games`）
- 固定ジャンルタグ（恋愛/ホラー/ファンタジー/SF/ミステリー/コメディ/日常/シリアス）
- 形式タグ（短編/長編/体験版/完結済み/連載中）
- システムタグ（選択肢あり/マルチエンド/ボイスあり/BGMあり）
- フリーワードタグと固定タグの分離
- タグ検索 / タグ絞り込み / タグ別一覧
- タグ未設定時の公開前 warning 検討
- Meilisearch / 高度検索との連携

### そのほか将来課題として記録
- ユニーク閲覧数 / ユニークプレイ数
- IP/ユーザー単位重複除外
- 日別集計
- 作者ダッシュボード
- 人気順/プレイ数順
- ランキング
- レコメンド
- イベントログテーブル
- アナリティクス基盤

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` の DLL rename で EPERM
- `pnpm -C apps/api build`: ❌ exit 1
	- 同上（`prisma:generate` で EPERM）
- `pnpm -C apps/frontend build`: ✅ exit 0
	- 既知 WARN のみ
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed

### 未実行の確認と理由
- `pnpm -C apps/api prisma migrate dev`
	- 実行したが、ローカルDBドリフト（`users` テーブル差分・欠落 migration）で中断。DBリセット要求のため採用せず、手動 migration を追加
- `pnpm -C apps/api prisma generate`
	- DLLロックにより EPERM（再試行でも失敗）
- API test
	- `apps/api/package.json` に test script がないため未実行

### 禁止・注意（今回の運用）
- タグ/ジャンル機能の実装には入っていない（将来課題のみ追記）
- 人気順/プレイ数順ソートは実装していない
- 公開一覧取得のみで閲覧数が増える実装は入れていない
- 非公開/削除済みゲームはカウント対象外

### ⚠️ viewCount/playCount migration 未適用時の復旧手順

`game_projects.viewCount does not exist` エラーが出た場合（migration ファイルは存在するが DB に未適用）、`prisma migrate reset` を使わず以下の手順でカラムを追加する。

```powershell
# 1. SQL ファイルをパイプで prisma db execute --stdin に渡す
#    (--file フラグは PowerShell でシンタックスエラーになる場合があるため --stdin を使用)
Get-Content apps/api/prisma/manual_add_game_counters.sql -Raw |
  pnpm --filter @talking/api exec prisma db execute --schema prisma/schema.prisma --stdin

# 2. Prisma クライアントを再生成
pnpm --filter @talking/api exec prisma generate

# 3. 動作確認: dev:all 起動後に /games と /my/games が 500 にならないことを確認
pnpm dev:all
```

実行する SQL（`apps/api/prisma/manual_add_game_counters.sql` に保存済み）:

```sql
ALTER TABLE "game_projects"
ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "playCount" INTEGER NOT NULL DEFAULT 0;
```

**注意点**
- `prisma db execute --file` は PowerShell 上で `syntax error at or near "ALTER"` になる場合がある。`-Raw` で読み込んだ文字列をパイプする `--stdin` 方式を使うこと。
- `prisma migrate dev` を使うと既存の migration ドリフトで DB リセットを要求される場合があるため、手動 `db execute` で対応する。
- 上記 SQL は `IF NOT EXISTS` を含むため、カラムが既に存在していても安全に再実行できる。

---

## 🔎 今回の確認メモ（2026-05-03 / 公開ゲーム一覧 検索・並び替えMVP）

### 実装した内容
- フロント（`apps/frontend/pages/games/index.vue`）
	- `/games` にキーワード検索 UI を追加（対象: タイトル・概要）
	- 並び替え UI を追加（`new` / `updated` / `title`）
	- 検索状態・件数表示を追加（検索中表示を含む）
	- 検索0件時の空状態文言を追加（`条件に一致する公開ゲームはありません。`）
	- URLクエリ同期を追加（`q`, `sort`）
		- 空白のみ検索は検索なし扱い（trim後空なら `q` を除去）
		- 不正な `sort` は `new` に正規化
		- リロード復元、戻る/進む復元に対応
- フロント API 層（`apps/frontend/composables/useGames.ts`）
	- `listPublic` のクエリ型を拡張（`q`, `sort`）
- API（`apps/api/src/games/games.controller.ts`, `apps/api/src/games/games.service.ts`）
	- `GET /games` に `q`, `sort` クエリを追加
	- 公開ゲームのみ（`isPublic=true`, `deletedAt=null`）を維持
	- `q` がある場合、`title` / `summary` の部分一致検索（大文字小文字非区別）
	- `sort` に応じて orderBy を切替
		- `new`: `createdAt desc`
		- `updated`: `updatedAt desc`
		- `title`: `title asc`（同値時は `createdAt desc`）
	- 不正な `sort` は `new` 扱い

### 将来課題として記録
- ページネーション
- 無限スクロール
- 人気順 / プレイ数順 / お気に入り数順
- タグ検索
- 作者検索
- 高度な全文検索 / Meilisearch 活用
- `/my/games` 側の検索・並び替え（同一UI方針への統一）
- 公開ゲームのプレイ数 / 閲覧数集計
- レコメンド

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend build`: ✅ exit 0
	- 既知 WARN のみ（`@nuxt/icon` の Nuxt 4要件、browserslist 更新推奨、Nuxt 依存 deprecation warning）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed

### 今回未実行の確認と理由
- API test
	- 理由: `apps/api/package.json` に test script が定義されていないため
- ブラウザ手動E2E（`/games?q=xxx&sort=updated` の画面操作確認）
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

---

## 🔎 今回の確認メモ（2026-05-03 / ゲームプレイ BGMフェードMVP）

### 実装した内容
- `apps/frontend/pages/games/[id]/play.vue`
	- BGMフェードMVPを実装
		- 停止時: 即停止ではなく固定時間フェードアウト後に `pause` / `src`解除 / `currentTime=0`
		- 切替時: 旧BGMフェードアウト後に新BGMをセットし、固定時間フェードイン
		- 同一BGM: 再読込・再頭出し・再フェードを行わず継続再生
	- `musicAssetId` 解決とBGM遷移にトークン管理を導入し、AUTO/SKIP高速遷移時の古いフェード残りを防止
	- `requestAnimationFrame` の後始末を追加し、`onBeforeUnmount` でフェード処理を確実に停止
	- 音声同意後のBGM再開はフェードイン対応（可能な範囲で既存フロー維持）
	- SEはMVPとして既存挙動を維持（BGMフェード処理に巻き込まない）

### 仕様確認（現行挙動の維持）
- `musicAssetId` 未指定ノードは従来どおり停止扱い（今回の変更では停止時の手段のみフェードアウト化）

### 将来課題（今回未実装）
- BGMクロスフェード
- ノードごとのfadeMs設定
- BGM/SE音量設定UI
- SE個別フェード
- 音声ミキサー
- 複数BGMレイヤー
- ユーザー設定保存
- SKIP中BGM切り替え方針
	- SKIP中は高速進行のため、途中ノードのBGM変更（例: A→B→無音→A）が体感されないことがある
	- 現状MVPは通常進行と同じBGM制御を使用し、重複再生や音量崩壊がなければ許容
	- 将来案1: SKIP中はBGM切り替えを抑制し、SKIP停止時に現在ノードのBGMへ同期
	- 将来案2: SKIP中もフェードなし即同期を行う（ただし頻繁切替で耳障りになる可能性あり）
	- 既読管理・SKIP速度設定と合わせて再検討

### 実行した確認
- `pnpm -w build`: ✅ exit 0
	- 既知 WARN のみ（`@nuxt/icon` の Nuxt 4要件、browserslist 更新推奨、Nuxt 依存 deprecation warning）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 3 files / 10 tests passed

### 今回未実行の確認と理由
- ブラウザ手動確認（BGM A→B切替の聴感、同一BGM継続、音声同意前後、AUTO/SKIP高速遷移時の体感確認）
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

---

## 🔎 今回の確認メモ（2026-05-03 / シナリオチェック追加MVP）

### 実装した内容
- `apps/frontend/utils/scenarioCheck.ts`
	- チェック1: ノード本文が空（warning）
		- `text` が空文字または空白のみのノードを検出（全ノード対象）
		- 演出専用ノードの可能性があるため warning（error にしない）
	- チェック2: 選択肢ラベルが空（warning）
		- `choice.label` が空文字または空白のみの選択肢を検出
		- `targetNodeId = null` の選択肢でも検出対象
	- チェック3: 選択肢はあるが表示可能な選択肢が0件（warning）
		- `choices.length > 0` かつ `targetNodeId != null` の選択肢が0件のノードを検出
	- チェック5: 開始シーン以外の `startNodeId` 壊れチェック（warning）
		- 開始シーン以外のシーンで `startNodeId` が設定されているが、そのノードIDがシーン内に存在しない場合に検出
		- `startNodeId` 未設定は許容（error にしない）
		- 開始シーンの `startNodeId` は既存の error チェックを維持
- `apps/frontend/tests/scenarioCheck.spec.ts`（新規作成）
	- 上記4チェックの vitest テストを追加（21ケース）
	- 既存チェック（error/warning/info）の後退防止テストも含む

### 素材参照チェック（チェック4）について
- 今回未実装。ノードが参照するアセットID（BGM・SE・背景・キャラクター等）の存在確認には、`runScenarioCheck` にアセット一覧を渡す設計変更が必要なため将来課題とした
- 将来課題として ROADMAP に追記済み

### API側公開前チェックへの影響
- 今回追加した warning は API 側公開前チェックに追加していない（公開ブロック項目は増やさない方針を維持）

### 将来課題
- 素材参照の厳密チェック（ノードが参照するアセットID の存在確認）
- アセット権限・公開可否チェック（削除済み・非公開アセット）
- 条件分岐の完全評価（`condition` / `alternateCondition` を考慮した到達判定）
- 変数キー存在チェック
- フローチャート可視化
- シナリオ Import/Export（JSON → AI向けMarkdown/DSL）
- 公開前チェック専用画面

### 実行した確認
- `pnpm -C apps/frontend test --run`: ✅ exit 0（4 files / 31 tests passed）
- `pnpm -C apps/frontend build`: ✅ exit 0
- `pnpm -w build`: ❌ exit 1（`apps/api prisma:generate` で EPERM。DLLロックのため失敗。フロントエンドは正常）
- API test コマンド: `apps/api/package.json` に test script がないため未実行

### 今回未実行の確認と理由
- ブラウザ手動確認（追加 warning の実画面確認、警告フィルタ、対象へ移動）
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

---

## 🔎 今回の確認メモ（2026-05-03 / ゲーム公開前チェックMVP）

### 実装した内容
- `apps/frontend/utils/scenarioCheck.ts`
	- edit画面にあったシナリオチェック判定（error / warning / info）を共通化
	- 開始地点不備・存在しない参照・未設定選択肢・到達不能ノード・終端ノードなど、既存判定をそのまま再利用できる形に整理
- `apps/frontend/pages/my/games/[id]/edit.vue`
	- シナリオチェック判定を共通ユーティリティ呼び出しに置換（判定の重複削減）
	- 一覧画面からの誘導用に、クエリでシナリオチェック表示状態を受け取る導線を追加
		- `focusScenarioCheck=1` でパネル展開
		- `scenarioCheckFilter=error|warning|info|all` で初期フィルタ設定
- `apps/frontend/pages/my/games/index.vue`
	- 公開トグル時（非公開→公開のみ）に `api.getEdit()` + 共通シナリオチェックを実行
	- 判定ルール
		- `error` 1件以上: 公開ブロック、公開状態は変更しない、件数と内容（先頭3件）を表示、編集画面シナリオチェックへ誘導
		- `warning` のみ: 確認ダイアログ承認時のみ公開
		- `info` のみ / 問題なし: 従来どおり公開可能
	- 非公開化（公開→非公開）は従来どおり常に許可
	- API側で公開拒否された場合、返却された `message` / `errors` を表示（UI状態は公開前のまま維持）
- `apps/api/src/games/games.service.ts`
	- `PATCH /games/:id` の `isPublic: true` 更新時に最低限の公開ガードを追加（MVP）
	- `error` が1件以上ある場合は 400 で拒否し、`message` と `errors` を返却
	- API側で拒否する最低限の `error`
		- `GameProject.startSceneId` 未設定
		- `GameProject.startSceneId` が存在しないシーンID参照
		- 開始シーンの `startNodeId` 未設定
		- 開始シーンの `startNodeId` が存在しないノードID参照
		- 開始シーンがノード0件
		- `GameNode.nextNodeId` が存在しないノードID参照
		- `GameChoice.targetNodeId` が存在しないノードID参照（`null` は許可）
		- `GameChoice.alternateTargetNodeId` が存在しないノードID参照（`null` は許可）
	- `warning` / `info` は API 側で公開拒否しない
	- `isPublic: false` の非公開化は常に許可
	- `isPublic` 未指定更新は従来どおり許可

### API側の扱い
- フロント側公開前チェックはユーザー向け（事前案内・warning確認・編集画面への修正導線）
- API側公開前チェックは公開状態整合を守る最終防衛線
- 今回はMVPとして最低限 `error` のみをAPIで拒否し、完全なサーバーサイド審査は将来課題とする

### 将来課題（公開審査）
- 完全なサーバーサイド公開審査
- アセット権限 / 削除済み素材参照チェック（削除済み・非公開アセットの検出）
- 条件分岐の完全評価
- 変数キー存在チェック
- warning/info の API レスポンス活用
- 公開申請 / 管理者レビュー
- 素材参照の厳密チェック（ノードが参照する背景/BGM/SE/キャラクター立ち絵IDの存在確認）
- フローチャート可視化
- シナリオImport/Export（JSON → AI向けMarkdown/DSL）
- 公開前チェック専用画面

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（ファイルロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 3 files / 10 tests passed
- API test コマンド: `apps/api/package.json` に test script がないため未実行

### 今回未実行の確認と理由
- ブラウザ手動確認（error/warning/info 各状態での公開導線の実操作、編集画面への遷移確認）
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

---

## 🔎 今回の確認メモ（2026-05-02 / edit画面の最後の選択位置復元MVP）

### 実装した内容
- `apps/frontend/pages/my/games/[id]/edit.vue`
	- 最後に選択したシーン/ノードを LocalStorage に保存する処理を追加
		- 保存キー: `talking.editor.lastSelection.v1:${gameId}`
		- 保存値: `sceneId` / `nodeId` / `updatedAt`
	- edit画面初期表示時に保存済み選択位置を復元する処理を追加
		- `sceneId` が有効なら該当シーンを復元
		- `nodeId` が有効なら該当ノードを復元
		- `nodeId` が保存シーン外でも、実在ノードが見つかれば所属シーンを優先して復元
		- 保存値破損時・削除済み参照時は安全にフォールバックし、必要に応じて保存値を整理
	- シーン削除/ノード削除後のフォールバック選択時にも保存状態が壊れないよう更新
	- 既存の右ペイン開閉状態保存（`talking.editor.rightPaneSections.v1`）には手を入れず共存
- `docs/PROJECT_SPEC.md`
	- 作業位置保存/復元仕様、保存キー、フォールバック方針、別キー管理を追記
- `docs/ROADMAP.md`
	- 実装済みに反映、検証結果を追記
	- 作業位置保存のリセット導線は将来課題として記録（今回は未実装）

### 実行した確認
- `pnpm -w build`: ✅ exit 0
	- 既知 WARN のみ（`@nuxt/icon` Nuxt 4要件、browserslist更新推奨、Nuxt依存deprecation）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 2 files / 7 tests passed

### 今回未実行の確認と理由
- ブラウザ手動確認（リロード復元、削除後フォールバック、NodePicker/シナリオチェック連携の実操作）
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

---

## 🔎 今回の確認メモ（2026-05-02 / 作業位置復元MVPのフォールバック強化）

### 問題
- 保存済み作業位置がない場合（初回訪問・新ブラウザ・localStorage削除）にシーン/ノードが自動選択されなかった
- `restoreLastSelection()` は `void` を返しており、呼び出し側がフォールバックを実行できなかった

### 実装した内容
- `apps/frontend/pages/my/games/[id]/edit.vue`
	- `restoreLastSelection()` の戻り値を `Promise<boolean>` に変更
		- 保存値なし、パース失敗、sceneId/nodeId が不正、解決不能はすべて `false` を返す
		- 正常に復元できた場合のみ `true` を返す
	- `getSavedLastSelection()` でパース失敗時・空値時に localStorage の古い値を削除してから `null` を返すよう変更
	- `selectInitialSceneAndNode()` 関数を追加
		- `GameProject.startSceneId` に一致するシーンがあればそのシーンを選択、なければ先頭シーン
		- 選択シーンの `startNodeId` に一致するノードがあればそのノードを選択、なければ先頭ノード
		- ノードが0件ならシーンのみ選択してノードは null
		- 選択後は `persistCurrentSelection()` で保存
	- `onMounted` のロード処理を整理
		- `const restored = await restoreLastSelection()` で結果を受け取る
		- `if (!restored) await selectInitialSceneAndNode()` でフォールバック実行
- `docs/PROJECT_SPEC.md`
	- 保存値なし/パース失敗/削除済み参照時のフォールバック仕様（`startSceneId` → 先頭シーン → `startNodeId` → 先頭ノード）を追記
- `docs/ROADMAP.md`
	- 最終更新日・ビルド状態テーブル・確認メモを追記

### 実行した確認
- `pnpm -C apps/frontend build`: ✅ exit 0
	- 既知 WARN のみ（`@nuxt/icon` Nuxt 4要件、browserslist更新推奨、Nuxt依存deprecation）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 2 files / 7 tests passed

### 今回未実行の確認と理由
- ブラウザ手動確認（localStorage なし時の初期選択、壊れ値時の選択、`startSceneId` 設定済み時の優先使用）
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

---

## 🔎 今回の確認メモ（2026-05-02 / 右ペイン開閉状態のlocalStorage保存 + 将来課題追記）

### 実装した内容
- `apps/frontend/pages/my/games/[id]/edit.vue`
	- 右ペイン開閉状態 `sectionOpen` に `scenarioCheck` を含めて統一管理
	- LocalStorage 永続化を追加
		- キー: `talking.editor.rightPaneSections.v1`
		- セクション開閉時に保存、ページ再表示時に復元
		- 保存値が壊れている場合は既定値へフォールバック
		- 保存値に不足キーがある場合は既定値で補完（将来のセクション追加に備える）
	- 通常表示と全画面表示で同一 `sectionOpen` を共有するよう整理
	- 任意導線として「セクション開閉をリセット」ボタンを追加
- `docs/PROJECT_SPEC.md`
	- 右ペインセクション開閉状態の LocalStorage 永続化仕様を追記
	- 保存キー、通常表示/全画面表示共有、破損時フォールバック、キー補完方針を追記
	- 将来課題に「シナリオのエクスポート/インポート（JSON → AI向けMarkdown/DSL）」を追記
- `docs/ROADMAP.md`
	- 右ペイン開閉状態 localStorage 保存を実装済みに反映
	- 将来課題「シナリオのテキストエクスポート・インポート」を具体化（段階案・検討事項を追記）

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（ファイルロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 2 files / 7 tests passed

### 今回未実行の確認と理由
- ブラウザ手動確認（開閉操作 → リロード復元、破損値時の表示確認、通常表示/全画面表示の共有確認）
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

---

## 🔎 今回の確認メモ（2026-05-02 / ゲームプレイ画面 AUTO・SKIP MVP）

### 実装した内容
- `apps/frontend/pages/games/[id]/play.vue`
	- プレイ画面のメッセージウィンドウに `AUTO` / `SKIP` ボタンを追加
	- `AUTO` は本文の全文表示完了後に固定待機時間で自動進行する MVP として実装
	- `SKIP` はタイプライターを即全文表示し、固定短時間で高速進行する MVP として実装
	- `AUTO` と `SKIP` の排他制御を追加
	- 選択肢表示、終端ノード、セーブ/ロードモーダル、バックログ、音声同意オーバーレイで AUTO / SKIP を停止
	- 手動進行時に AUTO / SKIP を停止し、古い進行タイマーを必ず解除するよう整理
	- `SKIP` の連続進行回数を監視し、100 回で停止する簡易ループガードを追加

### MVPとして今回あえて実装しなかったもの
- 既読管理
- 既読部分だけ Skip
- 未読も含めた強制 Skip
- Ctrl 長押し Skip
- Skip 速度設定
- Auto 待機時間設定
- キーコンフィグ
- プレイヤーごとの既読ログ保存
- Auto / Skip のユーザー設定保存
- モバイル向け Auto / Skip UI 最適化
- ボイス再生終了待ち Auto
- 未読到達時の Skip 停止
- AUTO 中の選択肢自動選択

### 実行した確認
- `pnpm -w build`: ✅ exit 0
	- 既知 WARN のみ（`@nuxt/icon` の Nuxt 4 要求、`baseline-browser-mapping` / `browserslist` の更新推奨、Nuxt 依存の deprecation warning）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 2 files / 7 tests passed

### 今回未実行の確認と理由
- ブラウザ手動確認（AUTO / SKIP の実操作、フルスクリーンでのボタン確認、選択肢・終端・オーバーレイ停止の目視確認）
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

---

## 🔎 今回の確認メモ（2026-05-02 / 右ペインセクション化MVP）

> 注: この確認メモは当時の作業単位の記録。後続作業で通常表示・全画面表示ともにセクション化され、分類整合も反映済み。

### 実装した内容
- `apps/frontend/pages/my/games/[id]/edit.vue`
	- 右ペインのノード編集欄をセクション化
		- 基本情報
		- 表示・素材
		- 演出
		- 遷移・分岐
		- シナリオチェック
		- 危険操作
	- 各セクション見出しをクリックで開閉できるように変更
	- `sectionOpen` の状態で各セクション内容を `v-if` 制御
	- `遷移・分岐` セクションに `次ノードID`、`次ノード作成時のコピー対象`、`選択肢` を集約
	- ノード削除導線は `危険操作` セクションに配置

### 実行した確認
- `pnpm -C apps/frontend build`: ✅ exit 0
	- 既知 WARN のみ（`@nuxt/icon` の Nuxt バージョン互換警告、browserslist 更新推奨など）

### 今回未実行の確認と理由
- ブラウザ手動確認（各セクションの開閉と入力保持、保存導線の実操作確認）
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

---

## 🔎 今回の確認メモ（2026-05-02 / 右ペイン全画面フォームのセクション整合）

> 注: この確認メモは当時「5セクション」として記録しているが、現在地の整理では「シナリオチェック」を含む6区分（基本情報 / 表示・素材 / 演出 / 遷移・分岐 / シナリオチェック / 危険操作）として扱う。

### 実装した内容
- `apps/frontend/pages/my/games/[id]/edit.vue`
	- ノード全画面表示（`fullscreenProps`）の右フォームにも、通常表示と同じ分類を反映
		- 基本情報 / 表示・素材 / 演出 / 遷移・分岐 / 危険操作
		- 右ペイン上部のシナリオチェックパネルを併せて運用
	- 各セクション見出しを追加し、`sectionOpen` で開閉制御
	- 以下の項目配置を通常表示と揃えるよう調整
		- 台詞、話者キャラ、背景、BGM、SE、カメラ、カメラ演出、ビジュアルエフェクト、カラーフィルター、キャラクター配置、次ノードID、選択肢、危険操作
	- 全画面時の2カラム構造（左ステージ / 右フォーム）は維持

### 将来課題として記録
- 通常表示フォームと全画面フォームは現在も二重実装で、片側修正漏れによる UI/機能差分が発生しやすい
- 将来的に `GameNodePropertyForm` などへの共通コンポーネント化を検討する
- ただし、`props/emit`、picker状態、保存処理、削除処理、シナリオチェック連携の接続範囲が広いため、別タスクで慎重に進める

### 実行した確認
- `pnpm -w build`: ✅ exit 0
	- 既知 WARN のみ（`@nuxt/icon` の Nuxt バージョン互換警告、browserslist 更新推奨など）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 2 files / 7 tests passed

### 今回未実行の確認と理由
- ブラウザ手動確認（通常表示/全画面表示の開閉操作と実入力の目視確認）
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

---

## 🔎 今回の確認メモ（2026-05-02 / セクション見出しと折りたたみ範囲の一致化）

> 注: この確認メモは「見出しと折りたたみ範囲の一致化」の修正記録。現在は通常表示・全画面表示とも同方針で整合済み。

### 実装した内容
- `apps/frontend/pages/my/games/[id]/edit.vue`
	- 通常表示で `基本情報` 見出しと実際の開閉対象のズレを修正
		- 台詞、前ノード継続表示、話者キャラ、話者表記が `sectionOpen.basic` に従うよう調整
	- `表示・素材` 見出しと項目配置の順序を整理し、見た目と開閉条件の対応を一致
	- 通常表示・全画面表示の両方で `遷移・分岐` セクション内に
		- 次ノードID
		- 次ノード作成時のコピー対象
		- 選択肢（追加/削除/条件/分岐先）
	  を集約し、`危険操作` セクション後方に通常編集項目が残らない構造に修正
	- 全画面表示側も同じ分類順を維持し、`sectionOpen` で一貫して開閉するよう統一

### 実行した確認
- `pnpm -w build`: ✅ exit 0
	- 既知 WARN のみ（`@nuxt/icon` の Nuxt バージョン互換警告、browserslist 更新推奨など）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 2 files / 7 tests passed

### 将来課題
- 通常表示フォームと全画面フォームの二重実装は継続中で、将来的な共通コンポーネント化（例: `GameNodePropertyForm`）は引き続き別タスクで検討する
- `props/emit`、picker状態、保存・削除処理、シナリオチェック連携の影響範囲が広いため、段階的に進める

---

## 🔎 今回の確認メモ（2026-05-02 / 右ペインセクション化MVPのドキュメント整合）

### 反映した内容
- `docs/PROJECT_SPEC.md`
	- 右ペインセクション化MVPを「実装済み」として現状仕様に整合
	- セクション分類を以下で明記
		- 基本情報 / 表示・素材 / 演出 / 遷移・分岐 / シナリオチェック / 危険操作
	- 分類ルールを明記
		- キャラクター配置は「表示・素材」
		- カメラ / カメラ演出 / ビジュアルエフェクト / カラーフィルターは「演出」
	- セクション見出しと折りたたみ範囲の一致方針、通常表示/全画面表示での分類一致方針を明記
- `docs/ROADMAP.md`
	- 右ペインセクション化MVPを実装済み扱いとして整理
	- 通常表示・全画面表示の両方に反映済みであることを明記
	- 危険操作の独立セクション化、表示・素材/演出の分類整理を明記
	- 過去メモのうち「当時状態」を示す箇所に注記を追加して、現在地と混同しないよう整理

### 残課題（継続）
- 通常表示と全画面表示で似たフォームが二重実装
- `GameNodePropertyForm` などへの共通コンポーネント化検討
- 開閉状態の localStorage 保存
- セクション要約表示の強化
- edit画面全体の本格的な情報設計v2
- スマホ/タブレット向け編集体験の再設計
- 3ペイン構造そのものの再設計

---

## 🔎 今回の確認メモ（2026-05-02 / シナリオチェック結果パネルの表示整理）

### 実装した内容
- `apps/frontend/pages/my/games/[id]/edit.vue`
	- シナリオチェック結果に severity フィルタを追加（`すべて / エラー / 警告 / 情報`、件数付き）
	- 一覧の表示順を `error → warning → info` に固定
	- 件数サマリの視認性を調整（エラーを最も強調、警告は中程度、情報は控えめ）
	- `info` 項目の配色を控えめに変更し、`すべて` 表示時は情報項目を折りたたみ可能にした
	- フィルタ後の0件時に「この条件のチェック項目はありません。」を表示
	- 全体0件時の「問題は見つかりませんでした。」表示を維持
	- 既存の「対象へ移動」機能を維持（フィルタ後も動作）

### 実行した確認
- `pnpm -w build`: ✅ exit 0
	- 既知 WARN のみ（`@nuxt/icon` の Nuxt バージョン互換警告、browserslist 更新推奨など）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 2 files / 7 tests passed

### 今回未実行の確認と理由
- ブラウザ手動確認（フィルタ切替と情報折りたたみの実操作確認）
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

---

## 🔎 今回の確認メモ（2026-05-02 / 開始地点設定のシーン側導線追加）

### 実装した内容
- `apps/frontend/pages/my/games/[id]/edit.vue`
	- シーン一覧の各行に「このシーンから開始」ボタンを追加
	- 開始シーンの行に「開始シーン」ラベルを表示
	- シーン側開始設定の挙動を追加
		- ノードあり: `GameProject.startSceneId` を対象シーンに更新
		- 対象シーンの `startNodeId` が設定済みなら維持
		- `startNodeId` が未設定なら先頭ノードを自動設定
		- ノード0件なら設定せず、トーストで案内
	- 既存のノード側「▶このノードから開始」は維持
		- `GameScene.startNodeId` を更新
		- 所属シーンを `GameProject.startSceneId` に同期
	- `game.value.startSceneId` / `scene.value.startNodeId` / `scenes.value` / `game.value.scenes` の同期ヘルパーを追加し、シーン一覧ラベル・ノード一覧ラベル・シナリオチェックの更新遅延を防止
	- テストプレイ起動時は `GameProject.startSceneId` を優先して開始地点クエリを組み立てるよう補正

### 仕様整理（開始地点）
- 開始地点は `GameProject.startSceneId` と `GameScene.startNodeId` の組み合わせで決まる
- ノード側から開始設定すると、所属シーンも開始シーンに同期される
- シーン側から開始設定すると、そのシーンの既存 `startNodeId` を優先して使用する
- `startNodeId` が未設定なら、シーン内の1番目のノードを自動で開始ノードに設定する
- 空シーンは開始シーンに設定しない

### 将来の設計課題（開始地点モデル）
- 現状では、ゲーム開始時に本質的に必要なのは開始ノードIDである
- 開始ノードの所属シーンは node から逆引きできる
- 通常のシナリオ遷移は `GameNode.nextNodeId` / `GameChoice.targetNodeId` / `GameChoice.alternateTargetNodeId` による nodeId 直指定であり、現時点では「シーンへ移動する」機能は存在しない
- この前提では、将来的に `GameProject.startNodeId` へ単純化する案がある
- 一方で、シーン単位ジャンプ、章選択、シーン単位テストプレイ、フローチャート表示を作るなら `GameScene.startNodeId` は意味を持つ
- 現時点では既存実装を維持しつつ、将来の設計課題として残す
- 今後シーン単位ジャンプを実装しない方針なら、`GameProject.startNodeId` への移行を検討する

### 実行した確認
- `pnpm -w build`: ❌ exit 1（2回実行して同じ失敗）
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` の rename 時に `EPERM`（ファイルロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 2 files / 7 tests passed

### 今回未実行の確認と理由
- ブラウザ手動確認（シーン側開始設定 UI 操作、公開ゲーム/テストプレイ開始地点の実画面確認）
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

---

## 🔎 今回の確認メモ（2026-05-02 / 開始ノード設定時に startSceneId を同期）

### 実装した内容
- `apps/frontend/pages/my/games/[id]/edit.vue`
	- `setSceneStartNode(id)` で `GameScene.startNodeId` 更新に加えて `GameProject.startSceneId` も現在シーン ID に更新するよう修正
		- `api.update(game.value.id, { startSceneId: scene.value.id })` を追加
		- ローカル state も `game.value.startSceneId = scene.value.id` に同期
	- ボタン文言を「▶開始ノードに設定」→「▶このノードから開始」に変更
	- シーン一覧に「★ 開始シーン」ラベルを追加（`game.startSceneId === s.id` のときのみ表示）
- API 側は `UpdateGameDto.startSceneId` / `GamesService.update()` が既に対応済みで追加実装不要

### 仕様整理
- `GameProject.startSceneId`: ゲーム全体の最初に入るシーン
- `GameScene.startNodeId`: そのシーン内で最初に再生するノード
- 「このノードから開始」を押すと、2 フィールドが同時に設定されてシナリオチェックエラーが解消される

### 実行した確認
- `pnpm -C apps/frontend build`: ✅ exit 0
- `pnpm -C apps/frontend test`: ✅ 2 files / 7 tests passed

---

## 🔎 今回の確認メモ（2026-05-02 / シナリオチェックMVP）

### 実装した内容
- フロント（`apps/frontend/pages/my/games/[id]/edit.vue`）
	- 右ペイン上部に「シナリオチェック」パネルを追加（折りたたみ可）
	- `error` / `warning` / `info` の3分類と件数サマリを表示
	- 各指摘に関連シーン/ノード情報（Scene番号・Node番号・本文プレビュー）を表示
	- 可能な項目に「対象へ移動」ボタンを追加し、該当シーン/ノードを選択できるようにした
	- 結果0件時は「問題は見つかりませんでした」を表示

### 検出項目
- 開始設定不備
	- `GameProject.startSceneId` 未設定 / 参照切れ
	- 開始シーン `startNodeId` 未設定 / 参照切れ
	- 開始シーンのノード0件
- 存在しない参照
	- `GameNode.nextNodeId`
	- `GameChoice.targetNodeId`
	- `GameChoice.alternateTargetNodeId`
- 遷移先未設定の選択肢（`targetNodeId === null`）
- 選択肢と `nextNodeId` の併用注意
- 開始ノードから到達不能なノード
- 空シーン
- 到達可能ノード中の終端（表示可能選択肢0件 かつ `nextNodeId` なし）

### 到達可能性の計算ルール（MVP）
- 始点: `GameProject.startSceneId` のシーンにある `startNodeId`
- 遷移:
	- 表示可能選択肢（`targetNodeId != null`）が1件以上ある場合:
		- `targetNodeId` を辿る
		- `alternateTargetNodeId` も「到達しうる候補」として辿る
		- `nextNodeId` は通常遷移として使わない
	- 表示可能選択肢が0件の場合:
		- `nextNodeId` があれば辿る
		- なければ終端
- 参照切れIDは到達計算では無視し、別途 error として報告
- 変数条件の厳密評価（`condition` / `alternateCondition`）は未対応

### 将来課題
- 変数条件を考慮した厳密な到達判定
- フローチャート可視化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` の rename 時に `EPERM`（ファイルロック）
	- 2回再実行しても同一エラー
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 2 files / 7 tests passed

### 今回未実行の確認と理由
- ブラウザ手動確認（シナリオチェック一覧の実画面確認、各ケースの実操作）
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
- ゲームプレイ関連: キーコンフィグ・AUTO/Skip高度化・プレイヤーごとのセーブデータ設計・スマホ/タブレット対応
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
	- ノード表示番号を表示順 `index + 1` に統一（edit画面一覧 / NodePicker通常表示 / 検索結果 / 詳細プレビュー / 遷移先ラベル）
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
- 右ペイン内のセクション化MVPは、通常表示・ノード全画面表示の両方で実装済み
- セクション見出しと折りたたみ範囲の一致、危険操作の独立配置、表示・素材/演出の分類整理まで反映済み
- セクション開閉状態の localStorage 保存は実装済み（`talking.editor.rightPaneSections.v1`）
- 以降は本格的な情報設計v2（画面全体）を段階的に進める
- 残課題: `GameNodePropertyForm` などへの共通コンポーネント化
- 残課題: セクション要約表示の強化
- 残課題: スマホ/タブレット向け編集体験の再設計
- 残課題: 3ペイン構造そのものの再設計

#### 右ペインのセクション化MVP（実装済み）
既存の編集フローを維持したまま、右ペイン情報のカテゴリ整理は完了済み。

> 注: 以下は当時の検討メモ。後続作業で通常表示・全画面表示ともに実装済み。

- 実装済み分類: 基本情報 / 表示・素材 / 演出 / 遷移・分岐 / シナリオチェック / 危険操作
- 実装済み整理: 危険操作は通常操作と分離し、ノード削除導線を独立配置
- 実装済み整理: `表示・素材` にキャラクター配置、`演出` にカメラ/カメラ演出/ビジュアルエフェクト/カラーフィルターを配置
- 残課題は `edit画面 情報設計v2` および `P3` セクションの項目を参照

#### ノード参照切れ警告・到達不能ノード検出
ノード削除や分岐編集に伴う整合崩れを減らすため、参照切れ警告と孤立ノード検出を追加する。
- ノード削除前に参照元件数を集計して警告する
- 保存時または一覧表示時に、どこからも到達できないノードを検出する
- 将来的な削除導線と合わせて管理画面に表示する

#### ゲームプレイ画面のキーボード操作

> 注: 下記の MVP 案は 2026-05-01 時点の将来課題メモ。後続作業（2026-05-01 ゲームプレイ画面キーボード操作MVP実装）で**実装済み**。✅ 実装済みセクションのテストプレイ欄を参照。

残課題（キーボードMVP実装後）:
- キーコンフィグ（Enter/Space/矢印キーのリマップ）
- AUTO / Skip の高度化
- プレイヤーごとのセーブデータ設計
- スマホ/タブレット向けプレイ操作最適化

#### AUTO / Skip の高度化
MVP では固定待機時間・固定速度・既読管理なしで実装済み。今後はノベルゲーム向けの自然な挙動へ拡張する。
- 既読管理の導入
- 既読部分だけ Skip
- 未読も含めた強制 Skip
- 未読到達時の Skip 停止
- Ctrl 長押し Skip
- クリック長押し / キー長押しによる一時 Skip
- Skip 速度設定
- Auto 待機時間設定
- ボイス再生終了待ち Auto
- Auto / Skip のユーザー設定保存
- プレイヤーごとの既読ログ保存
- AUTO 中の選択肢自動選択
- 難易度: 中〜高（既読状態・設定保存・入力設計の追加が必要）

#### バックログからの場面ジャンプ
バックログのエントリをクリックしてその時点に戻る。
- 難易度: 高（変数スナップショットが必要）

#### スタッフロール / クレジット表示
ゲーム終了時にスタッフロールやクレジットを表示する機能。
- ゲーム作者の表示
- 使用アセットの作者表示（背景・BGM・SE・キャラクター素材など分類）
- Special Thanks などの自由記述欄
- エンディングノード到達時にスタッフロールへ自動遷移する機構の検討
- 設計上の考慣事項:
  - ユーザー表示名機能が必要
  - アセット作者表示が必要
  - 使用アセット一覧をゲームから集計できる必要がある
  - 削除済み/非公開アセットのクレジット表示方針が必要
  - クレジット表示許諾や表示名の扱いを検討する
- 実装優先度: 主要な制作・公開・プレイ機能が安定した後（P3 以降）
- 難易度: 高（ユーザー表示名・アセット作者情報・集計処理の実装が必要）

### P3 — 構造改善（中長期）

#### 折りたたみ状態の保存（実装済み）
右ペインの各セクション開閉状態は LocalStorage 保存済み。
- キー: `talking.editor.rightPaneSections.v1`
- 通常表示/全画面表示で同一状態を共有
- 将来課題: ゲームID別保存（`...:gameId`）の導入検討

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
AIや外部ツールでテスト用シナリオを作りやすくし、テキストベース編集・共有を可能にする将来課題。

目的:
- AIや外部ツールでテスト用シナリオを作りやすくする
- テキストベースでシナリオを編集・共有しやすくする
- デバッグ用・サンプル用のゲームデータを作りやすくする

段階案:
1. Export JSON
	- `GameProject` / `GameScene` / `GameNode` / `GameChoice` を JSON 出力
	- まずはバックアップ・確認用途
2. Import JSON
	- JSON からシーン/ノード/選択肢を作成
	- 既存ゲームへの追加 / 全置換 / 新規ゲーム作成のモードを検討
3. AI向けMarkdown/DSL
	- 人間とAIが読み書きしやすいテキスト形式を検討
	- 例: `# Scene: プロローグ` / `## Node: start` / `本文:` / `choices:`

検討事項:
- import時のID解決
- node alias と実DB node id の対応
- `nextNodeId` / `choice targetNodeId` の解決
- 既存シーン/ノードとの衝突処理
- 上書き / 追加 / 全置換 のモード
- アセット参照の表現
- バリデーションとプレビュー
- 失敗時ロールバック
- AI生成シナリオのテスト用途整備

- 難易度: 中〜高

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

- BGMクロスフェード（難易度: 中）
- ノードごとのfadeMs設定（難易度: 中）
- BGM/SE音量設定UI（難易度: 中）
- SE個別フェード（難易度: 中）
- 音声ミキサー（難易度: 高）
- 複数BGMレイヤー（難易度: 高）
- ユーザー設定保存（音量・フェード設定）（難易度: 中）
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
