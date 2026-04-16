# アーキテクチャ

## ドメイン

### アセット（画像/音声）
- モデル: `Asset { id, ownerId, key, url, thumbKey, title, description, contentType, primaryTag, tags[], size, createdAt, ... }`
- 画像URLは **署名付き GET `/uploads/signed-get?key=...` の JSON `{ url }` を取得してから `<img src>` に適用** する（直リンク禁止）
- 検索: Meilisearch（facets: `contentType`, `primaryTag`, `tags`）

### キャラクター
- モデル:
  - `Character { id, ownerId, name, displayName, description, tags[], isPublic, createdAt, ... }`
  - `CharacterImage { id, characterId, key, thumbKey, emotion, emotionLabel, pattern, sortOrder, ... }`
- 立ち絵画像は **複数** 管理でき、各画像に **感情**、**パターン**、**表示ラベル**、**並び順（sortOrder, 小さいほど先頭）** を付与
- 編集UIでは画像クリックで **拡大プレビュー**、並び替え結果は `sortOrder` 更新で保存

### ゲーム（β）
- モデル: `GameProject`, `GameScene`, `GameNode`, `GameChoice`, `GameSave`
- シーン/ノード編集、背景・BGM・立ち絵配置、カメラ演出、メッセージテーマ、セーブスロットを提供
- プレイ画面は音声同意オーバーレイ付きで動作

## お気に入り

- エンドポイント
  - アセット: `POST/DELETE /assets/:id/favorite`, 一覧: `GET /favorites`
  - キャラ: `POST/DELETE /characters/:id/favorite`, 一覧: `GET /my/favorites/characters`
- UI
  - 公開ギャラリー・お気に入り・管理一覧で **♡トグル** が可能
  - 一覧画面は **URL クエリにフィルタ状態を保持** し、共有や再訪時の復元に対応

## 画面構成 / 導線

- **公開ギャラリー `/assets`** … アセット/キャラクターの **タブ切替** を持つ共通検索UI
- **アセット管理 `/my/assets`** … 自分の投稿一覧。UI からキャラクター管理へ遷移可能
- **アップロード `/upload`** … 「アセットをアップロード / キャラクターを作成」をタブで切替
- **お気に入り `/my/favorites` と `/my/favorites/characters`** … アセット/キャラクターで分離したお気に入り導線
- **マイキャラ `/my/characters`・公開一覧 `/characters`** … 一覧カードから詳細編集/閲覧へ遷移
- **ゲーム管理 `/my/games`・ゲームエディタ `/my/games/[id]/edit`・プレイ `/games/[id]/play`** … β機能の主要導線

## API / クライアント規約
- すべての HTTP は `$api` 経由（Authorization 自動付与）。**直 fetch 禁止**
- 画像URLは **必ず署名GETの JSON `{ url }` を解釈** してから適用
- CI は `--frozen-lockfile` 前提。依存追加/削除時は **lockfile をコミット**

## Monorepo 構成

このプロジェクトは pnpm workspace による Monorepo 構成です。

```
talking/
├── apps/
│   ├── api/         # NestJS バックエンド (REST API)
│   ├── frontend/    # Nuxt 3 フロントエンド
│   └── worker/      # BullMQ ワーカー (サムネ生成・検索インデックス更新)
├── packages/
│   ├── types/       # 共通型定義
│   └── sdk/         # 予約
└── scripts/         # セットアップスクリプト
```

---

## 主要サービスとポート

| サービス | ポート | 用途 |
|----------|--------|------|
| **Nuxt** | 3000 | フロントエンド |
| **NestJS API** | 4000 | REST API サーバー |
| **MinIO** | 9000 (API) / 9001 (Admin) | オブジェクトストレージ (S3互換) |
| **Meilisearch** | 7700 | 全文検索エンジン |
| **Redis** | 6379 | BullMQ キュー |
| **PostgreSQL** | 5432 | メインDB (Prisma) |

