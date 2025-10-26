# ハンドオフコンテキスト

> このテンプレートをコピーして、次のチャットセッションに貼り付けてください。

---

## 📅 日付

(例: 2025-10-26)

---

## 🎯 今日のゴール

(このセッションで達成したいことを 1-3 行で記載)

例:
- アセット一覧画面にタグフィルタを追加
- MinIO の署名付き URL で GET/PUT を実装

---

## 📸 現在の状態

(画面のスクリーンショット or 動作状況を記載)

例:
- 画面: http://localhost:3000/assets で一覧表示は OK
- API: http://localhost:4000/health で Healthy 確認済み
- スクリーンショット: (URL or 添付)

---

## ✅ 直近の変更

(編集したファイル・追加した機能を箇条書き)

例:
- `apps/frontend/pages/assets/index.vue`: タグ選択 UI 追加
- `apps/api/src/assets/dto/query-assets.dto.ts`: tags フィールド追加
- `apps/api/src/assets/assets.service.ts`: タグフィルタロジック実装 (未完了)

---

## ⚠️ 既知の問題

(未解決のバグ・警告・TODO を記載)

例:
- tags でフィルタしても全件返ってくる → Prisma クエリが未実装
- 型エラー: `AssetsService.findAll()` の戻り値が `any` になっている

---

## 🚀 次の一手

(次にやるべきことを優先順位付きで記載)

例:
1. `AssetsService.findAll()` で tags クエリを Prisma に反映
2. Frontend でタグフィルタ動作確認
3. 型エラー修正 (型定義を追加)

---

## 🔗 参考リンク

(PR, Issue, CI, スクリーンショットの URL)

例:
- PR: https://github.com/org/repo/pull/123
- Issue: https://github.com/org/repo/issues/42
- スクリーンショット: (URL)

---

## 📝 メモ

(その他、気づいたこと・注意点)

例:
- MinIO の CORS 設定は `cors.json` で管理 (再起動時に再設定不要)
- Prisma の型生成は `pnpm prisma generate` で手動実行が必要

---

## 決定事項 (ADR に記録済み)

(このセッションで決めた重要な設計判断)

例:
- ADR-0003: タグは配列型で保存 (正規化しない方針)
- ADR-0004: フィルタは AND 条件 (すべてのタグを含む)
