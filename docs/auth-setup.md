# Supabase 認証セットアップガイド

## 認証方式（最終仕様）

このプロジェクトでは **Supabase Auth + HS256/JWT Secret 検証** を使用します。

- **フロントエンド**: `@supabase/supabase-js` で Email/Password 認証
- **API**: Nest Guard が `SUPABASE_JWT_SECRET` で `Authorization: Bearer` を検証

---

## 設定手順

### 1. Supabase プロジェクトを作成

1. https://app.supabase.com にログイン
2. **New Project** を作成
3. Project → **Settings → API** を開く

### 2. API 設定値を確認

以下の値をコピーしておきます:

- **Project URL**: `https://<your-project-ref>.supabase.co`
- **anon (public) key**: `eyJhbGc...`（公開鍵）
- **JWT Secret**: `your-jwt-secret-here`（**API 側で使用**）

### 3. フロントエンド（Nuxt）の設定

`apps/frontend/.env` に以下を設定:

```env
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_KEY=eyJhbGc...  # anon public key
NUXT_PUBLIC_API_BASE=http://localhost:4000
```

### 4. バックエンド（Nest API）の設定

`apps/api/.env` に以下を設定:

```env
# Supabase Auth (HS256 JWT 検証)
SUPABASE_JWT_SECRET=your-jwt-secret-here
```

> **重要:** `SUPABASE_JWT_SECRET` は Supabase ダッシュボード → Settings → API → **JWT Secret** からコピーしてください。

### 5. 起動して確認

```powershell
pnpm dev:all
```

1. http://localhost:3000 にアクセス
2. ログイン（Supabase Auth UI）
3. `/my/assets` にアクセスして **200 OK** になることを確認

---

## よくあるエラー

### ❌ 401 Unauthorized（署名検証失敗）

**原因:**
- `SUPABASE_JWT_SECRET` が別プロジェクトの値、または typo

**解決策:**
1. Supabase ダッシュボードで JWT Secret を再確認
2. `apps/api/.env` を修正
3. API を再起動（`pnpm --filter api dev`）

### ❌ 401（期限切れ）

**原因:**
- JWT のトークンが有効期限切れ

**解決策:**
- `$api` が自動で refresh → 再試行を行います（`apps/frontend/plugins/api-auth.client.ts`）
- それでも 401 が続く場合は再ログイン

### ❌ 403 Forbidden（所有者不一致）

**原因:**
- 他人のアセットに `PATCH/DELETE` を実行した

**解決策:**
- 仕様どおり。自分のアセットのみ編集・削除可能です。

---

## デバッグ手順

### 1. ブラウザコンソールでトークン確認

```javascript
const supa = useSupabaseClient()
const { data: { session } } = await supa.auth.getSession()
console.log('Token:', session?.access_token)
```

### 2. トークンのペイロードをデコード

https://jwt.io にトークンを貼り付けて確認:

- `iss` (issuer): `https://<your-project-ref>.supabase.co/auth/v1`
- `aud` (audience): `authenticated`
- `sub`: ユーザーID

### 3. API のログを確認

API 起動時に以下のログが出ます:

```
[SupabaseAuthGuard] Auth successful: user@example.com
```

401 の場合は:

```
[SupabaseAuthGuard] JWT verification failed: signature verification failed
```

---

## 🔴 最重要：プロジェクト一致の確認

**フロントとAPIで異なるSupabaseプロジェクトを参照すると、JWT署名検証が失敗して401エラーになります。**

- Frontend の `SUPABASE_URL` と API の `SUPABASE_JWT_SECRET` が**同一プロジェクト**のものであることを確認してください。

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
