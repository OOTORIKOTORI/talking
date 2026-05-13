# file-map

このドキュメントは、設計レビュー時にリポジトリ内の役割を素早く参照できるようにしたファイルマップです。
対象は主に フロントエンド画面・コンポーネント・コンポーザブル・API・ワーカー・共有型定義 です。

除外方針:
- node_modules
- .nuxt / .output / dist
- *.test.ts / *.spec.ts
- *.d.ts
- prisma/migrations

---

## apps/frontend/pages/

```text
apps/frontend/pages/
├── index.vue                                # トップページ。ヘルス確認と主要導線を表示
├── explore.vue                              # 公開素材・公開キャラクターを混在表示する探索ページ。ASSET/CHARラベル付きカードgrid、読み込み/エラー/空状態を扱う
├── login.vue                                # Supabase ログイン画面
├── logout.vue                               # ログアウト処理を実行してトップへ戻すページ
├── upload.vue                               # 素材アップロード画面。画像/音声の投稿入口（公開/非公開の初期設定を含む）
├── assets/
│   ├── index.vue                            # 公開ギャラリー（素材）。検索・絞り込みの入口
│   └── [id].vue                             # 素材詳細画面。内容確認や関連操作を提供（非公開は owner のみ閲覧可）
├── characters/
│   ├── index.vue                            # 公開ギャラリー（キャラクター）一覧。キーワード/タグ/並び替えのフィルタパネル（適用・リセット、URLクエリ同期）
│   └── [id].vue                             # キャラクター公開詳細画面。素材詳細寄せのカード構成で基本情報・作者リンク・お気に入り・利用条件・画像/表情一覧・Lightbox・owner向け編集導線を扱う
├── games/
│   ├── index.vue                            # 公開ゲーム一覧ページ
│   └── [id]/
│       ├── index.vue                        # 公開ゲーム詳細ページ。通常クレジット表示、スタッフロール表示、`useStaffRollCredits` 経由のスタッフロール用クレジット取得を扱う
│       └── play.vue                         # ゲームプレイ画面。ノード進行、選択肢分岐、音声、カメラ、セーブ/ロードを統括
├── my/
│   ├── assets/
│   │   └── index.vue                        # 自分の素材管理一覧。投稿物の確認・整理用（公開/非公開バッジ・フィルタ対応）
│   ├── characters/
│   │   ├── index.vue                        # 自分のキャラクター一覧。検索/公開状態/タグ/並び替えフィルタ、公開/非公開バッジ表示
│   │   ├── new.vue                          # キャラクター新規作成画面
│   │   └── [id].vue                         # キャラクター編集画面。画像や公開設定の更新。公開→非公開保存時は usage-impact による保存前 warning 確認を表示
│   ├── favorites/
│   │   ├── index.vue                        # お気に入り素材一覧
│   │   └── characters.vue                   # お気に入りキャラクター一覧
│   └── games/
│       ├── index.vue                        # ゲーム管理一覧。新規プロジェクト作成と再編集導線
│       └── [id]/
│           └── edit.vue                     # ゲームエディタ。シーン/ノード/演出/テーマ設定を編集
```

---

## apps/frontend/components/

