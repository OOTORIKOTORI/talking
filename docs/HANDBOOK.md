# HANDBOOK（恒久規約）

実装の方針を支える恒久規約。コード変更があっても原則として守るべきルールをまとめます（各項の根拠ソースを併記）。

## UI 規約

- タブ UI の共通化
  - 「アセット｜キャラクター」のタブは共通コンポーネントを利用する。
  - コンポーネント: `apps/frontend/components/common/SectionTabs.vue`
- 画像の拡大表示
  - 画像は「クリックでのみ」拡大モーダルを開く。フォーム操作では開かない。
  - コンポーネント: `apps/frontend/components/common/ImageLightbox.vue`
- 立ち絵カードの並びと編集
  - 新規追加した画像は末尾に追加（最大の `sortOrder` + 1）。
  - 並び替えはドラッグ＆ドロップで行い、`sortOrder` を 0..N-1 に再採番して保存。
  - `sortOrder` は値が小さいほど先頭に表示。
  - 実装根拠: `apps/frontend/pages/my/characters/[id].vue`

## コーディング規約

- API 呼び出しは `$api` を経由する
  - 認証ヘッダ付与と 401 時の自動リフレッシュ/再試行を行う。
  - 根拠: `apps/frontend/plugins/api-auth.client.ts`, `apps/frontend/composables/useApi.ts`
- 署名URLは JSON を経由
  - 署名GETは `GET /uploads/signed-get?key=...` が JSON `{ url }` を返す。得られた URL を `<img src>` に適用する。
  - 根拠: `apps/api/src/uploads/uploads.controller.ts#getSignedGetUrl`, `apps/frontend/composables/useSignedUrl.ts`
- お気に入り（♡）は楽観更新＋失敗時ロールバック
  - アセット/キャラともにトグル時は UI を即時反映し、API 失敗時に元へ戻す。
  - 根拠: `apps/frontend/composables/useFavoriteToggle.ts`, `apps/frontend/composables/useFavoriteToggleCharacter.ts`

## CI 規約

- Lockfile厳格モード
  - CI は `pnpm install --frozen-lockfile` を前提とし、依存追加時は `pnpm-lock.yaml` もコミットする。

---

### ChangeLog (chat handover)

- 2025-11-02: タブUI共通化、拡大操作、並び替え・`sortOrder` の規約化。`$api` 経由・署名URL JSON 経由・楽観更新を明文化。CI lockfile ポリシーを追記。
