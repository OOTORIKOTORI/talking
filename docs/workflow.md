# 開発ワークフロー

## ブランチ戦略

### ブランチ命名規則

```
<type>/<short-description>
```

**Type 一覧:**

- `feat/` : 新機能 (例: `feat/tag-ui`)
- `fix/` : バグ修正 (例: `fix/upload-cors`)
- `docs/` : ドキュメント更新 (例: `docs/add-handoff`)
- `chore/` : ビルド・設定変更 (例: `chore/update-deps`)
- `refactor/` : リファクタリング (例: `refactor/extract-composable`)
- `test/` : テスト追加 (例: `test/assets-service`)

### ブランチ運用

1. `main` から新しいブランチを切る
2. 作業完了後に `main` へ PR
3. レビュー後にマージ (Squash Merge 推奨)

---

## Conventional Commits

コミットメッセージは以下の形式に従ってください:

```
<type>(<scope>): <subject>

<body (optional)>

<footer (optional)>
```

**例:**

```
feat(assets): タグ機能を追加

アセットに複数のタグを付与できるように実装。
検索時にタグでフィルタリング可能。

Closes #42
```

```
fix(uploads): CORS エラーを修正

MinIO の CORS 設定を cors.json で定義し、
署名付き PUT が成功するように変更。
```

```
docs: ハンドオフ手順を追加
```

**Type 一覧:**

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `chore`: ビルド・設定
- `refactor`: リファクタリング
- `test`: テスト追加
- `perf`: パフォーマンス改善
- `ci`: CI/CD 設定

---

## Pull Request チェックリスト

PR を作成する際は以下を確認してください:

### コード品質

- [ ] `pnpm lint` が通る (各 app で実行)
- [ ] `pnpm typecheck` が通る
- [ ] `pnpm test` が通る
- [ ] `pnpm build` が通る
- [ ] `pnpm postbuild` (meta-check) が通る
- [ ] 型エラーがない (TypeScript)

### 動作確認

- [ ] ローカルで `pnpm dev:all` が正常起動
- [ ] 変更箇所が期待通り動作
- [ ] 既存機能が壊れていない (リグレッションテスト)

### ドキュメント

- [ ] README や docs の更新が必要な場合は反映済み
- [ ] コード内のコメントが適切
- [ ] UI 変更時：用語統一（公開ギャラリー/アセット管理）を確認

### PR 記述

- [ ] 目的と変更内容を明記
- [ ] スクリーンショット or デモ動画 (UI 変更の場合)
- [ ] 関連 Issue を記載 (`Closes #123`)

---


## CI/CD 方針

### pnpm / lockfile の運用
- CI は `pnpm install --frozen-lockfile`。**package.json と pnpm-lock.yaml の乖離を許容しない**
- 新規モジュール追加/削除時は **lockfile の差分もコミット必須**
- `@nuxt/icon` は modules で使う。SFCでの直接importはしない

### CI チェック項目

- **lint**: ESLint による静的解析
- **typecheck**: TypeScript 型チェック
- **test**: ユニット・統合テスト
- **build**: 全アプリケーションのビルド確認
- **postbuild**: メタデータチェック（meta-check）
- **smoke:og**: OG画像生成のスモークテスト
- **ci:guards**: ガード・認可ロジックのテスト
- **LHCI**: Lighthouse CI（パフォーマンス計測）

### 基本方針

- **Lint & Type Check**: PR 時に自動実行
- **Build**: `pnpm build` で全アプリケーションがビルドできることを確認
- **Deploy**: (将来) main へのマージ時に自動デプロイ

### `pnpm approve-builds` の扱い

型チェックが厳しすぎる場合、一時的に `pnpm approve-builds` でビルドを通すことがあります。ただし、以下のルールを守ってください:

- PR に「型エラーを残す理由」を明記
- Issue を作成して後で修正する
- 極力使わない (型安全性が低下するため)

---

## レビュー方針

### レビュアー向け

- コードの意図を理解してから指摘
- 「なぜこの実装か?」を確認
- 小さな修正はマージ後でも OK (ブロックしない)

### レビュイー向け

- PR は小さく分割 (300行未満が目安)
- 「なぜこの変更が必要か?」を PR 本文に記載
- CI が通ってからレビュー依頼

---

## デイリータスク

```powershell
# 1. 最新コードを取得
git pull origin main

# 2. 依存更新 (package.json 変更時)
pnpm install

# 3. DB マイグレーション (schema.prisma 変更時)
cd apps/api
pnpm prisma migrate dev

# 4. 開発サーバー起動
pnpm dev:all
```

---

## マージ後の作業

```powershell
# main に戻る
git checkout main
git pull origin main

# 使い終わったブランチを削除
git branch -d feat/my-feature
git push origin --delete feat/my-feature
```
