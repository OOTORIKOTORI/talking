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

## お気に入り（Favorites）統一仕様

- 楽観的更新 → API 反映 → 失敗時ロールバック
  - 出典: アセット `apps/frontend/composables/useFavoriteToggle.ts`、キャラ `apps/frontend/composables/useFavoriteToggleCharacter.ts`
- 表示同期
  - 一覧フェッチ後に `applyFavorites()` で `isFavorited` を上書き
  - 出典: `apps/frontend/composables/useAssets.ts#applyFavorites`
- 返却データの表記ゆれを正規化
  - `normalizeAssetFavorite()` で `isFavorited` を付与（`isFavorite`/`favorited` 等を吸収）
  - 出典: `apps/frontend/composables/useAssets.ts#normalizeAssetFavorite`

## 検索 / フィルタ / URL 同期

- `/assets`（公開）と `/my/assets`（自分）
  - クエリ: `q`, `contentType`, `primaryTag`, `tags`, `sort` をURLに反映・復元
  - 出典: `apps/frontend/pages/assets/index.vue`, `apps/frontend/pages/my/assets/index.vue`, APIは `apps/api/src/search/search.controller.ts`
- `/characters`（公開一覧）
  - クエリ: `q`, `tags`, `sort` をURLに反映・復元
  - 出典: `apps/frontend/pages/characters/index.vue`

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

### ルーティング / 画面
- **エディタ**: `/my/games/:id/edit`
  - 左：シーン一覧、中央：ノード一覧、右：プロパティ（プレビュー含む）
  - 右ペインは「通常表示 / 全画面」をトグル（UI 文言: *全画面, 通常表示, Fで切替 / Escで閉じる*）
  - ステージは 16:9、`MiniStage.vue` でプレビュー
- **プレビュー（プレイヤ）**: `/games/:id/play`（※現状はカメラ未反映。今後対応）

### ドメイン / モデル（Prisma 正）
- `GameProject { id, ownerId, title, summary?, deletedAt? ... }`
- `GameScene { id, projectId(FK), name, order, createdAt, updatedAt }`
- `GameNode  { id, sceneId(FK), order, text, speakerCharacterId?, speakerDisplayName?, bgAssetId?, musicAssetId?, sfxAssetId?, portraits Json?, camera Json?, createdAt, updatedAt }`
- `GameChoice { id, nodeId(FK), order, label, nextNodeId? }`

#### Node.camera JSON
```ts
type Camera = { zoom: number /*100–300*/; cx: number /*0–100*/; cy: number /*0–100*/ }
// 既定: { zoom:100, cx:50, cy:50 }（％はステージ基準）
```

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

### エディタ操作（右ペイン）
- 台詞（text）
- 話者キャラ（speakerCharacterId）と **話者表記（自由入力）** …匿名演出（`???` 等）やあだ名に対応
- 背景（bgAssetId） … サムネ表示
- BGM（musicAssetId） … `<audio controls>` で再生/停止可
- SFX（sfxAssetId） … 予約済み（UI あり、今後プレビュー付与）
- **キャラクター配置（portraits[]）** … 複数行。各行で画像変更 / 削除 / `x,y,scale,z` を個別調整
- **カメラ** … 倍率（zoom 100–300%）、中心（cx,cy 0–100%）
- プレビューは通常/全画面のどちらでも同一ロジックで描画され、見た目が極力一致

### API 概要（認可: 所有者）
- `GET /games/:id/scenes` / `POST /games/:id/scenes`（Upsert）
- `GET /games/scenes/:sceneId/nodes` / `POST /games/scenes/:sceneId/nodes`（choices 同梱で Upsert）
- `DELETE /games/nodes/:nodeId`
  - 新規 Node 追加時は `order = (scene内 max + 1)` （`GamesService.upsertNode` 参照）
  - 既存更新は `id` 有無で分岐

### 既知の制限 / TODO
- プレイヤ `/games/:id/play` は **カメラ未適用**（次フェーズで反映）
- SFX のプレビュー未実装
- 選択肢（choices）の UI は最小
- 画像の遅延読込・AVIF/WebP 最適化は別タスク

---

### ChangeLog (chat handover)

- 2025-11-02: 実装を根拠にキャラクター機能のモデル/画面/APIを正規化。Favorites をアセット/キャラ横断で統一（楽観更新・一覧同期・正規化関数）。検索/URL 同期のクエリ項目を明記。署名URLの取得/再取得方針と `$api` 経由の根拠を出典付きで追記。既知の落とし穴とテストTODOを整理。
- 2025-11-04: ゲーム制作（β）仕様を追加。シーン/ノード構造、portraits 配置、カメラ操作、署名 URL 経由の画像/音声取得を明記。
