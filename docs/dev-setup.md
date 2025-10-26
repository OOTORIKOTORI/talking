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

各 `.env` ファイルを必要に応じて編集してください。ローカル開発では通常そのままで OK です。

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

---

## トラブルシュート

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
