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
- ステージ描画は `StageCanvas.vue` を**唯一のソース・オブ・トゥルース**とする。通常/全画面/プレイヤの全てが同一座標系（％）・同一スケール式で描画されること。
- メッセージウィンドウはステージ幅 `--stage-w` に比例して角丸/余白/フォントサイズがスケールする。レイヤ順は 背景 < キャラ < メッセージ窓 を原則とし、`.mw { z-index: 100 }` を基準とする。

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

## ゲーム制作（β）実装規約

- 画像/音声は **必ず署名 URL**（`/uploads/signed-get?key=...`）で取得する。直リンク禁止。フロントは `useAssetMeta().signedFromId()` を使う。
- `portraits[].scale` は「**ステージ高さに対する％**」。MiniStage の暫定互換として `>60 → 1/3` 近似あり（既存データの見た目保全）。将来は保存値の正規化を検討。
- カメラ JSON は `{ zoom(100–300), cx(0–100), cy(0–100) }` 固定。編集・保存は小数を避け、整数％で扱う。

## エディタ UX 規約

- 右ペインは **通常/全画面** をトグル可能。両モードで**同一座標系**（％）を守り、見た目差分を最小化する。
- ピッカーは「**自分の◯◯ / お気に入り**」タブ + 検索を共通 UX とする（Asset/Character/CharacterImage）。
- 次ノードの指定は NodePicker（モーダル）を既定とし、ID直打ちは補助とする。候補リストには Scene/Node 番号と台詞冒頭を表示する。
- 「シナリオ全体設定」（MessageTheme）はモーダルで編集し、通常/全画面プレビューの**両方**で見た目が一致することを QA の合格条件とする。
- 音声は初回のみ同意を得る。合意後は BGM の自動再生を試行し、失敗時は次のユーザー操作で再試行できる UI を提供する。

---

### ChangeLog (chat handover)

- 2025-11-02: タブUI共通化、拡大操作、並び替え・`sortOrder` の規約化。`$api` 経由・署名URL JSON 経由・楽観更新を明文化。CI lockfile ポリシーを追記。
- 2025-11-04: ゲーム制作（β）実装規約を追加。署名 URL 必須、portraits scale の暫定互換、カメラ JSON 仕様、エディタ UX（通常/全画面トグル、ピッカー共通 UX）を明文化。