```text
apps/frontend/components/
├── AssetThumbnail.vue                       # アセットのサムネイル表示。署名URLやフォールバック表示を吸収
├── EditAssetModal.vue                       # アセット情報編集モーダル（公開/非公開の切り替えを含む）。公開→非公開保存時は usage-impact を確認し、参照中ゲームがある場合に保存前 warning モーダルを表示
├── asset/
│   └── AssetCard.vue                        # 素材一覧用カード。詳細遷移（サムネイル/タイトル）と作者リンク・お気に入り操作をDOM構造で分離しつつ、説明・タグ・クレジット表記・お気に入り件数を表示（UI整理のみ、API変更なし）
├── character/
│   ├── CharacterCard.vue                    # キャラクター一覧用カード。詳細遷移（サムネイル/タイトル）と作者リンク・お気に入り操作をDOM構造で分離しつつ、名称・説明・タグ・クレジット表記を表示。公開一覧/お気に入り/探索で利用（UI整理のみ、API変更なし）
│   └── CharacterImageThumb.vue              # キャラクター差分画像のサムネイル表示
├── common/
│   ├── CrossNavTabs.vue                     # 画面横断ナビゲーション用タブ
│   ├── ImageLightbox.vue                    # 画像拡大表示モーダル
│   ├── SectionTabs.vue                      # セクション切り替えタブ
│   ├── TabsSwitch.vue                       # 軽量なタブスイッチUI
│   ├── ToastContainer.vue                   # トースト通知の描画コンテナ
│   └── UploadTabs.vue                       # アップロード画面の種別切り替えタブ
├── game/
│   ├── BacklogModal.vue                     # バックログ表示モーダル
│   ├── GameCreditConfirmModal.vue           # 公開前クレジット確認モーダル。削除済み・非公開素材などの問題カードで参照診断issueの使用箇所一覧（最大5件）を表示し、各行から直接ジャンプ可能。issue未特定時はカテゴリ単位編集導線にフォールバック
│   ├── GameManualCreditsEditor.vue          # ゲーム単位の手動クレジット編集コンポーネント。個別保存フローで動作する
│   ├── GameStaffRollModal.vue               # スタッフロール表示モーダル。速度プリセット・セクション表示順・終了時挙動に従い自動スクロール再生する
│   ├── MessageThemeModal.vue                # メッセージウィンドウ/セーブUIのテーマ編集モーダル。`クレジット/スタッフロール` タブでスタッフロール表示ON/OFF・速度・自動表示・セクション表示順・終了時挙動・手動クレジットを扱う
│   ├── MessageWindow.vue                    # メッセージ窓本体。テーマ解決済みCSSで台詞を表示
│   ├── MiniStage.vue                        # エディタ用の簡易ステージプレビュー
│   ├── NodePicker.vue                       # 遷移先ノード選択ダイアログ
│   ├── StageCanvas.vue                      # 背景・立ち絵・カメラ・演出を描くステージキャンバス
│   └── TestPlayPanel.vue                    # テストプレイ専用パネル。現在地・操作・ノード情報・遷移ログの4セクション構成
├── pickers/
│   ├── AssetPicker.vue                      # アセット選択モーダル。背景/BGM/SFX選択に利用
│   ├── CharacterImagePicker.vue             # キャラクター画像差分の選択モーダル
│   └── CharacterPicker.vue                  # 話者キャラクターの選択モーダル
└── ui/
    └── ColorField.vue                       # テーマ編集用の色入力フィールド。プリセット色対応
```

---

## apps/frontend/composables/

```text
apps/frontend/composables/
├── useApi.ts                                # API クライアント取得。クライアント側は api-auth.client の $api、SSR側は $fetch.create() へフォールバック
├── useAssetMeta.ts                          # アセットIDからメタ情報や署名済みURLを取得
├── useAssets.ts                             # アセット API 呼び出しをまとめたコンポーザブル
├── useAudioConsent.ts                       # 音声再生の同意状態を localStorage と同期
├── useAutoRefreshUrl.ts                     # 期限付きURLを自動更新して失効を防ぐ
├── useBacklog.ts                            # バックログ取得・表示の共通処理
├── useCharacters.ts                         # キャラクター API 呼び出しをまとめる
├── useFavoriteToggle.ts                     # 素材お気に入りのトグル処理
├── useFavoriteToggleCharacter.ts            # キャラクターお気に入りのトグル処理
├── useGames.ts                              # ゲーム API 呼び出し群。scene/node/save API の窓口
├── useIoOnce.ts                             # 一度だけ動かしたい処理の補助ユーティリティ
├── useProfiles.ts                           # プロフィール関連 API 呼び出しをまとめる
├── useQuerySync.ts                          # URL クエリと画面状態の同期補助
├── useSignedUrl.ts                          # 署名 GET URL の取得関数を提供
├── useStaffRollCredits.ts                   # スタッフロール用クレジット取得処理の共通化
├── useStageScale.ts                         # ステージ実寸を CSS 変数へ反映して拡縮を安定化
├── useToast.ts                              # 成功/失敗トーストを発行する共有ストア
├── useUploader.ts                           # 署名 PUT URL を使ったアップロード処理
└── useVisualEffects.ts                      # shake / flash 演出の状態管理と再生制御
```

