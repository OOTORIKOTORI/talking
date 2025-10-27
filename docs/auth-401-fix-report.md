# 401 一掃パック - 実施完了レポート

**ブランチ**: `fix/auth-401-supabase-sync`  
**実施日**: 2025年10月27日  
**コミット数**: 3件

## 実施した修正

### ✅ 1. フロント $fetch プラグインの安定化
**ファイル**: `apps/frontend/plugins/api-auth.client.ts`  
**コミット**: `359c83a - fix(frontend): ensure Authorization header via Headers and refresh on 401`

**変更内容**:
- Authorization ヘッダーを `Headers` オブジェクト経由で設定し、型安全性を確保
- 401エラー時に `refreshSession()` を実行してトークン更新を試みる
- リフレッシュ失敗時は `/login` へリダイレクト

**効果**:
- `@ts-ignore` による型無視を削除し、安全なヘッダー設定を実現
- トークン期限切れ時の自動回復機能を追加

---

### ✅ 2. Supabase Guard のデバッグログ強化
**ファイル**: `apps/api/src/auth/supabase-auth.guard.ts`  
**コミット**: `134e327 - chore(api): add debug logs for Supabase JWT verification`

**変更内容**:
- `decodeJwt` を import し、署名検証前にトークンの `iss` / `aud` / `sub` をログ出力
- JWKS URL と Authorization ヘッダーの有無をログ出力
- エラー原因の詳細をログに記録

**効果**:
- 401エラーの原因を迅速に特定可能
- プロジェクト不一致などの設定ミスをすぐに発見できる

---

### ✅ 3. 包括的な認証セットアップガイド作成
**ファイル**: `docs/auth-setup.md`  
**コミット**: `ce23a7f - docs: add comprehensive Supabase auth setup guide`

**内容**:
- Supabase プロジェクト一致の重要性を強調
- フロントエンドとバックエンドの `.env` 設定手順
- 401エラーのトラブルシューティング手順
- よくあるエラーとその解決方法
- 開発モード（認証スキップ）の説明

**効果**:
- 新規開発者でもスムーズに認証を設定可能
- トラブル発生時の自己解決を支援

---

## 動作確認方法

### 1. 環境変数の確認
```bash
# フロント
apps/frontend/.env の SUPABASE_URL を確認

# API
apps/api/.env の SUPABASE_JWKS_URL を確認
→ 両方が同じプロジェクトを参照していること
```

### 2. アプリケーション起動
```bash
pnpm dev:all
```

### 3. ブラウザでテスト
1. `/login` でログイン
2. `/my/assets` にアクセス → **200 OK** で自分の投稿が表示される
3. DevTools の Network タブで `Authorization: Bearer ...` ヘッダーを確認

### 4. API ログで確認
```
[SupabaseAuthGuard] JWKS URL: https://xxxxx.supabase.co/auth/v1/.well-known/jwks.json
[SupabaseAuthGuard] Auth header: present
[SupabaseAuthGuard] Token iss: https://xxxxx.supabase.co/auth/v1 aud: authenticated sub: xxxxx
[SupabaseAuthGuard] Auth successful: user@example.com
```

---

## チェックリスト（実施前に確認）

- [x] ブランチ `fix/auth-401-supabase-sync` を作成
- [x] フロントのプラグインを修正（Headers 経由 & 401リフレッシュ）
- [x] API の Guard にデバッグログを追加
- [x] 認証セットアップガイドを作成
- [ ] `.env` ファイルで同じ Supabase プロジェクトを設定（ユーザー作業）
- [ ] アプリケーションを起動して動作確認（ユーザー作業）
- [ ] 401エラーが解消されたことを確認（ユーザー作業）

---

## 次のステップ

1. **環境変数の設定**
   - `docs/auth-setup.md` を参照して、フロントとAPIの `.env` を設定
   
2. **動作確認**
   - `pnpm dev:all` で起動
   - `/my/assets` や `/upload` にアクセスして 401 が出ないことを確認

3. **本番環境への適用**
   - `.env.production` でも同様に設定
   - 環境変数が正しく参照されることを確認

---

## トラブルシューティング

もし 401 が依然として発生する場合：

1. **API のログを確認**
   ```
   [SupabaseAuthGuard] JWKS URL: ...
   [SupabaseAuthGuard] Auth header: ...
   [SupabaseAuthGuard] Token iss: ...
   ```

2. **ブラウザのコンソールでトークン確認**
   ```javascript
   const supa = useSupabaseClient()
   const { data: { session } } = await supa.auth.getSession()
   console.log('Token:', session?.access_token)
   ```

3. **トークンを jwt.io でデコード**
   - `iss` が API の JWKS URL と同じドメインか確認

詳細は `docs/auth-setup.md` を参照してください。

---

**作成者**: GitHub Copilot  
**レビュー推奨**: 環境変数設定後の動作確認
