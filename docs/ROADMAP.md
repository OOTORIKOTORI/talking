# Talking 開発ロードマップ

> 最終更新: 2026-05-20（FI-118 公開前チェックUX polish MVP — issue一覧の表示中件数サマリー・スクロール上限・カード視認性・パネル開閉ボタン改善）
> 用途: **進捗管理の正ドキュメント**。作業完了のたびに更新すること。
> `docs/handoff.md` は旧メモ・補助資料。進捗同期はこのファイルを正とする。
> 未着手・自由アイデアの索引は `docs/IDEA_BACKLOG.md` を参照。

---

## 📍 現在地サマリ（2026-05-20）

最新仕様確認コミット: 19acd25a3a25a3b32d809bb4a49dcb975cf4647e（FI-055 Phase 2-i implementation commit）

以下の MVP が一区切り済みです。

**公開・クレジットまわり**
- スタッフロールUI MVP（プレイ終了画面 + 公開ゲーム詳細から表示、既存 `GET /games/:id/credits` を再利用）
- クリア後エンドカードMVP（公開プレイの終端で読了後カードを表示し、作品詳細・作者プロフィール・スタッフロール・公開ゲーム一覧へ回遊できる導線を追加）
  - **軽polish 2026-05-16**: エンドカード表示中のテストプレイパネル等背景UIの映り込みを低減。背景を StageCanvas 中心に、エンドカードのボタンレイアウトをスマホ幅対応に
- スタッフロール表示順カスタマイズMVP（`staffRollSectionOrder`、ゲーム単位で「手動クレジット / 使用素材 / 使用キャラクター」の大分類順のみを変更可能）
- スタッフロール設定MVP（ゲーム単位ON/OFF、default ON。OFF時は導線のみ非表示で通常クレジット表示と `GET /games/:id/credits` は維持）
- スタッフロール自動表示ON/OFF MVP（`staffRollAutoOpenEnabled`、default OFF。`staffRollEnabled=false` 時も自動表示設定は操作・保存できるが、実際の自動表示は行われない。プレイ終了時の自動表示は1回のみ）
- スタッフロール速度設定MVP（ゲーム単位で「ゆっくり/標準/速い」3段階。設定は「ゲーム全体設定 > クレジット/スタッフロール」で「全体設定を保存」反映。既存ゲームのデフォルトは標準）
- スタッフロール設定UI polish完了（全体設定モーダル内のサマリ表示を調整し、OFF時の自動表示ONを `自動表示ON（OFF中は開きません）` と明示）
- 「クレジット/スタッフロール」表現統一完了（タブ名・設定文言の呼称を統一）
- 手動クレジットUI/API MVP（`GameCredit.kind = MANUAL`、owner向けCRUD、公開中即反映）
- 右ペイン軽量化MVP（スタッフロール設定・手動クレジットを編集画面右ペインから「ゲーム全体設定 > クレジット/スタッフロール」へ移設済み）
- 制作ガイドカードMVP（編集画面右ペインに、開始地点・ノード数・カバー画像・公開前チェックから次アクションを案内する非強制ナビを追加。折りたたみ・非表示・再表示に対応し、右ペインの圧迫を抑制）
  - **軽polish 2026-05-16**: カード全体を縦幅抑制、完了状態表示をコンパクト化、余白削減、ボタンサイズ・配置最適化、補足文言の出すぎ抑制
- スタッフロール表示は「クレジット/スタッフロール」タブ内で設定し、右下の「全体設定を保存」で反映
- 手動クレジットは同タブに表示するが、追加/編集/削除は個別保存
- 公開前確認モーダル（クレジット/利用条件/status 警告/修正候補表示/編集導線強化）
- 公開前クレジット確認から該当 issue への直接ジャンプMVP完了
- 非公開ゲームの公開前確認では現在参照のみ表示（削除済み locked credit の混入を防止）
- Asset.isPublic MVP（Boolean）実装: 公開一覧/検索/プロフィール/お気に入りは `isPublic=true` を基準、自分の一覧と owner 自身の詳細は private 表示可
- Asset/Character 非公開化時の利用影響表示MVP: 編集保存で `isPublic: true -> false` の場合のみ usage-impact を確認し、参照中ゲームがあるときは保存前 warning モーダルを表示（確認後続行可、保存ブロックなし）
- この素材/キャラクターが使われている作品MVP: 公開素材/公開キャラクター詳細に、参照している公開ゲームを最大6件表示。`GameAssetReference` / `GameCharacterReference` を利用（詳細参照位置・ランキングは未実装）
- GameCredit DB 分離・公開時点スナップショット固定・公開後即 lock 運用
- 公開中編集時の注意バナー（折りたたみ状態 localStorage 保存）
- 公開中ゲームの保存前再確認UX（`window.confirm`、キャンセルで保存中断）
- 公開中ゲームでは、全体設定モーダル内の公開版に影響する変更を保存する時に共通confirmを表示
- 全体設定で変更なし保存時はconfirmを出さない
- 非公開ゲームの全体設定保存ではconfirmを出さない
- 手動クレジットの個別保存confirmは全体設定保存confirmとは別管理
- 公開中ゲームの構造変更confirm拡張（ノード削除/シーン削除/開始シーン変更/開始ノード変更）

**プロフィール/作者表示まわり**
- CreatorProfile / ownerDisplayName / ownerDisplayNameSnapshot
- 作者プロフィールページ・公開コンテンツ一覧（各最大6件）
- 作者リンク/お気に入りボタンのHTML構造整理MVP（公開素材カード/公開キャラクターの詳細リンク・作者リンク・お気に入り導線をDOM上で分離、DB/API変更なし）

**一覧ページ上部の検索・フィルタUI polish MVP**（2026-05-14 実装）
 - `/assets` / `/characters` / `/my/assets` / `/my/characters` の検索・フィルタ領域の見た目を統一
	 - 検索入力上部に「検索」「絞り込み」の軽い見出しを追加
	 - フィルタカード内のレイアウトは、素材系（`/assets`, `/my/assets`）は `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`、キャラクター系（`/characters`, `/my/characters`）は `grid grid-cols-1 md:grid-cols-2` を採用（いずれもスマホでは1カラム）。
	 - ボタン・チップ・入力欄の見た目を統一（label: `text-xs font-semibold`、button: `px-3 py-2 text-sm font-medium`、rounded-lg）
	 - プライマリタグの checkbox を視覚的にボタン状に表示（`accent-blue-600` で focus 改善）
	 - 適用/リセットボタン行をグリッド全幅に配置し、スマホ幅でも押しやすい横並び2分割に整理
	 - 既存の検索条件・URL query・API 仕様は維持（`q`, `contentType`, `primaryTag`, `tags`, `sort`, `visibility` のクエリ名変更なし）
	 - `/assets` と `/my/assets` の `onSearchInput` debounce（300ms）維持
	 - `/characters` と `/my/characters` の `applyFilters` / `resetFilters` 挙動維持
	 - DB/API/migration 変更なし（UI/Tailwind レイアウト調整のみ）
	 - 出典: `apps/frontend/pages/assets/index.vue`, `apps/frontend/pages/characters/index.vue`, `apps/frontend/pages/my/assets/index.vue`, `apps/frontend/pages/my/characters/index.vue`

**管理側の空状態 / エラー状態 polish MVP**（2026-05-14 実装）
- 対象: `/my/assets` と `/my/characters`
- loading/error/empty を管理一覧で統一
	- loading: 白カード調（`bg-white border border-gray-200 rounded-lg shadow-sm p-8`）
	- error: 赤背景パネル（アイコン + タイトル + 本文 + 再読み込みボタン）
	- empty: 白カード調（`bg-white border border-gray-200 rounded-lg shadow-sm px-6 py-12 text-center`）
- 初回0件と検索/絞り込み結果0件で導線を分岐
	- `/my/assets`: 初回0件は `/upload` へのアップロード導線、条件あり0件は `resetFilters()` の「条件をリセット」
	- `/my/characters`: 初回0件は `/my/characters/new` への作成導線、条件あり0件は `resetFilters()` の「条件をリセット」
- `/my/assets` のエラー再読み込みは `offset = 0` に戻して `performSearch()` を再実行
- `/my/characters` のエラー再読み込みは `fetchCharacters()` を再実行
- DB/API/migration 変更なし（ページ内UI整理のみ）
- 出典: `apps/frontend/pages/my/assets/index.vue`, `apps/frontend/pages/my/characters/index.vue`

**お気に入り一覧 / Explore 表示 polish MVP**（2026-05-14 実装）
- `/my/favorites`（素材）・`/my/favorites/characters`（キャラクター）・`/explore` の UI 見た目・余白・見出し・カード配置を公開ギャラリー・コンテンツ管理に統一
  - **ページ構造の統一**:
    - ヘッダー: 白背景・shadow-sm、見出し・TabsSwitch 配置（`/my/favorites` / `/my/favorites/characters`）、padding 統一（`px-4 sm:px-6 lg:px-8 py-4`）
    - メインコンテンツ: `min-h-screen bg-gray-50`、padding（`px-4 sm:px-6 lg:px-8 py-8`）
    - グリッド列数: `/explore` は `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` gap-6（公開ギャラリー・コンテンツ管理と統一）。`/my/favorites` ・ `/my/favorites/characters` は後続の検索/フィルタ追加 MVP でグリッドを調整（最終値は各 MVP のグリッド記載を参照）
  - **空状態・読み込み状態の改善**:
    - `/my/favorites` / `/my/favorites/characters`: SVG アイコン + テキスト（例: 「お気に入りの素材はまだありません」+ 補足説明）
    - `/explore`: 読み込み状態（スピナー + 「読み込み中…」）、エラー状態（赤背景パネル）、空状態（アイコン + テキスト）
  - **Explore の ASSET/CHAR ラベル維持**: 位置・サイズ・色を調整し、カードと視覚的に競合しない配置（`absolute left-2 top-2 z-10 rounded bg-gray-900/80 px-2 py-0.5 text-[10px] font-semibold text-white`）
  - **カード表示・お気に入り ON/OFF 挙動**: AssetCard / CharacterCard の既存責務は維持、詳細リンク・作者リンク・お気に入りボタンの DOM 構造は維持
  - DB/API/migration 変更なし（UI/Tailwind レイアウト調整のみ、既存クエリ・導線維持）
  - 当該表示 polish 時点では検索/フィルタ機能は追加しない（後続の各検索/フィルタ追加 MVP で追加済み）
  - 出典: `apps/frontend/pages/my/favorites/index.vue`, `apps/frontend/pages/my/favorites/characters.vue`, `apps/frontend/pages/explore.vue`

