# PROJECT_SPEC（正準仕様）

本書は実装を根拠とした正準仕様です。記述は実装からの逆引きであり、推測は含みません（各所に出典ファイル/関数を明記）。

## ドメインモデル（実装準拠）

- Character（キャラクター）
  - フィールド: `id`, `ownerId`, `name`, `displayName`, `description?`, `isPublic`, `createdAt`, `updatedAt`, `deletedAt?`, `tags?: string[]`, `images?: CharacterImage[]`, `isFavorite?`
  - 出典: `packages/types/src/index.ts` の `export interface Character`
- CharacterImage（立ち絵画像単位）
  - フィールド: `id`, `characterId`, `key`, `thumbKey?`, `width?`, `height?`, `contentType`, `size?`, `emotion: CharacterEmotion`, `emotionLabel?`, `pattern?`, `sortOrder: number`, `createdAt`, `updatedAt`
  - 備考: 並び順プロパティ名は `order` ではなく `sortOrder`
  - 出典: `packages/types/src/index.ts` の `export interface CharacterImage`
- Emotion（列挙）
  - 値: `NEUTRAL | HAPPY | SAD | ANGRY | SURPRISED | FEAR | DISGUST | SHY | SLEEPY | THINKING | OTHER`
  - 日本語ラベル: `utils/characterLocales.ts` の `EMOTION_JP_LABEL` を正とする
    - 例: 自然体（NEUTRAL）/ 楽しい（HAPPY）/ 悲しい（SAD）/ 怒り（ANGRY）/ 驚き（SURPRISED）/ 恐れ（FEAR）/ 嫌悪（DISGUST）/ 照れ（SHY）/ 眠い（SLEEPY）/ 思案（THINKING）/ その他（OTHER）
  - 出典: 型は `packages/types/src/index.ts` の `export type CharacterEmotion`、日本語ラベルは `apps/frontend/utils/characterLocales.ts`

## UI / 画面仕様（実装準拠）

- タブナビ（共通）
  - 画面上部に「アセット｜キャラクター」タブを表示
  - 出典: `apps/frontend/components/common/SectionTabs.vue`
- 公開ギャラリー
  - パス: `/assets`（タブ: アセット｜キャラクター）
  - 検索/フィルタ: `q`, `contentType`, `primaryTag`, `tags`, `sort` をURLクエリに保持・復元
  - 出典: `apps/frontend/pages/assets/index.vue`（クエリ同期と検索）、`apps/frontend/composables/useAssets.ts`
- アセット管理
  - パス: `/my/assets`（タブ: アセット｜キャラクター）
  - 検索/フィルタ: 上記と同等のクエリ同期
  - 出典: `apps/frontend/pages/my/assets/index.vue`
- お気に入り
  - パス: `/my/favorites`（アセット）・`/my/favorites/characters`（キャラクター）
  - タブ: アセット｜キャラクター
  - 出典: `apps/frontend/pages/my/favorites/characters.vue`
- キャラクター
  - 一覧（公開）: `/characters`（タブ: アセット｜キャラクター）
    - クエリ同期: `q`, `tags`, `sort`
    - 出典: `apps/frontend/pages/characters/index.vue`
  - 詳細（公開）: `/characters/[id]`
    - 画像クリックで拡大モーダル
    - 出典: `apps/frontend/pages/characters/[id].vue`, `apps/frontend/components/common/ImageLightbox.vue`
  - マイ一覧: `/my/characters`
    - 出典: `apps/frontend/pages/my/characters/index.vue`
  - 新規作成: `/my/characters/new`
    - タブ `UploadTabs` を利用（「アセットをアップロード｜キャラクターを作成」）
    - 出典: `apps/frontend/pages/my/characters/new.vue`, `apps/frontend/components/common/UploadTabs.vue`
  - 編集: `/my/characters/[id]`
    - 立ち絵カードのレイアウト: 3カラム（md以上で3列）
    - 画像クリックで拡大モーダル（フォーム操作では開かない）
    - 編集可能フィールド: `emotion`（Enum選択＋`emotionLabel`自由ラベル）, `pattern`（任意文字列）, `sortOrder`（小さいほど先頭）
    - 新規アップロード画像は末尾に追加（最大の `sortOrder` + 1 を付与）
    - ドラッグ＆ドロップで入替、`sortOrder` を 0..N-1 に再採番して保存
    - 保存トースト／削除は取り消し可能トースト（5秒）
    - 出典: `apps/frontend/pages/my/characters/[id].vue`
- 公開ゲーム
  - 一覧（公開）: `/games`
    - 検索/並び替え: `q`（タイトル/概要の部分一致）, `sort`（`new | updated | title`）
    - URLクエリ同期: `q`, `sort` を反映・復元。不正な `sort` は `new` に正規化
    - カウンタ表示: `viewCount`（閲覧）/ `playCount`（プレイ）をカード内に表示
    - カバー表示: `coverAssetId` が設定されている場合は画像サムネイルを表示。未設定/取得失敗時はプレースホルダー表示を維持
    - 空状態: 検索あり0件時は「条件に一致する公開ゲームはありません。」を表示
    - 出典: `apps/frontend/pages/games/index.vue`, `apps/frontend/composables/useGames.ts`
  - マイ一覧（管理）: `/my/games`
    - 検索/並び替え/公開状態: `q`（タイトル/概要の部分一致）, `sort`（`updated | created | title | public`）, `status`（`all | public | private`）
    - URLクエリ同期: `q`, `sort`, `status` を反映・復元。不正な `sort` / `status` は `updated` / `all` に正規化
    - 検索確定: 検索ボタンまたは Enter で適用（入力中値と適用済み条件を分離）
    - カバー表示: `coverAssetId` が設定されているゲームは一覧カード左側に小型サムネイルを表示
    - 空状態: 検索/フィルタ結果0件時は「条件に一致する自作ゲームはありません。」を表示
    - 出典: `apps/frontend/pages/my/games/index.vue`, `apps/frontend/composables/useGames.ts`

## API と型（実装の出典）

- 型の出典
  - 共通型: `packages/types/src/index.ts`（`Asset`, `Character`, `CharacterImage`, `CharacterEmotion` など）
- 署名URL（GET/PUT）
  - GET（閲覧用）: `GET /uploads/signed-get?key=...&ttl=...` → JSON `{ url }`
    - 出典: `apps/api/src/uploads/uploads.controller.ts#getSignedGetUrl`
  - PUT（アップロード用）: `POST /uploads/signed-url` → 直PUTまたはフォームPOSTの情報
    - 出典: `apps/api/src/uploads/uploads.controller.ts#getSignedUrl`
- アセット（Favorites 含む）
  - 公開一覧: `GET /assets`、検索: `GET /search/assets`
    - 出典: `apps/frontend/composables/useAssets.ts`（`listPublic`, `searchMine`）と `apps/api/src/search/search.controller.ts`
  - お気に入り一覧: `GET /favorites`（配列は `normalizeAssetFavorite` で正規化）
  - お気に入り登録: `POST /assets/:id/favorite`
  - お気に入り解除: `DELETE /assets/:id/favorite`
    - 出典: フロント `apps/frontend/composables/useAssets.ts`（`listFavorites`, `favorite`, `unfavorite`, `applyFavorites`）/ サーバ `apps/api/src/favorites/*.ts`
- キャラクター
  - 公開一覧: `GET /characters`（`publicOnly` 省略時は公開のみ）
  - 公開詳細: `GET /characters/:id`
  - 作成: `POST /my/characters`
  - 取得（自分）: `GET /my/characters/:id`
  - 更新: `PATCH /my/characters/:id`
  - 削除: `DELETE /my/characters/:id`
  - 画像メタ追加: `POST /my/characters/:id/images`
  - 画像メタ更新: `PATCH /my/characters/:id/images/:imageId`
  - 画像削除: `DELETE /my/characters/:id/images/:imageId`
    - 出典: `apps/frontend/composables/useCharacters.ts` と `apps/api/src/characters/*.controller.ts`
  - お気に入り登録: `POST /characters/:id/favorite`
  - お気に入り解除: `DELETE /characters/:id/favorite`
  - お気に入り一覧（キャラ）: `GET /my/favorites/characters`
    - 出典: フロント `apps/frontend/composables/useCharacters.ts`（`favorite`, `unfavorite`, `listFavorites`）/ サーバ `apps/api/src/characters/character-favorites.*`
- 公開ゲーム
  - 公開一覧: `GET /games`
    - クエリ: `limit`, `offset`, `q`, `sort`
    - `q`: 空白trim後に空でなければ `title` / `summary` の部分一致検索（大文字小文字非区別）
    - `sort`: `new`（`createdAt desc`）/ `updated`（`updatedAt desc`）/ `title`（`title asc`, `createdAt desc`）
    - 不正な `sort` は `new` として扱う
    - 返却は公開ゲームのみ（`isPublic = true`, `deletedAt = null`）
    - `items[*]` は `coverAssetId` / `viewCount` / `playCount` を含む
  - 公開詳細: `GET /games/:id`
    - 詳細取得自体ではカウントを増やさない
    - 詳細画面側で `POST /games/:id/view` を呼び、公開ゲームのみ `viewCount` を +1 する
  - 公開プレイ開始カウント: `POST /games/:id/play`
    - プレイ画面の初期表示で呼び、公開ゲームのみ `playCount` を +1 する
    - セーブ/ロード、ノード進行では増やさない
    - 出典: `apps/api/src/games/games.controller.ts`, `apps/api/src/games/games.service.ts`
  - 自作一覧（管理）: `GET /games/my`
    - クエリ: `q`, `sort`, `status`
    - `q`: 空白trim後に空でなければ `title` / `summary` の部分一致検索（大文字小文字非区別）
    - `sort`: `updated`（`updatedAt desc`）/ `created`（`createdAt desc`）/ `title`（`title asc`, `updatedAt desc`）/ `public`（`isPublic desc`, `updatedAt desc`）
    - `status`: `all`（指定なし）, `public`（公開中のみ）, `private`（非公開のみ）
    - 不正な `sort` / `status` は `updated` / `all` として扱う
    - ログイン中ユーザー自身のゲームのみ返却し、`deletedAt = null` を維持
  - 更新: `PATCH /games/:id`
    - owner 本人のみ更新可能、削除済みゲームは更新不可（既存仕様）
    - `coverAssetId` は `string | null` を受け付け、`null` で解除可能
    - `coverAssetId` 指定時は以下を満たす必要がある
      - 画像アセット（`contentType` が `image/` で開始）
      - 削除済みでない（`deletedAt = null`）
      - 次のいずれかを満たす
        - 自分のアセット（`ownerId === userId`）
        - ログイン中ユーザーがお気に入り済み（`Favorite(userId, assetId)` が存在）
      - 権限のない他人アセット（未お気に入り）は `403` で拒否
    - `isPublic: true` を含む更新時のみ公開前チェックを実行し、`coverAssetId` 単独更新では公開前チェックを再実行しない

## お気に入り（Favorites）統一仕様

- 楽観的更新 → API 反映 → 失敗時ロールバック
  - 出典: アセット `apps/frontend/composables/useFavoriteToggle.ts`、キャラ `apps/frontend/composables/useFavoriteToggleCharacter.ts`
- 表示同期
  - 一覧フェッチ後に `applyFavorites()` で `isFavorited` を上書き
  - 出典: `apps/frontend/composables/useAssets.ts#applyFavorites`
- 返却データの表記ゆれを正規化
  - `normalizeAssetFavorite()` で `isFavorited` を付与（`isFavorite`/`favorited` 等を吸収）
  - 出典: `apps/frontend/composables/useAssets.ts#normalizeAssetFavorite`

## アセットお気に入り数表示MVP（2026-05-03）

- 実装範囲
  - 公開アセット一覧 `GET /search/assets` の `items[*]` に `favoriteCount` を追加
  - アセット詳細 `GET /assets/:id` に `favoriteCount` を追加
  - 公開一覧カード `/assets` で `お気に入り n` を表示（`undefined` は `0` 扱い）
  - アセット詳細 `/assets/:id` で `お気に入り n` を表示し、トグルUIの近傍に配置
- API実装方針
  - Prisma relation の `_count`（`_count.favorites`）を利用
  - `favoriteCount` 専用カラムは追加しない（migration なし）
  - 削除済みアセットは既存方針どおり `deletedAt: null` のみ返却
