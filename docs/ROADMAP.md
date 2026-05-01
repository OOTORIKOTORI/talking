# Talking 開発ロードマップ

> 最終更新: 2026-05-01（ゲーム公開・共有フローMVP実装）
> 用途: **進捗管理の正ドキュメント**。作業完了のたびに更新すること。
> `docs/handoff.md` は旧メモ・補助資料。進捗同期はこのファイルを正とする。

---

## 🏗️ ビルド状態

| 日付 | 結果 | 備考 |
|------|------|------|
| 2026-05-01 | ✅ exit 0 | WARN: `@nuxt/icon` Nuxt 3.19.3 非互換（>=4.0.0 必要）、browserslist 7ヶ月古い（軽微） |

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

### 🟡 優先度中
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

#### NodePicker キーボード操作
現在はマウス操作のみ。矢印キー + Enter で選択・確定できるようにする。

#### キャラクター Meilisearch インデックス
現在はキャラクター検索が Prisma 直取得。アセットと同様に Meilisearch でインデックス化する。

#### `@nuxt/icon` の互換問題を解消
まずは Nuxt 3 系で使える `@nuxt/icon` のバージョン固定・設定見直し・代替実装を優先する。
Nuxt 4 移行は別タスクとして影響範囲を評価したうえで判断する。

### P2 — プレイ体験向上（優先度中）

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
