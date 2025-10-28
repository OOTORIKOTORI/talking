# 開発環境セットアップ

## 必要な環境

- **Node.js**: 22.x
- **pnpm**: 最新版 (`npm install -g pnpm`)
- **Docker Desktop**: 最新版 (MinIO, PostgreSQL, Redis, Meilisearch を起動)
- **Git**: 最新版

---

## 初回セットアップ

### 1. リポジトリクローン & 依存インストール

```powershell
git clone <repository-url>
cd talking
pnpm install
```

### 2. 環境変数ファイルをコピー

```powershell
# API
Copy-Item apps/api/.env.example apps/api/.env

# Frontend
Copy-Item apps/frontend/.env.example apps/frontend/.env

# Worker
Copy-Item apps/worker/.env.example apps/worker/.env
```

### 3. 環境変数の設定

#### Frontend (`apps/frontend/.env`)

```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_KEY=<anon-public-key>
NUXT_PUBLIC_API_BASE=http://localhost:4000
```

#### API (`apps/api/.env`)

```env
# Supabase Auth (HS256 JWT 検証)
SUPABASE_JWT_SECRET=<Supabase ダッシュボードの JWT Secret>

# S3/MinIO
S3_PUBLIC_BASE=http://localhost:9000/talking-dev

# Redis
REDIS_URL=redis://localhost:6379

# Meilisearch
MEILI_HOST=http://localhost:7700
MEILI_KEY=masterKey123
```

> **重要:** `SUPABASE_JWT_SECRET` は Supabase ダッシュボード → Settings → API → **JWT Secret** からコピーしてください。

### 3. Docker サービス起動

```powershell
docker-compose up -d
```

起動確認:

```powershell
docker-compose ps
```

すべてのサービスが `Up (healthy)` になっていることを確認。

### 4. Prisma マイグレーション実行

```powershell
cd apps/api
pnpm prisma migrate dev
```

### 5. MinIO の CORS 設定

MinIO は署名付き URL で PUT/GET するため、CORS 設定が必要です。

#### 方法 A: Docker 内の AWS CLI を使う (推奨)

```powershell
docker exec -it minio-container mc alias set local http://localhost:9000 minioadmin minioadmin
docker exec -it minio-container mc cors set local/uploads --rule "[{\"AllowedOrigins\":[\"http://localhost:3000\"],\"AllowedMethods\":[\"GET\",\"PUT\",\"POST\",\"DELETE\"],\"AllowedHeaders\":[\"*\"],\"MaxAgeSeconds\":3000}]"
```

#### 方法 B: MinIO Admin UI で設定

1. http://localhost:9001 にアクセス (minioadmin / minioadmin)
2. `uploads` バケットを選択 → Summary → CORS Rules
3. `cors.json` の内容を貼り付けて保存

### 6. バケットポリシー設定 (署名付き URL 用)

```powershell
# Docker 内で実行
docker exec -it minio-container mc policy set download local/uploads
```

または MinIO Admin UI で `uploads` バケットのポリシーを `public-read` に設定。

---

## 日常の起動

```powershell
# ルートで実行
pnpm dev:all
```

これにより以下が一括起動します:
- Docker Compose サービス (PostgreSQL, Redis, MinIO, Meilisearch)
- NestJS API (http://localhost:4000)
- Nuxt Frontend (http://localhost:3000)
- BullMQ Worker

> **注意:** MinIO バケットは **private** です。画像表示は署名付き GET URL を使用します。CORS 設定はリポジトリ同梱のスクリプトで適用済みです。

---

## トラブルシュート

### 401 Unauthorized（認証エラー）

#### 原因 1: Authorization ヘッダーが付いていない

- Network タブで `Authorization: Bearer` が付いているか確認
- 付いていない場合 → `$api` composable を使う（`useApi.ts`）

#### 原因 2: SUPABASE_JWT_SECRET が間違っている

1. Supabase ダッシュボード → Settings → API → **JWT Secret** を確認
2. `apps/api/.env` の `SUPABASE_JWT_SECRET` と一致しているか確認
3. 修正後、API を再起動

#### 原因 3: トークンの期限切れ

- `$api` は自動で refresh → 1回再試行を行います（`apps/frontend/plugins/api-auth.client.ts`）
- それでも 401 が出る場合は再ログイン

#### 原因 4: フロントとAPIで異なる Supabase プロジェクトを参照

- `apps/frontend/.env` の `SUPABASE_URL` と `apps/api/.env` の `SUPABASE_JWT_SECRET` が**同一プロジェクト**のものか確認

### Docker サービスが Unhealthy

```powershell
# ログ確認
docker-compose logs <service-name>

# 再起動
docker-compose restart <service-name>
```

### 署名付き URL で 404 / 403

- **404**: バケット or オブジェクトが存在しない → MinIO Admin UI で確認
- **403**: CORS or ポリシー設定が不足 → 上記の CORS/ポリシー設定を再実行
- **期限切れ**: フロントが自動で `/uploads/signed-get` を再取得して復旧します

### Prisma の型が古い

```powershell
cd apps/api
pnpm prisma generate
```

### ポートが既に使用されている

他のプロセスがポートを占有している場合:

```powershell
# ポート使用状況確認 (例: 4000)
netstat -ano | findstr :4000

# プロセス終了 (PID を確認してから)
taskkill /PID <PID> /F
```

---

## Meilisearch 初期設定

```powershell
# スクリプト実行 (初回のみ)
.\scripts\init-meilisearch.ps1
```

または手動で API Key を設定:

```powershell
curl -X POST http://localhost:7700/keys `
  -H "Authorization: Bearer masterKey" `
  -H "Content-Type: application/json" `
  -d '{"actions":["search"],"indexes":["*"],"expiresAt":null}'
```

---

## よく使うコマンド

```powershell
# 全サービス起動
pnpm dev:all

# API のみ起動
cd apps/api
pnpm dev

# Frontend のみ起動
cd apps/frontend
pnpm dev

# Worker のみ起動
cd apps/worker
pnpm dev

# Prisma Studio (DB GUI)
cd apps/api
pnpm prisma studio

# Docker サービス停止
docker-compose down

# Docker サービス完全削除 (ボリューム含む)
docker-compose down -v
```