- お気に入り追加/解除時の更新方式
  - 楽観更新で `isFavorite/isFavorited` と `favoriteCount` を同時更新
  - 追加成功: `+1`、解除成功: `-1`（下限 `0`）
  - API失敗時は favorite 状態と件数をロールバック
- 影響範囲メモ
  - `/my/favorites` も同じアセットカード表示時に `favoriteCount` を自然表示（取得できる場合）
  - `/my/assets` は管理画面のため表示必須対象外（既存UIを維持）

## いいね / 素材棚 / 採用 / 引用・クレジット — 概念整理（設計方針）

### 現状（MVP）

現在 `favorites` テーブルが以下の2つの役割を兼ねている。

1. **お気に入り / いいね** — 好き・応援・あとで見る・人気指標
2. **素材棚 / 制作棚** — 自分のゲーム制作で使う素材を集める制作用ブックマーク

MVPとしてこの兼任を許容する。ただし将来的には以下のとおり概念分離を検討する。

現状の Picker との関係:
- `AssetPicker` は「自分のアセット / お気に入り」の2タブ構成で、お気に入り済みアセットを制作素材候補として扱っている。
- `CharacterPicker` も「自分のキャラ / お気に入り」の2タブ構成で、同様にお気に入り済みキャラクターを制作候補として扱っている。
- つまり現行のお気に入りは、実質的に制作素材棚の役割も持っている。

### 将来分ける4概念

#### 1. いいね / Like

| 項目 | 内容 |
|------|------|
| 意味 | 純粋な好意・応援・評価。「あとで制作に使う」とは分ける |
| 用途 | アセット/キャラクターへの反応、ランキング、作者へのフィードバック、おすすめ/人気順 |
| UI文言候補 | `いいね` / `応援` / `好き` |
| 将来DB候補 | `AssetLike`、`CharacterLike`、または汎用 `likes` |
| 注意 | 現在の `Favorite` と混同しない。将来的に `favoriteCount` は `likeCount` 相当に寄せるか、互換名として扱うかを検討対象にする |

#### 2. 素材棚 / Shelf / Library

| 項目 | 内容 |
|------|------|
| 意味 | ゲーム制作で使うために、自分の制作棚へ保存すること。Pickerに表示される候補。好きかどうかではなく「制作に使うかもしれない」状態 |
| 用途 | 背景/BGM/SE/カバー画像の選択候補、キャラクター配置候補、制作用ブックマーク |
| UI文言候補 | `素材棚に追加` / `制作棚に追加` / `制作に追加` / `ライブラリに追加` |
| 将来DB候補 | `AssetShelfItem`、`CharacterShelfItem`、または `asset_shelf_items` / `character_shelf_items` |
| 注意 | 現状の `Favorite` はここも兼任。移行時は既存 `favorites` を棚に初期移行するか、いいねに初期移行するか、ユーザーに選ばせるかを将来検討。制作用Pickerは原則「自分の素材 + 素材棚」を表示する方向 |

#### 3. 採用 / Use / Adoption

| 項目 | 内容 |
|------|------|
| 意味 | ゲーム内で実際に参照されている状態。背景/BGM/SE/カバー画像/立ち絵互換など、ゲームデータに保存されている参照。作者に返る実績として重要 |
| 用途 | 使用数/採用数集計、アセット作者への利用実績表示、削除影響表示との連携 |
| 保持したい情報例 | `gameId`、`assetId` or `characterId`、`field`（coverAssetId / bgAssetId / musicAssetId / sfxAssetId / portraitAssetId / speakerCharacterId / portraits 等）、`sceneId?`、`nodeId?`、`createdAt`、`updatedAt` |
| 将来DB候補 | `GameAssetReference`、`GameCharacterReference`、`AssetUsage`、`CharacterUsage` |
| 注意 | 採用は「棚に入っている」だけでは発生しない。保存時/公開前チェック/参照診断/削除影響表示と連携する。非公開ゲームの採用情報は、作者に詳細を返さない（集計だけ、または自分のゲームだけ詳細表示） |

#### 4. 引用・クレジット / Credit

| 項目 | 内容 |
|------|------|
| 意味 | 公開ゲームやスタッフロールで、素材作者・キャラクター作者を表示するための関係。「採用」と近いが、見せ方・権利・作者尊重の文脈 |
| 用途 | ゲームページでの素材クレジット表示、スタッフロール、作者への帰属明示 |
| UI文言候補 | `使用素材` / `素材クレジット` / `このゲームで使われている素材` / `クレジットに表示` |
| 将来DB候補 | `GameCredit`、`GameAssetCredit`、`GameCharacterCredit`、または `GameAssetReference` から自動生成 |
| 注意 | MVPでは自動生成方針でよい。手動編集・任意追記は将来課題。削除済み/非公開素材の表示名をどう残すかは将来課題。表示名・作者名のスナップショット保存が必要になる可能性がある |

### 正規採用ルート（UX設計方針）

素材はコピーして奪うものではなく、ゲーム作品内で正式に採用し、作者に実績とクレジットが返るものとして設計する。

**正規フロー:**
1. ギャラリーで素材・キャラクターを見る
2. いいねする、または素材棚に追加する
3. エディタの Picker から素材棚の素材を選ぶ
4. ノード/ゲーム保存時に採用関係が記録される
5. 公開ゲームの詳細/クレジットに素材作者が表示される
6. 素材作者側には採用数/使用数として実績が返る

この方針を貫くことで、再アップロードやコピーより正規ルートが便利で得になる体験を作ることが目標。

### 将来の指標分離案

| 指標 | 意味 |
|------|------|
| いいね数 | 人気/評価 |
| 素材棚追加数 | 制作者が使いたいと思った数 |
| 採用数 / 使用数 | 実際にゲーム内で使われた数（公開ゲームのみ or 全ゲームかは要検討） |
| 閲覧数 | 見られた数 |

### 将来のUI文言案

| 操作 | 意味 |
|------|------|
| いいね | 好き/応援/あとで見る |
| 素材棚に追加 | 制作に使う候補として保存 |
| このゲームで採用している素材 | 実際にゲーム内で参照している素材 |
| 素材クレジット | スタッフロール/素材クレジット対象 |
| クレジットに表示 | 作者名・素材名をゲームページに掲載 |

## アセット指標の将来課題

- アセット閲覧数 `viewCount`
  - 集計対象: `/assets/:id` 詳細表示
  - 非対象: `/assets` 一覧表示、`/my/assets` 管理画面
  - MVP案: ゲームと同様にリロードごと増加を許容
  - 将来: ユニーク閲覧（ユーザー/IP重複除外）
- アセットお気に入り数の高度化
  - 一覧負荷次第で `favoriteCount` カラムの導入を検討
  - favorite/unfavorite 時にカウンタ増減
  - お気に入り順ソート、人気順ソートへの活用
- アセット使用数 `usedInGameCount`
  - 背景/BGM/SE/キャラクター素材別の集計
  - 公開ゲームのみ対象か、非公開ゲームを含めるかを検討
  - ゲーム削除/非公開化時の集計ルールを整理
  - 使用数順ソートへの活用
- ランキング/検索連携
  - お気に入り順、閲覧数順、使用数順、人気順
  - タグ検索との複合条件
  - Meilisearch / 高度検索スコアリング連携
- 分析基盤
  - 作者ダッシュボード
  - イベントログテーブル

## 検索 / フィルタ / URL 同期

- `/assets`（公開）と `/my/assets`（自分）
  - クエリ: `q`, `contentType`, `primaryTag`, `tags`, `sort` をURLに反映・復元
  - 出典: `apps/frontend/pages/assets/index.vue`, `apps/frontend/pages/my/assets/index.vue`, APIは `apps/api/src/search/search.controller.ts`
- `/characters`（公開一覧）
  - クエリ: `q`, `tags`, `sort` をURLに反映・復元
  - 出典: `apps/frontend/pages/characters/index.vue`
- `/games`（公開一覧）
  - クエリ: `q`, `sort` をURLに反映・復元（`sort` 未指定時は `new`）
  - 検索対象: `title`, `summary`（UI表示上は description にマップ）
  - 出典: `apps/frontend/pages/games/index.vue`, `apps/frontend/composables/useGames.ts`, `apps/api/src/games/games.service.ts`
- `/my/games`（自作管理一覧）
  - クエリ: `q`, `sort`, `status` をURLに反映・復元（`sort` 未指定時は `updated`、`status` 未指定時は `all`）
  - 検索対象: `title`, `summary`
  - 出典: `apps/frontend/pages/my/games/index.vue`, `apps/frontend/composables/useGames.ts`, `apps/api/src/games/games.controller.ts`, `apps/api/src/games/games.service.ts`

## サムネ / 署名URL 取扱

- 取得フロー: `GET /uploads/signed-get` で JSON `{ url }` を受け取り、`<img src>` に適用
  - 出典: `apps/frontend/composables/useSignedUrl.ts` と `apps/frontend/components/character/CharacterImageThumb.vue`
- TTL切れ時の再取得: 403 を検知して再署名を行うヘルパーあり
  - 出典: `apps/frontend/composables/useAutoRefreshUrl.ts`
- スケルトン表示: URL未取得時はプレースホルダ表示
  - 出典: `apps/frontend/components/character/CharacterImageThumb.vue`
- 直 fetch 禁止 / `$api` 経由
  - 認証トークン付与・401時の自動リトライ等を行う `$api` を使用
  - 出典: `apps/frontend/plugins/api-auth.client.ts`, `apps/frontend/composables/useApi.ts`

## 既知の落とし穴 & 対処

- 401/403
  - `$api` 経由で Authorization を付与。401時は Supabase のセッション更新→再試行
  - 出典: `apps/frontend/plugins/api-auth.client.ts`
- 署名URL TTL 切れ
  - 403 検知で再取得（`useAutoRefreshUrl`）、もしくは `useSignedUrl.refresh()` を呼ぶ
  - 出典: `apps/frontend/composables/useAutoRefreshUrl.ts`, `apps/frontend/composables/useSignedUrl.ts`
- CI `ERR_PNPM_OUTDATED_LOCKFILE`
  - `pnpm install --frozen-lockfile` を前提に lockfile（`pnpm-lock.yaml`）も必ずコミット

## テスト / E2E TODO（抜粋）

- ♡トグル（アセット/キャラ）：楽観更新とロールバックの確認
- 署名GET再取得：403後の自動再取得
- キャラクター編集：並び替えD&D、`sortOrder` 保存、削除の取り消しトースト
- アップロード一連：PUT 署名→登録→サムネ表示

---

## ゲーム制作（β）仕様

### 目的
Talking 上で"シーン→ノード"の順にテキスト/演出を組み立て、プレビューしながら ADV 風ゲームを制作できる。

### ゲーム参照診断（Reference Diagnostics）MVP仕様（2026-05-04）

#### 概要
- 保存済みゲーム（GameProject）内の全ノードを走査し、**素材・キャラクター・キャラクター画像の参照エラー**を診断する。
- API側で一括チェックし、エディタ画面のシナリオチェック欄に警告として表示。
- 診断は自動実行で、保存処理をブロックしない（警告表示のみ）。
- 削除・非公開・型不一致など**参照エラーの判定**を細分化し、ユーザーが問題を把握しやすくする。

#### 診断対象と警告コード
診断はゲーム全体またはシーン/ノード単位で実行でき、各問題に固有の警告コード（code）を割り当てる。

