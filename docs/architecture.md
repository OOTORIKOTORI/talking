# アーキテクチャ

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
│   └── sdk/         # (予約)
└── scripts/         # セットアップスクリプト
```

---

## 主要サービスとポート

| サービス         | ポート        | 用途                                      |
|------------------|---------------|-------------------------------------------|
| **Nuxt**         | 3000          | フロントエンド                            |
| **NestJS API**   | 4000          | REST API サーバー                         |
| **MinIO**        | 9000 (API)    | オブジェクトストレージ (S3互換)           |
|                  | 9001 (Admin)  | MinIO 管理画面                            |
| **Meilisearch**  | 7700          | 全文検索エンジン                          |
| **Redis**        | 6379          | BullMQ キュー & セッション                |
| **PostgreSQL**   | 5432          | メインDB (Prisma)                         |

すべてのサービスは `docker-compose.yml` で定義され、`pnpm dev:all` で一括起動します。

---

## 機能サマリ

### コア機能

- **公開ギャラリー** (`/assets`): 未ログインでも閲覧・検索が可能なアセット一覧
- **アセット管理** (`/my/assets`): 本人のみがアクセスできる作成・編集・削除画面
- **ファイルアップロード**: S3/MinIO 署名付きPUT → finalize でDB保存
- **サムネ生成**: Worker が sharp で 512px cover サムネを `thumbs/` に生成
- **検索**: Meilisearch へのインデックス登録（非同期）

---

## URL/画面構成

| パス                | 機能               | 認証       | 備考                                   |
|---------------------|--------------------|------------|----------------------------------------|
| `/`                 | ホーム             | 不要       | 公開トップページ                       |
| `/assets`           | 公開ギャラリー     | 不要       | 全ユーザーのアセット一覧・検索         |
| `/assets/[id]`      | アセット詳細       | 不要       | 管理ボタンは**オーナーのみ**表示       |
| `/upload`           | アップロード       | **必須**   | ログイン後のみアクセス可能             |
| `/my/assets`        | アセット管理       | **必須**   | 本人のアセットのみ表示・編集・削除     |
| `/my/favorites`     | お気に入り一覧     | **必須**   | 自分がお気に入り登録した公開アセット一覧。公開ギャラリー準拠UI。


## アクセス制御（AuthN/Z）

### 認証方式

- **Supabase Auth**（Email/Password）
- フロントエンド: `@supabase/supabase-js` を使用してログイン・セッション管理
- API: Nest Guard が **HS256（`SUPABASE_JWT_SECRET`）** で JWT を検証

### エンドポイントの認可

#### 公開（認証不要）

- `GET /assets` — 公開ギャラリー一覧
- `GET /assets/:id` — アセット詳細
- `GET /uploads/signed-get` — 署名付き GET URL 取得

#### 要ログイン

- `POST /uploads/signed-url` — 署名付き PUT URL 取得（アップロード開始）
- `POST /assets` — finalize（DB保存）
- `GET /assets/mine` — 本人のアセット一覧
- `PATCH /assets/:id` — アセット更新（オーナー照合）
- `DELETE /assets/:id` — アセット削除（オーナー照合）

### オーナー制御

`PATCH/DELETE /assets/:id` は、JWT の `sub`（ユーザーID）と `Asset.ownerId` を照合し、不一致の場合は **403 Forbidden** を返します。

---

## API 一覧

### アップロード関連

#### `POST /uploads/signed-url`

**リクエスト:**
```json
{
  "filename": "example.png",
  "contentType": "image/png"
}
```

**レスポンス:**
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

**レスポンス:**
```json
{
  "url": "https://minio.example.com/bucket/uploads/abc123.png?X-Amz-..."
}
```

### アセット関連

#### `POST /assets` (finalize)

**リクエスト:**
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

**レスポンス:**
```json
{
  "id": "uuid-1234",
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

#### `GET /assets?limit=20&cursor=...`

公開ギャラリー一覧（ページネーション対応）

**レスポンス:**
```json
{
  "items": [...],
  "nextCursor": "cursor-string"
}
```

#### `GET /assets/mine?limit=20&cursor=...`

本人のアセット一覧（アセット管理画面用）

#### `GET /assets/:id`


#### `PATCH /assets/:id`

アセット更新（本人のみ）

#### `DELETE /assets/:id`

アセット削除（本人のみ）


### お気に入り関連 API
- `GET /favorites`（要ログイン）: お気に入りの資産一覧
- `POST /assets/:id/favorite`（要ログイン）: お気に入り登録
- `DELETE /assets/:id/favorite`（要ログイン）: お気に入り解除

## データモデル（Asset 抜粋）

```prisma
model Asset {
  id          String   @id @default(uuid())
  ownerId     String   // Supabase Auth の user.id

### Asset 拡張
- `description` (string, 任意)
- `primaryTag` (enum) … 必須の分類タグ。以下の値のいずれか
  - 画像: `IMAGE_BG`（背景）, `IMAGE_CG`（一枚絵）, `IMAGE_OTHER`
  - 音声: `AUDIO_BGM`（BGM）, `AUDIO_SE`（効果音）, `AUDIO_VOICE`（ボイス）, `AUDIO_OTHER`
- `tags` (string[]) … 自由タグ（カンマ区切り入力→配列格納）
  key         String   // S3 object key (original)
### Favorite モデル
- `userId`, `assetId`, `createdAt`
- 複合ユニーク(`userId`,`assetId`)
  thumbKey    String?  // サムネのキー（存在時は一覧で優先表示）
  title       String?
  description String?
  tags        String[] // 配列型
  contentType String
  size        Int      // bytes
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 非同期処理（BullMQ キュー）

### サムネ生成

1. `POST /assets` 時に `thumbnails` キューへ `generate-thumbnail` ジョブを投入
2. Worker が sharp で画像を 512px cover にリサイズ
3. `thumbs/` に保存し、`Asset.thumbKey` を更新

### 検索インデックス

1. Asset の作成・更新・削除時に Search キューへ投入
2. Worker が Meilisearch に upsert または remove を実行

---


## 署名URLの扱い（TTL 切れの復旧）

- 一覧・詳細画面でサムネや画像を表示する際、403/401（期限切れ）を検知
- 自動で `/uploads/signed-get?key=...` を再取得して URL を復旧
- ユーザー体験を損なわない透過的な更新

---

## フロントエンド主要フロー

**アップロード**
1) `/upload` でファイル選択 → `POST /uploads/signed-url` → 署名PUTでMinIOへ
2) `POST /assets` finalize で DB 登録・Worker キュー投入

**サムネ表示**
1) `<AssetCard>` は `thumbKey` または `key` を使って `GET /uploads/signed-get?key=...` を叩き、返ってきた **JSONの `url`** を `<img src>` にセットする（APIのエンドポイント自体を `src` に入れない）
2) 画像エラー時は自動で署名URLを再取得（TTL切れ対策）。メモリ短期キャッシュを持ち再取得を抑制。

**公開ギャラリー（/assets）**
キーワード検索、コンテンツタイプ（画像/音声）、プライマリタグ（背景/一枚絵/BGM/効果音/ボイス/その他）、自由タグ（カンマ区切り）、並び替え（新しい順/古い順/タイトル）を提供
オーナー以外には編集/削除ボタンを非表示

**お気に入り（/my/favorites）**
公開ギャラリーと同等のフィルタUIを持つ
解除は即時にカードを消す（楽観更新）

---


---

## 用語ルール（更新）
- 公開ギャラリー: `/assets`（全体閲覧・検索）
- アセット管理: `/my/assets`（自分の投稿の編集・削除）
- お気に入り: `/my/favorites`（お気に入りした公開アセットの一覧）
- サムネ: `thumbKey` を基点に署名GETで解決したURL画像