> 補足: 専用の useGameEngine.ts は存在せず、ゲーム実行ロジックは play.vue と gameState.ts と useVisualEffects.ts に分散しています。

---

## apps/frontend/layouts/

```text
apps/frontend/layouts/
└── （現在は対象ファイルなし）               # レイアウト専用ファイルは未配置
```

---

## apps/frontend/plugins/

```text
apps/frontend/plugins/
└── api-auth.client.ts                       # Supabase セッションの access_token を API リクエストへ自動付与
```

---

## apps/frontend/middleware/

```text
apps/frontend/middleware/
├── require-auth.client.ts                   # クライアント側の認証確認ミドルウェア
└── require-auth.ts                          # /my/* と /upload を保護し、未認証時は login へ遷移
```

---

## apps/api/src/

```text
apps/api/src/
├── app.module.ts                            # NestJS 全体モジュール。各 feature module を束ねる
├── main.ts                                  # API エントリポイント。Nest の起動設定を行う
├── assets/
│   ├── assets.controller.ts                 # アセット CRUD と公開取得の HTTP 入口（詳細は任意認証で owner の private 閲覧を許可）
│   ├── assets.module.ts                     # assets 機能のモジュール定義
│   ├── assets.service.ts                    # Prisma・検索キュー連携を含むアセット業務ロジック（公開条件: deletedAt=null かつ isPublic=true、owner は private 閲覧可）
│   └── dto/
│       ├── create-asset.dto.ts              # アセット作成リクエスト DTO
│       ├── query-assets.dto.ts              # アセット検索/絞り込み用 DTO
│       └── update-asset.dto.ts              # アセット更新リクエスト DTO
├── auth/
│   ├── current-user.decorator.ts            # 認証済みユーザー情報を取り出すデコレータ
│   ├── optional-supabase-auth.guard.ts      # 認証任意 API 用の Supabase Guard
│   └── supabase-auth.guard.ts               # 認証必須 API 用の Supabase Guard
├── characters/
│   ├── character-favorites.controller.ts    # キャラクターお気に入り操作の API 入口
│   ├── character-favorites.service.ts       # キャラクターお気に入り登録/解除ロジック
│   ├── character-images.controller.ts       # キャラクター画像の追加・管理 API
│   ├── characters.controller.ts             # キャラクター CRUD と公開取得 API（`q/tags/sort/visibility` クエリ対応）
│   ├── characters.module.ts                 # characters 機能のモジュール定義
│   ├── characters.service.ts                # キャラクター本体と画像関連の業務ロジック（公開/管理一覧の検索・タグ・並び替え・公開状態フィルタを含む）
│   └── dto/
│       ├── create-character.dto.ts          # キャラクター作成 DTO
│       ├── create-image.dto.ts              # キャラクター画像作成 DTO
│       ├── query-characters.dto.ts          # キャラクター検索 DTO（`q/tags/sort/visibility`）
│       └── update-character.dto.ts          # キャラクター更新 DTO
├── favorites/
│   ├── favorites.controller.ts              # お気に入り関連 API の共通入口
│   ├── favorites.list.controller.ts         # お気に入り一覧取得 API
│   ├── favorites.module.ts                  # favorites 機能のモジュール定義
│   ├── favorites.service.ts                 # アセットお気に入りの保存/取得ロジック（他者privateは登録/一覧表示不可）
│   ├── favorites.toggle.controller.ts       # お気に入り ON/OFF 切り替え API
│   └── dto/
│       └── favorites.query.dto.ts           # お気に入り一覧取得用 DTO
├── games/
│   ├── games.controller.ts                  # ゲーム/シーン/ノード/セーブ API の HTTP 入口
│   ├── games.module.ts                      # games 機能のモジュール定義
│   ├── games.service.ts                     # ゲーム本体ロジック。theme 保存、スタッフロール設定の保存、scene/node 更新、save slots、クレジット/参照診断を担当
│   └── dto/
│       └── update-game.dto.ts               # ゲーム更新 DTO。タイトル/概要/公開状態/テーマ/スタッフロール設定などを受ける
├── health/
│   ├── health.controller.ts                 # ヘルスチェック API
│   ├── health.module.ts                     # health 機能のモジュール定義
│   └── health.service.ts                    # 稼働状態の返却ロジック
├── meili/
│   └── meili.client.ts                      # Meilisearch クライアント初期化
├── my/
│   ├── my.controller.ts                     # 自分の profile / assets 系 API（assets は public/private 両方返却、characters 管理一覧は characters.controller.ts 側に集約）
│   └── my.module.ts                         # my 機能のモジュール定義
├── prisma/
│   ├── prisma.module.ts                     # PrismaService を DI するモジュール
│   └── prisma.service.ts                    # Prisma クライアントの共通サービス
├── queues/
│   ├── purge.producer.ts                    # 削除後パージジョブの投入
│   ├── search.producer.ts                   # 検索インデックス更新ジョブの投入
│   └── thumbnail.producer.ts                # サムネイル生成ジョブの投入
├── search/
│   ├── search.controller.ts                 # Meilisearch を使ったアセット検索 API（public は isPublic=true、owner=self は private 含む）
│   ├── search.module.ts                     # search 機能のモジュール定義
│   └── dto/
│       └── search-assets.dto.ts             # 検索条件 DTO
└── uploads/
    ├── uploads.controller.ts                # 署名 URL 発行 API の入口
    ├── uploads.module.ts                    # uploads 機能のモジュール定義
    └── uploads.service.ts                   # S3/MinIO 向け署名 PUT/GET URL を発行
```