すべてのサービスは `docker-compose.yml` で定義され、`pnpm dev:all` で一括起動します。

---

## 機能サマリ

### コア機能
- **公開ギャラリー**（`/assets`）: 未ログインでも閲覧・検索可能なアセット/キャラクター導線
- **アセット管理**（`/my/assets`）: 本人のみがアクセスできる編集・削除画面
- **キャラクター管理**（`/my/characters`）: キャラクター作成、立ち絵追加、表示順管理
- **ファイルアップロード**: S3/MinIO 署名付き PUT → finalize でDB保存
- **サムネ生成**: Worker が sharp で 512px cover サムネを `thumbs/` に生成
- **検索**: Meilisearch へのインデックス登録（非同期）
- **ゲーム制作（β）**: シーン/ノード編集、プレビュー、セーブ管理

---

## URL / 画面構成

| パス | 機能 | 認証 | 備考 |
|------|------|------|------|
| `/` | ホーム | 不要 | 公開トップページ |
| `/assets` | 公開ギャラリー | 不要 | アセット/キャラクターをタブ切替で表示 |
| `/assets/[id]` | アセット詳細 | 不要 | 管理ボタンはオーナーのみ表示 |
| `/characters` | キャラクター公開一覧 | 不要 | 公開キャラクターの一覧 |
| `/characters/[id]` | キャラクター詳細 | 不要 | 立ち絵一覧・プロフィール表示 |
| `/upload` | アップロード | **必須** | ログイン後のみアクセス可能 |
| `/my/assets` | アセット管理 | **必須** | 本人のアセットのみ表示・編集・削除 |
| `/my/characters` | マイキャラクター管理 | **必須** | 自分のキャラクターのみ表示 |
| `/my/characters/new` | キャラクター新規作成 | **必須** | 作成フロー入口 |
| `/my/characters/[id]` | キャラクター編集 | **必須** | 立ち絵編集・ライトボックス・順序調整 |
| `/my/favorites` | お気に入りアセット | **必須** | 公開ギャラリー準拠UI |
| `/my/favorites/characters` | お気に入りキャラクター | **必須** | キャラクター専用お気に入り一覧 |
| `/games` | ゲーム一覧（β・設計上） | 不要 | 現状の主要導線は `/my/games` と `/games/[id]/play` |
| `/games/[id]/play` | ゲームプレイ / テストプレイ | 不要 | 音声同意オーバーレイ付き |
| `/my/games` | ゲーム管理（β） | **必須** | 自作ゲームの一覧 |
| `/my/games/[id]/edit` | ゲームエディタ（β） | **必須** | シーン/ノード編集 |

## アクセス制御（AuthN / Z）

### 認証方式
- **Supabase Auth**（Email/Password）
- フロントエンド: `@supabase/supabase-js` を使用してログイン・セッション管理
- API: Nest Guard が **JWKS**（`SUPABASE_JWKS_URL`）で JWT を検証（`jose` ライブラリ使用）
- 互換のため `SUPABASE_JWT_SECRET` によるレガシー検証もフォールバックとして残している

### エンドポイントの認可

#### 公開（認証不要）
- `GET /assets` — 公開ギャラリー一覧
- `GET /assets/:id` — アセット詳細
- `GET /uploads/signed-get` — 署名付き GET URL 取得
- `GET /characters` — キャラクター公開一覧
- `GET /characters/:id` — キャラクター詳細
- `GET /characters/:id/images` — 公開キャラクター画像一覧
- `GET /games/:id` — 公開ゲーム詳細 / プレイ用データ取得