| コード | 対象 | 原因 | 説明 |
|--------|------|------|------|
| `ASSET_MISSING` | 背景/BGM/SE | 存在しない | アセットIDが見つからない |
| `ASSET_DELETED` | 背景/BGM/SE | 削除済み | アセットが削除済み状態（`deletedAt` が非null） |
| `ASSET_KIND_MISMATCH` | 背景/BGM/SE | 種別不一致 | アセット種別（image/audio）が用途と一致しない |
| `ASSET_NOT_USABLE` | 背景/BGM/SE | 権限なし | ユーザーが所有/お気に入りしていない（他人のアセット） |
| `CHARACTER_MISSING` | 話者/立ち絵 | 存在しない | キャラクターIDが見つからない |
| `CHARACTER_DELETED` | 話者/立ち絵 | 削除済み | キャラクターが削除済み状態（`deletedAt` が非null） |
| `CHARACTER_NOT_USABLE` | 話者/立ち絵 | 権限なし/非公開 | 所有/お気に入りしていない、または他人の非公開キャラクター |
| `CHARACTER_IMAGE_MISSING` | 立ち絵画像 | 存在しない | CharacterImage IDが見つからない |
| `CHARACTER_IMAGE_MISMATCH` | 立ち絵画像 | 画像ID/キャラIDの不一致 | `portrait.imageId` が `portrait.characterId` に属していない |
| `PORTRAIT_KEY_MISMATCH` | 立ち絵画像 | keyの不整合 | クライアント側の `portrait.key` とDB上の canonical な `key` が不一致 |
| `PORTRAITS_INVALID` | 立ち絵全体 | 構造不正 | `portraits` 配列の構造に問題がある（characterId/imageId 欠落等） |

#### APIエンドポイント
```
GET /games/:id/reference-diagnostics
```

- **認証**: SupabaseAuthGuard で owner のみ（self.ownerId == req.user.userId）
- **クエリ**: なし
- **返却**:
  ```ts
  interface GameReferenceDiagnosticsResult {
    issues: GameReferenceDiagnosticIssue[]
    counts: {
      warning: number // 警告総数（ただし warnings ≠ allIssues.length の場合の位置付けは検討）
    }
    checkedAt: ISO8601Timestamp
  }
  
  interface GameReferenceDiagnosticIssue {
    id: string                                // 一意のissueID（例: `ref_<hash>`）
    source: 'reference'                       // 警告種別（scenarioCheck内での識別用）
    severity: 'warning'                       // 常に'warning'（エラーは返さない）
    code: GameReferenceDiagnosticCode         // 警告コード（上記表を参照）
    message: string                           // UI向けメッセージ（日本語）
    field: 'bgAssetId' | 'musicAssetId' | 'sfxAssetId' | 'speakerCharacterId' | 'portraits' | (game-level)
    refId: string | null                      // 参照先ID（assetId, characterId 等）。ゲーム固有は null
    sceneId: string | null                    // 対象シーンID（ゲーム固有は null）
    sceneName: string                         // 対象シーン名（ゲーム固有時は空文字列）
    sceneOrder: number | null                 // 対象シーンの番号（1-indexed）。ゲーム固有は null
    nodeId: string | null                     // 対象ノードID（ゲーム固有は null）
    nodeOrder: number | null                  // 対象ノードの番号（1-indexed）。ゲーム固有は null
    nodePreview: string                       // 対象ノードのテキストプレビュー（最初の50文字）
  }
  ```

#### エディタ画面でのUI統合
- `/my/games/:id/edit` の「シナリオチェック」セクション内で、既存の localIssues（構造チェック）と統合表示。
- referenceDiagnostics が非null時：
  - 参照診断の issues を warnings に変換（`severity = 'warning'`）し、localIssues に追加。
  - 全 issues を重大度順（error > warning > info）で並び替え。
  - warning 件数に参照診断の warning 件数を加算。
- エラーメッセージ表示：
  - API 取得失敗時は `referenceDiagnosticsError` をalertまたは UIで通知。
- リアルタイム更新：
  - ノード追加/削除/シーン削除時に `refreshReferenceDiagnostics()` を再実行し、UI を最新化。
  - onMounted時にも自動取得。

#### 実装補足
- 対象ゲームの全シーン/ノードを一括ロードし、参照されている assetId / characterId / imageId を収集
- 収集した全IDを Prisma `findMany` + `in: []` ガードで一括取得し、Map 化してローカル検証（N+1 回避）
- お気に入り（Favorite / FavoriteCharacter）も同様に一括取得し、所有者またはお気に入り済みかをマップで判定
- portrait key normalize は Node 保存時の既存処理と統合

#### 将来課題
- Auto-repair（自動修正）:  warning を削除して置き換える機能。MVP では実装しない。
- Quarantine（問題素材を一時隔離）: ゲーム実行時に参照エラー時点で fallback 画像を表示など。MVP では実装しない。
- 他言語対応: 現状日本語のみ。
- 並行編集時の参照診断の再計算タイミング。

### ゲーム内参照アセット権限ルール（MVP棚卸し: 2026-05-04）

#### 基本ルール
- ゲーム制作時に参照できる素材は「自分の素材」と「お気に入り済み素材」を基本とする。
- お気に入りは「いいね」だけでなく、制作時の素材棚・ブックマークとして扱う。
- 制作用Pickerには全公開素材を直接並べず、お気に入り済み素材に絞って表示する。
- 削除済み素材は参照不可とする。
- 素材種別が用途と一致しない参照は不可とする。

#### アセット種別ルール
- 背景画像: `image/*` のアセット
- カバー画像: `image/*` のアセット
- BGM: `audio/*` のアセット
- SE: `audio/*` のアセット
- キャラクター: 自分のキャラクター、またはお気に入り済みキャラクター
- 立ち絵/表情: 選択済みキャラクターの `CharacterImage`

#### UIルール
- `AssetPicker` は「自分のアセット / お気に入り」の2タブ構成とし、`type="image" | "audio"` を両タブに適用する。
- `CharacterPicker` は「自分のキャラ / お気に入り」の2タブ構成とする。
- 公開素材を制作で使いたい場合は、まずお気に入り登録してからPickerで選択する。
- ノード編集では、背景=`AssetPicker type="image"`、BGM/SE=`AssetPicker type="audio"` を使用する。
- ゲーム全体設定のカバー画像は `AssetPicker type="image"` を使用する。

#### API側ルール（理想）
- 保存時は `assetId` / `characterId` / `characterImageId` について「本人所有 or お気に入り済み」を検証する。
- `image/audio/character` など用途別の型不一致は拒否する。
- 削除済み素材・参照不可素材は拒否する。

#### 現状棚卸し（2026-05-04 更新）
- カバー画像（`coverAssetId`）は API で「本人所有 or お気に入り済み」「`image/*`」「未削除」を検証済み。
- Node保存時の `bgAssetId` / `musicAssetId` / `sfxAssetId` も API 側で以下を検証済み（2026-05-04 MVP）。
  - `bgAssetId`: `image/*` のみ。本人所有 or お気に入り済み。削除済み不可。`null`/未指定は許可。
  - `musicAssetId` / `sfxAssetId`: `audio/*` のみ。本人所有 or お気に入り済み。削除済み不可。`null`/未指定は許可。
  - 種別違い（画像 → 音声フィールド等）は `BadRequestException`、権限なしは `ForbiddenException`。
  - 共通ロジックは `GamesService.assertGameAssetUsable(userId, assetId, 'image'|'audio')` に集約。
  - カバー画像の `assertCoverAssetUsable` はこの共通関数に委譲。
- キャラクター参照（`speakerCharacterId` / `portraits[*].characterId`）の Node 保存時バリデーションを実装済み（2026-05-04 MVP）。
  - `speakerCharacterId`: 本人所有 or 公開かつお気に入り済みキャラクターのみ保存可能。`null`/未指定は許可。
  - 共通ロジックは `GamesService.assertGameCharacterUsable(userId, characterId)` に集約。
- 立ち絵 JSON（`portraits`）の Node 保存時バリデーションを実装済み（2026-05-04 MVP）。
  - `portraits[*].imageId` は `CharacterImage.id` として存在し、entry の `characterId` に属している必要がある。
  - `portraits[*].key` は API 保存時に DB 上の canonical `CharacterImage.key` へ上書き正規化される（クライアントから送られた値は信用しない）。
  - キャラクターのアクセス可否は `assertGameCharacterUsable` と同ルールで検証される。
- `portraitAssetId` は互換維持のレガシー画像アセット参照フィールド。現行立ち絵は `portraits[*].imageId` を使う。
  - `portraitAssetId` が非空で指定された場合は `assertGameAssetUsable(userId, portraitAssetId, 'image')` を通す。
  - `null`/未指定/空文字は許可。
- Node 更新時の所有確認を強化済み（2026-05-04 MVP）。
  - `node.id` が指定されている場合、そのノードが URL の `sceneId` 配下であることを検証する。
  - クライアントから送られた `sceneId` フィールドは無視し、URL の `sceneId` に固定する（クロスシーン移動を防止）。
- `POST /characters/:id/favorite` に防御を追加済み（2026-05-04 MVP）。
  - 存在しない/削除済みキャラクターのお気に入りは `NotFoundException` で拒否。
  - 非公開の他人キャラクターのお気に入りは `ForbiddenException` で拒否。

### アセット削除時の利用影響表示MVP（2026-05-04）

#### 概要
アセット所有者が自分のアセットを削除しようとしたときに、そのアセットがゲーム内でどう使われているかを削除確認UIで事前表示する。削除自体はブロックしない（warning表示のみ）。

#### API
`GET /assets/:id/usage-impact` (`SupabaseAuthGuard` 必須、アセット所有者のみ実行可能)

- 他人のアセットIDを指定した場合: `ForbiddenException`
- 存在しない/削除済みアセット: `NotFoundException`
- 削除済みアセットのMVP判断: `NotFoundException` で返す（削除済みアセットは診断不要なため）

#### 診断対象フィールド
| フィールド | モデル | 備考 |
|-----------|-------|------|
| `coverAssetId` | `GameProject` | カバー画像 |
| `bgAssetId` | `GameNode` | 背景 |
| `musicAssetId` | `GameNode` | BGM |
| `sfxAssetId` | `GameNode` | SE |
| `portraitAssetId` | `GameNode` | 立ち絵互換（レガシーフィールド） |

- `portraits[*].imageId` は `CharacterImage` 参照であり、Asset ID ではないため今回の診断対象外。将来的に `CharacterImage` → `Asset` の逆引きが必要になった場合に対応する。
- 対象ゲームは `GameProject.deletedAt: null` のゲームのみ（論理削除済みゲームは除外）。
- 公開・非公開ゲームの両方を集計対象にする。

#### レスポンス設計
- `totalGameCount` / `ownGameCount` / `otherGameCount`: distinct ゲーム件数
- `totalReferenceCount` / `ownReferenceCount` / `otherReferenceCount`: 参照箇所合計
- `byField`: フィールド別件数（cover/bg/music/sfx/portrait）
- `ownGameSamples`: 自分のゲームの最大10件サンプル（`sampleLimit: 10`、`hasMoreOwnGames: boolean`）
- `checkedAt`: 診断実行時刻（ISO 8601）

#### 他人ゲームのプライバシー方針
他人のゲームは、公開・非公開に関わらず **件数だけ** 返す。以下は返さない:
- 他人のゲームタイトル
- 他人のシーン名・ノード本文
- 他人の userId / ownerId
- 他人ゲームの公開/非公開内訳

**理由**: 非公開ゲームの存在・タイトル・内容がアセット所有者に漏れるのを避けるため。また、「誰がこの素材を使っているか」の監視機能にならないようにするため。

#### Asset.isPublic / visibility について
現行の `Asset` モデルには `isPublic` / visibility フィールドがない。現状は `deletedAt: null` が実質的な公開条件。「非公開化時の影響表示」は将来 `Asset.visibility` / `Asset.isPublic` 等を設計するときに接続する。MVPでは対象外。

### 共有素材の再アップロード/コピー問題（設計論点）

ユーザーが参照切れを避けるために他人のアセットをダウンロードして自分のアセットとして再アップロードする可能性がある。

#### 問題点
- 人気度が分散し、本来の作者への評価や利用実績が見えづらくなる
- 元作者への採用実績・クレジットが返らない
- 作者が削除/公開停止したい素材が、別ユーザーの再アップロードとして残り続ける
- 利用条件・ライセンス・権利処理が曖昧になる
- 「参照切れ回避」のためにコピー文化が強まると、素材共有サービスとしての信頼性が落ちる

#### MVP方針
- 表示可能な画像/音声の完全なダウンロード防止は現実的ではない（signed URL はアクセス制御であってDRMではない）
- MVPでは技術的な検出・ブロックは実装しない
- 対策は「完全防止」ではなく、プロダクト設計で正規ルートを使いやすくする方向を目指す
- 正規採用ルートを便利にして、再アップロードするより公式利用の方が得になる設計に寄せる（→「正規採用ルート（UX設計方針）」参照）

