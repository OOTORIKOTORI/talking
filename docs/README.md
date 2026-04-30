# ドキュメント索引

Talking プロジェクトのドキュメント一覧。

---

## 仕様・設計

### [アーキテクチャ](./architecture.md)
システム構成・ドメイン・URL一覧・API一覧・データモデル・認証・非同期処理・アクセス制御・ChangeLog

### [正準仕様 (PROJECT_SPEC)](./PROJECT_SPEC.md)
実装を根拠とした逆引き仕様書。型定義・API・落とし穴・既知の制限など出典ファイル付きで記載

### [恒久規約 (HANDBOOK)](./HANDBOOK.md)
コード変更があっても守るべきUI規約・コーディング規約・命名規則

### [ADR（設計判断記録）](./adr/README.md)
重要な技術的決定の記録。`docs/adr/` 以下に日付・連番で蓄積

---

## 開発ガイド

### [開発環境セットアップ](./dev-setup.md)
初回セットアップ・環境変数・Docker・Prismaマイグレーション・トラブルシュート

### [認証セットアップ](./auth-setup.md)
Supabase Auth（JWKS）の設定手順

### [開発ワークフロー](./workflow.md)
ブランチ規約・Conventional Commits・CIチェック項目

### [RUNBOOK](./RUNBOOK.md)
詳細コマンド・よく使う操作・トラブルシュート集

---

## プロジェクト管理

### [ロードマップ](./ROADMAP.md)
実装済み機能・既知の課題・今後実装予定の機能一覧

### [ファイルマップ](./file-map.md)
フロントエンド・API・Workerの全ファイル一覧と各ファイルの役割・props/emit/関数名

### [ハンドオフ手順](./handoff.md)
複数チャットにまたがる開発での引き継ぎ方法・テンプレート

---

## クイックスタート

```bash
pnpm install
pnpm dev:all
cd apps/api && pnpm prisma migrate dev
```

詳細は [開発環境セットアップ](./dev-setup.md) を参照。

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
