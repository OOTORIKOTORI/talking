# ドキュメント索引

Talking プロジェクトのドキュメント一覧。

## ドキュメント一覧

### [アーキテクチャ](./architecture.md)
システム構成・ドメイン・URL一覧・API一覧・データモデル・認証・非同期処理・アクセス制御

### [開発環境セットアップ](./dev-setup.md)
初回セットアップ・環境変数の設定・Docker・Prismaマイグレーション・トラブルシュート

### [認証セットアップ](./auth-setup.md)
Supabase Auth（JWKS）の設定手順

### [開発ワークフロー](./workflow.md)
ブランチ規約・Conventional Commits・CIチェック項目

### [ファイルマップ](./file-map.md)
フロントエンド・API・Workerの全ファイル一覧と各ファイルの役割・props/emit/関数名

### [ロードマップ](./ROADMAP.md)
実装済み機能・既知の課題・今後実装予定の機能一覧

### [ハンドオフ手順](./handoff.md)
複数チャットにまたがる開発での引き継ぎ方法・テンプレート

### [RUNBOOK](./RUNBOOK.md)
詳細コマンド・よく使う操作・トラブルシュート集

---

## クイックスタート

```bash
pnpm install
pnpm dev:all
cd apps/api && pnpm prisma migrate dev
```n
詳細は [開発環境セットアップ](./dev-setup.md) を参照。
