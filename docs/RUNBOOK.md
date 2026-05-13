# RUNBOOK - ローカル環境更新と復旧（Windows / PowerShell）

## 1. 最新コード取得後 / ZIP 入れ替え後 / schema 変更後の標準手順

必ずリポジトリルートで実行:

```pwsh
# 依存変更があるとき
pnpm install

docker compose up -d
pnpm db:status
pnpm -C apps/api prisma:migrate
pnpm -C apps/api prisma:generate
pnpm -C apps/api build
.\scripts\init-meilisearch.ps1

# 必要時のみ（詳細は下の「Meili再index」）
pnpm search:reindex

pnpm dev:all
```

補足:
- `pnpm -C apps/api prisma:migrate` は `prisma migrate dev` を実行する。
- `prisma migrate dev` が DB reset を要求した場合は、安易に reset せず一旦停止して原因を確認する。
- frontend だけの build 成功では不十分。schema 変更時は API 側の migrate / generate / build まで完了させる。

## 2. Meilisearch 初期化

推奨は `scripts/init-meilisearch.ps1` の実行:

```pwsh
.\scripts\init-meilisearch.ps1
```

このスクリプトは次を行う:
- `assets`, `games`, `conversations` index の作成（既存時はそのまま継続）
- `assets` index settings 更新
	- `filterableAttributes`: `contentType`, `primaryTag`, `tags`, `ownerId`, `isPublic`
	- `sortableAttributes`: `createdAt`

### 手動で設定する場合（最終手段）

```pwsh
$headers = @{ Authorization = 'Bearer masterKey123' }

# index 作成
Invoke-RestMethod -Uri 'http://localhost:7700/indexes' -Method Post -Headers $headers -ContentType 'application/json' -Body '{"uid":"assets"}'
Invoke-RestMethod -Uri 'http://localhost:7700/indexes' -Method Post -Headers $headers -ContentType 'application/json' -Body '{"uid":"games"}'
Invoke-RestMethod -Uri 'http://localhost:7700/indexes' -Method Post -Headers $headers -ContentType 'application/json' -Body '{"uid":"conversations"}'

# assets settings 更新
Invoke-RestMethod -Uri 'http://localhost:7700/indexes/assets/settings' -Method Patch -Headers $headers -ContentType 'application/json' -Body '{"filterableAttributes":["contentType","primaryTag","tags","ownerId","isPublic"],"sortableAttributes":["createdAt"]}'
```

## 3. Meili再index（必要時のみ）

`isPublic` filter warning が出る、または index 内容に不整合が疑われる場合の復旧手順:

1. Meilisearch 起動確認（`docker compose ps` など）
2. `.\scripts\init-meilisearch.ps1` を実行
3. worker を起動（`pnpm -C apps/worker dev`）
4. reindex 実行（`pnpm search:reindex` または `pnpm -C apps/api search:reindex`）
5. `GET /assets` や `GET /search/assets` で検索結果を確認

重要:
- `search:reindex` は BullMQ の `search-index` キューへ job を投入する方式。
- worker が起動していないと、キュー投入されても Meilisearch への反映は進まない。

## 4. Prisma EPERM（Windows）対策

`query_engine-windows.dll.node` rename 失敗（EPERM）が出る場合は、実行中プロセスが DLL を掴んでいる可能性が高い。

対応手順:
1. dev server / worker / Prisma Studio / node プロセスを停止
2. `pnpm -C apps/api prisma:generate` を再実行
3. 必要なら `pnpm -C apps/api build` を再実行

## 5. 日常運用メモ

- Docker UI:
	- Meili: http://localhost:7700
	- MinIO: http://localhost:9001
	- MailHog: http://localhost:8025
- MinIO 初期セットアップ時は `talking-dev` バケット作成を確認する。

## 6. Git へコミットしないもの

検証ログはコミットしない:
- `build_out.txt`
- `build_output.txt`
- `test_out.txt`
- `diff_out.txt`
- `review.patch.txt`

`git status` で差分に含まれていたら、コミット対象から外すこと。