#### 将来の対策案
- `GameAssetReference` / `AssetUsage` による採用関係の明示記録
  - ゲームがどの素材を実際に採用しているかを明示的に記録する
  - アセット作者に採用数/使用数として実績が返る基盤
- `sourceAssetId` / `derivedFromAssetId` による派生元追跡
- ファイルhash / perceptual hash / audio fingerprint による重複検出は将来課題（誤検知・計算コスト・回避可能性があるためMVPでは実装しない）
- ライセンス/利用条件/クレジット方針の整理
- 削除/非公開/新規利用停止/既存利用継続/権利侵害停止の意味を分ける
  - ギャラリーから非表示/新規利用停止
  - 既存ゲームでの継続利用を許すアーカイブ
  - 権利侵害/規約違反などの強制停止

### キャラクター削除時の利用影響表示MVP（2026-05-04）

#### 概要
キャラクター所有者が自分のキャラクターを削除しようとしたときに、そのキャラクターがゲーム内でどう使われているかを削除確認UIで事前表示する。削除自体はブロックしない（warning表示のみ）。アセット削除時MVPの横展開だが、参照フィールドがキャラクター固有のため実装は独立。

#### API
`GET /my/characters/:id/usage-impact` (`SupabaseAuthGuard` 必須、キャラクター所有者のみ実行可能)

- 存在しない/削除済みキャラクター: `NotFoundException`
- 他人のキャラクターIDを指定した場合: `ForbiddenException`

#### 診断対象フィールド
| フィールド | モデル | 備考 |
|-----------|-------|------|
| `speakerCharacterId` | `GameNode` | 話者として設定されている場合 |
| `portraits[*].characterId` | `GameNode` | 立ち絵配置の characterId 一致 |
| `portraits[*].imageId` | `GameNode` | 立ち絵配置の imageId が対象キャラクター画像IDに一致する場合 |

- `portraits` は JSON フィールドのため、DB側フィルタではなく TypeScript 側でフィルタ（N+1なし）
- 対象ゲームは `GameProject.deletedAt: null` のゲームのみ（論理削除済みゲームは除外）
- 公開・非公開ゲームの両方を集計対象にする

#### レスポンス設計
- `characterId` / `totalGameCount` / `ownGameCount` / `otherGameCount`
- `totalReferenceCount` / `ownReferenceCount` / `otherReferenceCount`
- `ownByField`: 自分のゲームでのフィールド別件数（`{ speakerCharacterId, portraits }`）
- `ownGameSamples`: 自分のゲームの最大10件サンプル（`sampleLimit: 10`、`hasMoreOwnGames: boolean`）
- `checkedAt`: 診断実行時刻（ISO 8601）

#### 他人ゲームのプライバシー方針
アセット削除時MVPと同じ方針：他人のゲームは **件数だけ** 返す。以下は返さない:
- 他人のゲームタイトル / シーン名 / ノード本文
- 他人の userId / ownerId
- 他人ゲームの公開/非公開内訳

#### アセット削除時MVPとの関係
- アセット削除時MVP（`GET /assets/:id/usage-impact`）と設計方針・レスポンス構造を揃えている
- フロントUIもアセット削除モーダルに倣い、`showDeleteModal` / `usageImpact` / `usageImpactLoading` / `usageImpactError` で管理
- キャラクター固有の表示: 話者（`speakerCharacterId`）/ 立ち絵配置（`portraits`）の2区分

#### portraits フィールドの実装方針
- `portraits` は Prisma JSON フィールドのため、DB 側で `NOT: { portraits: null }` のような null 条件は指定しない（Prisma の runtime validation エラーになる）
- MVP では `scene: { project: { deletedAt: null } }` のみ DB 条件とし、候補ノードを全取得
- TypeScript 側で `Array.isArray(n.portraits)` によって絞り込み、各エントリが object であること・`characterId` / `imageId` が string であることを確認してから比較
- 不正な JSON 形状（null / object / malformed 配列）が混在しても API が 500 にならないよう堅牢化している

### ルーティング / 画面

- **エディタ**: `/my/games/:id/edit`
  - 左:シーン一覧、中央:ノード一覧、右:プロパティ(プレビュー含む)
  - 右ペインは「通常表示 / 全画面」をトグル(UI: *全画面 / 通常表示*, F で切替・Esc で閉じる)
  - ステージは 16:9 比率で **StageCanvas** に統一。通常・全画面・テストプレイすべてで**同一スケール・比率**で描画（`useStageScale` で実高さpxをCSS変数 `--stage-h-px` に流し、フォント・余白を clamp() でスケール）
  - **「全体設定」**ボタンから**ゲーム全体設定モーダル**を開ける
    - 基本情報タブで `title` / `summary` / `coverAssetId` を同時編集
    - カバー画像は「自分の画像アセット」または「お気に入り済み画像アセット」から選択/クリア可能（保存までゲーム本体へ未反映）
    - 音声アセットは選択不可（`AssetPicker type="image"`）
    - 保存時は `title` / `summary` / `coverAssetId` / 各テーマ設定を同時に `PATCH /games/:id` へ送信
    - メッセージウィンドウタブでは背景色・枠線・角丸・余白・名前帯表示・文字色・文字サイズ・行間・タイプ速度を編集
  - ノード編集欄では「開始ノードに設定」ボタンでシーンの `startNodeId` を更新
  - シーン一覧では「このシーンから開始」操作で `GameProject.startSceneId` を更新可能
    - 対象シーンの `startNodeId` が設定済みなら維持
    - 未設定ならシーン内先頭ノードを `startNodeId` に自動設定
    - ノード0件のシーンは開始シーンに設定せず、ノード追加を案内
  - 「次ノード」は **NodePicker（モーダル＋検索・冒頭プレビュー付き）** から選択
    - 「シーン → ノード」二段階選択UI（左ペイン: シーン一覧、右ペイン: 選択中シーンのノード一覧）
    - キーボード操作: 検索欄初期フォーカス・右ペインで `↑` / `↓` / `Enter` / `Esc` 操作可能
    - 詳細プレビュー: 所属シーン・Node番号・本文プレビュー・選択肢数・nextNode設定有無・開始ノード表示
    - 検索時は全シーン横断検索、現在シーンの最新ノード反映と他シーン候補維持に対応

<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue, apps/frontend/components/game/NodePicker.vue -->
#### エディタのキーボードショートカット
- **Ctrl/⌘+Enter**: 「保存して次のノードへ」を実行（保存→新規作成→nextNodeId連結→遷移、`saving` 状態で連打防止）
- **Ctrl/⌘+K**: 次ノードID欄にフォーカス中に NodePicker を即起動（既存の選択処理と統合）
- **F**: プロパティペインの全画面⇔通常表示を切替
- **Esc**: 全画面プロパティペインを閉じる

- **テストプレイ**: `/games/:id/play`
  - クエリ `?sceneId=&nodeId=` を受け取り、指定がない場合は **scene.startNodeId → 先頭ノード**の順で自動補完
  - 初回は **音声同意オーバーレイ**を表示。クリックで `AudioContext.resume()` を呼び出し、BGM自動再生を試みる（失敗時は次の操作で再試行）
  - **BGMフェードMVP（実装済み）**
    - BGM停止時は即停止せず、固定時間フェードアウト後に `pause` / `src` 解除 / `currentTime` リセットを行う
    - BGM切替時は「現在曲フェードアウト → 新曲セット → 新曲フェードイン」を直列で実行する（クロスフェードは未実装）
    - 同一BGM（同一ノード遷移で `musicAssetId` が変化しないケース）は再読込・頭出し・再フェードを行わず再生継続
    - 現行仕様として、`musicAssetId` 未指定ノードへ遷移した場合はBGM停止扱い（フェードアウト経由）
    - フェード処理は世代トークンで管理し、AUTO / SKIP の高速遷移中でも古いフェードが新しいBGM音量を破壊しない
  - ノードに `sfxAssetId` が設定されている場合、そのノードへ遷移したタイミングで効果音(SE)を1回再生する
  - SEはMVPとして既存挙動を維持（BGMフェード処理には巻き込まない）
  - 効果音(SE)の再生も音声同意(`audioConsent`)に従う。BGMまたは効果音のいずれかが存在する場合は、初回に音声同意オーバーレイを表示する
  - フルスクリーン化してもノード状態は維持される
  - **カメラ（zoom/cx/cy）は StageCanvas に反映**され、背景とキャラクターに拡大・パン変換を適用（メッセージウィンドウは拡大しない）
  - **セリフ継続表示**: `continuesPreviousText` が true のノードでは、前ノードのテキストを消さずに残し、現在のノードのテキストを追加表示する。連続する継続フラグを遡って累積表示する（会話の流れを維持したまま演出可能）
  - **AUTO / SKIP MVP（実装済み）**
    - メッセージウィンドウのクイック操作列に `AUTO` / `SKIP` ボタンを表示し、通常表示・フルスクリーン表示の両方で利用可能
    - `AUTO`: 本文の全文表示完了後、固定待機時間（現状 1500ms）で自動進行
    - `SKIP`: タイプライターを即全文表示し、短い固定間隔（現状 80ms）で高速進行
    - `AUTO` と `SKIP` は排他。片方を ON にするともう片方は OFF
    - 選択肢表示時、終端ノード到達時、セーブ/ロードモーダル表示時、バックログ表示時、音声同意オーバーレイ表示時は AUTO / SKIP を停止
    - 手動進行（クリック、`Enter`、`Space` など）を行った場合、AUTO / SKIP は停止
    - 既読管理は未実装。今回の `SKIP` は既読/未読を区別しない単純高速進行
    - `SKIP` は連続 100 回進行でループガードを発火し、`Skipを停止しました。シナリオがループしている可能性があります。` を通知して停止
  - **キーボード操作**: ゲームプレイ画面で以下のキー操作が可能（実装済み）
    - `Enter` / `Space`: タイプライター中は全文表示、完了後は次のノードへ進む（選択肢表示中はハイライト選択肢を決定）
    - `↑` / `↓`: 選択肢表示中にハイライト移動（末尾/先頭でループ）
    - 数字キー `1`〜`9`: 対応する番号の選択肢を直接選択
    - `Esc`: セーブ/ロードモーダル → バックログ → フルスクリーンの優先順に閉じる
    - `input` / `textarea` / `select` / `button` / `[contenteditable]` フォーカス時はショートカット無効
    - IME 変換中（`event.isComposing` / `key === 'Process'`）はキー処理をスキップ
    - セーブ/ロードモーダルまたはバックログ表示中は Esc 以外でゲーム進行しない
  - 出典: `apps/frontend/pages/games/[id]/play.vue`, `apps/frontend/components/game/MessageWindow.vue`

#### AUTO / SKIP の将来課題

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
- クリック長押し / キー長押しによる一時 Skip
- AUTO 中の選択肢自動選択

#### スタッフロール / クレジット表示（将来課題）

- ゲーム終了時にスタッフロールやクレジットを表示する
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

### ドメイン / モデル(Prisma 正)
- `GameProject { id, ownerId, title, summary?, viewCount Int, playCount Int, startSceneId String?, messageTheme Json?, deletedAt? ... }`
  - `startSceneId`: ゲーム全体の開始シーンID
  - `viewCount`: 公開ゲーム詳細表示の累計カウント（MVP）
  - `playCount`: 公開ゲームプレイ開始の累計カウント（MVP）
  - `messageTheme`: メッセージウィンドウテーマ設定（後述）
- `GameScene { id, projectId(FK), name, order, startNodeId String?, createdAt, updatedAt }`
  - `startNodeId`: シーン開始ノードID（ゲーム開始時は `GameProject.startSceneId` のシーンにある `startNodeId` を使用）
- `GameNode  { id, sceneId(FK), order, text, speakerCharacterId?, speakerDisplayName?, bgAssetId?, musicAssetId?, sfxAssetId?, portraits Json?, camera Json?, cameraFx Json?, continuesPreviousText Boolean?, createdAt, updatedAt }`
  - `continuesPreviousText`: 前ノードのセリフを消さずに継続表示するフラグ（省略時 false）。true の場合、このノードのテキストを前ノードのテキストに追加して表示する。エディタでは「前ノードのセリフを消さずに続ける」チェックボックスで設定。