**トップページ / ホーム導線 polish MVP**（2026-05-14 実装）
- 対象: `/`（`apps/frontend/pages/index.vue`）
- 目的: 一覧UI統一シリーズ後の軽量 polish として、トップを「公開コンテンツを見つける入口」と「制作を始める入口」に整理
- 実装内容:
	- レイアウトを `min-h-screen bg-gray-50` + `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8` に変更
	- ヒーロー文言を更新し、主要CTAを配置（`/explore`, `/games`, `/my/games`, `/upload`）
	- 主要導線カードを追加（見つける / 公開ギャラリー / キャラクター / 公開ゲーム / ゲーム制作 / 素材アップロード）
	- `/explore` カードをやや強調し、横断入口として視認性を向上
	- API状態カードは削除せず、ページ下部の「開発状態」として控えめに配置
	- `useFetch(`${config.public.apiBase}/health`)` と `pending/error/data` の既存表示ロジックは維持
- スコープ明記:
	- 本格的なLP化は行わない（入口整理MVPに限定）
	- DB/API/migration変更なし
- 出典: `apps/frontend/pages/index.vue`, `docs/PROJECT_SPEC.md`, `docs/file-map.md`

**トップページ 新着コンテンツ枠MVP**（2026-05-14 実装）
- 対象: `/`（`apps/frontend/pages/index.vue`）
- 目的: トップページから公開コンテンツへの導線を増やすため、新着表示を追加
- 実装内容:
	- 主要導線カードと「開発状態」カードの間に「新着コンテンツ」セクションを追加
	- 3カテゴリを最大3件ずつ表示
		- 最近公開されたゲーム（`listPublic({ limit: 3, offset: 0, sort: 'new' })`）
		- 最近追加された素材（`listPublic({ limit: 3, offset: 0, sort: 'createdAt:desc' })`）
		- 最近追加されたキャラクター（`listPublic(undefined, 3, 0, { sort: 'createdAt:desc' })`）
	- 各カテゴリは独立取得として実装し、1カテゴリ失敗時もトップ全体は表示継続
	- 各カテゴリに empty / error 表示を実装（0件時文言、取得失敗時「取得できませんでした」）
	- レイアウト: PCで3カラム、スマホで1カラム縦積み
- スコープ明記:
	- 今回は新着順表示のみ（ランキングではない）
	- 既存のランキング/人気順/プレイ数順/使用数順、今遊ばれている/今使われている系の実装は後続課題として維持
	- DB/API/migration変更なし
- 出典: `apps/frontend/pages/index.vue`, `docs/PROJECT_SPEC.md`, `docs/file-map.md`

**お気に入り一覧の検索/フィルタUI追加 MVP**（2026-05-14 実装）
- `/my/favorites`（素材お気に入り）に検索・フィルタUI追加
  - **検索/フィルタカード**: 白カード（`bg-white p-4 sm:p-5 rounded-lg shadow-sm`）、検索欄 + フィルタ項目 + 適用/リセットボタン
  - **フィルタ項目**: コンテンツタイプ（すべて/画像/音声）、プライマリタグ（背景/一枚絵/その他/BGM/効果音/ボイス/その他）、タグ（カンマ区切り）、並び替え（新しい順/古い順）
  - **URL クエリ同期**: `q`, `type`, `primaryTag`, `tags`, `sort` を保有し復元（`sort` は active filter 判定から除外）
  - **loading/error/empty 状態**: スピナー + 「読み込み中...」、エラーパネル（再読み込みボタン付き）、条件なし0件 vs 条件あり0件で導線分岐
  - グリッド: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`、適用/リセット: `grid-cols-2 gap-3`
- `/my/favorites/characters`（キャラクターお気に入り）に検索・フィルタUI追加
  - **検索/フィルタカード**: 素材と同じ白カード構成
  - **フィルタ項目**: タグ（カンマ区切り）、並び替え（新しい順/古い順/名前順）
  - **URL クエリ同期**: `q`, `tags`, `sort` を保有し復元（`sort` は active filter 判定から除外）
  - **loading/error/empty 状態**: 素材と同じ構成・言葉遣い
  - グリッド: `grid-cols-1 md:grid-cols-2 gap-4`、適用/リセット: `grid-cols-2 gap-3`
- **API側対応**:
  - 素材: `FavoritesModule` に `FavoritesListController` / `FavoritesToggleController` を登録し、`GET /favorites` で `q`, `type`, `primaryTag`, `tags`, `sort`, `limit`, `offset` をサポート
  - キャラクター: `CharacterFavoritesController.list` で `q`, `tags`, `sort`, `limit`, `offset` をサポート
  - 既存 `FavoritesService.list()` / `CharacterFavoritesService.list()` の filter ロジック活用、DB/migration 変更なし
  - 返却形式: 素材 `{ items, total }`、キャラクター配列維持
- **型・composable 更新**:
  - `packages/types/src/favorites.ts` の `FavoritesQuery`: `primary` → `primaryTag` に修正
  - `useAssetsApi().listFavoriteAssets(query)` / `useCharactersApi().listFavoriteCharacters(query)` は空値を送信しない（既存動作継続）
- **ドキュメント更新**:
  - `docs/PROJECT_SPEC.md`: UI構成・フィルタ項目・API仕様記載
  - `docs/ROADMAP.md`: 実装済み MVP 追記
- **お気に入り解除時の一覧即時除去 polish**（2026-05-14 実装）
	- 対象: `/my/favorites` と `/my/favorites/characters`
	- `AssetCard` / `CharacterCard` はお気に入り切り替え成功時に `favorite-toggled` を emit
	- favorites 親ページで `favorite-toggled` を受け、`isFavorited=false` のときだけ親配列から該当カードを即時除去
	- `/my/favorites` は `total` も `Math.max(0, total - 1)` で調整
	- 公開ギャラリー（`/assets`, `/characters`）・管理一覧（`/my/assets`, `/my/characters`）ではカードを除去しない
	- カード内の optimistic update は維持し、API失敗時はロールバックして emit しない
	- DB/API/migration 変更なし（カードイベント経由のフロント親配列除去のみ）
- **スコープ制限**: DB/migration 変更なし、既存お気に入り導線・toggle 挙動維持

**Explore 検索/フィルタ追加 MVP**（2026-05-14 実装）
- `/explore` ページに検索・フィルタUI追加
  - **ページ見出し・説明文更新**:
    - 見出しを「見つける」に変更（従来「Explore」）
    - 説明文を「公開されている素材やキャラクターをまとめて探せます。」に変更
  - **検索/フィルタカード**: 白カード（`bg-white p-4 sm:p-5 rounded-lg shadow-sm`）、検索欄 + フィルタ項目 + 適用/リセットボタン
  - **フィルタ項目**: 
    - 検索（`q`）: placeholder「素材・キャラクターを検索（名前・説明・タグ）」
    - 種別（`kind`）: `all` / `asset` / `character`、表示「すべて / 素材 / キャラクター」（API呼び出しを分岐）
    - タグ（`tags`）: カンマ区切り
    - 並び替え（`sort`）: `createdAt:desc` / `createdAt:asc`、表示「新しい順 / 古い順」
  - **URL クエリ同期**: `q`, `kind`, `tags`, `sort` を保有し復元（`sort` は active filter 判定から除外）
  - **loading/error/empty 状態**:
    - loading: 白カード内スピナー + 「読み込み中...」
    - error: 赤背景パネル（アイコン + 「コンテンツの取得に失敗しました」+ 「再読み込み」ボタン）
    - empty（条件なし）: 「公開コンテンツはまだありません」+ 「公開された素材やキャラクターがここに表示されます。」
    - empty（条件あり）: 「条件に一致するコンテンツはありません」+ 「検索語や絞り込み条件を変えて試してください。」+ 「条件をリセット」ボタン
  - **データ取得**:
    - `kind=all`: `/search/assets` と `/characters` API を並列呼び出し、`createdAt` で再ソート
    - `kind=asset`: `/search/assets` のみ呼び出し
    - `kind=character`: `/characters` API のみ呼び出し
    - 各 API に `q`, `tags`, `sort` を渡す（既存 API で既にサポート済み）
    - `/search/assets` はログイン時に `isFavorited` / `isFavorite` を返す（後続の整合チェックで追加済み）
  - **カード・お気に入り挙動**: AssetCard / CharacterCard の既存責務・ASSET/CHAR ラベル維持、お気に入り解除してもカードは除去しない（`/my/favorites` のみ除去）
  - グリッド: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`、gap-6
  - 適用/リセット: `grid-cols-2 gap-3`
  - DB/migration 変更なし（検索/フィルタ MVP 自体は既存エンドポイント・クエリ仕様を活用。後続の整合チェックで `/search/assets` の返却にお気に入り状態を追加済み）
  - ゲーム表示なし（現在は素材・キャラクターのみ）
