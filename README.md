# Talking

ブラウザでビジュアルノベルゲームを作れる Web アプリ。
画像・音声・キャラクターデータをアップロード・共有し、シナリオエディタでゲームを制作できます。

## 技術スタック

- フロントエンド: Nuxt 3
- API: NestJS
- DB/ORM: Prisma (PostgreSQL)
- 検索: Meilisearch
- ストレージ: MinIO
- キュー: BullMQ
- 認証: Supabase Auth (JWKS)

## クイックスタート

```bash
pnpm install
pnpm dev:all
cd apps/api && pnpm prisma migrate dev
```

## ドキュメント

詳細は [`docs/`](./docs/README.md) を参照してください。
進捗・既知課題・次にやることは [`docs/ROADMAP.md`](./docs/ROADMAP.md) を正として管理します。

| ドキュメント | 内容 |
|-------------|------|
| [アーキテクチャ](./docs/architecture.md) | システム構成・API・データモデル・認証 |
| [開発環境セットアップ](./docs/dev-setup.md) | 初回セットアップ・環境変数・トラブルシュート |
| [認証セットアップ](./docs/auth-setup.md) | Supabase Auth の設定方法 |
| [開発ワークフロー](./docs/workflow.md) | ブランチ規約・Conventional Commits |
| [ファイルマップ](./docs/file-map.md) | ファイル構造と各ファイルの役割 |
| [ロードマップ](./docs/ROADMAP.md) | 実装済み機能・既知の課題・今後の計画 |
| [ハンドオフ手順](./docs/handoff.md) | 旧メモ・補助資料。進捗同期の主導線ではない |
| [RUNBOOK](./docs/RUNBOOK.md) | 詳細コマンド・トラブルシュート集 |

## サービス URL（ローカル開発）

| サービス | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000 |
| Meilisearch | http://localhost:7700 |
| MinIO Console | http://localhost:9001 |