#### 要ログイン
- `POST /uploads/signed-url` — 署名付き PUT URL 取得（アップロード開始）
- `POST /assets` — finalize（DB保存）
- `GET /assets/mine` — 本人のアセット一覧
- `PATCH /assets/:id` — アセット更新（オーナー照合）
- `DELETE /assets/:id` — アセット削除（オーナー照合）
- `GET /my/characters` — 自分のキャラクター一覧
- `POST /my/characters` — キャラクター作成
- `GET /my/characters/:id` — 自分のキャラクター詳細
- `PATCH /my/characters/:id` — キャラクター更新（オーナー照合）
- `DELETE /my/characters/:id` — キャラクター削除（オーナー照合）
- `GET /my/characters/:id/images` — 立ち絵一覧（編集用）
- `POST /my/characters/:id/images` — 立ち絵追加
- `PATCH /my/characters/:id/images/:imageId` — 立ち絵更新（感情 / パターン / ラベル / sortOrder）
- `DELETE /my/characters/:id/images/:imageId` — 立ち絵削除
- `POST /assets/:id/favorite` / `DELETE /assets/:id/favorite` — アセットお気に入り
- `POST /characters/:id/favorite` / `DELETE /characters/:id/favorite` — キャラクターお気に入り
- `GET /favorites` — お気に入りアセット一覧
- `GET /my/favorites/characters` — お気に入りキャラクター一覧
- `GET /games/my` — 自分のゲーム一覧
- `POST /games` / `PATCH /games/:id` / `DELETE /games/:id` — ゲーム作成・更新・削除

### オーナー制御
- `PATCH/DELETE /assets/:id` は JWT の `sub` と `Asset.ownerId` を照合し、不一致なら **403 Forbidden** を返す
- `PATCH/DELETE /my/characters/:id` および画像編集系も同様に `Character.ownerId` を照合する
- ゲーム更新系は `GameProject.ownerId` を基準にオーナー制御する

---

## API 一覧

### アップロード関連

#### `POST /uploads/signed-url`

**リクエスト**
```json
{
  "filename": "example.png",
  "contentType": "image/png"
}
```

**レスポンス**
```json
{
  "url": "https://minio.example.com/bucket/uploads/abc123.png?X-Amz-...",
  "method": "PUT",
  "headers": {
    "Content-Type": "image/png"
  }
}
```

#### `GET /uploads/signed-get?key=...`

**レスポンス**
```json
{
  "url": "https://minio.example.com/bucket/uploads/abc123.png?X-Amz-..."
}
```

### アセット関連

#### `POST /assets`（finalize）

**リクエスト**
```json
{
  "key": "uploads/abc123.png",
  "title": "サンプル画像",
  "description": "説明文",
  "tags": ["風景", "夕焼け"],
  "contentType": "image/png",
  "size": 1048576
}
```

**レスポンス**
```json
{
  "id": "asset-id",
  "ownerId": "user-id",
  "key": "uploads/abc123.png",
  "thumbKey": null,
  "title": "サンプル画像",
  "description": "説明文",
  "tags": ["風景", "夕焼け"],
  "contentType": "image/png",
  "size": 1048576,
  "createdAt": "2025-10-28T00:00:00.000Z"
}
```

#### `GET /assets?limit=20&offset=0`
公開ギャラリー一覧（ページネーション / フィルタ対応）

#### `GET /assets/mine?limit=20&offset=0`
本人のアセット一覧（アセット管理画面用）

#### `GET /assets/:id`
アセット詳細取得

#### `PATCH /assets/:id`
アセット更新（本人のみ）

#### `DELETE /assets/:id`
アセット削除（本人のみ）

### お気に入り関連 API
- `GET /favorites`（要ログイン）: お気に入りアセット一覧
- `POST /assets/:id/favorite`（要ログイン）: アセットお気に入り登録
- `DELETE /assets/:id/favorite`（要ログイン）: アセットお気に入り解除
- `POST /characters/:id/favorite`（要ログイン）: キャラクターお気に入り登録
- `DELETE /characters/:id/favorite`（要ログイン）: キャラクターお気に入り解除
- `GET /my/favorites/characters`（要ログイン）: お気に入りキャラクター一覧

### キャラクター関連 API

