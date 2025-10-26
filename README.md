# Talking

A monorepo project using pnpm workspaces.

## 📚 ドキュメント

**→ [docs/README.md](./docs/README.md) にドキュメント索引があります**

- [アーキテクチャ](./docs/architecture.md): システム構成・データフロー
- [開発環境セットアップ](./docs/dev-setup.md): 初回セットアップ・日常起動
- [開発ワークフロー](./docs/workflow.md): ブランチ規約・PR チェックリスト
- [ハンドオフ手順](./docs/handoff.md): 複数チャット向け引き継ぎ
- [ロードマップ](./docs/roadmap.md): MVP → β → 正式リリースの計画

---

## 🚀 開発クイックスタート

```powershell
# 1. 依存インストール
pnpm install

# 2. Docker サービス起動 & 開発サーバー起動
pnpm dev:all

# 3. Prisma マイグレーション実行
cd apps/api
pnpm prisma migrate dev
```

詳細は [開発環境セットアップ](./docs/dev-setup.md) を参照してください。

---

## Monorepo Layout

```
talking/
├── apps/
│   ├── frontend/    # Nuxt 3 フロントエンド
│   ├── api/         # NestJS API サーバー
│   └── worker/      # BullMQ ワーカー
└── packages/
    ├── types/       # 共通型定義
    └── sdk/         # SDK ライブラリ (予約)
```

## Requirements

- Node.js v22.12.0 (see `.nvmrc`)
- pnpm v10.16.0
- Docker Desktop for Windows

---

## Local Development Setup (詳細)

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
