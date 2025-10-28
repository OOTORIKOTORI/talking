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

---

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

アセット詳細

#### `PATCH /assets/:id`

アセット更新（本人のみ）

#### `DELETE /assets/:id`

アセット削除（本人のみ）

---

## データモデル（Asset 抜粋）

```prisma
model Asset {
  id          String   @id @default(uuid())
  ownerId     String   // Supabase Auth の user.id
  key         String   // S3 object key (original)
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

## 技術スタック

- **Frontend**: Nuxt 3 (Vue 3 + Composition API), TailwindCSS
- **Backend**: NestJS (TypeScript), Prisma ORM
- **Worker**: BullMQ (Redis ベースのジョブキュー), sharp (画像処理)
- **DB**: PostgreSQL
- **Storage**: MinIO (S3 互換)
- **Search**: Meilisearch
- **Auth**: Supabase Auth (HS256 JWT 検証)
- **Runtime**: Node.js 22, pnpm