#### `GET /characters` — 公開キャラクター一覧（認証不要）
#### `GET /characters/:id` — キャラクター詳細（認証不要）
#### `GET /my/characters` — 自分のキャラクター一覧（要ログイン）
#### `POST /my/characters` — キャラクター作成（要ログイン）
#### `GET /my/characters/:id` — キャラクター詳細（オーナー用）
#### `PATCH /my/characters/:id` — キャラクター更新（要ログイン・オーナーのみ）
#### `DELETE /my/characters/:id` — キャラクター削除（要ログイン・オーナーのみ）

#### キャラクター立ち絵 API
#### `GET /characters/:id/images` — 公開立ち絵一覧
#### `GET /my/characters/:id/images` — 編集用立ち絵一覧
#### `POST /my/characters/:id/images` — 立ち絵追加（要ログイン）
#### `PATCH /my/characters/:id/images/:imageId` — 立ち絵更新（感情 / パターン / ラベル / sortOrder）
#### `DELETE /my/characters/:id/images/:imageId` — 立ち絵削除

### ゲーム関連 API（β）
- `GET /games/my`（要ログイン）: 自分のゲーム一覧
- `POST /games`（要ログイン）: ゲーム作成
- `GET /games/:id`（公開/権限付き）: ゲーム詳細取得
- `PATCH /games/:id`（要ログイン）: ゲーム更新
- `DELETE /games/:id`（要ログイン）: ゲーム削除
- `GET /games/:id/scenes` / `POST /games/:id/scenes` — シーン一覧 / 追加・更新
- `GET /games/scenes/:sceneId/nodes` / `POST /games/scenes/:sceneId/nodes` — ノード一覧 / 追加・更新
- `GET /games/:id/saves` / `POST /games/:id/saves` — セーブ一覧 / 保存

## データモデル

### Asset
```prisma
model Asset {
  id          String          @id @default(cuid())
  ownerId     String?         // 現行スキーマでは nullable（既存データ互換）。通常の認証アップロードでは必ず設定される
  key         String          @unique
  thumbKey    String?
  thumbWidth  Int?            @default(512)
  thumbHeight Int?            @default(512)
  title       String?
  description String?
  contentType String
  primaryTag  AssetPrimaryTag @default(IMAGE_OTHER)
  tags        String[]        @default([])
  size        Int
  createdAt   DateTime        @default(now())
  deletedAt   DateTime?
  favorites   Favorite[]
}
```

#### ソフトデリートについて
- `Asset.deletedAt` が非 null のレコードは論理削除済みとして扱う
- `GET /assets` と `GET /assets/mine` では `deletedAt: null` のものだけを返す
- `DELETE /assets/:id` は物理削除ではなく `deletedAt` に現在時刻をセットする
- 論理削除後、検索インデックスから除外し、MinIO 上の実ファイルは `purge` キュー経由で遅延ハード削除される

### Character
```prisma
model Character {
  id          String              @id @default(cuid())
  ownerId     String
  name        String
  displayName String
  description String?
  tags        String[]            @default([])
  isPublic    Boolean             @default(true)
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
  images      CharacterImage[]
  favorites   FavoriteCharacter[]
}
```

### CharacterImage
```prisma
model CharacterImage {
  id           String           @id @default(cuid())
  characterId  String
  key          String
  thumbKey     String?
  contentType  String
  emotion      CharacterEmotion @default(NEUTRAL)
  emotionLabel String?
  pattern      String?
  sortOrder    Int              @default(0)
  character    Character        @relation(fields: [characterId], references: [id], onDelete: Cascade)
}
```

#### CharacterEmotion enum
```prisma
enum CharacterEmotion {
  NEUTRAL   // 自然体
  HAPPY     // 嬉しい
  SAD       // 悲しい
  ANGRY     // 怒り
  SURPRISED // 驚き
  FEAR      // 恐れ
  DISGUST   // 嫌悪
  SHY       // 照れ
  SLEEPY    // 眠い
  THINKING  // 思案
  OTHER     // その他
}
```

### Favorite（アセット）
```prisma
model Favorite {
  id        String   @id @default(cuid())
  userId    String
  assetId   String
  createdAt DateTime @default(now())
  @@unique([userId, assetId])
}
```