- **スコープ制限**: 
  - contentType / primaryTag フィルタは追加しない（素材専用フィルタ）
  - キャラクター専用フィルタ（Emotion など）は追加しない
  - ルート `/explore` は変更しない
	- グローバルナビ PC / スマホメニューに `/explore` への「見つける」導線あり
- DB/migration 変更なし（検索/フィルタ MVP 自体は既存スキーマ・filter ロジック再利用。後続の整合チェックで `/search/assets` の返却にお気に入り状態を追加済み）
- 出典: `apps/frontend/pages/explore.vue`, `apps/frontend/app.vue`, `apps/frontend/pages/index.vue`, `apps/frontend/pages/my/favorites/index.vue`, `apps/frontend/pages/my/favorites/characters.vue`, `apps/api/src/favorites/*.ts`, `apps/api/src/characters/character-favorites.*`, `packages/types/src/favorites.ts`, `docs/`

**ゲーム制作/編集基盤まわり**
- ゲーム複製・公開前チェック（error ブロック/warning 確認）・参照診断・シナリオチェック
- FI-055 Phase 2-a: `NodeTransitionFields.vue` による次ノード選択 / 次ノード作成時コピー対象フォーム共通化MVP
- FI-055 Phase 2-b-1: `NodeChoicesFields.vue` による選択肢UI（通常遷移先/状態操作/条件分岐先）共通化MVP
- FI-055 Phase 2-b-2: `buildNodePayloadForSave` を `edit.vue` script 内に抽出し、`saveNode` / `saveAndCreateNext` の保存payload正規化を一元化
- FI-055 Phase 2-c: `NodeBasicInfoFields.vue` を新規作成し、通常表示/全画面表示の「基本情報」セクション（台詞/継続チェック/話者キャラ/話者表記）を共通化
- 話者キャラクリア後の表示修正: `speakerCharacterId` が空のとき `selectedCharLabel` が「未選択」を返すよう修正（`speakerDisplayName` は独立して保持）
- FI-055 Phase 2-d-1: `NodeMaterialsFields.vue` を新規作成し、通常表示/全画面表示の「表示・素材」セクションのうち背景/BGM/効果音(SE) UIを共通化
- FI-055 Phase 2-d-2: `NodePortraitsFields.vue` を新規作成し、通常表示/全画面表示のキャラクター配置UIを共通化（表示・素材セクション内の残り重複を解消）
- FI-055 Phase 2-e: `NodeSaveActions.vue` / `NodeDangerZone.vue` を新規作成し、通常表示/全画面表示の保存ボタン・危険操作セクションを共通化
- FI-055 Phase 2-f: `EditorPublishCheckSummaryCard.vue` を新規作成し、公開前チェックパネル内のサマリーカードを共通コンポーネント化（表示用 computed を移譲）
- FI-055 Phase 2-g: `EditorPublishCheckIssueList.vue` を新規作成し、公開前チェックパネルの issue 一覧表示（情報折りたたみ・対象へ移動・highlight）を共通コンポーネント化（フィルターUI・カテゴリフィルター・参照診断API処理は `edit.vue` 側に残置）
- FI-055 Phase 2-h: `EditorPublishCheckFilters.vue` を新規作成し、公開前チェックパネルの severity filter / category filter ボタン列を共通コンポーネント化。`scenarioFilterButtonClass` / `scenarioCategoryFilterButtonClass` を `edit.vue` から削除（フィルター状態管理・issue算出・API処理は `edit.vue` 側に残置）
- FI-055 Phase 2-i: `EditorPublishCheckPanel.vue` を新規作成し、公開前チェックセクションの外枠・見出し・折りたたみ・件数チップ・参照診断中/エラー表示・3コンポーネント配置を共通コンポーネント化。`edit.vue` から `EditorPublishCheckSummaryCard` / `EditorPublishCheckFilters` / `EditorPublishCheckIssueList` の直接 import を削除（scenario check API・diagnostics API・filter state・focus処理は `edit.vue` 側に残置）
- **FI-055 Phase 2 UIコンポーネント化MVP 一区切り（2026-05-20）**: 通常表示/全画面表示の主要フォームUI重複はおおむね解消済み。残る scenario check API / reference diagnostics API / filter state / issue算出 computed の切り出しは Phase 3候補として保留。急ぎではなく、`edit.vue` の変更頻度や事故リスクが高まった時に着手する。
- **公開前チェックUX polish MVP（FI-118、2026-05-20）**: issue一覧に表示中件数サマリー行（「表示中 N件 / 全 M件」）を追加。issue カード一覧に `max-h-[360px]` スクロール上限を設定し画面圧迫を低減。カード余白・severity/categoryラベル並び・「対象へ移動」ボタンスタイル・highlighted ring を軽くpolish。パネル折りたたみボタンに開閉矢印と active スタイルを追加。
- **次の開発候補**: FI-057 edit画面情報設計v2 / テストプレイ高速確認まわりなど
- 話者キャラ欄の独立性修正: `speakerCharacterLabel` ref を追加し、話者キャラ欄の表示が `speakerDisplayName` の手入力に引っ張られないよう改善。`clearChar()` で `speakerDisplayName` を消去しないよう修正
- `refreshSpeakerCharacterLabel(characterId)` async helper を追加: `selectNode()` 時に API から実際のキャラ名を取得し `speakerCharacterLabel` を正確な名前で更新（`/my/characters/:id` → `/characters/:id` フォールバック、レースコンディションガード付き）
- 制作ガイドボタンUX修正: ボタン文言を「📋 ガイド」に固定し、表示中は active スタイルで状態を示す（`📋 ガイドを閉じる` への動的変化を廃止）
- 開始ノード到達不能判定見直しMVP（到達可能性の起点にゲーム開始ノード + 各シーン開始ノードを採用し、false positiveを抑制）
- 右ペインセクション化・localStorage 保存・作業位置復元
- edit 画面右ペイン上部アクション群の整理MVP（表示 / 設定 / 出力で軽くグルーピング。既存ボタン挙動は不変、狭い幅では flex-wrap で自然に折り返し）
- 作者向けテストプレイ支援MVP一区切り（テストプレイパネルUI整理・選択肢までスキップ・`/games/:id/play` のクエリなし開始時に `startSceneId` 優先へ修正）
- テストプレイパネル小コンポーネント化MVP（`apps/frontend/components/game/TestPlayPanel.vue` 抽出。通常表示/フルスクリーン表示の両方で同一コンポーネントを利用し、挙動変更なし）
- edit 画面3ペイン幅 localStorage 復元のクランプ修正（`gameEditorPaneWidths`。過大/過小/壊れ値を安全値へ補正し、ウィンドウリサイズ時も再補正）
- edit 画面の表示設定リセット導線MVP（右ペイン上部UIから、3ペイン幅 / 右ペイン開閉 / 最後の選択位置を安全にリセット。localStorage由来の表示崩れや作業位置復元ミスから復旧しやすくする。ゲーム内容は変更しない）

**共通インフラ**
- 共通ヘッダースマホ対応・`/my/games` SSR 由来エラー修正
- RUNBOOK / migration / Meili手順整理MVP（運用ドキュメント整備）
	- UI変更ではなく、ローカル環境更新時の事故低減を目的に手順を整理
	- `docs/RUNBOOK.md` を現行運用に更新（migrate/generate/build、`init-meilisearch.ps1` 推奨、Meili復旧フロー、Windows EPERM 対策、検証ログ非コミット注意）
	- `apps/api/scripts/reindex-search.ts` で `isPublic` / `thumbKey` をキュー payload へ渡すよう更新
	- `search:reindex` script を追加（root と `apps/api`）

