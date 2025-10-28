# Talking

A monorepo project using pnpm workspaces.

## 📚 ドキュメント

**→ [docs/README.md](./docs/README.md) にドキュメント索引があります**

- [アーキテクチャ](./docs/architecture.md): システム構成・データフロー・認証
- [開発環境セットアップ](./docs/dev-setup.md): 初回セットアップ・日常起動
- [認証セットアップ](./docs/auth-setup.md): Supabase Auth（HS256/JWT Secret）の設定
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
│   └── worker/      # BullMQ ワーカー（サムネ生成・検索）
└── packages/
    ├── types/       # 共通型定義
    └── sdk/         # SDK ライブラリ (予約)
```

## Requirements

- Node.js v22.12.0 (see `.nvmrc`)
- pnpm v10.16.0
- Docker Desktop for Windows

---

## サービスURL

| サービス              | URL                                     | 備考                                    |
|-----------------------|-----------------------------------------|-----------------------------------------|
| **Web (Frontend)**    | http://localhost:3000                   | Nuxt 3 フロントエンド                   |
| **API**               | http://localhost:4000                   | NestJS REST API                         |
| **Meilisearch UI**    | http://localhost:7700                   | Authorization: `Bearer masterKey123`    |
| **MinIO Console**     | http://localhost:9001                   | admin / password123                     |
| **MailHog UI**        | http://localhost:8025                   | メール確認用                            |

---

## 用語集

- **公開ギャラリー**: 未ログインでも閲覧可能なアセット一覧画面（`/assets`）
- **アセット管理**: 本人のみがアクセスできる作成・編集・削除画面（`/my/assets`）
- **サムネ**: サムネイル画像（`thumbKey`）
- **認証方式**: Supabase Auth（HS256 / JWT Secret 検証）

## 詳細

詳細なコマンドとトラブルシューティングは [RUNBOOK.md](./RUNBOOK.md) を参照してください。
