# Talking

A monorepo project using pnpm workspaces.

## Monorepo Layout

```
talking/
├── apps/
│   ├── frontend/    # Frontend application
│   ├── api/         # API server
│   └── worker/      # Background worker
└── packages/
    ├── types/       # Shared TypeScript types
    └── sdk/         # SDK library
```

## Requirements

- Node.js v22.12.0 (see `.nvmrc`)
- pnpm v10.16.0
- Docker Desktop for Windows

## Local Development Setup

## クイックスタート

1. **Docker サービス起動**
   ```pwsh
   docker compose up -d
   ```

2. **Meilisearch 初期化**
   ```pwsh
   .\scripts\init-meilisearch.ps1
   ```

3. **MinIO バケット作成**
   - http://localhost:9001 にアクセス
   - ログイン: `admin` / `password123`
   - Buckets → Create Bucket → `talking-dev`

4. **アプリケーション起動**（それぞれ別ターミナルで）
   
   **Frontend:**
   ```pwsh
   cd apps/frontend
   pnpm dev -o
   ```
   
   **API:**
   ```pwsh
   cd apps/api
   pnpm dlx prisma migrate dev --name init
   pnpm start:dev
   ```
   
   **Worker (オプション):**
   ```pwsh
   cd apps/worker
   pnpm dev
   ```

## サービスURL

- **Meilisearch UI:** http://localhost:7700 (Authorization: `Bearer masterKey123`)
- **MinIO Console:** http://localhost:9001 (admin / password123)
- **MailHog UI:** http://localhost:8025

## 詳細

詳細なコマンドとトラブルシューティングは [RUNBOOK.md](./RUNBOOK.md) を参照してください。
