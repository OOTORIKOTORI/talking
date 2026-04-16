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
├── explore.vue                              # 公開コンテンツの探索ページ。ゲーム/アセット/キャラクターの導線
├── login.vue                                # Supabase ログイン画面
├── logout.vue                               # ログアウト処理を実行してトップへ戻すページ
├── upload.vue                               # アセットアップロード画面。画像/音声の投稿入口
├── assets/
│   ├── index.vue                            # 公開アセット一覧。検索・絞り込みの入口
│   └── [id].vue                             # アセット詳細画面。内容確認や関連操作を提供
├── characters/
│   ├── index.vue                            # 公開キャラクター一覧
│   └── [id].vue                             # キャラクター詳細・画像表示画面
├── games/
│   └── [id]/
│       └── play.vue                         # ゲームプレイ画面。ノード進行、選択肢分岐、音声、カメラ、セーブ/ロードを統括
├── my/
│   ├── assets/
│   │   └── index.vue                        # 自分のアセット管理一覧。投稿物の確認・整理用
│   ├── characters/
│   │   ├── index.vue                        # 自分のキャラクター一覧
│   │   ├── new.vue                          # キャラクター新規作成画面
│   │   └── [id].vue                         # キャラクター編集画面。画像や公開設定の更新
│   ├── favorites/
│   │   ├── index.vue                        # お気に入りアセット一覧
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
├── EditAssetModal.vue                       # アセット情報編集モーダル
├── asset/
│   └── AssetCard.vue                        # アセット一覧用カード。画像・タイトル・お気に入りUIを表示
├── character/
│   ├── CharacterCard.vue                    # キャラクター一覧用カード
│   └── CharacterImageThumb.vue              # キャラクター差分画像のサムネイル表示
├── common/
│   ├── CrossNavTabs.vue                     # 画面横断ナビゲーション用タブ
│   ├── ImageLightbox.vue                    # 画像拡大表示モーダル
│   ├── SectionTabs.vue                      # セクション切り替えタブ
│   ├── TabsSwitch.vue                       # 軽量なタブスイッチUI
│   ├── ToastContainer.vue                   # トースト通知の描画コンテナ
│   └── UploadTabs.vue                       # アップロード画面の種別切り替えタブ
├── game/
│   ├── MessageThemeModal.vue                # メッセージウィンドウ/セーブUIのテーマ編集モーダル
│   ├── MessageWindow.vue                    # メッセージ窓本体。テーマ解決済みCSSで台詞を表示
│   ├── MiniStage.vue                        # エディタ用の簡易ステージプレビュー
│   ├── NodePicker.vue                       # 遷移先ノード選択ダイアログ
│   └── StageCanvas.vue                      # 背景・立ち絵・カメラ・演出を描くステージキャンバス
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
├── useApi.ts                                # Nuxt から提供される API クライアントを取り出す最小ラッパー
├── useAssetMeta.ts                          # アセットIDからメタ情報や署名済みURLを取得
├── useAssets.ts                             # アセット API 呼び出しをまとめたコンポーザブル
├── useAudioConsent.ts                       # 音声再生の同意状態を localStorage と同期
├── useAutoRefreshUrl.ts                     # 期限付きURLを自動更新して失効を防ぐ
├── useCharacters.ts                         # キャラクター API 呼び出しをまとめる
├── useFavoriteToggle.ts                     # アセットお気に入りのトグル処理
├── useFavoriteToggleCharacter.ts            # キャラクターお気に入りのトグル処理
├── useGames.ts                              # ゲーム API 呼び出し群。scene/node/save API の窓口
├── useIoOnce.ts                             # 一度だけ動かしたい処理の補助ユーティリティ
├── useQuerySync.ts                          # URL クエリと画面状態の同期補助
├── useSignedUrl.ts                          # 署名 GET URL の取得関数を提供
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
│   ├── assets.controller.ts                 # アセット CRUD と公開取得の HTTP 入口
│   ├── assets.module.ts                     # assets 機能のモジュール定義
│   ├── assets.service.ts                    # Prisma・検索キュー連携を含むアセット業務ロジック
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
│   ├── characters.controller.ts             # キャラクター CRUD と公開取得 API
│   ├── characters.module.ts                 # characters 機能のモジュール定義
│   ├── characters.service.ts                # キャラクター本体と画像関連の業務ロジック
│   └── dto/
│       ├── create-character.dto.ts          # キャラクター作成 DTO
│       ├── create-image.dto.ts              # キャラクター画像作成 DTO
│       ├── query-characters.dto.ts          # キャラクター検索 DTO
│       └── update-character.dto.ts          # キャラクター更新 DTO
├── favorites/
│   ├── favorites.controller.ts              # お気に入り関連 API の共通入口
│   ├── favorites.list.controller.ts         # お気に入り一覧取得 API
│   ├── favorites.module.ts                  # favorites 機能のモジュール定義
│   ├── favorites.service.ts                 # アセットお気に入りの保存/取得ロジック
│   ├── favorites.toggle.controller.ts       # お気に入り ON/OFF 切り替え API
│   └── dto/
│       └── favorites.query.dto.ts           # お気に入り一覧取得用 DTO
├── games/
│   ├── games.controller.ts                  # ゲーム/シーン/ノード/セーブ API の HTTP 入口
│   ├── games.module.ts                      # games 機能のモジュール定義
│   └── games.service.ts                     # ゲーム本体ロジック。theme 保存、scene/node 更新、save slots を担当
├── health/
│   ├── health.controller.ts                 # ヘルスチェック API
│   ├── health.module.ts                     # health 機能のモジュール定義
│   └── health.service.ts                    # 稼働状態の返却ロジック
├── meili/
│   └── meili.client.ts                      # Meilisearch クライアント初期化
├── my/
│   ├── my.controller.ts                     # 自分の assets / characters 一覧を返す API
│   └── my.module.ts                         # my 機能のモジュール定義
├── prisma/
│   ├── prisma.module.ts                     # PrismaService を DI するモジュール
│   └── prisma.service.ts                    # Prisma クライアントの共通サービス
├── queues/
│   ├── purge.producer.ts                    # 削除後パージジョブの投入
│   ├── search.producer.ts                   # 検索インデックス更新ジョブの投入
│   └── thumbnail.producer.ts                # サムネイル生成ジョブの投入
├── search/
│   ├── search.controller.ts                 # Meilisearch を使ったアセット検索 API
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
- 公開 props は gameId、initial、initialUi、emit は close と saved です。
- 主な関数は save、reset、resetUi、applyPreset、applyUiPreset、exportTheme です。
- ※ 保存時は PATCH /games/:id に messageTheme と gameUiTheme を同時送信します。

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
