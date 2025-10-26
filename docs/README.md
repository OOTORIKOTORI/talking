# ドキュメント索引

このプロジェクトのドキュメント一覧です。複数チャットにまたがる開発でも迷子にならないよう、仕様・進め方・ハンドオフ手順をここに集約しています。

## 📚 ドキュメント一覧

### 1. [アーキテクチャ](./architecture.md)
システム構成・データフロー・Monorepo 構成・主要サービスとポート

### 2. [開発環境セットアップ](./dev-setup.md)
初回セットアップ・日常起動・Prisma マイグレーション・MinIO 設定・トラブルシュート

### 3. [開発ワークフロー](./workflow.md)
ブランチ規約・Conventional Commits・PR チェックリスト・CI 方針

### 4. [ハンドオフ手順](./handoff.md)
複数チャット向けの作業引き継ぎ方法・テンプレートの使い方

### 5. [プロンプトテンプレート](./prompts/README.md)
直接編集モードヘッダー・タスク指示テンプレート

### 6. [ADR (Architecture Decision Records)](./adr/README.md)
設計判断の記録・既存の決定事項一覧

### 7. [ロードマップ](./roadmap.md)
MVP → β → 正式リリースまでの計画・TODO リスト

---

## 🚀 最初にやること（クイックスタート）

```powershell
# 1. 依存インストール
pnpm install

# 2. Docker サービス起動 & 開発サーバー起動
pnpm dev:all

# 3. Prisma マイグレーション実行
cd apps/api
pnpm prisma migrate dev
```

詳細は [開発環境セットアップ](./dev-setup.md) を参照してください。
