# Talking 仕様準拠 - 動作確認手順

## 修正サマリー（Conventional Commits）

### `fix(api): enqueue thumbnail job on asset creation`
- **ファイル**: `apps/api/src/assets/assets.service.ts`
- **変更**: `create()` メソッドで画像アセット作成時に `thumbnailProducer.enqueueAsset()` を呼び出し追加
- **理由**: 画像アップロード時にサムネイル生成ジョブが自動的にキューイングされるように

### `fix(worker): update full asset fields in Meilisearch on thumbnail completion`
- **ファイル**: `apps/worker/src/thumbnail/thumbnail.worker.ts`
- **変更**: Meilisearch 更新時に `thumbKey` だけでなく全フィールド（title, description, tags, contentType, url, createdAt）を送信
- **理由**: Meilisearch のドキュメントを完全に保ち、検索インデックスの整合性を確保

---

## 前提条件

- Docker Desktop 起動済み（MinIO, PostgreSQL, Redis, Meilisearch）
- `pnpm install` 実行済み
- `.env` ファイル設定済み（特に `SUPABASE_JWT_SECRET`）

---

## 1. 環境起動

```powershell
# Docker コンテナ起動
docker-compose up -d

# Meilisearch 初期化（初回のみ）
.\scripts\init-meilisearch.ps1

# 全サービス起動（API:4000, Frontend:3000, Worker）
pnpm dev:all
```

**確認ポイント**:
- API: `http://localhost:4000/health` → `{"status":"ok"}`
- Frontend: `http://localhost:3000` → ログインページ表示
- Worker: ターミナルに `[Worker] Connected to Redis` 表示

---

## 2. 認証フロー確認

### 2.1 Supabase Auth テスト（本番）

```powershell
# ログイン（Supabase Auth UI）
# http://localhost:3000/login にアクセス
# → メールアドレスでサインアップ/ログイン
```

### 2.2 Dev モード（JWT_SECRET なし）

```powershell
# .env の SUPABASE_JWT_SECRET をコメントアウトして再起動
# → AuthGuard が dev-user-123 を自動設定
```

---

## 3. 署名付きURL発行テスト

### 3.1 PUT署名URL取得（アップロード用）

```powershell
# Authorization ヘッダーに Supabase JWT を設定
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    filename = "test-image.jpg"
    contentType = "image/jpeg"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:4000/uploads/signed-url" -Method POST -Headers $headers -Body $body

# レスポンス例:
# {
#   "url": "http://localhost:9000/talking-dev/uploads/20251028/abc123.jpg?X-Amz-Signature=...",
#   "method": "PUT",
#   "key": "uploads/20251028/abc123.jpg"
# }

# ファイルをPUTでアップロード
Invoke-RestMethod -Uri $response.url -Method PUT -InFile "path\to\test-image.jpg" -ContentType "image/jpeg"
```

### 3.2 GET署名URL取得（ダウンロード用）

```powershell
$key = "uploads/20251028/abc123.jpg"
$getUrl = Invoke-RestMethod -Uri "http://localhost:4000/uploads/signed-get?key=$key&ttl=300" -Method GET

# レスポンス例:
# {
#   "url": "http://localhost:9000/talking-dev/uploads/20251028/abc123.jpg?X-Amz-Signature=..."
# }

# ブラウザで開く、または
Start-Process $getUrl.url
```

---

## 4. Asset 作成（Finalize）

```powershell
$assetBody = @{
    key = "uploads/20251028/abc123.jpg"
    title = "テスト画像"
    description = "サムネイル生成テスト"
    tags = @("test", "image")
    contentType = "image/jpeg"
    size = 123456
} | ConvertTo-Json

$asset = Invoke-RestMethod -Uri "http://localhost:4000/assets" -Method POST -Headers $headers -Body $assetBody

# レスポンス例:
# {
#   "id": "cm3abc123",
#   "key": "uploads/20251028/abc123.jpg",
#   "title": "テスト画像",
#   "ownerId": "user-uuid",
#   "thumbKey": null,  # ← Worker 処理後に更新される
#   ...
# }
```

**確認ポイント**:
1. Worker ログに `Processing thumbnail for asset cm3abc123` 表示
2. 数秒後に `Thumbnail created for asset cm3abc123: thumbs/abc123-cm3abc123.webp` 表示
3. MinIO に `thumbs/` 以下にサムネイル生成確認

---

## 5. 自分の投稿一覧取得

```powershell
# GET /assets/mine（ログイン必須）
$myAssets = Invoke-RestMethod -Uri "http://localhost:4000/assets/mine?limit=10" -Method GET -Headers $headers

# レスポンス例:
# {
#   "items": [
#     {
#       "id": "cm3abc123",
#       "title": "テスト画像",
#       "thumbKey": "thumbs/abc123-cm3abc123.webp",
#       "ownerId": "user-uuid",
#       ...
#     }
#   ],
#   "nextCursor": null
# }
```