- `GameChoice { id, nodeId(FK), label, targetNodeId?, condition?, effects?, alternateTargetNodeId?, alternateCondition? }`
  - `targetNodeId` 未設定は `null`（空文字 `''` は未使用）

#### 開始地点モデルの再検討課題

- 現状のゲーム開始地点は `GameProject.startSceneId` と `GameScene.startNodeId` の組み合わせで表現している
- ただし通常のシナリオ遷移は `GameNode.nextNodeId` / `GameChoice.targetNodeId` / `GameChoice.alternateTargetNodeId` による nodeId 直指定であり、現時点では「シーンへ移動する」機能は存在しない
- そのため、ゲーム開始時に本質的に必要なのは開始ノードIDだけであり、開始ノードの所属シーンは node から逆引きできる
- 将来的には `GameProject.startNodeId` に単純化する余地がある
- 一方で、シーン単位ジャンプ、章選択、シーン単位テストプレイ、フローチャート表示を実装するなら `GameScene.startNodeId` は意味を持つ
- 現時点では既存実装を維持し、この点は将来の設計課題として扱う
- 今後シーン単位ジャンプを実装しない方針が固まるなら、`GameProject.startNodeId` への移行を再検討する

#### Node.camera JSON
```ts
type Camera = { zoom: number /*100–300*/; cx: number /*0–100*/; cy: number /*0–100*/ }
// 既定: { zoom:100, cx:50, cy:50 }（％はステージ基準）
```

#### Node.cameraFx JSON（カメラ演出）

```ts
type Camera = { zoom: number; cx: number; cy: number }

type CameraPoint = {
  zoom?: number  // 100–300 (%)
  cx?: number   // 0–100 (%)
  cy?: number   // 0–100 (%)
}

type CameraFxMode = 'cut' | 'together' | 'pan-then-zoom' | 'zoom-then-pan'

type GameNodeCameraFx = {
  from?: CameraPoint    // ノード開始時のカメラ（省略時は前ノードの camera または現在カメラ）
  to?: CameraPoint      // ノード終了時のカメラ（省略時はこのノードの camera）
  durationMs?: number   // アニメーション時間(ms)。0 以下 or 未指定ではアニメなし
  mode?: CameraFxMode   // アニメの順序。省略時 'together'
}
```

* テストプレイでは、ノードに入ったタイミングで以下のルールでカメラを決定し、`StageCanvas` に反映する:
  * 開始カメラ:
    * `cameraFx.from` があればそれを使う（不足プロパティは前ノードの camera を補完）
    * なければ前ノードの camera（先頭ノードでは `{zoom:100,cx:50,cy:50}`）
  * 終了カメラ:
    * `cameraFx.to` があればそれを使う（不足プロパティはこのノードの camera を補完）
    * なければこのノードの `camera`

* `mode` / `durationMs` に応じて、ズームとパンを `requestAnimationFrame` で補間して動かす。
* `cameraFx` が未設定、`mode: "cut"`、`durationMs <= 0` の場合は、従来どおりカット切替。

※ UI では当面、from/to の詳細編集は行わず、「前ノード → このノード」のパターンに対するモードと時間を指定する簡易 UI を提供する。

**エディタでの設定**:
- 「カメラ演出」セクションで有効/無効をチェックボックスで切り替え
- モード選択: 「ズーム＋パン同時」「パン → ズーム」「ズーム → パン」「カット切替」
- アニメーション時間（ms）を数値入力（0以下または未設定でアニメなし）
- 通常表示・全画面表示の両方で設定可能

#### Node.portraits JSON（複数）
```ts
type Portrait = {
  characterId: string
  imageId: string
  thumb?: string
  x: number /*0–100*/      // ％: 左上(0,0) – 右下(100,100)
  y: number /*0–100*/      // ％: 立ち位置。MiniStage 側で translate(-50%,-100%)
  scale?: number /*%*/     // ステージ高さに対する％。MiniStage は >60 を 1/3 に近似（150→50）
  z?: number               // 前後関係。大きいほど手前
}
```

### アセットの扱い
- 画像/音声は **直リンク禁止**。必ず `/uploads/signed-get?key=...` を経由して取得（TTL 失効時は再署名）。
- フロントは `useAssetMeta().signedFromId()` を利用。
- 取得 UI:
  - AssetPicker: 「自分のアセット / お気に入り」タブ + 検索
  - CharacterPicker → CharacterImagePicker: キャラ→その画像を段階選択

### メッセージウィンドウ（全体設定）
<!-- impl: apps/frontend/components/game/MessageThemeModal.vue, apps/frontend/utils/themeUtils.ts -->
`MessageThemeModal.vue` で定義される共通テーマ。保存は `PATCH /games/:id` に `{ messageTheme }` を送信。

#### ゲーム全体設定（基本情報MVP）
<!-- impl: apps/frontend/components/game/MessageThemeModal.vue, apps/frontend/pages/my/games/[id]/edit.vue -->
- `/my/games/:id/edit` 上部の常時フォームは廃止し、ゲーム基本情報は「全体設定」モーダル内の `基本情報` タブで編集する。
- 全体設定モーダルは「ゲーム全体設定」として、`title` / `summary` とプレイ画面UI設定（messageTheme / gameUiTheme / backlogTheme）を一体で扱う。
- 基本情報MVPの対象は `title` / `summary` のみ。
- 将来拡張候補: `coverAssetId` / タグ / ジャンル / 注意書き / slug などを基本情報タブまたは周辺設定へ追加検討。

#### v2（プリセット中心の新仕様）
<!-- impl: packages/types/src/index.ts (MessageThemeV2, RGBA, FONT_K 等の定数), apps/frontend/utils/themeUtils.ts (resolveThemeV2, migrateToV2) -->
v2 では px 直指定から「1〜10段階のプリセット」中心へ移行。色はRGBA対応。既存データは自動でプリセットへ丸め込み。

```ts
interface MessageThemeV2 {
  themeVersion: 2;
  
  // 既存（継続）
  rows?: 1|2|3|4|5|6;          // 表示行数（既定3）
  scale?: 'sm'|'md'|'lg';       // ウィンドウサイズ（既定md、互換用）
  
  // 新プリセット（1〜10）
  fontPreset?: 1|...|10;        // 文字サイズ 既定5
  windowPreset?: 1|...|10;      // ウィンドウサイズ 既定6（md相当）
  paddingPreset?: 1|...|10;     // 内側余白 既定5
  radiusPreset?: 1|...|10;      // 角丸 既定5
  borderPreset?: 1|...|10;      // 枠線太さ 既定3
  shadowPreset?: 1|...|10;      // 影強度 既定4
  typeSpeedPreset?: 1|...|10;   // タイプ速度 既定6（1=ゆっくり、10=高速）
  
  // 色（RGBA or HEX string）
  frameBg?: RGBA | string;      // メッセージ枠背景
  frameBorder?: RGBA | string;  // 枠線色
  nameBg?: RGBA | string;       // 名前背景色
  textColor?: RGBA | string;    // 文字色
  
  // グラデーション
  gradientDirection?: 'none'|'to-b'|'to-t'|'to-r'|'to-l';  // グラデーション方向（既定 'none'）
  gradientColor?: RGBA | string;  // グラデーション終点色（方向が'none'以外の場合に使用）
  
  // フォントスタイル
  fontWeight?: 'normal'|'bold';   // フォント太さ（既定 'normal'）
  fontStyle?: 'normal'|'italic';  // フォントスタイル（既定 'normal'）
  
  // 旧値（fallback用、v1互換）
  frame?: {...};
  name?: {...};
  text?: {...};
  typewriter?: {...};
}

interface RGBA {
  r: number;  // 0-255
  g: number;  // 0-255
  b: number;  // 0-255
  a: number;  // 0-1
}
```

**プリセットテーブル（定数）**:
<!-- impl: packages/types/src/index.ts -->

