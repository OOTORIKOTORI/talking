# タスク指示テンプレート

> AI にタスクを依頼する際のテンプレートです。コピーして使ってください。

---

## 基本形式

```markdown
# モード: 直接編集 (Workspace Edits)
- 変更はワークスペースに直接適用。ファイル本文をチャットに長文出力しない。
- 実行後は「作成/変更したファイル一覧」と簡単な要約だけを出力。
- 既存構成は尊重し最小差分。不要なリネームはしない。

# 目的
(何を実現したいか 1-2 行で)

# 変更範囲
(影響するファイル・モジュールを列挙)
- Frontend: `apps/frontend/pages/xxx.vue`
- API: `apps/api/src/xxx/xxx.service.ts`
- Shared: `packages/types/src/xxx.ts`

# 要求
(具体的な要件を箇条書き)
- 機能A を追加
- UI は X のようにする
- API は Y を返す

# 完了条件
(どうなれば完了か)
- 型エラーなし
- `pnpm dev:all` で正常起動
- スクリーンショットで動作確認
```

---

## 例 1: 新機能追加

```markdown
# モード: 直接編集

# 目的
アセット詳細画面にコメント機能を追加

# 変更範囲
- Frontend: `apps/frontend/pages/assets/[id].vue`
- API: `apps/api/src/assets/assets.controller.ts`
- API: `apps/api/src/assets/assets.service.ts`
- DB: `apps/api/prisma/schema.prisma` (Comment モデル追加)

# 要求
- コメント一覧を表示 (投稿日時降順)
- コメント投稿フォーム (テキストエリア + 送信ボタン)
- API: `POST /api/assets/:id/comments` でコメント作成
- API: `GET /api/assets/:id/comments` でコメント一覧取得

# 完了条件
- Prisma マイグレーション成功
- 型エラーなし
- コメント投稿・一覧表示が動作
```

---

## 例 2: バグ修正

```markdown
# モード: 直接編集

# 目的
アップロード時の CORS エラーを修正

# 現象
- Frontend から MinIO へ PUT すると 403
- ブラウザコンソール: "CORS policy: No 'Access-Control-Allow-Origin' header"

# 推測原因
- MinIO の CORS 設定が不足
- `cors.json` の AllowedOrigins に localhost:3000 がない

# 対応方針
1. `cors.json` を確認・修正
2. MinIO 再起動手順を `docs/dev-setup.md` に追記
3. CORS 設定コマンドを README に記載

# 完了条件
- PUT が成功 (Network タブで 200 OK)
- ドキュメント更新済み
```

---

## 例 3: リファクタリング

```markdown
# モード: 直接編集

# 目的
アセット一覧の Composable を分離

# 変更範囲
- Frontend: `apps/frontend/composables/useAssets.ts` (新規作成)
- Frontend: `apps/frontend/pages/assets/index.vue` (ロジック移動)

# 要求
- `useAssets()` Composable を作成
- `fetchAssets()`, `filteredAssets`, `loading` を Composable に移動
- `pages/assets/index.vue` は UI のみに専念

# 完了条件
- 型エラーなし
- 既存の動作が壊れていない
- コード量が減っている
```

---

## ヒント

### 目的は具体的に

❌ 「アセット機能を改善」  
✅ 「アセット一覧にページネーションを追加」

### 変更範囲を明示

ファイルパスを書くことで、AI が的確に編集できます。

### 完了条件を定義

「型エラーなし」「起動確認」「スクリーンショット」など、客観的な基準を設けましょう。