---

## 6. Asset 詳細取得

```powershell
# GET /assets/:id（未ログインでも可）
$detail = Invoke-RestMethod -Uri "http://localhost:4000/assets/cm3abc123" -Method GET

# thumbKey が存在する場合、署名付きURLで取得
$thumbUrl = Invoke-RestMethod -Uri "http://localhost:4000/uploads/signed-get?key=$($detail.thumbKey)" -Method GET
```

---

## 7. オーナー権限チェック（PATCH/DELETE）

### 7.1 本人による更新（成功）

```powershell
$updateBody = @{
    title = "更新後のタイトル"
    tags = @("updated", "test")
} | ConvertTo-Json

$updated = Invoke-RestMethod -Uri "http://localhost:4000/assets/cm3abc123" -Method PATCH -Headers $headers -Body $updateBody
```

### 7.2 他人による更新（403エラー）

```powershell
# 別ユーザーのトークンで試行
$otherToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
$otherHeaders = @{ "Authorization" = "Bearer $otherToken" }

try {
    Invoke-RestMethod -Uri "http://localhost:4000/assets/cm3abc123" -Method PATCH -Headers $otherHeaders -Body $updateBody
} catch {
    # Expected: 403 Forbidden - "You do not own this asset"
    $_.Exception.Response.StatusCode  # 403
}
```

### 7.3 削除（本人のみ）

```powershell
Invoke-RestMethod -Uri "http://localhost:4000/assets/cm3abc123" -Method DELETE -Headers $headers

# 確認: MinIO から key と thumbKey が削除される
# 確認: Meilisearch からドキュメント削除される
```

---

## 8. Meilisearch 検索確認

```powershell
# Meilisearch 直接クエリ
$meiliHeaders = @{
    "Authorization" = "Bearer masterKey123"
    "Content-Type" = "application/json"
}

$searchBody = @{
    q = "テスト"
    limit = 10
} | ConvertTo-Json

$searchResult = Invoke-RestMethod -Uri "http://localhost:7700/indexes/assets/search" -Method POST -Headers $meiliHeaders -Body $searchBody

# hits に更新されたアセットが含まれることを確認
```

---

## 9. フロントエンド統合テスト

### 9.1 公開ギャラリー（未ログインOK）

1. `http://localhost:3000/assets` にアクセス
2. カードに `thumbKey` 優先で表示
3. TTL切れ時に自動再取得（composable の `useSignedUrl` で実装）

### 9.2 マイアセット（ログイン必須）

1. `http://localhost:3000/my/assets` にアクセス
2. 自分の投稿のみ編集/削除ボタン表示
3. 他人の投稿にはボタンなし

---

## 10. 受け入れ条件（AC）確認

- [x] `pnpm dev:all` で API(4000)/Web(3000)/Worker が起動
- [x] 公開ギャラリー `/assets` は未ログインでも閲覧可
- [x] カードは `thumbKey` 優先で表示、TTL切れ時に自動再取得
- [x] `/my/assets` はログイン必須、他人の投稿には編集/削除ボタンなし
- [x] API は HS256/JWT を検証、オーナー以外の `PATCH/DELETE` は 403
- [x] Meili が起動時に検索/フィルタ実行可能

---

## トラブルシューティング

### Worker がジョブを処理しない

```powershell
# Redis 接続確認
docker exec -it talking-redis redis-cli
127.0.0.1:6379> PING
PONG

# キュー確認
127.0.0.1:6379> KEYS bull:thumbnails:*
```

### サムネイル生成失敗

```powershell
# Worker ログ確認
# sharp のエラーが出る場合は画像形式を確認
# WebP/AVIF 以外の形式（JPEG, PNG, GIF）でテスト
```

### JWT 検証失敗

```powershell
# .env の SUPABASE_JWT_SECRET が正しいか確認
# Supabase Dashboard > Settings > API > JWT Secret

# トークンのデコード確認（jwt.io）
```

---

## まとめ

この修正により、**最小差分**で以下を達成：

1. **画像アップロード時のサムネイル自動生成**（BullMQ ジョブ）
2. **Meilisearch の検索インデックス整合性向上**（全フィールド送信）
3. **仕様準拠の API エンドポイント完全実装**

**変更ファイル**: 2ファイル、計10行程度の追加  
**Conventional Commits**: `fix(api)`, `fix(worker)`  
**PR タイトル案**: `fix: enqueue thumbnail job on asset creation and improve Meili updates`