| プリセット | 項目 | 値（index 1..10） | 意味 |
|---|---|---|---|
| `FONT_K` | 文字サイズ倍率 | [0, 0.70, 0.80, 0.90, 0.95, 1.00, 1.08, 1.16, 1.25, 1.35, 1.48] | 基準16px × 係数（既定5 = 1.00） |
| `PADDING_K` | 内側余白倍率 | [0, 0.70, 0.80, 0.90, 0.95, 1.00, 1.10, 1.20, 1.30, 1.40, 1.55] | 基準16px × 係数（既定5 = 1.00） |
| `RADIUS_PX` | 角丸（px） | [0, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24] | 絶対値（既定5 = 12px） |
| `BORDER_PX` | 枠線太さ（px） | [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 10] | 絶対値（既定3 = 2px） |
| `TYPE_MS` | タイプ速度（ms/文字） | [0, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15] | 1=ゆっくり、10=高速（既定6 = 35ms） |
| `WINDOW_PRESET` | ウィンドウサイズ | 各 `{ w, h, mb, mw }` | 1=小(84%), 6=標準(92%, md), 10=大(98%) |
| `SHADOW_PRESET` | 影強度 | [0, 'none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] | Tailwind影クラス（既定4 = 'md'） |

**フォントスケールの根拠**:
<!-- impl: apps/frontend/composables/useStageScale.ts, apps/frontend/components/game/MessageWindow.vue -->
- ステージの実高さpx (`--stage-h-px`) を基準に `clamp()` でフォントサイズを算出：
  - `font-size: clamp(12px, calc(16px * fontK * var(--stage-scale, 1)), 28px)`
  - `--stage-scale = var(--stage-h-px) / 720` （720pxを基準）
- 通常表示・全画面・テストプレイで**同一のバランス**で見えるよう設計

**行数とスクロール抑止**:
<!-- impl: apps/frontend/components/game/MessageWindow.vue -->
- `rows` で表示行数（1〜6）を指定。メッセージ本文は `-webkit-line-clamp` / `line-clamp` で固定高さに制限し、**スクロール禁止**

**色入力とプレビュー**:
<!-- impl: apps/frontend/components/game/MessageThemeModal.vue, ColorField.vue -->
- ColorField コンポーネントで RGB+Alpha ピッカー、HEX入力（#RRGGBB）、RGBA文字列入力、プリセットパレットを提供
- コントラスト比（WCAG基準）を計算し、閾値（4.5:1/3.0:1）を下回ると警告表示

**互換性**:
- 旧データ（v1）は読み込み時に `migrateToV2()` で自動変換
- px値から最寄りプリセットへ丸め（例: 文字16px → fontPreset=5）
- 保存時に `themeVersion: 2` を付与

**上級設定**:
- 折り畳みで px 直接入力も可能（上限値として動作、画面サイズに応じて自動調整）

**出典**:
- 型定義: `packages/types/src/index.ts` （`MessageThemeV2`, `RGBA`, プリセット定数）
- 編集UI: `apps/frontend/components/game/MessageThemeModal.vue`
- ユーティリティ: `apps/frontend/utils/themeUtils.ts` （変換・コントラスト計算）
- 描画: `apps/frontend/components/game/MessageWindow.vue`, `apps/frontend/components/game/StageCanvas.vue`

<!-- impl: apps/frontend/components/game/MessageThemeModal.vue -->
**保存処理の堅牢化**:
- `$api` は関数内で取得（`useNuxtApp()` をsave関数内で呼び出し）してSSR問題を回避
- `saving` ref で保存中状態を管理し、ボタンを無効化（連打防止）
- エラー時：HTTPステータスとメッセージをトーストで詳細表示（例: `保存エラー (400): フィールドが不正です`）
- 成功時：`saved` イベントで親に `messageTheme` を即時反映し、プレビューを更新

**API仕様**:
<!-- impl: apps/api/src/games/games.controller.ts, apps/api/src/games/games.service.ts -->
- **エンドポイント**: `PATCH /games/:id`
- **リクエストボディ**: `{ messageTheme: MessageThemeV2, themeVersion?: 2 }`
- **レスポンス**: 更新後のゲームオブジェクト（`messageTheme` を含む）
- **認可**: SupabaseAuthGuard（所有者のみ）
- **バリデーション**: JSON型として受理、色フィールドはRGBA/HEX文字列を許容

#### v1（旧仕様、互換維持）
```ts
interface MessageTheme {
  frame: { bg: string; borderColor: string; borderWidth: number; radius: number; padding: number };
  name: { show: boolean; bg: string; color: string; padding: number; radius: number };
  text: { color: string; size: number; lineHeight: number; fontPreset?: 1|...|10; rows?: 1|...|6 };
  typewriter: { msPerChar: number };
  scale?: 'sm'|'md'|'lg';
}
```

プレビューは **StageCanvas** 上で `MessageWindow` を重ねて確認。通常・全画面・テストプレイいずれでも同一比率で表示。

### エディタ操作(右ペイン)
<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue -->
- 台詞（text）
- 話者キャラ（speakerCharacterId）と **話者表記（自由入力）** …匿名演出（`???` 等）やあだ名に対応
- 背景（bgAssetId） … サムネ表示
- BGM（musicAssetId） … `<audio controls>` で再生/停止可
- 効果音（SE, sfxAssetId） … エディタ上のラベルは「効果音(SE)」。`<audio controls>` で試聴可
- **キャラクター配置（portraits[]）** … 複数行。各行で画像変更 / 削除 / `x,y,scale,z` を個別調整

#### 右ペインセクション化MVP（2026-05-02 実装）
<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue -->
- ノード編集欄を次のセクションに分割し、各見出しをクリックで開閉可能にした
  - 基本情報
  - 表示・素材
  - 演出
  - 遷移・分岐
  - シナリオチェック
  - 危険操作
- 通常表示だけでなく、ノード全画面表示（2カラム右フォーム）にも同等のセクション分類と開閉挙動を反映した
- セクション開閉状態は `sectionOpen` で管理する（初期値: 基本情報/表示・素材/遷移・分岐/シナリオチェックは開、演出/危険操作は閉）
- セクション開閉状態は LocalStorage に永続化する
  - キー: `talking.editor.rightPaneSections.v1`（現状は全ゲーム共通。ゲームID別保存は将来検討）
  - セクション開閉時に保存し、ページ再表示時に復元する
  - 保存値が壊れている場合は既定値へフォールバックする
  - 保存値に欠けているキーは既定値で補完する（将来キー追加時の互換を確保）
  - 通常表示と全画面表示は同じ `sectionOpen` 状態を共有する
- 最後に選択した作業位置（シーン/ノード）を LocalStorage に永続化する
  - キー: `talking.editor.lastSelection.v1:${gameId}`（ゲームごとに分離）
  - シーン選択時に `sceneId` を保存し、ノード未選択状態として `nodeId` は `null` で保存する
  - ノード選択時に `sceneId` と `nodeId` を保存する
  - 保存時に `updatedAt`（timestamp）を付与する
  - 復元時は保存済み `sceneId` / `nodeId` を検証し、存在する対象のみ適用する
  - 保存済み `nodeId` が別シーン所属の場合、該当ノードが見つかったシーンを優先して復元する
  - 保存済み scene/node が削除済みなどで不正な場合は既存初期状態へフォールバックし、古い保存値は削除または現在状態で上書きする
  - 保存値がない場合・復元に失敗した場合は、`GameProject.startSceneId` のシーン（未設定なら先頭シーン）→ そのシーンの `startNodeId`（未設定なら先頭ノード）の順で初期選択する
  - JSON パース失敗時・sceneId/nodeId が不正・保存済み sceneId が存在しない場合は localStorage の古い値を削除してから初期選択へフォールバックする
  - 右ペイン開閉状態（`talking.editor.rightPaneSections.v1`）とは別キーで管理し、互いに干渉しない
- 各入力ブロックの表示制御は `v-if` で行い、既存の編集・保存・削除・選択肢編集機能は維持する
- セクション見出しと折りたたみ範囲の不一致を修正し、「見出しの直下にある項目」がその見出しの開閉状態に従うよう整理した
- 通常表示と全画面表示で、各項目の所属カテゴリ（基本情報 / 表示・素材 / 演出 / 遷移・分岐 / 危険操作）を一致させた
- `シナリオチェック` は右ペイン上部の専用パネルとして配置し、severity フィルタ付きで折りたたみ可能（通常表示/全画面表示の編集フローから利用可能）
- `表示・素材` セクションには `キャラクター配置` を配置する
- `演出` セクションには `カメラ` / `カメラ演出` / `ビジュアルエフェクト` / `カラーフィルター` を配置する
- `遷移・分岐` セクションには `次ノードID`、`次ノード作成時のコピー対象`、`選択肢` を含める
- `危険操作` セクションにはノード削除導線を配置する
- 今回はフォーム共通コンポーネント化までは行わず、通常表示/全画面表示のフォーム重複は将来課題として扱う

<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue -->
#### 次ノードの設定
- 次ノードID欄はフォーカス可能（`tabindex="0"`）で、クリックまたは **Ctrl/⌘+K** で **NodePicker** を起動
- NodePicker は全シーン・全ノードから検索可能で、Scene番号/#ノード番号/台詞冒頭（20文字）を表示
- 選択後は `nodeDraft.nextNodeId` に反映し、モーダルを閉じる

#### 削除導線と参照整合（現状）
- **ノード削除MVPは実装済み**（owner 限定、存在しない対象は 404、非ownerは 403）
- **シーン削除MVPは実装済み**（owner 限定、存在しない対象は 404、非ownerは 403、最後の1シーンは削除不可）
- **ゲーム削除導線は実装済み**（`/my/games` から削除確認付きで soft delete 可能）
  - 削除済みゲームは `/my/games` / `/games` / `/games/:id` / `/games/:id/play` / `/my/games/:id/edit` から見えない
  - 完全削除・purge は将来課題として残す
- 削除前確認ダイアログと参照件数表示は実装済み
  - ノード: 開始ノード参照 / nextNode参照 / choice遷移先参照
  - シーン: 削除されるノード数 / シーン内ノードへの外部参照件数
- ノード削除・シーン削除時は参照解除を明示実行する
  - `GameScene.startNodeId`
  - `GameNode.nextNodeId`
  - `GameChoice.targetNodeId`
  - `GameChoice.alternateTargetNodeId`
  - （シーン削除時）`GameProject.startSceneId`
- `GameChoice.targetNodeId` / `GameChoice.alternateTargetNodeId` は参照解除時に `null` を設定する
- 既存の `targetNodeId = ''` データは migration で `null` に移行する

#### ゲーム複製MVP（2026-05-04 実装）
<!-- impl: apps/api/src/games/games.controller.ts, apps/api/src/games/games.service.ts, apps/frontend/composables/useGames.ts, apps/frontend/pages/my/games/index.vue -->
- API: `POST /games/:id/duplicate` を追加（要ログイン）
- owner 本人のみ複製可能
  - 他人のゲーム: `403`
  - 削除済みゲーム: `404`
- 複製対象
  - `GameProject`: `title`, `summary`, `coverAssetId`, `messageTheme`, `gameUiTheme`, `backlogTheme`
  - `GameScene`: `name`, `order`, `startNodeId`
  - `GameNode`: 現行ノード設定一式（本文/話者/素材参照/演出/カメラ/分岐関連）
  - `GameChoice`: `label`, `targetNodeId`, `condition`, `effects`, `alternateTargetNodeId`, `alternateCondition`
- ID再マッピング
  - 旧 `sceneId` → 新 `sceneId`
  - 旧 `nodeId` → 新 `nodeId`
  - `GameProject.startSceneId` / `GameScene.startNodeId` / `GameNode.nextNodeId` / `GameChoice.targetNodeId` / `GameChoice.alternateTargetNodeId` を新IDへ変換
  - 壊れた参照や未設定は `null` に安全化
- 複製時に引き継がないもの
  - 公開状態（複製先は常に `isPublic = false`）
  - `viewCount` / `playCount`（複製先は `0`）
  - セーブデータ、プレイ履歴、お気に入り等の周辺データ
  - アセット実体（素材ID参照は引き継ぎ）
- タイトルは `元タイトル のコピー` を基本とし、重複時は `元タイトル のコピー 2` のように採番
- 実装はDBトランザクションで行い、途中失敗時に中途半端な複製データを残さない
- UI: `/my/games` の各カードに「ゲームを複製」ボタンを追加
  - 実行前に確認ダイアログ表示
  - 成功時は一覧を再取得し、複製先IDが取得できた場合は `/my/games/:newId/edit` へ遷移
  - 失敗時はトーストでエラー表示

#### ゲーム基本情報編集MVP（2026-05-04 実装）
<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue, apps/api/src/games/games.service.ts, apps/api/src/games/dto/update-game.dto.ts -->
- 編集画面 `/my/games/:id/edit` の上部に、ゲーム基本情報（`title`, `summary`）の編集UIを追加
  - 現在値を初期表示し、保存後は画面上部タイトル表示（`game.title`）も即時更新
  - 保存ボタンは「未変更」「保存中」「バリデーションエラー」で無効化し、二重送信を防止
  - 成功時はトースト通知、失敗時はエラーメッセージ表示
- バリデーション（MVP）
  - `title`: 必須、空文字・空白のみ不可、最大120文字
  - `summary`: 任意、空可、最大500文字
  - フロントとAPIの両方で上記を担保
- API更新仕様（`PATCH /games/:id`）
  - owner 本人のみ更新可能（非ownerは `403`）
  - 削除済みゲームは更新不可（`404`）
  - `title` / `summary` 更新のみでは公開前チェックを再実行しない
  - 公開前チェックは従来どおり `isPublic: true` を明示した更新時のみ実行
- 公開済みゲームの `title` / `summary` 更新は許可し、`/games` 一覧・`/games/:id` 詳細には更新内容がそのまま反映される
- `coverAssetId` は「ゲーム全体設定 > 基本情報」タブで編集可能（画像アセットのみ。自分の画像またはお気に入り済み画像を選択/クリア対応）

#### 選択肢と通常遷移先の優先順位（2026-05-02 更新）
- `choice.targetNodeId !== null` の選択肢のみ「表示可能な選択肢」とする
- 表示可能な選択肢が1件以上ある場合、プレイ時は選択肢を表示し、`nextNodeId` は使用しない
- 表示可能な選択肢が0件の場合のみ、`nextNodeId` があれば通常進行する
- `nextNodeId` もない場合は終了扱いにする
- `targetNodeId = null` の選択肢は編集画面で警告表示し、プレイ画面では表示しない（MVP）
- 編集画面で `nextNodeId` と表示可能な選択肢が同時設定の場合は注意文を表示する

#### シナリオチェックMVP（2026-05-02 実装）
<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue -->
- 編集画面右ペイン上部に「シナリオチェック」パネルを追加（折りたたみ可）
- 結果を `error` / `warning` / `info` の3分類で一覧表示
- 件数サマリ（エラーn件・警告n件・情報n件）を表示
- 各項目に関連シーン/ノード情報を表示し、可能な項目は「対象へ移動」で該当シーン/ノードへジャンプ可能
- 0件時は「問題は見つかりませんでした」を表示

#### シナリオチェック表示改善（2026-05-02 追補）
<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue -->
- 結果一覧の表示順を `error → warning → info` に統一
- severity フィルタ（`すべて / エラー / 警告 / 情報`）を追加し、各フィルタに件数を表示
- フィルタ後の0件時は「この条件のチェック項目はありません。」を表示
- 情報（info）は配色を控えめにし、`すべて` 表示時は情報群を折りたたみ可能にして、エラー/警告を先に確認しやすくした
- 件数サマリはエラーを最も目立つ見た目にし、警告を次点、情報を控えめに表示
- 既存の「対象へ移動」動線は維持し、フィルタ後の一覧からも従来どおりジャンプ可能

#### 公開前チェックMVP（2026-05-03 実装）
<!-- impl: apps/frontend/pages/my/games/index.vue, apps/frontend/utils/scenarioCheck.ts, apps/frontend/pages/my/games/[id]/edit.vue, apps/api/src/games/games.service.ts -->
- `/my/games` からの公開切替（非公開→公開）時に、公開前チェックを実行する
- チェック判定は edit画面のシナリオチェックと同一ロジックを共通化した `runScenarioCheck` を利用する
- 判定ルール
  - `error` が1件以上: 公開不可（公開状態は変更しない）
  - `warning` のみ: 確認ダイアログ承認後に公開可
  - `info` のみ / 問題なし: 公開可
- `error` 時のUI
  - エラー件数を表示
  - エラー内容（先頭3件）を表示
  - 「シナリオチェックを確認」導線として edit画面へ遷移可能
  - 遷移時に `focusScenarioCheck=1&scenarioCheckFilter=error` を付与し、シナリオチェックパネル展開とエラーフィルタ初期表示を行う
- `/my/games` での非公開化（公開→非公開）は従来どおり常に許可
- API側の公開時チェック（最終防衛線）を追加
  - `PATCH /games/:id` で `isPublic: true` がリクエストに含まれる場合のみ、サーバー側で最低限の `error` チェックを実施
  - `error` が1件以上なら 400 で公開拒否（`message` と `errors` を返す）
  - `warning` / `info` 相当の項目は API では公開拒否しない
  - `isPublic: false` の非公開化は常に許可
  - `isPublic` 未指定の更新は従来どおり許可
- 役割分担
  - フロント側公開前チェック: ユーザー向けの事前案内（warning確認、修正導線）
  - API側公開前チェック: 公開状態整合を守る最終防衛線

#### 公開前チェックMVPの確認結果（2026-05-03）
- 実行コマンド
  - `pnpm -w build`: 失敗（exit 1）
    - `apps/api prisma:generate` で `query_engine-windows.dll.node` rename 時に `EPERM`（ファイルロック）
  - `pnpm -C apps/frontend test`: 成功（3 files / 10 tests passed）
  - API test コマンド: `apps/api/package.json` に test script がないため未実行
- 未実行確認
  - ブラウザ手動E2E（error/warning/info の各状態での公開導線の実操作）は未実施
  - 理由: この実行環境ではブラウザ手動検証を実行していないため

検出項目:
- 開始設定不備
  - `GameProject.startSceneId` 未設定/参照切れ
  - 開始シーンの `startNodeId` 未設定/参照切れ
  - 開始シーンが空（ノード0件）
- 存在しない参照
  - `GameNode.nextNodeId`
  - `GameChoice.targetNodeId`
  - `GameChoice.alternateTargetNodeId`
- 未設定選択肢
  - `GameChoice.targetNodeId === null`（warning）
- 選択肢と `nextNodeId` の併用注意
  - 表示可能な選択肢が1件以上あり、かつ `nextNodeId` も設定されているノード（info）
- 到達不能ノード
  - 開始ノードから到達できないノード（warning）
- 空シーン
  - ノード0件のシーン（warning）
- 終端ノード
  - 到達可能ノードのうち、表示可能な選択肢0件かつ `nextNodeId` なし（info）

到達可能性の計算ルール:
- 始点は `GameProject.startSceneId` のシーンにある `startNodeId`
- ノード遷移
  - 表示可能な選択肢が1件以上ある場合:
    - `choice.targetNodeId` を候補に含める
    - `choice.alternateTargetNodeId` も「到達しうる候補」として含める
    - このとき `nextNodeId` は通常遷移として使わない
  - 表示可能な選択肢が0件の場合:
    - `nextNodeId` があれば遷移
    - なければ終端
- 存在しない参照は到達計算では無視し、別途エラーとして報告
- 変数条件（`condition` / `alternateCondition`）の厳密評価はMVPでは行わない

将来課題:
- 変数条件の厳密評価を含む到達可能性判定
- フローチャート可視化

#### シナリオチェック追加MVP（2026-05-03 実装）
<!-- impl: apps/frontend/utils/scenarioCheck.ts, apps/frontend/tests/scenarioCheck.spec.ts -->
- 既存の開始地点/参照切れ/到達不能チェックに加えて、以下のwarningチェックを追加

| チェック | 対象 | severity |
|---------|------|----------|
| ノード本文が空または空白のみ | 全ノード | warning |
| 選択肢ラベルが空または空白のみ | 全選択肢（`targetNodeId=null`含む） | warning |
| 選択肢データはあるが表示可能な選択肢が0件 | 全ノード | warning |
| 開始シーン以外で `startNodeId` が設定済みだが存在しないノードIDを参照 | 開始シーン以外のシーン | warning |

- 今回追加した warning は API 側公開前チェックで公開ブロックしない（既存の error チェックのみが API 側でのブロック対象）
- 素材参照チェック（ノードが参照するアセットID の存在確認）は将来課題

将来課題:
- 素材参照の厳密チェック（背景・BGM・SE・キャラクター立ち絵のアセットID存在確認）
- アセット権限・公開可否チェック（削除済み・非公開アセット）
- 条件分岐の完全評価
- 変数キー存在チェック
- フローチャート可視化
- シナリオ Import/Export
- 公開前チェック専用画面

#### シーンラベル・シーン管理性改善（2026-05-02 実装済み）
- `GameScene.name` をシーンラベルとして活用（DB変更・マイグレーションなし）
- edit画面左ペインのシーン一覧に Scene番号・シーン名・ノード数を表示
- 選択中シーンの名前を入力欄で編集可能（Enter or blur で `PATCH /games/scenes/:sceneId { name }` 保存）
- 入力欄ラベルを「選択中シーン名」に簡略化（補足文は削除）
- シーン名が空の場合は `Scene N` フォールバック表示（シーン一覧・NodePicker共通）
- シーン名変更後: `scene.value` / `scenes.value` / `game.value.scenes` を即時同期→ NodePicker ・ `findNodeLabel`（遷移先ラベル）に自動反映
- NodePicker のシーン準の表示は既実装済み（`Scene N: name` 形式、ノード数、現在シーンバッジ、検索・詳細プレビュー）
- 将来課題（実装外）: シーン並び替え / シーン説明文 / シーンサムネイル / フローチャート表示

#### NodePicker の現状と残課題

NodePicker の「シーン → ノード」二段階選択UIは**実装済み**。

- 左ペインでシーン選択、右ペインで選択中シーンのノードを選択
- 検索欄に入力すると全シーン横断検索モードに切り替わり、クリア後は選択中シーンのノード一覧に戻る
- 現在シーンの最新ノード反映と他シーン候補維持に対応
- キーボード操作: 検索欄初期フォーカス・右ペイン `↑` / `↓` / `Enter` / `Esc` で操作可能
- 詳細プレビュー（所属シーン・Node番号/ID・本文プレビュー・選択肢数・nextNode設定有無・開始ノード表示）を実装済み

残課題:
- シーン一覧（左ペイン）のキーボード操作
- `←` / `→` または `Ctrl+↑` / `Ctrl+↓` によるシーン切り替え
- Tab 移動時のフォーカス設計
- スクロール位置保持
- キーボード操作と検索入力の干渉防止のさらなる改善

<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue (saveAndCreateNext) -->
#### 「保存して次のノードへ」の動作フロー
1. 現在のノードを保存（`nodeDraft` から `portraits` の `thumb` を除外して送信）
2. コピー対象項目（背景/キャラ/BGM/カメラ）を抽出：
   - `copyOpts` オブジェクト（`{ bg, chars, bgm, camera }`）で制御
   - LocalStorage（`talking_copy_opts_v1`）に永続化
3. 新規ノードを作成（テキスト/話者/選択肢は空、コピー項目のみ継承）
4. 現在ノードの `nextNodeId` を新規ノードIDに更新
5. ノード一覧を再取得し、新規ノードへ遷移（`selectNode()`）
6. トースト通知（成功/失敗）

**例外処理**:
- 保存失敗時：トーストでエラー表示、ノード一覧は更新しない
- `saving` ref で連打防止（実行中は `Ctrl/⌘+Enter` を無視）

- **開始地点の設定**:
  - ノード側: 各ノード列の「▶このノードから開始」ボタンで `GameScene.startNodeId` を PATCH 保存し、同時に所属シーンを `GameProject.startSceneId` に同期
  - シーン側: シーン一覧の「このシーンから開始」で `GameProject.startSceneId` を更新
    - 既存の `startNodeId` があれば維持
    - 未設定なら先頭ノードを `startNodeId` に自動設定
    - ノード0件シーンは設定せず警告表示

**確認ログ（2026-05-02）**:
- `pnpm -w build`: ❌ `apps/api prisma:generate` の `query_engine-windows.dll.node` rename で `EPERM`（ファイルロック）
- `pnpm -C apps/frontend test`: ✅ 2 files / 7 tests passed
- 未実行: ブラウザ手動確認（シーン側開始設定UI操作・公開/テストプレイ開始地点の実画面確認）
  - 理由: この実行環境ではブラウザ手動E2Eを実施していないため
- **カメラ** … 編集UIは実装済み（倍率 zoom 100–300%、中心 cx,cy 0–100%）。StageCanvas への反映済み（MiniStage にも適用済み）
- **カメラ演出（cameraFx）** … エディタで「カメラ演出」セクションから設定可能。テストプレイでは `requestAnimationFrame` で滑らかなカメラアニメーションを実現
- **ビジュアルエフェクト（visualFx）** … 「ビジュアルエフェクト」セクションで設定。画面揺れ（shake）とフラッシュ（flash）の2種類、それぞれ小・中・大の3段階強度を選択可能。エディタではプレビューボタンで即座に確認でき、テストプレイではノード表示時に自動再生。画面全体（背景・キャラクター・メッセージウィンドウ含む）に適用され、`requestAnimationFrame` ベースの滑らかなアニメーション
- **セリフ継続表示（continuesPreviousText）** … 「前ノードのセリフを消さずに続ける」チェックボックスで設定。会話の流れを維持した演出が可能

**プレビュー**:
- 通常表示：右ペインに16:9のステージを表示、幅プリセット（S/M/L）で調整可能
- 全画面表示：左にステージ、右にフォームを2カラム配置。ステージは最大72vh、アスペクト比16:9を維持
- どちらも `StageCanvas` + `MessageWindow` で描画し、**同一の相対バランス**で見える

### API 概要（認可: 所有者）
- `GET /games/:id/scenes` / `POST /games/:id/scenes`（Upsert）
- `GET /games/scenes/:sceneId/nodes` / `POST /games/scenes/:sceneId/nodes`（choices 同梱で Upsert）
- `DELETE /games/nodes/:nodeId`
  - 新規 Node 追加時は `order = (scene内 max + 1)` （`GamesService.upsertNode` 参照）
  - 既存更新は `id` 有無で分岐

**GameNode データ構造**:
<!-- impl: apps/api/prisma/schema.prisma, packages/types/src/index.ts -->
```ts
interface GameNode {
  id: string;
  sceneId: string;
  type: 'DIALOG';
  order: number;
  speakerCharacterId?: string;
  speakerDisplayName?: string;
  text?: string;
  bgAssetId?: string;
  musicAssetId?: string;
  sfxAssetId?: string;
  nextNodeId?: string;
  continuesPreviousText?: boolean;
  portraits?: Array<{
    characterId: string;
    imageId: string;
    key?: string;
    x: number;  // 0-100%
    y: number;  // 0-100%
    scale: number;  // %
    z?: number;
  }>;
  camera?: {
    zoom: number;  // 100-300%
    cx: number;    // 0-100% (center x)
    cy: number;    // 0-100% (center y)
  };
  cameraFx?: {
    from?: { zoom?: number; cx?: number; cy?: number };
    to?: { zoom?: number; cx?: number; cy?: number };
    durationMs?: number;
    mode?: 'cut' | 'together' | 'pan-then-zoom' | 'zoom-then-pan';
  };
  visualFx?: {
    type: 'shake' | 'flash';
    intensity: 'small' | 'medium' | 'large';
  };
  choices?: Array<{
    id: string;
    label: string;
    targetNodeId: string;
  }>;
}
```

**ビジュアルエフェクト詳細**:
<!-- impl: apps/frontend/composables/useVisualEffects.ts -->
- **画面揺れ (shake)**:
  - small: 強度5px, 300ms, 30Hz
  - medium: 強度12px, 500ms, 30Hz
  - large: 強度25px, 700ms, 30Hz
  - 減衰する振動（`decay = 1 - progress`）、X軸とY軸で異なる振幅
- **フラッシュ (flash)**:
  - small: 不透明度0.4, 200ms, 白色
  - medium: 不透明度0.7, 300ms, 白色
  - large: 不透明度1.0, 400ms, 白色
  - フェードアウトアニメーション

**エフェクト実装**:
<!-- impl: apps/frontend/components/game/StageCanvas.vue -->
- `.stage` 全体に `transform` でshake適用（背景・キャラ・メッセージ含む）
- エフェクトレイヤー（`.effect-layer`）でflashを表示（z-index: 50）
- `requestAnimationFrame` ベースの滑らかなアニメーション
- クリーンアップ処理（`cancelAnimationFrame`）で適切に停止

### 既知の制限 / TODO
- 音声同意は `localStorage('talking_audio_consent_v1')` で保持
- 選択肢（choices）の UI は最小
- `GameChoice.targetNodeId` の `''` 運用は暫定であり、nullable 化または未設定表現の整理が必要
- target未設定の選択肢をプレイ時にどう扱うかは将来課題
- NodePicker シーン一覧（左ペイン）のキーボード操作・フォーカス設計・スクロール位置保持は残課題
- ノード参照切れ警告、到達不能ノード検出、フローチャート可視化は将来課題
- シーン/ノードコピー・移動は将来課題
  - シーン複製（シーン内ノード/選択肢の一括複製、シーン内参照再マップ、シーン外参照ポリシー選択）
  - ノード複製（同一シーン内複製時の `nextNodeId` / `choice.targetNodeId` の扱い方針）
  - ノード移動（別シーン移動時のID維持方針、参照維持/警告、`startNodeId` 影響整理）
  - シーン間ノードコピー（コピー先で新nodeId発行、参照関係の扱い）
  - 付随課題: undo/redo、操作前確認ダイアログ、コピー先選択UI、大量ノード操作、シーン/ノードテンプレート化、シナリオImport/Export連携
- シナリオのエクスポート/インポート（JSON → 将来的にAI向けMarkdown/DSL）は将来課題
- キーコンフィグ・AUTO再生・Skip機能・プレイヤーごとのセーブデータ設計は将来課題
- スマホ/タブレット向けプレイ操作最適化は将来課題
- 画像の遅延読込・AVIF/WebP 最適化は別タスク
- BGMクロスフェードは未実装（現在は直列フェード）
- ノードごとの fadeMs 指定は未実装（固定フェード時間）
- BGM/SE 音量設定UIは未実装
- SE個別フェード（ノード別制御含む）は未実装
- 音声ミキサー、複数BGMレイヤー、ユーザー設定保存は未実装
- 公開ゲーム一覧 `/games` の将来課題（今回未実装）
  - ページネーション / 無限スクロール最適化
  - 人気順 / プレイ数順 / お気に入り数順（集計基盤整備後）
  - タグ検索 / 作者検索
  - 高度な全文検索（Meilisearch活用）
  - `/my/games` への検索・並び替えUI方針統一
  - レコメンド
- 公開ゲームのタグ/ジャンル機能（将来課題）
  - ゲーム編集時のタグ設定（`/my/games`）
  - 固定ジャンルタグ（例: 恋愛 / ホラー / ファンタジー / SF / ミステリー / コメディ / 日常 / シリアス）
  - 形式タグ（例: 短編 / 長編 / 体験版 / 完結済み / 連載中）
  - システムタグ（例: 選択肢あり / マルチエンド / ボイスあり / BGMあり）
  - 固定タグとフリーワードタグの分離設計
  - タグ未設定時の公開前 warning
  - タグ絞り込み/タグ別一覧、Meilisearch・高度検索との連携
- 公開ゲーム分析の将来課題
  - ユニーク閲覧数 / ユニークプレイ数
  - IP / ユーザー単位の重複除外
  - 日別集計
  - 作者ダッシュボード
  - ランキング
  - イベントログテーブル
  - アナリティクス基盤

---

### ChangeLog (chat handover)

- 2026-05-04: `/my/games/:id/edit` の上部に常時表示していたゲーム基本情報フォームを撤去し、`MessageThemeModal.vue` を「ゲーム全体設定」へ拡張。先頭に `基本情報` タブを追加し、`title` / `summary` の入力検証（title必須・空白不可・120文字以内、summary任意・500文字以内）、文字数表示、`PATCH /games/:id` への同時保存（title/summary/messageTheme/gameUiTheme/backlogTheme）を実装。保存後は親画面のタイトル/概要表示へ即時反映。
- 2026-05-04: ゲーム基本情報編集MVPを実装。`/my/games/:id/edit` に `title` / `summary` 編集UIを追加し、保存中状態・未変更時無効化・成功/失敗通知を実装。複製直後の `元タイトル のコピー` を同画面で自然に変更可能。API側は `PATCH /games/:id` の owner制御/削除済み制御を維持しつつ、`title` 必須（空白のみ不可）・`summary` 任意の入力検証（`title<=120`, `summary<=500`）を追加。`isPublic: true` のときだけ公開前チェックを実行する既存挙動を維持。確認結果: `pnpm -w build` ❌（`apps/api prisma:generate` の `query_engine-windows.dll.node` rename で EPERM）, `pnpm -C apps/frontend test` ✅（4 files / 31 tests passed）, `pnpm -C apps/api run test` ❌（`ERR_PNPM_NO_SCRIPT`）。
- 2026-05-04: ゲーム複製MVPを実装。`POST /games/:id/duplicate` を追加し、owner限定・削除済み除外・トランザクション実行で `GameProject`/`GameScene`/`GameNode`/`GameChoice` を複製。`startSceneId`/`startNodeId`/`nextNodeId`/`targetNodeId`/`alternateTargetNodeId` は新IDへ再マップし、壊れた参照は `null` に安全化。複製先は常に非公開、`viewCount`/`playCount` は0、セーブデータ等は非複製、アセットはID参照を維持。`/my/games` に確認付き「ゲームを複製」ボタンを追加し、成功時に一覧再取得＋複製先編集画面へ遷移。確認結果: `pnpm -w build` ❌（`apps/api prisma:generate` の `query_engine-windows.dll.node` rename で EPERM）, `pnpm -C apps/api build` ❌（同理由）, `pnpm -C apps/frontend test` ✅（4 files / 31 tests passed）, API test script は未定義のため未実行。
- 2025-11-02: 実装を根拠にキャラクター機能のモデル/画面/APIを正規化。Favorites をアセット/キャラ横断で統一（楽観更新・一覧同期・正規化関数）。検索/URL 同期のクエリ項目を明記。署名URLの取得/再取得方針と `$api` 経由の根拠を出典付きで追記。既知の落とし穴とテストTODOを整理。
- 2025-11-04: ゲーム制作（β）仕様を追加。シーン/ノード構造、portraits 配置、カメラ操作、署名 URL 経由の画像/音声取得を明記。
- 2025-12-07: ゲーム制作機能を拡張。`continuesPreviousText`（セリフ継続表示）と `cameraFx`（カメラ演出）フィールドを追加。MessageThemeV2 にグラデーション（`gradientDirection`, `gradientColor`）とフォントスタイル（`fontWeight`, `fontStyle`）プロパティを追加。カメラ演出では4つのアニメーションモード（together/pan-then-zoom/zoom-then-pan/cut）を実装し、`requestAnimationFrame` で滑らかな動きを実現。エディタではキーボードショートカット（Ctrl/⌘+Enter, Ctrl/⌘+K, F, Esc）を拡充し、NodePicker による次ノード選択と「保存して次のノードへ」機能を強化。`visualFx`（ビジュアルエフェクト）を追加し、画面揺れ（shake）とフラッシュ（flash）の2種類×3段階強度のプリセットエフェクトを実装。エディタでのプレビュー機能とテストプレイでの自動再生に対応。
- 2026-05-01: ノード削除MVP・シーン削除MVPを実装。削除前確認と参照件数表示、削除時の参照解除を反映。ゲーム削除導線と `GameChoice.targetNodeId` の未設定表現は将来課題として整理。
- 2026-05-01: ゲーム削除導線を実装済みに更新（`/my/games` から確認付き soft delete、削除済みゲームの各画面遮断）。NodePicker「シーン → ノード」二段階選択UI・キーボード操作MVP・詳細プレビューを実装済みとして反映し、残課題（左ペインキーボード操作・フォーカス設計・スクロール保持）を整理。ゲームプレイ画面キーボード操作MVPの仕様（Enter/Space・↑/↓・数字キー・Esc）を追加。PROJECT_SPEC.md と ROADMAP.md を最新コード基準で整合。今回はドキュメント更新のみで build/test は不要。
- 2026-05-02: シーンラベル・シーン管理性改善MVPを実装。`GameScene.name` をシーンラベルとして活用（DB変更・マイグレーションなし）。edit画面左ペインのシーン一覧に Scene番号・シーン名・ノード数を表示。選択中シーンの名前を入力欄で編集可能に（Enter/blurで保存）。シーン名変更後のシーン一覧・NodePicker・遷移先ラベルへの即時反映を実装。未対応将来課題（並び替え・説明文・サムネイル・フローチャート）をROADMAPに記録。
- 2026-05-02: 右ペインセクション開閉状態の LocalStorage 永続化を実装。キーは `talking.editor.rightPaneSections.v1` を採用し、通常表示/全画面表示で同一状態を共有。保存値破損時の既定値フォールバックと、新規キー追加時の既定値補完を追加。シナリオエクスポート/インポート（JSON → 将来的にAI向けMarkdown/DSL）を将来課題として明記。
- 2026-05-02: ゲーム編集画面で最後に選択したシーン/ノードの作業位置復元MVPを実装。`talking.editor.lastSelection.v1:${gameId}` に `sceneId` / `nodeId` / `updatedAt` を保存し、再訪時に復元。保存値破損・削除済み参照時は安全にフォールバックし、右ペイン開閉状態キー（`talking.editor.rightPaneSections.v1`）とは分離管理。
- 2026-05-02: 作業位置復元MVPのフォールバック強化。保存値なし・パース失敗・削除済み参照のいずれの場合も、`GameProject.startSceneId` → 先頭シーン → `startNodeId` → 先頭ノードの順で初期選択されるよう `selectInitialSceneAndNode()` を追加。`restoreLastSelection()` が `Promise<boolean>` を返し、`false` の場合に初期選択へフォールバック。`getSavedLastSelection` でパース失敗・空値時に localStorage の古い値を削除。
- 2026-05-03: ゲーム公開前チェックMVPを実装。`runScenarioCheck` を共通化し、`/my/games` の公開操作で `error` を公開不可、`warning` は確認後公開可、`info` のみ/問題なしは公開可に統一。`error` 時は edit画面のシナリオチェックへ誘導（クエリでエラーフィルタ初期表示）。API側公開審査は将来課題として維持。
- 2026-05-03: ゲームプレイ画面に BGM フェードイン/フェードアウトMVPを実装。`musicAssetId` 変更時に「旧曲フェードアウト→新曲フェードイン」を直列実行し、同一BGMは再読み込みせず継続再生。`musicAssetId` 未指定時は現行仕様を維持して停止扱い（フェードアウト経由）。SEはMVPとして既存挙動維持。AUTO/SKIP高速遷移時の競合を避けるためフェード処理に世代トークン管理を導入。
- 2026-05-03: シナリオチェック追加MVPを実装。既存チェックに加えて「ノード本文が空」「選択肢ラベルが空」「表示可能な選択肢が0件のノード」「開始シーン以外の壊れた startNodeId」を warning として検出。API側公開ブロックには追加しない。vitest に21ケースのテストを追加（4 files / 31 tests 全通過）。素材参照の厳密チェックは将来課題として記録。
- 2026-05-03: 公開ゲーム一覧 `/games` の検索・並び替えMVPを実装。`q`（title/summary 部分一致）と `sort`（`new|updated|title`）を URL クエリ同期し、空白検索の無効化・不正sortの正規化・検索0件時空状態表示を追加。`GET /games` は `q` / `sort` を受け取り API 側で公開ゲーム検索・ソートを実施。
- 2026-05-03: 公開ゲーム閲覧数/プレイ数の集計MVPを実装。`GameProject` に `viewCount` / `playCount` を追加し、詳細画面オープン時は `POST /games/:id/view`、プレイ画面オープン時は `POST /games/:id/play` でカウント。公開一覧/詳細にカウンタ表示を追加。重複除外・人気順/プレイ数順ソートは今回未実装として将来課題へ整理。タグ/ジャンル機能の将来課題も追記。