次にやることは「[🎯 次にやる候補](#-次にやる候補)」を参照。

---

## ✅ 実装済み（主要）

### 公開・クレジットまわり

- **この素材/キャラクターが使われている作品MVP**（2026-05-15 実装）（公開素材詳細 `/assets/:id` と公開キャラクター詳細 `/characters/:id` に、参照している公開ゲーム一覧を表示。API は `GET /assets/:id/used-in-games` と `GET /characters/:id/used-in-games` を追加し、`GameAssetReference` / `GameCharacterReference` を利用。対象ゲームは `deletedAt: null` かつ `isPublic: true` のみ。デフォルト最大6件、`hasMore` あり。表示項目はタイトル/作者/概要/使用回数/使用箇所/閲覧数/プレイ数。ノード/シーン単位の詳細表示、ページネーション、ランキング、`usedInGameCount` カラム追加、Meilisearch連携は未実装。既存 `usage-impact` は削除/非公開影響確認用途として維持。）

- **スタッフロール終了時挙動MVP**（2026-05-12 実装）（`GameProject.staffRollEndBehavior`（TEXT NOT NULL DEFAULT 'stop'）を追加（migration: `20260512130000_add_staff_roll_end_behavior`）。ゲーム単位で自動スクロール末尾到達時の挙動を「最後で停止（`stop`）/ 最後で閉じる（`close`）/ 先頭に戻ってループ（`loop`）」の3択で選択可能。設定場所は「ゲーム全体設定 > クレジット/スタッフロール」タブ内、スクロール速度設定の下。スマホ幅でも押しやすいUIにする（grid-cols-2 / sm:grid-cols-3）。自動スクロール末尾到達時だけ挙動を適用。手動スクロール/ホイール/タッチ操作による一時停止の既存挙動は維持。`stop` は末尾で停止、`close` は末尾でモーダル自動閉じ、`loop` は末尾から先頭へ戻り自動スクロール継続。`staffRollEnabled=false` でも設定値は保存される。公開中ゲーム側は共通confirm対象。`credits.counts.total === 0`（空表示）時は無理に終了時挙動を発火しない。ユーザーが明示的に一時停止中は末尾挙動を暴発させず、モーダル閉じ後に interval/timer が残らないようクリーンアップ。BGM/SE連動・より凝った演出は将来課題。）

- **スタッフロール自動表示ON/OFF MVP**（2026-05-11 実装）（`GameProject.staffRollAutoOpenEnabled`（BOOLEAN NOT NULL DEFAULT false）を追加（migration: `20260511120000staffrollautoopenenabled`）。設定場所は「ゲーム全体設定 > クレジット/スタッフロール」タブ。`staffRollEnabled=false` の場合は自動表示設定を有効化していても自動表示しない。公開中ゲームでこの設定を変更して「全体設定を保存」する場合も、既存の共通confirm対象。非公開ゲームではconfirmなし。プレイ画面では終了状態到達時に `staffRollEnabled !== false` かつ `staffRollAutoOpenEnabled === true` のときだけスタッフロールを自動で開き、1プレイ中に1回のみ自動表示する。モーダルを閉じた後の再レンダーでは再表示しない。手動ボタン・既存速度設定・`GET /games/:id/credits` 仕様は維持。）

- **スタッフロール速度設定MVP**（2026-05-10 実装）（`GameProject.staffRollSpeedPreset`（TEXT NOT NULL DEFAULT 'normal'）を追加（migration: `20260510130000staffrollspeedpreset`）。ゲーム単位で「ゆっくり / 標準 / 速い」3段階の自動スクロール速度を選択できる。設定場所は「ゲーム全体設定 > クレジット/スタッフロール」タブ内、スタッフロール表示ON/OFF トグルの下。速度設定は「全体設定を保存」で反映される（ON/OFFと同一保存フロー）。公開中ゲームで速度変更して保存する場合も共通confirm対象。既存ゲームのデフォルトは「標準」（42px/sec）。slow=28px/sec、fast=64px/sec。`staffRollEnabled=false`でも速度値は保存される。ON/OFF設定・通常クレジット表示・`GET /games/:id/credits` は維持。速度設定MVP実装時点では「エンディング後自動表示」は将来課題だったが、2026-05-11に「スタッフロール自動表示ON/OFF MVP」として実装済み。残る将来課題は「BGM、より細かな速度カスタマイズ、カテゴリ別アニメーション、より凝った演出」。）

- **スタッフロールUI MVP**（2026-05-09 実装）（`apps/frontend/components/game/GameStaffRollModal.vue` を追加。`GET /games/:id/credits` の既存レスポンスをそのまま表示。プレイ終了画面（通常/フルスクリーン）と公開ゲーム詳細ページに導線を追加。DB変更・migration追加・API追加なし。演出強化MVPとして自動スクロール（初期ON・最下部停止）、停止/再開、先頭へ戻る、手動操作時の自動停止、スクロールバーを目立たせない表示、上下フェード/再生状態表示/中央上映寄りレイアウトを実装。より凝った演出・カテゴリ別アニメーション・BGM/SE連動は将来課題。速度設定・自動表示ON/OFFは別MVPで実装済み。）

- **スタッフロール設定MVP**（2026-05-10 実装）（`GameProject.staffRollEnabled` を追加し、ゲーム編集画面で導線表示ON/OFFを保存可能化。defaultは `true` で既存ゲーム挙動を維持。OFF時は公開詳細の「スタッフロールで見る」とプレイ終了画面（通常/フルスクリーン）の「スタッフロール」ボタンのみ非表示にし、通常クレジット表示と `GET /games/:id/credits` は変更しない。`GameCredit` / 手動クレジット / snapshot lock の仕様変更なし。）

- **右ペイン軽量化MVP**（2026-05-10 実装）（編集画面右ペインから「スタッフロール設定」カードと `GameManualCreditsEditor` を撤去し、`MessageThemeModal.vue` の `クレジット/スタッフロール` タブへ移設。スタッフロール設定は即時保存ではなく右下の「全体設定を保存」で反映し、手動クレジットは同タブ内で個別保存を維持。公開中ゲームでは、`staffRollEnabled` に限らず全体設定モーダル内の公開版に影響する設定変更を保存する時に共通confirmを表示し、変更なし保存や非公開ゲームではconfirmを出さない。手動クレジットの個別保存confirmは別管理。`GET /games/:id/credits`、通常クレジット表示、`GameCredit` / 手動クレジット / snapshot lock の仕様は維持。）

- **スタッフロール用クレジット取得処理の共通化**（2026-05-11 実装）（`apps/frontend/composables/useStaffRollCredits.ts` を追加し、公開ゲーム詳細ページ（`/games/:id`）とプレイ画面（`/games/:id/play`）の両方で共通利用。`GET /games/:id/credits` の取得・エラーハンドリング・再取得フローを共通化し、UI挙動は維持。）

- **手動クレジットUI/API MVP**（2026-05-09 実装）（`GameCredit.kind = MANUAL` をゲーム単位の手動クレジットとして運用。`GET/POST/PATCH/DELETE /games/:id/manual-credits` を追加。公開中ゲームでの追加/編集は `snapshotLockedAt` を即時更新。`GET /games/:id/credits` に `manualCredits` と `counts.manual` を追加し、`counts.total` を `assets + characters + manual` に拡張。`syncGameCredits` の delete/recreate 対象を `ASSET/CHARACTER` unlocked のみに限定し、`MANUAL` を削除しないよう修正。）

- **公開前確認での最新参照反映・履歴クレジット混入防止**（`GamesService.getCredits` で非公開ゲームのオーナー公開前確認時は `collectGameReferenceUsageFromGame` を使い現在参照中の ID のみを表示対象とする。locked `GameCredit` は名前/利用条件の補完用途に限定し、現在参照されていない削除済みキャラ等が公開前確認モーダルに出ないよう修正。`apps/api/src/games/games.service.ts`）
- **公開前確認画面内の修正候補表示MVP**（クレジット確認モーダルの deleted / missing / private（素材・キャラクター）項目に、修正候補の短文ヒントをカード内表示。ノード/フィールド単位の直接ジャンプは後続MVPで実装済み。残る将来課題は一括修正・自動差し替え。`apps/frontend/components/game/GameCreditConfirmModal.vue`）
- **公開前確認画面からの編集導線強化MVP**（クレジット確認モーダルに編集画面への導線を追加。警告ありの場合に警告サマリーボタン「問題を確認する」、素材/キャラクター別カードのボタン「参照を編集」を実装。クリックで `/my/games/{id}/edit` へ遷移し、カテゴリ単位で公開前チェックへ誘導。編集画面側の既存「対象へ移動」でノードへ移動可能。後続で最初の該当issueへの直接ジャンプMVPを追加済み。`apps/frontend/components/game/GameCreditConfirmModal.vue`）
- **公開前チェックサマリーMVP**（2026-05-14 実装）（編集画面右ペインの公開前チェックパネルに、issue 一覧より上にサマリーカードを追加。全体状態として `公開準備OK` / `注意あり` / `要修正` / `チェック中…` を表示。severity 別件数（要修正 / 注意 / 情報）と既存カテゴリ別件数（構成 / 素材参照 / キャラクター参照）を表示。要修正がある場合は error 系 issue を最大 3 件表示し、3 件超は「ほか N件」で省略。issue 一覧への `#publish-check-issues` アンカー導線付き。DB/API 変更なし。自動修正・一括修正は将来課題。`apps/frontend/pages/my/games/[id]/edit.vue`）
- **公開前確認モーダルからの該当 issue 直接ジャンプMVP**（2026-05-12 実装）（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移。`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示。`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動。issue未特定時は既存のカテゴリ単位導線へフォールバック。）
- **公開前確認の複数使用箇所一覧MVP**（2026-05-12 実装）（削除済み/見つからない/非公開の素材・キャラクターが複数ノードで参照されている場合、クレジット確認モーダルのカード内に「使用箇所 N件」と Scene/Node/フィールド別の行一覧を最大5件表示。各行に「ここへ移動」ボタン（1件のみ「該当箇所へ移動」）。5件超は「ほかN件」のみ表示。issue未特定時は「参照を編集」カテゴリ導線にフォールバック。入力フィールドへのピンポイントフォーカス・一括修正・自動差し替えは将来課題。`apps/frontend/components/game/GameCreditConfirmModal.vue`）
- **公開中編集時の保存前再確認UX MVP**（公開済みゲームの編集画面で「保存」「保存して次のノードへ」実行時に `window.confirm` で再確認。キャンセル時は保存中断、続行時のみ既存保存処理を実行。非公開ゲームでは確認表示なし。公開中編集バナーと文言整合を維持。`apps/frontend/pages/my/games/[id]/edit.vue`）
- **公開中ゲームの構造変更confirm拡張 MVP**（2026-05-09 実装）（公開中ゲームのみ、ノード削除・シーン削除・開始シーン変更・開始ノード変更の直前に `window.confirm` を表示。削除系は通常削除confirmを公開中向け文言へ置き換えて1回表示に統一し、二重confirmを回避。非公開ゲームは従来挙動を維持。`nextNode`/選択肢遷移変更は保存ボタン確定フローのため既存保存confirmで扱う。`apps/frontend/pages/my/games/[id]/edit.vue`）
- **公開中編集バナー折りたたみMVP**（全文表示/省スペース表示の切り替えボタンを追加。折りたたみ状態を `localStorage`（key: `talking.editor.publishedEditBannerCollapsed.v1`）に保存し再読み込み後も維持。全ゲーム共通状態。`apps/frontend/pages/my/games/[id]/edit.vue`）
- **公開中編集時の注意バナーMVP**（`isPublic === true` のゲームを編集中、タイトル行直下に注意バナーを表示。保存時の即時公開反映と新規追加クレジットの即 lock を明示。挙動変更・自動非公開化なし。`apps/frontend/pages/my/games/[id]/edit.vue`）
- **公開時点クレジット/利用条件スナップショット固定MVP**（`GameCredit.snapshotLockedAt` 追加。公開遷移で `lockGameCreditsSnapshot` 実行。`syncGameCredits` は locked snapshot を上書き・削除しない。backfill 用に `db:lock-game-credit-snapshots`、検証用に `db:check-game-credit-snapshots` を追加）
- **公開後参照追加・削除の厳密運用**（公開済みゲームで `syncGameReferences` が走った後、`lockUnlockedGameCreditsIfPublished` により未 lock `GameCredit` を即 lock。削除された参照の locked credit は履歴として保持。2026-05-07 実装済み）
- **GameCredit DB 分離MVP**（`GameCredit` テーブル追加。`GameAssetReference` / `GameCharacterReference` から自動同期。`db:sync-game-references` 後に GameCredit も同期。`GET /games/:id/credits` は公開済みゲーム詳細で GameCredit 優先、空時は既存方式へ fallback。非公開ゲームのオーナー公開前確認は現在参照優先の例外あり（詳細は `docs/PROJECT_SPEC.md` 参照）。`db:check-game-credits` を追加）
- **GameCredit 実レスポンス確認・互換ガードMVP**（`smoke:game-credits` スクリプト追加。APIレスポンス構造互換性を smoke test。`db:check-game-credits`（DB 整合）と `smoke:game-credits`（APIレスポンス互換）で役割分離）
- **ゲーム使用素材・キャラクター参照DB分離MVP**（`GameAssetReference` / `GameCharacterReference` を追加。`create` / `coverAssetId` 更新 / `upsertNode` / `deleteNode` / `deleteScene` / `duplicate` で同期。`GET /games/:id/credits` は参照テーブル優先＋空時 fallback でレスポンス互換を維持）
- **公開前クレジット確認画面MVP**（2026-05-06 実装）（`/my/games` の公開ボタンをクリック時、既存シナリオチェック＋参照診断の後、「公開前にクレジットを確認」モーダル表示。各項目に作者名・クレジット必須/任意・利用条件・status 警告を表示。キャンセルボタンで公開しない、「確認して公開」ボタンで既存公開処理を実行。当時は手動クレジットUI/APIは対象外だったが、2026-05-09に別MVPとして実装済み）
- **クレジット欄UI polish**（ownerId 短縮表示 `d7ef...f292`、用途バッジ化、素材/キャラの行表示改善、非公開項目の詳細非公開表示）
- **ライセンス/利用条件表示MVP**（`usageTerms`（自由入力）+ `creditRequired`（boolean）を Asset/Character に追加。2026-05-05 実装済み。詳細は `docs/PROJECT_SPEC.md` 参照）
- **公開ゲーム詳細の使用素材・キャラクタークレジット表示MVP**（`GET /games/:id/credits` を追加し、`GameProject` / `GameNode` 参照から動的集計。素材は cover/bg/music/sfx/portraitAsset、キャラクターは speaker/portraits を対象に集約表示。削除済み/非公開/不明はフォールバック名+非リンク表示）

### プロフィール/作者表示まわり

- **作者リンク/お気に入りボタンのHTML構造整理MVP**（2026-05-14 実装）（`apps/frontend/components/asset/AssetCard.vue` と `apps/frontend/components/character/CharacterCard.vue` でカード全体リンク構造を見直し、詳細遷移をサムネイル/タイトルリンクへ限定。作者導線は `/profiles/:ownerId` の独立リンク化、お気に入りボタンは詳細リンク外の独立操作に統一。`@click.stop.prevent` や `router.push` 補助関数に依存せず導線競合を回避。`/assets`、`/characters`、`/my/favorites`、`/my/favorites/characters`、`/explore` の表示要素（タグ、クレジットバッジ、ASSET/CHAR ラベル）を維持。DB/API/migration変更なし。）
- **表示名スナップショット保存MVP**（`Asset` / `Character` / `GameProject` に `ownerDisplayNameSnapshot` を追加。作成時に現在の `CreatorProfile.displayName` を保存。`ownerDisplayName` は `snapshot -> 現在 profile -> null` で解決するよう統一）
- **作者プロフィール公開コンテンツ一覧MVP**（`GET /profiles/:userId/contents` を追加。`/profiles/[userId]` にその作者の公開ゲーム・公開アセット・公開キャラクターを各最大6件表示。0件時は各カテゴリに控えめな空表示。コンテンツAPI失敗時もプロフィール表示は維持）
- **キャラクター作者プロフィールリンクMVP**（公開キャラクター詳細 `/characters/:id` で作者表示を追加し、`/profiles/:userId` へ遷移。公開キャラクター一覧 `/characters` のカードにも作者表示/遷移を追加。キャラクター系レスポンスに `ownerDisplayName` を追加し、未設定時は短縮 ownerId フォールバック）
- **プロフィール/クリエイター名MVP**（`CreatorProfile` テーブル追加、`PATCH /my/profile` / `GET /my/profile` / `GET /profiles/:userId` API 追加、公開ゲーム一覧/詳細/クレジット欄に `ownerDisplayName` を追加、フロント `/my/profile` ページ追加・ヘッダーにリンク追加、未設定時は短縮 ownerId フォールバック）
- **作者プロフィールページリンクMVP**（フロント `/profiles/[userId]` 公開ページ追加、公開ゲーム一覧/詳細/クレジット欄の作者表示から `/profiles/:userId` へ遷移、`linkable === false` クレジット項目は非リンク維持）
- **アセット作者プロフィールリンクMVP**（公開アセット一覧 `/assets` と公開アセット詳細 `/assets/:id` で作者表示を追加し、`/profiles/:userId` へ遷移。アセット系レスポンスに `ownerDisplayName` を追加し、未設定時は短縮 ownerId フォールバック）

### ゲーム制作/編集基盤まわり

- **ゲームエディタ edit 画面の情報設計v2**（右ペインセクション化MVP）
	- 通常表示・ノード全画面表示の両方に反映済み
	- セクション見出しと折りたたみ範囲を一致化
	- 危険操作を独立セクション化
	- 分類整理: キャラクター配置は「表示・素材」、カメラ/カメラ演出/ビジュアルエフェクト/カラーフィルターは「演出」
- **右ペインセクション開閉状態の localStorage 保存**（キー: `talking.editor.rightPaneSections.v1`。通常表示/全画面表示で共有。保存値破損時は既定値にフォールバック、未定義キーは既定値で補完）
- **edit 画面の最後の選択位置（シーン/ノード）の localStorage 保存・復元MVP**（キー: `talking.editor.lastSelection.v1:${gameId}`（ゲームごとに分離）。保存済み scene/node が削除済み・不正な場合は安全にフォールバック）
- **edit 画面3ペイン幅 localStorage 復元値のクランプ修正**（キー: `gameEditorPaneWidths`。復元時に現在の表示幅へ収まるよう補正し、壊れた値/過大値/過小値は安全値へ丸める。window resize 時にも再クランプ。既存の3ペイン可変幅・`fullscreenProps`・リサイズ保存挙動は維持）
- **ゲーム参照診断API MVP**（素材/キャラクター/キャラクター画像の参照エラー検査、11種類の警告コード、warning 表示、save/publish をブロックしない）
- **エディタ画面への参照診断統合**（シナリオチェック画面にマージ表示、localIssues + referenceIssues、重大度順ソート、ノード/シーン操作時に動的リフレッシュ）
- **ゲーム公開前チェックMVP**（フロント事前チェック + API 最終防衛線。error 時は公開ブロック・warning 時は確認）
- **公開前チェックUIカテゴリ分けMVP**（「公開前チェック」改称、件数表示付きカテゴリフィルタ、issue カードへのカテゴリラベル表示、公開切替時カテゴリ別 warning 確認）
- **シナリオチェックMVP**（整合性チェック一覧・error/warning/info 分類・対象ジャンプ）
- **シナリオチェック追加MVP**（空本文/空ラベル/表示可能選択肢0件/開始シーン以外の startNodeId 壊れ → warning）
- **開始ノード到達不能判定見直しMVP**（2026-05-12 実装）（到達可能性の起点をゲーム全体開始ノードに加えて各シーン開始ノードまで拡張。`scene.startNodeId` 未設定シーンは先頭ノードを起点扱い。`scene.startNodeId` が参照不正な場合は先頭への自動フォールバックをせず、既存の壊れた開始ノード警告を維持。孤立ノード検出は維持。将来はチャプター/隠しシーン/任意開始点を踏まえたより厳密な到達判定を検討。）
- **NodePicker「シーン → ノード」二段階選択UI**（キーボード操作・stale state 修正・詳細プレビュー）
- **シーンラベル・シーン管理性改善MVP**（シーン名編集UI・一覧改善・NodePicker 連携）
- **自作ゲーム管理 `/my/games` ゲーム複製MVP**（owner 限定、確認ダイアログ、複製後編集画面遷移）
- **ゲーム基本情報編集MVP**（`/my/games/:id/edit` で `title` / `summary` 編集、保存状態表示、複製後タイトル変更導線）
- **ゲームカバー画像選択UI MVP**（ゲーム全体設定 > 基本情報タブで `coverAssetId` 選択/解除、公開一覧/詳細・自作一覧への反映）
- **Node 保存時の背景/BGM/SE 参照アセット共通バリデーション MVP**（`bgAssetId`=`image/*`・`musicAssetId`/`sfxAssetId`=`audio/*`・本人所有 or お気に入り済み・削除済み拒否。`GamesService.assertGameAssetUsable` 共通化。カバー画像チェックも同関数に委譲。）
- **開始地点設定導線の拡張**（ノード側に加えてシーン側から開始シーン設定）
- **ゲームプレイ画面キーボード操作MVP**（Enter/Space・↑/↓/Enter・数字キー・Esc）
- **ゲームプレイ画面 BGMフェードMVP**（停止フェードアウト・切替時直列フェード・同一BGM継続）
- **作者向けテストプレイ支援MVP**（2026-05-09 実装）（編集画面に `選択中からテスト` / `最初からテスト` の2導線を実装。どちらも `testPlay=1` を付けて新規タブで起動し、保存済み内容で再生するため未保存の `nodeDraft` は反映しない。`選択中からテスト` は現在選択中のシーン/ノードを優先（ノード未選択時は `scene.startNodeId` → シーン先頭ノード、シーン未選択時はゲーム全体開始位置へフォールバック）。`最初からテスト` は選択中シーン/ノードを無視してゲーム全体の開始位置から開始。`/games/:id/play` では `testPlay=1` を付けたうえで作者本人（`game.ownerId === currentUserId`）の場合のみ作者向け簡易デバッグパネルを表示し、現在シーン/現在ノード/次ノード/選択肢数/選択肢遷移先概要/使用素材ID/キャラクター数を確認可能。非作者/未ログインが `testPlay=1` を付けても作者向けUIは表示しない。作者本人のテストプレイは公開 `playCount` にカウントしない。パネル折りたたみと、sceneId/nodeId クエリ付きで編集画面へ戻る導線を追加。遷移ログMVPとして、`start` / `next` / `choice` / `end` / `missing` のログをメモリ内に最大30件保持し、通常/フルスクリーン双方のパネルに表示、ログクリア操作を追加。テキスト即表示・高速確認モードMVPとして、テストプレイパネル内に「全文表示」ボタンを追加し、現在ノードの本文をタイプライター待ちなしで即座に全文表示。「高速確認 ON/OFF」トグルを追加し、ON にするとタイプライター待ちなしで本文を即表示、以後のノード進行でも同様に即表示。高速確認モードON/OFFは localStorage に保存され、次回以降の作者向けテストプレイでも復元される。保存対象は高速確認ON/OFFのみで、全文表示の単発状態や遷移ログは保存しない。遷移ログ永続化は未実装のまま。高速確認ON/OFF 操作は遷移ログに記録しない。「選択肢までスキップ」は `nextNodeId` を連続でたどって最初の選択肢ノードで停止し、到達先本文をタイプライター待ちなしで即全文表示してから選択肢を表示する。選択肢の自動選択はしない。あわせて、パネル内情報を「現在地 / 操作 / ノード情報 / 遷移ログ」に整理し、通常表示とフルスクリーン表示で同じ構造に揃えた。）
- **公開前チェックUX polish MVP（FI-118、2026-05-20）**（issue一覧に「表示中 N件 / 全 M件」サマリー行を追加。情報折りたたみ中は右端に補足を薄く表示。カード一覧ラッパーに `max-h-[360px] overflow-y-auto` を設定し画面圧迫を低減。カード余白・severity/categoryラベル並び・「対象へ移動」ボタンを青系スタイルに変更して視認性を改善。highlighted issue のring を強化（`ring-sky-400 border-sky-500 bg-sky-50/60`）。パネル折りたたみボタンに開閉矢印 `▾` と active スタイルを追加し open/closed の区別を明確化。API/state/computed の仕様変更なし。）
- **作者向けテストプレイ支援 遷移ログコピー/エクスポートMVP**（2026-05-14 実装）（遷移ログのテキストコピー・JSONエクスポート機能をテストプレイパネルのボタンで追加。テキストコピーは見出し・ゲームタイトル・ゲームID・export日時・ログ件数・各ログ行を含む。JSONエクスポートは `format` / `version` / `exportedAt` / `game` / `count` / `logs` を含み、`logs` 内の各要素には `seq` / `kind` / `fromNodeId` / `toNodeId` / `fromLabel` / `toLabel` / `choiceIndex` / `choicePreview` / `occurredAt` / `occurredAtIso` / `line` を含める。ファイル名は `talking-transition-log-{gameId}-{timestamp}.json` の形式。ログが0件の場合はコピー/保存とも disabled または軽く通知。コピー/エクスポート操作そのものはログに記録しない。永続化は今回スコープ外。）

### 公開ゲーム・ギャラリーまわり

- **ゲーム制作・公開・共有フローMVP**（公開一覧・API・公開切替・UI 導線）
- **ノード/シーン/ゲーム 削除MVP**（削除前確認・参照解除・導線）
- **公開ゲーム一覧 `/games` 検索・並び替えMVP**（`q` + `sort` + URL 同期 + API 側検索/ソート）
- **自作ゲーム管理 `/my/games` 検索・並び替え・公開状態フィルタMVP**（`q` + `sort` + `status` + URL 同期 + API 側検索/ソート/フィルタ）
- **公開ゲーム閲覧数/プレイ数 集計MVP**（`viewCount` / `playCount` + 明示カウントAPI + 一覧/詳細表示）
- **公開ギャラリー検索**（/search/assets 接続、Meilisearch 障害時 Prisma fallback）
- **未ログイン公開ギャラリーで `/favorites` を呼ばない修正**、公開ゲームのセーブ/ロードUX 補正

### アセット・キャラクター管理まわり

- **素材・キャラクタークレジット表示MVP**（2026-05-13 実装）
	- 公開素材カードにタグ表示を追加し、説明未入力時の余白崩れを抑制
	- 公開キャラクタークレジット表示MVP（`GET /games/:id/credits` を追加し、`GameProject` / `GameNode` 参照から動的集計。素材は cover/bg/music/sfx/portraitAsset、キャラクターは speaker/portraits を対象に集約表示。削除済み/非公開/不明はフォールバック名+非リンク表示）
	- `/characters` は inline カードから `CharacterCard` 利用へ変更
	- `/my/characters` の管理カードに説明・公開/非公開バッジ・クレジット表記バッジ・タグ・作成日・編集導線を整理表示
	- DB/API変更なし
- **素材管理・キャラクター管理カードの操作導線 polish MVP**（2026-05-13 実装）（`/my/assets` と `/my/characters` の管理カードのUI・操作導線を整理。カード内を「サムネイル → タイトル/説明 → バッジ → タグ → メタ → 操作エリア」の順に統一。編集ボタンを filled primary（`bg-blue-600 text-white`）に統一しカード下部にまとめ、削除ボタンを outline danger（`border border-red-200 text-red-600`）でカード本体クリックと競合しないよう `@click.stop` を追加。ファイルサイズ・作成日を1行のメタ行に集約。キャラクター管理カードも同じ操作エリア構造に揃え、編集ボタンは filled primary の NuxtLink に変更。カードに `flex flex-col` を追加してスマホ幅でもボタンが崩れにくい構造に。DB/API変更なし。）
- **管理側の空状態 / エラー状態 polish MVP**（2026-05-14 実装）（`/my/assets` と `/my/characters` の loading / error / empty 表示を白カード/赤パネル/CTA付きに統一。初回0件は作成/アップロード導線、条件あり0件は `resetFilters()` のリセット導線を主導線に整理。`/my/assets` はエラー時に `offset=0` で `performSearch()` 再実行、`/my/characters` は `fetchCharacters()` 再実行。既存カード表示・検索/フィルタ・URL query・API呼び出しは維持。DB/API/migration 変更なし。）
- **キャラクター側の一覧UI統一MVP**（2026-05-13 実装）（`/characters` に素材一覧と同思想のフィルタパネルを追加。キーワード検索・タグ検索・並び替え・適用/リセットに対応し、空状態文言を最適化。`/my/characters` にキーワード検索・公開状態フィルタ（すべて/公開/非公開）・タグ検索・並び替え・適用/リセットを追加。管理カードで `Character.isPublic` ベースの公開/非公開バッジを表示。route/API path/DB/migration 変更なしで既存導線を維持。）
- **素材詳細 / キャラクター詳細のレイアウト統一 MVP**（2026-05-13 実装）（`/characters/:id` を `/assets/:id` に近い公開詳細レイアウトへ整理。見出し・タブ・白カード・基本情報・作者リンク・お気に入り・説明・タグ・利用条件・画像/表情一覧を統一感ある構成に変更。感情/パターンフィルタと画像 Lightbox を維持しつつ、owner の場合のみ管理セクションと `/my/characters/:id` への編集導線を表示。画像プレビューは既存 `useSignedUrl` を継続利用。DB/API変更なし。）
- **キャラクター削除時の利用影響表示MVP**（`GET /my/characters/:id/usage-impact` API、削除確認モーダルへの影響表示統合、`speakerCharacterId` / `portraits[*].characterId` / `portraits[*].imageId` 診断、他人ゲームは件数のみ）
- **アセット削除時の利用影響表示MVP**（`GET /assets/:id/usage-impact` API、削除確認モーダルへの影響表示統合、他人ゲームは件数のみ、100件超でも全件返さない設計）
- **Asset/Character 非公開化時の利用影響表示MVP**（`GET /assets/:id/usage-impact` / `GET /my/characters/:id/usage-impact` を流用し、`isPublic: true -> false` 保存時のみ参照影響を確認。公開中ゲーム参照ありは強い warning、非公開/下書きのみは軽い notice。確認後に保存続行可能）
- **アセットお気に入り数表示MVP**（`favoriteCount` 表示、公開一覧/詳細、楽観更新+ロールバック）
- **ゲーム内参照アセット権限ルールの棚卸しMVP**（自分+お気に入り方針の明文化、UI/API 現状差分の記録）

### 概念整理・インフラ

- **いいね / 素材棚 / 採用 / 引用・クレジット の4概念分離設計**を docs に明文化（`docs/PROJECT_SPEC.md` 「いいね / 素材棚 / 採用 / 引用・クレジット — 概念整理（設計方針）」、コード実装は将来段階的に実施）
- **共通ヘッダーのスマホ対応MVP**（2026-05-07）
- **SSRフォールバック規約整備**・`/my/games` SSR 由来エラー修正（2026-05-07）

---

## 🔧 公開・クレジットまわりの現在仕様

### GET /games/:id/credits

- **公開済みゲームの通常公開詳細**: `GameCredit` を優先して返却。locked `GameCredit` は公開時点クレジット履歴として保持。
- **非公開ゲームのオーナー公開前確認** (`!game.isPublic && game.ownerId === userId`):
	- 現在の `GameProject` / `GameScene` / `GameNode` 内容を走査（`collectGameReferenceUsageFromGame`）して収集した参照 ID のみを表示対象にする。
	- `GameCredit` の locked snapshot は名前・作者表示名・利用条件・`creditRequired` の**補完用途**のみ。
	- 現在参照されていない locked credit は公開前確認の修正対象として表示しない。
- `GameCredit` が空のゲームは既存方式（`GameAssetReference` / `GameCharacterReference` → 動的集計）へフォールバック（互換維持）。
- 詳細仕様: `docs/PROJECT_SPEC.md` 参照。

### 公開前確認モーダル（/my/games）

- `/my/games` の非公開→公開フローで表示（シナリオチェック + 参照診断後）。
- 素材/キャラクター別のクレジット確認（名前・作者・creditRequired/usageTerms・status・使用箇所）。
- `deleted` / `missing` / `private`（キャラクター）status に修正候補文を表示。
- 警告ありの場合、編集画面への遷移ボタンを表示:
	- 全体警告ボタン: `focusScenarioCheck=1&scenarioCheckFilter=warning`
	- 素材別カード: `scenarioCheckCategory=asset-reference`
	- キャラクター別カード: `scenarioCheckCategory=character-reference`
- 素材側 `private` も status 警告として扱う（`Asset.isPublic=false`）。
- 詳細仕様: `docs/PROJECT_SPEC.md` 参照。

### 公開中編集（/my/games/:id/edit）

- 公開済みゲームでも編集可能（自動で非公開にはしない）。
- 保存した変更は公開版にも即反映される。
- タイトル行直下に注意バナーを表示。折りたたみ状態は `localStorage`（key: `talking.editor.publishedEditBannerCollapsed.v1`）に保存。
- 公開中ゲームで「保存」「保存して次のノードへ」を押したとき**のみ** `window.confirm` で再確認。キャンセル時は保存しない。
- 公開中ゲームで、ノード削除・シーン削除・開始シーン変更・開始ノード変更の実行前に `window.confirm` で再確認。
- 削除系は公開中のみ、公開中警告 + 参照summary を1回のconfirmに統合して表示（通常削除confirmとの二重表示を回避）。非公開ゲームでは公開中向けconfirmは出さず、削除系は従来の削除confirmのみ表示。
- **将来課題**: ノード追加・シーン追加へのconfirm拡張、差分検出、独自モーダル、公開版/下書き版分離。

### AIレビュー用 台本Markdown Export MVP（2026-05-15 実装）

- 編集画面（`/my/games/:id/edit`）右ペイン上部に「MDコピー」「MD保存」ボタンを追加。
- MDコピー: AIレビュー用の台本Markdownをクリップボードにコピー。成功時 Toast: 「AIレビュー用Markdownをコピーしました」、失敗時 Toast: 「Markdownのコピーに失敗しました」、出力不能時 Toast: 「出力できるゲーム情報がありません」。
- MD保存: AIレビュー用の台本Markdownを `.md` ファイルとしてダウンロード。ファイル名は `talking-ai-review-script-{gameId}-{timestamp}.md` 形式（`timestamp` は `YYYY-MM-DDTHH-mm-ss` 形式）。成功時 Toast: 「AIレビュー用Markdownを保存しました」、失敗時 Toast: 「Markdownの保存に失敗しました」。
- 出力内容:
  - ヘッダー: タイトル、ゲームID、シーン数、ノード数、開始シーン/ノードID
  - Export Note: AIに渡す前提の注記
  - Summary: 使用素材ID（BG/BGM/SFX/キャラクター画像）、使用キャラクターID
  - Scene Index: シーン一覧
  - Script: 各シーン、各ノードの詳細（ノードID、話者、テキスト、nextNode、choices、ポートレート情報）
- データ源: `game.value`、`scenarioCheckScenes.value`（現在選択中ノードについては未保存の `nodeDraft` を反映）。
- コードフェンスは ``` 重複に対応し、4バッコートへ自動切り替え。
- 公開前チェック結果（未到達警告・素材/キャラクター参照警告を含む）を同梱するよう拡張（2026-05-18）。
- 以下は含めない: クレジット詳細、素材/キャラクター詳細情報のAPI追加取得、Import、JSON Export、独自DSL、自動AIレビュー実行。
- DB/API 変更・migration 追加なし（フロント UI出力のみ）。出力操作でゲーム内容は保存・変更されない。
- 詳細仕様: `docs/PROJECT_SPEC.md` 参照。

---

## 🎯 次にやる候補

`RUNBOOK / migration / Meili手順整理MVP` は 2026-05-14 に完了済みのため、候補から除外済み。

優先順（現時点のおすすめ順）:

1. **コンテンツ名称統一 - UI 完全統一フェーズ（後続）** — 2026-05-13 の名称ルールMVP（見出し・タブ・ナビの統一、docs更新）の後続として、以下を段階実装
	- **素材管理・キャラクター管理の検索/フィルタ統一（polish）** — 2026-05-13 MVPでキャラクター側へ検索/フィルタを追加済み。後続は入力補助・細かな項目配置・操作感の最終統一を行う
	- **所有者向け管理エリアの表現統一** — `/my/assets` と `/my/characters` の構成・表現・操作導線（作成・編集・削除・公開状態変更）を統一
	- **公開側ギャラリーの検索/フィルタ統一（polish）** — 2026-05-13 MVPで `/characters` に検索/タグ/並び替えを追加済み。後続は素材側との項目粒度・UI密度をさらに合わせる

2. **Asset.visibility 拡張（unlisted など）** — 現在の `Asset.isPublic` Boolean MVP を、必要に応じて `public/private/unlisted` へ拡張する設計。
2. **Like / Shelf DB 分離** — `AssetLike` / `AssetShelfItem` 導入、現行 `favorites` の役割分離。設計は `docs/PROJECT_SPEC.md` に明文化済み。
3. **スタッフロール拡張 / BGM（P2〜P3）** — 現スタッフロールMVP（スタッフロール表示ON/OFF・速度設定・自動表示ON/OFF実装済み）の拡張（終了時挙動の詳細オプション、BGM、より細かな速度カスタマイズ）。音声素材/クレジット設計と絡むため慎重に扱う。
4. **公開版/下書き版分離** — 公開中編集の安全性向上の本命施策（反映タイミング分離）。

---

## 🔮 後回しにする大きめ課題

**クレジット・ライセンス**
- GameCredit snapshot lock guard 強化（`db:check-game-credit-snapshots` 運用強化・公開前/公開時ガード連携）
- 公開前確認の使用箇所一覧拡張（複数箇所一覧MVPは実装済み。将来課題: 入力フィールドそのものへのピンポイントフォーカス・一括修正・自動差し替え・5件超の展開/折りたたみUI）
- スタッフロール演出強化（スキップ導線、終了時挙動の詳細オプション、カテゴリ別アニメーション、より凝った演出）
- スタッフロール拡張（終了時挙動の詳細オプション、より細かな速度カスタマイズ、スタッフロール用BGM）
- スタッフロール用BGMは音声素材管理・権利表示・`GameCredit`・公開前確認との整合を前提に設計し、単独で先行実装しない
- 構造化ライセンス（CC ライセンス等）
- 公開中編集時の再確認UX拡張（差分検出、重要変更のみ確認、独自モーダル化、「今後表示しない」導線）
- 公開中編集の差分検出基盤（公開版影響の自動判定）
- 公開版/下書き版分離（編集反映タイミング制御）
- 公開前チェックUIの完全ミニマル化（ヘッダー重大度バッジのフィルタ化等）

**アセット/キャラクター visibility**
- `Asset.visibility`（public/private/unlisted など）拡張設計（現状は `isPublic` Boolean MVP）
- `sourceAssetId` / `derivedFromAssetId` による派生元追跡
- 再アップロード/コピー問題への対策（perceptual hash / audio fingerprint は将来課題）

**いいね / 素材棚 DB・UI 分離**（設計は `docs/PROJECT_SPEC.md` に明文化済み）
- 現在 `favorites` がいいねと制作素材棚を兼任。将来的に以下の4概念・DB分離を検討:
	- **いいね / Like**（`AssetLike` / `CharacterLike`）— 純粋な好き/応援/評価指標。ランキング・おすすめへの活用
	- **素材棚 / Shelf**（`AssetShelfItem` / `CharacterShelfItem`）— 制作用に保存したアセット/キャラクター。`AssetPicker` / `CharacterPicker` の素材候補として表示
	- **採用 / Adoption**（`GameAssetReference` / `GameCharacterReference`）— 実際にゲーム内ノード/シーンで参照されているアセット/キャラクター（基盤は実装済み）
	- **引用・クレジット / Credit**（`GameCredit`）— 公開ゲームページやスタッフロールでの素材作者/キャラクター作者表示（MVP 実装済み）
- 段階案: 文言整理MVP → `AssetLike` / `AssetShelfItem` 導入 → 構造化ライセンス

**指標・分析**
- アセット閲覧数 `viewCount` MVP（`/assets/:id` のみカウント、一覧/管理画面は非対象）
- アセット使用数 `usedInGameCount` の定義と集計方針（公開/非公開、削除時扱い）
- アセット指標ソート・ランキング（お気に入り順/閲覧数順/使用数順/人気順）
- アセット指標の検索連携（タグ検索との複合、Meilisearch 連携）
- 指標基盤強化（`favoriteCount` カラム化、ユニーク閲覧、イベントログ、作者ダッシュボード）

**ゲーム編集体験**
- edit 画面プロパティフォームの共通コンポーネント化（通常表示/全画面表示の二重実装解消）
	- 背景: 背景フィルター / 背景ぼかしMVPで、通常表示側のみUI追加・全画面側反映漏れの再発があった
	- 実装状況: Phase 1〜Phase 2-g まで実装済み（演出系 / 遷移・分岐 / 素材・キャラ参照 / 保存・危険操作 / 公開前チェックサマリーカード + issue 一覧）
	- 残課題: 公開前チェックパネル全体のコンポーネント化（フィルターUI・カテゴリフィルター・参照診断API処理を含む）は未着手
	- 詳細設計: `docs/editor-property-form-refactor-plan.md`
- 右ペインセクションの要約表示（閉じた状態での情報把握）の強化
	- 実装状況: 基本情報・表示素材・演出・遷移分岐の主要編集セクションMVP実装済み（2026-05-18）
	- 残課題: 必要に応じた詳細要約・UI polish
- edit 画面全体の本格的な情報設計v2
- テストプレイ高速確認の拡張（分岐までスキップ / 自動巡回・自動到達確認）
- テストプレイ時のみの警告表示（開始地点未設定、存在しない遷移先、参照不可素材/キャラクター）
- 将来の状態インスペクタ（`flags` / `variables` / `visitedNodes` / `affinity`）
- 遷移ログの永続化
- プレイ中編集
- ノード作成/選択肢作成
- スライド編集パネル
- ライブ編集 / プレイしながら作るモード（中長期構想 / P3）
	- 体験価値は高いが、まずは作者向けテストプレイ支援MVPを先行する。
	- 方向性: 全画面に近いプレイ画面 + 作者用スライドパネルで、再生中にノード作成・選択肢追加・遷移先設定まで行える編集体験v2。
	- 想定連携: テストプレイ用デバッグ表示、遷移ログ、将来のフラグ/変数インスペクタ。
	- 主な設計課題: 編集状態管理、未保存変更、プレイ状態との同期、公開中編集時の確認UX、undo/redo、通常3ペイン編集との責務分離。
- スマホ/タブレット向け編集体験の再設計
- 3ペイン構造そのものの再設計
- 作業位置保存のリセット導線（例: 「最後の選択位置をリセット」）
- NodePicker シーン一覧（左ペイン）のキーボード操作・フォーカス設計・スクロール保持

**プレイヤー体験**
- キーコンフィグ・AUTO/Skip 高度化・プレイヤーごとのセーブデータ設計

**ゲーム一覧・プロフィール**
- 公開ゲーム一覧の拡張（ページネーション / 無限スクロール / 人気順・プレイ数順 / タグ検索 / 作者検索）
- プロフィール拡張（slug / プロフィール画像 / SNSリンク / 本格的な作者別作品一覧）
- タグ/ジャンル編集

**シナリオ・制作ツール**
- 変数条件の厳密評価（condition/alternateCondition）
- フローチャート可視化
- シナリオ Import/Export（JSON → AI 向け Markdown/DSL）

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
| 2026-05-03 | ❌ exit 1 | 公開ゲーム閲覧数/プレイ数MVP後。`pnpm -C apps/api build` は `prisma:generate` で EPERM（DLLロック） |
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

## 📚 履歴ログ

> 以下は作業単位ごとの確認メモです。最新の進捗・仕様は上部セクションを参照してください。

---

## 🔎 今回の確認メモ（2026-05-04 / ゲーム内参照アセット権限ルール 棚卸しMVP）

### 棚卸し結果（UI）
- `AssetPicker` は「自分のアセット / お気に入り」の2タブ構成。
- `AssetPicker` の `type="image" | "audio"` は両タブに適用される。
- ノード編集の素材選択は以下で統一されている。
	- 背景: `AssetPicker type="image"`
	- BGM: `AssetPicker type="audio"`
	- SE: `AssetPicker type="audio"`
- ゲーム全体設定のカバー画像選択は `AssetPicker type="image"` を使用。
- `CharacterPicker` は「自分のキャラ / お気に入り」の2タブ構成。
- `CharacterImagePicker` は選択中キャラクターIDに対して画像を取得する（公開→自分所有の順で取得）。

### 棚卸し結果（API）
- カバー画像（`coverAssetId`）は `PATCH /games/:id` 保存時に以下を検証済み。
	- 本人所有 or お気に入り済み
	- `image/*` のみ
	- 削除済み不可
- **Node保存時の `bgAssetId` / `musicAssetId` / `sfxAssetId` は 2026-05-04 MVP で検証済み。**
	- `bgAssetId`: `image/*`・本人所有 or お気に入り済み・削除済み不可。
	- `musicAssetId` / `sfxAssetId`: `audio/*`・本人所有 or お気に入り済み・削除済み不可。
	- 共通ロジック: `GamesService.assertGameAssetUsable(userId, assetId, 'image'|'audio')`。
- キャラクター配置/立ち絵参照（`speakerCharacterId`/`portraitAssetId`）のNode保存時バリデーションは未整備。
	- 参照IDの所有・お気に入り・種別・削除状態の共通検証が未実装。
- 付随の軽微修正として、お気に入り一覧APIで削除済み素材/参照不可キャラが混入しないようフィルタを追加。

### 今回の小修正
- `MessageThemeModal` のカバー説明文を実装実態に合わせて修正。
	- 旧: 「自分の画像アセットのみ選択できます。」
	- 新: 「自分の画像アセット、またはお気に入りした公開画像アセットを選択できます。」
- `favorites` 一覧で `deletedAt: null` を適用。
- `character-favorites` 一覧で `deletedAt` と公開可否（本人所有 or 公開）を適用。
- `games.service.ts` の Node保存処理に、`bgAssetId`/`musicAssetId`/`sfxAssetId` の共通バリデーション実装（`assertGameAssetUsable`）。

### 将来課題（ゲーム内参照素材）
- `characterId`（speakerCharacterId）が本人所有 or お気に入り済みかの確認
- `characterImageId` / `portraitAssetId` が選択済みキャラクターに属するかの確認
- キャラクター配置全体の参照バリデーション（キャラ配置ブロックまとめて検証）
- 参照切れ素材のシナリオチェック warning（bg/BGM/SE/キャラ全体）
- アセット削除/非公開化時の利用中ゲームへの影響表示

### 実行した確認
- `pnpm -C apps/frontend test`: ✅ exit 0（4 files / 31 tests passed）
- `pnpm -w build`: ❌ exit 1（`apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に EPERM）
- `pnpm -C apps/api build`: ❌ exit 1（`prisma:generate` で EPERM（DLLロック））
- `pnpm -C apps/api run test`: ❌ exit 1（`ERR_PNPM_NO_SCRIPT`（test script未定義））

### 今回未実行の確認と理由
- ブラウザ手動確認（error/warning/info 各状態での公開導線の実操作、編集画面への遷移確認）
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api build`: ❌ exit 1
	- `prisma:generate` で EPERM（DLLロック）
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
- ブラウザ手動確認（削除済み/見つからない/非公開の素材・キャラクターで、参照診断 `reference issues` から最初の該当 issue（`nodeId` を持つ issue を優先）へ直接遷移、`/my/games/{id}/edit` に `scenarioCheckIssueId` / `scenarioCheckRefId` / `scenarioCheckField` / `scenarioCheckNodeId` を付与し、edit画面側で該当 issue を強調表示、`sceneId`/`nodeId` がある場合は既存のフォーカス処理で対象ノードへ移動、issue未特定時は既存のカテゴリ単位導線へフォールバック）の実操作確認
	- 理由: この実行環境ではブラウザ手動E2Eを実施していないため

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
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
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
- 公開済みゲーム変更時の通知
- プレイヤーごとの既読ログ保存
- AUTO / Skip の高度化
- スマホ/タブレット向けプレイ操作最適化

### 実行した確認
- `pnpm -w build`: ❌ exit 1
	- `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（DLLロック）
- `pnpm -C apps/frontend test`: ✅ exit 0
	- 4 files / 31 tests passed
- `pnpm -C apps/api run test`: ❌ exit 1
	- `ERR_PNPM_NO_SCRIPT`（`apps/api` に test script 未定義）

### 未実行の確認と理由
-