### FavoriteCharacter（キャラクター）
```prisma
model FavoriteCharacter {
  id          String   @id @default(cuid())
  userId      String
  characterId String
  createdAt   DateTime @default(now())
  @@unique([userId, characterId])
}
```

### ゲーム関連モデル（β）
- `GameProject` — ゲーム本体、公開設定、メッセージテーマ
- `GameScene` — シーン単位の構成
- `GameNode` — セリフ、背景、BGM、立ち絵、カメラ設定
- `GameChoice` — 分岐選択肢
- `GameSave` — MANUAL / AUTO / QUICK の保存スロット

---

## 非同期処理（BullMQ キュー）

### サムネ生成
1. `POST /assets` 時に画像ジョブを投入
2. Worker が sharp で画像を 512px cover にリサイズ
3. `thumbs/` に保存し、`Asset.thumbKey` を更新

### 検索インデックス更新（Search Queue）
1. Asset の作成・更新・削除時に `search-index` キューへジョブ投入する
2. Worker が Meilisearch の `assets` インデックスへ upsert / remove を実行する
3. `assets` インデックスの facets は `contentType`, `primaryTag`, `tags`
4. 現行実装では Character 用の Meilisearch ジョブ投入や `characters` インデックス更新は未実装
5. キャラクター一覧 / 詳細は `GET /characters` 系 API で Prisma を使って取得し、`deletedAt: null` と `isPublic` 条件で絞り込む
6. 公開ギャラリー `/assets` のタブ切替 UI は共通だが、全文検索インデックスとして稼働しているのは現状 `assets` のみ

---

## 署名URLの扱い（TTL 切れの復旧）
- 一覧・詳細画面でサムネや画像を表示する際、403 / 401（期限切れ）を検知
- 自動で `/uploads/signed-get?key=...` を再取得して URL を復旧
- ユーザー体験を損なわない透過的な更新

---

## フロントエンド主要フロー

**アップロード**
1. `/upload` でファイル選択
2. `POST /uploads/signed-url` で署名付き PUT URL を取得
3. MinIO へアップロード後、`POST /assets` finalize でDB登録・Worker投入

**サムネ表示**
1. `<AssetCard>` は `thumbKey` または `key` を使って `GET /uploads/signed-get?key=...` を呼び出す
2. 返ってきた JSON の `url` を `<img src>` に設定する
3. 画像エラー時は署名URLを再取得して自動復旧する

**公開ギャラリー（`/assets`）**
- キーワード検索
- コンテンツタイプ（画像/音声）
- プライマリタグ（背景/一枚絵/BGM/効果音/ボイス/その他）
- 自由タグ（カンマ区切り）
- 並び替え（新しい順 / 古い順 / タイトル）

**お気に入り（`/my/favorites` / `/my/favorites/characters`）**
- 公開ギャラリーに近いフィルタ UI を持つ
- 解除時は楽観更新でカードを即時に消す

---

## 用語ルール（更新）
- 公開ギャラリー: `/assets`（全体閲覧・検索）
- アセット管理: `/my/assets`（自分の投稿の編集・削除）
- キャラクター管理: `/my/characters`（自分のキャラクター編集）
- お気に入り: `/my/favorites` / `/my/favorites/characters`
- サムネ: `thumbKey` を基点に署名GETで解決した URL 画像

---

### ChangeLog (chat handover)
- 2025-11-02: キャラクター節・お気に入り・タブ導線・署名GET・`$api` 規約を最新版に更新
- 2026-04-16: レビューによる大幅更新 — キャラクター / ゲームの URL・API・データモデル追加、認証方式（JWKS）修正、お気に入りAPIパス統一、Favorite / CharacterImage モデル追記
- 2026-04-16 (2): Asset.ownerId nullable 確認・ソフトデリート挙動追記・CharacterEmotion enum 定義追加・キャラクター検索インデックス設定追記