---

## apps/worker/src/

```text
apps/worker/src/
├── index.ts                                 # BullMQ ワーカー起動点。検索・画像ジョブの監視を開始
├── purge/
│   └── purge.worker.ts                      # 削除済みアセットの S3 / DB / 検索インデックスを後片付け
└── thumbnail/
    └── thumbnail.worker.ts                  # 画像サムネイル生成と検索インデックス更新を行う
```

---

## packages/types/src/

```text
packages/types/src/
├── favorites.ts                             # お気に入り一覧のクエリ型定義
└── index.ts                                 # 共有型定義の中心。Asset / Character / MessageTheme / GameUiTheme などを公開
```

---

## 重点ファイルの詳細メモ

### apps/frontend/pages/games/[id]/play.vue
- ゲーム実行の中心ファイルです。現在ノード、選択肢、カメラ、色フィルター、BGM/SFX、セーブ/ロードモーダルまで 1 画面で管理します。
- 主な状態は game、current、gameState、saveListData、currentColorFilter、saveLoadOpen です。
- 主な関数は start、restart、go、advanceWithinNodeOrNext、selectChoice、saveToSelectedSlot、loadFromSelectedSlot、refreshSaves です。
- ※ MessageWindow と StageCanvas を組み合わせて表示し、useVisualEffects と gameState.ts を使って進行と演出を制御します。

### apps/frontend/components/game/MessageWindow.vue
- メッセージ窓本体です。テーマを resolveThemeV2 で解決し、CSS 変数へ変換して台詞と話者名を表示します。
- 公開 props は speaker、text、accumulatedPrefix、theme、animate です。
- emit は click を公開しており、親側で次ノード進行に使います。
- ※ v1 / v2 両方の messageTheme を受けられる互換レイヤーです。

### apps/frontend/components/game/StageCanvas.vue
- 背景、立ち絵、カメラズーム、shake / flash、色フィルターをまとめて描画するステージ表示コンポーネントです。
- 公開 props は backgroundUrl、characters、message、theme、camera、effectState、colorFilter です。
- 内部で MessageWindow を再利用し、プレビュー画面と本番画面の見た目を揃えています。

