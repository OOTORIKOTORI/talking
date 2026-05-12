# RUNBOOK — ローカル起動までのコマンド集（Windows/PowerShell 版）

## 0) バージョン
```pwsh
node -v   # v22.12.0
pnpm -v   # v10.16.0
```

## 1) リポ初期化（既に C:\talking がある場合はスキップ可）
```pwsh
# New-Item -ItemType Directory -Path C:\talking | Out-Null
# Set-Location C:\talking
git init
```

## 2) docker-compose 起動
```pwsh
docker compose up -d
# UIs:
# Meili:   http://localhost:7700  (Authorization: Bearer masterKey123)
# MinIO:   http://localhost:9001  (admin / password123)
# MailHog: http://localhost:8025
```

MinIO バケット作成（Console → Buckets → `talking-dev`）

## 3) Meilisearch 初期化
### (A) PowerShell推奨: Invoke-RestMethod を使用
```pwsh
$headers = @{ Authorization = 'Bearer masterKey123' }
Invoke-RestMethod -Uri 'http://localhost:7700/indexes' -Method Post -Headers $headers -ContentType 'application/json' -Body '{"uid":"assets"}'
Invoke-RestMethod -Uri 'http://localhost:7700/indexes' -Method Post -Headers $headers -ContentType 'application/json' -Body '{"uid":"games"}'
Invoke-RestMethod -Uri 'http://localhost:7700/indexes' -Method Post -Headers $headers -ContentType 'application/json' -Body '{"uid":"conversations"}'
```

### (B) もしくは curl.exe を明示
```pwsh
curl.exe -X POST http://localhost:7700/indexes -H "Authorization: Bearer masterKey123" -H "Content-Type: application/json" -d "{\"uid\":\"assets\"}"
curl.exe -X POST http://localhost:7700/indexes -H "Authorization: Bearer masterKey123" -H "Content-Type: application/json" -d "{\"uid\":\"games\"}"
curl.exe -X POST http://localhost:7700/indexes -H "Authorization: Bearer masterKey123" -H "Content-Type: application/json" -d "{\"uid\":\"conversations\"}"
```

## 4) Frontend 開発起動（別ターミナル）
```pwsh
Set-Location apps/frontend
pnpm dev -o
```

## 5) API 開発起動（別ターミナル）
```pwsh
Set-Location apps/api
pnpm dlx prisma migrate dev --name init
pnpm start:dev
```

## 5.1) Prisma schema 変更時のチェックリスト（重要）
```pwsh
Set-Location C:\talking
pnpm -C apps/api prisma:migrate
pnpm -C apps/api prisma:generate
pnpm -C apps/api build
```

注意:
- Prisma schema 変更時は frontend build のみでは不十分
- migration を追加した後、`git status --ignored apps/api/prisma/migrations/<migration名>` や `git ls-files apps/api/prisma/migrations/<migration名>/migration.sql` で Git 追跡寻常か確認してください（`_` を含む名前は `.gitignore` に引っかかる可能性がある）
- 必要なら dev server 再起動

## 6) Worker 起動（任意/別ターミナル）
```pwsh
Set-Location apps/worker
pnpm dev
```

## 7) よく使う補助
```pwsh
# ランダム秘匿値
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## トラブルシューティング

### Docker Desktop が必要
- Docker Desktop for Windows をインストールしてください
- インストール後、PowerShellを再起動してください

### Meilisearch 初期化スクリプト
`scripts/init-meilisearch.ps1` を実行してください：
```pwsh
.\scripts\init-meilisearch.ps1
```
