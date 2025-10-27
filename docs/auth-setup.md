# Supabase 認証セットアップガイド

## 概要

このプロジェクトでは Supabase Auth を使用してユーザー認証を行います。  
フロントエンド（Nuxt）とバックエンド（Nest）が **同じ Supabase プロジェクト** を参照する必要があります。

## 🔴 最重要：プロジェクト一致の確認

**フロントとAPIで異なるSupabaseプロジェクトを参照すると、JWT署名検証が失敗して401エラーになります。**

### 確認方法

1. Supabase ダッシュボード（https://app.supabase.com）にログイン
2. プロジェクトを選択
3. Settings → API で以下を確認：
   - **Project URL**: `https://<project-ref>.supabase.co`
   - **Project API keys**: `anon public` キー

## セットアップ手順

### 1) フロントエンド（Nuxt）の設定

`apps/frontend/.env` ファイルを作成：

```bash
# Supabase Auth
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_KEY=eyJhbGc...  # anon (publishable) key

# その他
NUXT_PUBLIC_API_BASE=http://localhost:4000
NUXT_PUBLIC_MEILI_HOST=http://localhost:7700
NUXT_PUBLIC_MEILI_KEY=masterKey123
NUXT_PUBLIC_S3_PUBLIC_BASE=http://localhost:9000/talking-dev
```

### 2) バックエンド（Nest API）の設定

`apps/api/.env` ファイルを作成：

```bash
# Supabase Auth - フロントと同じプロジェクト！
SUPABASE_PROJECT_REF=<your-project-ref>  # 例: abcdefghijklmnopqrst
SUPABASE_JWKS_URL=https://${SUPABASE_PROJECT_REF}.supabase.co/auth/v1/.well-known/jwks.json

# または直接フルURL指定
# SUPABASE_JWKS_URL=https://<your-project-ref>.supabase.co/auth/v1/.well-known/jwks.json

# その他
PORT=4000
DATABASE_URL="postgresql://talking:talking@localhost:5432/talking?schema=public"
# ... (その他の設定)
```

> ⚠️ `<your-project-ref>` は必ずフロントの `SUPABASE_URL` と同じプロジェクトのものを使用してください。

## 401 エラーのトラブルシューティング

### チェックリスト

- [ ] フロント `.env` の `SUPABASE_URL` が正しいプロジェクトを指している
- [ ] API `.env` の `SUPABASE_JWKS_URL` が同じプロジェクトを指している
- [ ] `SUPABASE_PROJECT_REF` に `${}` などのテンプレート変数が残っていない
- [ ] ブラウザの Network タブで `/assets/mine` などのリクエストに `Authorization` ヘッダーが含まれている
- [ ] API のコンソールログで `[SupabaseAuthGuard] JWKS URL:` と `Auth header:` を確認

### デバッグ手順

1. **ブラウザコンソールでトークン確認**

```javascript
const supa = useSupabaseClient()
const { data: { session } } = await supa.auth.getSession()
console.log('Token:', session?.access_token)
```

2. **トークンのペイロードをデコード** (https://jwt.io で貼り付け)
   - `iss` (issuer) が `https://<your-project-ref>.supabase.co/auth/v1` になっているか確認
   - `aud` (audience) が `authenticated` になっているか確認

3. **API のログを確認**

```bash
# API を起動して、リクエスト時のログを確認
pnpm --filter api dev
```

ログに以下が表示されます：
```
[SupabaseAuthGuard] JWKS URL: https://xxxxx.supabase.co/auth/v1/.well-known/jwks.json
[SupabaseAuthGuard] Auth header: present
[SupabaseAuthGuard] Token iss: https://xxxxx.supabase.co/auth/v1 aud: authenticated sub: xxxxx
[SupabaseAuthGuard] Auth successful: user@example.com
```

### よくあるエラー

#### ❌ `JWT verification failed: signature verification failed`

**原因**: フロントとAPIで異なるSupabaseプロジェクトを参照している

**解決**: 両方の `.env` で同じプロジェクトを設定する

#### ❌ `Missing or invalid authorization header`

**原因**: フロントからAuthorizationヘッダーが送信されていない

**解決**: `apps/frontend/plugins/api-auth.client.ts` が正しく機能しているか確認

#### ❌ `Auth disabled (dev mode)`

**原因**: `SUPABASE_JWKS_URL` が設定されていないか、`${}` が残っている

**解決**: `.env` ファイルで `SUPABASE_PROJECT_REF` を実際の値に置き換える

## 開発モード（認証スキップ）

開発中、一時的に認証をスキップしたい場合：

`apps/api/.env` で `SUPABASE_JWKS_URL` を空にする：

```bash
# SUPABASE_JWKS_URL=  # コメントアウトまたは削除
```

この場合、すべてのリクエストが `dev-user-123` として扱われます。  
**本番環境では必ず有効にしてください。**

## 参考リンク

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Nuxt Supabase Module](https://supabase.nuxtjs.org/)
- [jose (JWT library)](https://github.com/panva/jose)