### apps/frontend/components/game/MessageThemeModal.vue
- メッセージ窓テーマとセーブ/ロード UI テーマをまとめて編集するモーダルです。
- `クレジット/スタッフロール` タブでスタッフロール表示ON/OFF（`staffRollEnabled`）、速度プリセット（`staffRollSpeedPreset`）、エンディング後自動表示（`staffRollAutoOpenEnabled`）、セクション表示順（`staffRollSectionOrder`）、終了時挙動（`staffRollEndBehavior`）、手動クレジット編集（`GameManualCreditsEditor` 経由の個別保存）を扱います。
- 公開 props は gameId、initial、initialUi、emit は close と saved です。
- 主な関数は save、reset、resetUi、applyPreset、applyUiPreset、exportTheme です。
- ※ 「全体設定を保存」は PATCH /games/:id に messageTheme / gameUiTheme / staffRoll 設定を同時送信します。手動クレジットは独立した個別保存フローで保存します。

### ゲームエンジン相当の実装
- 専用の useGameEngine.ts はありません。
- 実際のエンジン相当は apps/frontend/pages/games/[id]/play.vue が担当し、条件分岐と状態遷移は apps/frontend/utils/gameState.ts、演出は apps/frontend/composables/useVisualEffects.ts が支えています。
- gameState.ts の主な関数は evaluateChoiceCondition、applyChoiceEffects、resolveChoiceTarget、filterVisibleChoices です。

### テーマ設定関連
- メッセージウィンドウの見た目解決は apps/frontend/components/game/MessageWindow.vue と apps/frontend/utils/themeUtils.ts が担当します。
- GameProject のテーマ保存/取得は apps/api/src/games/games.service.ts の update で allowlist 管理されています。
- 保存対象は messageTheme と gameUiTheme で、フロント側の送信窓口は MessageThemeModal.vue と useGames.ts です。

### packages/types/src/index.ts
- 共有型の中心ファイルです。Asset、Character、CharacterImage、MessageTheme、MessageThemeV2、GameUiTheme、VisualEffect、ColorFilter を公開します。
- メッセージテーマのプリセット定数として FONT_K、PADDING_K、RADIUS_PX、BORDER_PX、TYPE_MS、WINDOW_PRESET もここにあります。
- ※ フロントと API の両方が参照するため、仕様変更時の基準点になります。

---

## 主要な状態管理の対応表

| 状態 | 管理場所 | 備考 |
|------|----------|------|
| ゲーム進行（現在ノード） | apps/frontend/pages/games/[id]/play.vue | current、gameState、prefixText などで管理 |
| メッセージウィンドウテーマ | apps/frontend/pages/games/[id]/play.vue / apps/frontend/components/game/MessageWindow.vue / apps/frontend/utils/themeUtils.ts | game.messageTheme を描画用 CSS に解決 |
| セーブ/ロード | apps/frontend/pages/games/[id]/play.vue / apps/frontend/composables/useGames.ts / apps/api/src/games/games.service.ts | SaveSlot は MANUAL 100 / AUTO 5 / QUICK 1 |
| 認証トークン | apps/frontend/plugins/api-auth.client.ts | Supabase session の access_token を Authorization に付与 |

---

## 命名規則メモ

- ページファイルの動的ルートは [id].vue で統一されており、[gameId].vue のような名前は使っていません。
- コンポーネントのディレクトリ構成は components/game、components/common、components/character、components/asset、components/pickers、components/ui のように小文字カテゴリ分割です。
- コンポーザブルは use プレフィックスでほぼ統一されています。
- API クライアントの呼び出し方は useApi から受けた $api を useGames / useAssets / useCharacters などでラップする形です。
- 認証付き通信では plugin 側で Authorization: Bearer access_token を自動付与します。
- 編集中の一時状態は draft、nodeDraft、uiDraft のような名前で保持されています。

---

## 補足メモ

- review 観点では、ゲーム再生ロジックは 1 ファイル集中型で、UI テーマ・進行・音声・セーブが play.vue にまとまっています。
- テーマ仕様は packages/types/src/index.ts を基準に、描画は MessageWindow.vue、保存は MessageThemeModal.vue と games.service.ts が受け持ちます。
- 状態分岐ロジックを追うときは、play.vue → gameState.ts → useVisualEffects.ts の順に読むと把握しやすいです。
