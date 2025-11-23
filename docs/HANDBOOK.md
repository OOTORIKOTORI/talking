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

<!-- impl: apps/frontend/components/game/StageCanvas.vue, MessageWindow.vue -->
## メッセージウィンドウ規約

- ステージ描画は `StageCanvas.vue` を**唯一のソース・オブ・トゥルース**とする。  
  通常 / 全画面 / プレイヤ すべてが同一座標系（％）・同一スケール式で描画。
- メッセージウィンドウはステージ幅 `--stage-w` に比例して角丸・余白・フォントサイズをスケーリング。
- レイヤ順は **背景 < キャラ < メッセージウィンドウ**。`.mw { z-index: 100 }` を基準とする。

<!-- impl: apps/frontend/components/game/MessageWindow.vue, themeUtils.ts -->
**プリセット優先の原則**:
- 標準設定では **1〜10段階のプリセット** を使用。px直指定は「上級設定」に格納し、非エンジニア向けUIでは非推奨とする
- フォントサイズ・余白・角丸・枠線・影・タイプ速度は**すべてプリセット**で統一
- 色は RGBA ピッカー + HEX/RGBA 手入力 + プリセットパレット
- 実装根拠: `apps/frontend/components/game/MessageThemeModal.vue`, `apps/frontend/utils/themeUtils.ts`

**スケールの統一原則**:
- 通常表示・全画面・テストプレイは **同一の相対バランス** で見えること
  - `useStageScale` で実高さpx (`--stage-h-px`) をCSS変数に流し、`clamp()` でフォントサイズを算出
  - 基準は 720px、min 12px、max 28px
  - 実装根拠: `apps/frontend/composables/useStageScale.ts`, `apps/frontend/components/game/MessageWindow.vue`

**スクロール禁止の原則**:
- メッセージ本文は **スクロール禁止**。`rows` で指定した行数を `-webkit-line-clamp` / `line-clamp` で固定
- 行数を超えるテキストは省略（実運用では台詞を分割して次ノードへ）
- 実装根拠: `apps/frontend/components/game/MessageWindow.vue`

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

<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue, apps/frontend/components/game/NodePicker.vue -->
**エディタ UX の原則**:

- 右ペインは **通常/全画面** をトグル可能。両モードで**同一座標系**（％）を守り、見た目差分を最小化する。
  - 全画面時は左にステージ（最大72vh、16:9維持）、右にフォーム（360〜440px）を2カラム配置
  - 実装根拠: `apps/frontend/pages/my/games/[id]/edit.vue`

- ピッカーは「**自分の◯◯ / お気に入り**」タブ + 検索を共通 UX とする（Asset/Character/CharacterImage）。

- 「開始ノードに設定」ボタンで PATCH `/games/scenes/:id` に `{ startNodeId }` を送信。  
  保存後はローカル状態を即座に更新。

<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue, apps/frontend/components/game/NodePicker.vue -->
**次ノード選択の原則**:
- 「次ノード」選択は **NodePicker** を既定とし、ID直入力は補助手段とする
- NodePicker の候補リストには **Scene番号 / #ノード番号 / 台詞冒頭（20文字）** を表示
- 次ノードID欄は `tabindex="0"` でフォーカス可能。**Ctrl/⌘+K** で即起動
- 実装根拠: `apps/frontend/components/game/NodePicker.vue`, `apps/frontend/pages/my/games/[id]/edit.vue`

<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue (saveAndCreateNext) -->
**連続作成の原則**:
- 連続ノード作成は **「保存して次のノードへ」** を用いる
  - ショートカット: **Ctrl/⌘+Enter**
  - コピー項目（背景/キャラ/BGM/カメラ）は LocalStorage に永続化
- 連打防止: `saving` ref で保存中は無効化
- 失敗時の挙動: トーストでエラー表示、ノード一覧は更新しない
- 実装根拠: `apps/frontend/pages/my/games/[id]/edit.vue`

<!-- impl: apps/frontend/components/game/MessageThemeModal.vue -->
**全体設定（メッセージテーマ）の原則**:
- 「シナリオ全体設定」はモーダルで編集し、**通常・全画面プレビューが一致する**ことをQAの合格条件とする
- 保存は `PATCH /games/:id` に `{ messageTheme, themeVersion: 2 }` を送信
- エラー時：HTTPステータスとメッセージをトースト表示（例: `保存エラー (400): ...`）
- 成功時：`saved` イベントで親の `game.messageTheme` を即時反映
- 実装根拠: `apps/frontend/components/game/MessageThemeModal.vue`

- 音声同意：初回再生時のみオーバーレイ表示。承諾後はBGM自動再生を試行、失敗時はユーザー操作で再試行可能。

---

### ChangeLog (chat handover)

- 2025-11-02: タブUI共通化、拡大操作、並び替え・`sortOrder` の規約化。`$api` 経由・署名URL JSON 経由・楽観更新を明文化。CI lockfile ポリシーを追記。
- 2025-11-04: ゲーム制作（β）実装規約を追加。署名 URL 必須、portraits scale の暫定互換、カメラ JSON 仕様、エディタ UX（通常/全画面トグル、ピッカー共通 UX）を明文化。
