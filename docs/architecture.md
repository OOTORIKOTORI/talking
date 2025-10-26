# アーキテクチャ

## Monorepo 構成

このプロジェクトは pnpm workspace による Monorepo 構成です。

```
talking/
├── apps/
│   ├── api/         # NestJS バックエンド (REST API)
│   ├── frontend/    # Nuxt 3 フロントエンド
│   └── worker/      # BullMQ ワーカー (検索インデックス更新)
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

## データフロー図

### アセットアップロード → 検索インデックス更新

```
[Frontend: Nuxt]
    ↓ 1. POST /api/uploads/signed (ファイル名/MIME)
[API: NestJS]
    ↓ 2. 署名付き PUT URL 生成 (MinIO)
    ↓ 返却
[Frontend]
    ↓ 3. PUT (署名付き URL) → MinIO へ直接アップロード
[MinIO]
    ↓ 保存完了
[Frontend]
    ↓ 4. POST /api/assets/finalize (key, filename, etc.)
[API]
    ↓ 5. DB 登録 (Prisma → PostgreSQL)
    ↓ 6. BullMQ ジョブ投入 (Redis キュー: search-index)
[Worker]
    ↓ 7. ジョブ取得
    ↓ 8. Meilisearch にインデックス登録/更新
[Meilisearch]
    ↓ 検索可能に
```

---

## 主要 .env の要点

### apps/api/.env

```env
DATABASE_URL=postgresql://user:password@localhost:5432/talking
REDIS_URL=redis://localhost:6379
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET_NAME=uploads
S3_PUBLIC_BASE=http://localhost:9000/uploads
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_KEY=masterKey
```

### apps/frontend/.env

```env
NUXT_PUBLIC_API_BASE=http://localhost:4000
```

### apps/worker/.env

```env
# API と同じ REDIS_URL, DATABASE_URL, MEILISEARCH_* を使用
```

---

## 技術スタック

- **Frontend**: Nuxt 3 (Vue 3 + Composition API), TailwindCSS
- **Backend**: NestJS (TypeScript), Prisma ORM
- **Worker**: BullMQ (Redis ベースのジョブキュー)
- **DB**: PostgreSQL
- **Storage**: MinIO (S3 互換)
- **Search**: Meilisearch
- **Runtime**: Node.js 22, pnpm

---

## セキュリティ設計

- **署名付き URL**: MinIO のバケットは非公開。GET/PUT は署名付き URL でアクセス。
- **CORS**: MinIO は `cors.json` で localhost:3000 を許可。
- **認証**: (将来) JWT or セッションベース (未実装)
