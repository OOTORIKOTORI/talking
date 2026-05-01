# PROJECT_SPEC（正準仕様）

本書は実装を根拠とした正準仕様です。記述は実装からの逆引きであり、推測は含みません（各所に出典ファイル/関数を明記）。

## ドメインモデル（実装準拠）

- Character（キャラクター）
  - フィールド: `id`, `ownerId`, `name`, `displayName`, `description?`, `isPublic`, `createdAt`, `updatedAt`, `deletedAt?`, `tags?: string[]`, `images?: CharacterImage[]`, `isFavorite?`
  - 出典: `packages/types/src/index.ts` の `export interface Character`
- CharacterImage（立ち絵画像単位）
  - フィールド: `id`, `characterId`, `key`, `thumbKey?`, `width?`, `height?`, `contentType`, `size?`, `emotion: CharacterEmotion`, `emotionLabel?`, `pattern?`, `sortOrder: number`, `createdAt`, `updatedAt`
  - 備考: 並び順プロパティ名は `order` ではなく `sortOrder`
  - 出典: `packages/types/src/index.ts` の `export interface CharacterImage`
- Emotion（列挙）
  - 値: `NEUTRAL | HAPPY | SAD | ANGRY | SURPRISED | FEAR | DISGUST | SHY | SLEEPY | THINKING | OTHER`
  - 日本語ラベル: `utils/characterLocales.ts` の `EMOTION_JP_LABEL` を正とする
    - 例: 自然体（NEUTRAL）/ 楽しい（HAPPY）/ 悲しい（SAD）/ 怒り（ANGRY）/ 驚き（SURPRISED）/ 恐れ（FEAR）/ 嫌悪（DISGUST）/ 照れ（SHY）/ 眠い（SLEEPY）/ 思案（THINKING）/ その他（OTHER）
  - 出典: 型は `packages/types/src/index.ts` の `export type CharacterEmotion`、日本語ラベルは `apps/frontend/utils/characterLocales.ts`

## UI / 画面仕様（実装準拠）

- タブナビ（共通）
  - 画面上部に「アセット｜キャラクター」タブを表示
  - 出典: `apps/frontend/components/common/SectionTabs.vue`
- 公開ギャラリー
  - パス: `/assets`（タブ: アセット｜キャラクター）
  - 検索/フィルタ: `q`, `contentType`, `primaryTag`, `tags`, `sort` をURLクエリに保持・復元
  - 出典: `apps/frontend/pages/assets/index.vue`（クエリ同期と検索）、`apps/frontend/composables/useAssets.ts`
- アセット管理
  - パス: `/my/assets`（タブ: アセット｜キャラクター）
  - 検索/フィルタ: 上記と同等のクエリ同期
  - 出典: `apps/frontend/pages/my/assets/index.vue`
- お気に入り
  - パス: `/my/favorites`（アセット）・`/my/favorites/characters`（キャラクター）
  - タブ: アセット｜キャラクター
  - 出典: `apps/frontend/pages/my/favorites/characters.vue`
- キャラクター
  - 一覧（公開）: `/characters`（タブ: アセット｜キャラクター）
    - クエリ同期: `q`, `tags`, `sort`
    - 出典: `apps/frontend/pages/characters/index.vue`
  - 詳細（公開）: `/characters/[id]`
    - 画像クリックで拡大モーダル
    - 出典: `apps/frontend/pages/characters/[id].vue`, `apps/frontend/components/common/ImageLightbox.vue`
  - マイ一覧: `/my/characters`
    - 出典: `apps/frontend/pages/my/characters/index.vue`
  - 新規作成: `/my/characters/new`
    - タブ `UploadTabs` を利用（「アセットをアップロード｜キャラクターを作成」）
    - 出典: `apps/frontend/pages/my/characters/new.vue`, `apps/frontend/components/common/UploadTabs.vue`
  - 編集: `/my/characters/[id]`
    - 立ち絵カードのレイアウト: 3カラム（md以上で3列）
    - 画像クリックで拡大モーダル（フォーム操作では開かない）
    - 編集可能フィールド: `emotion`（Enum選択＋`emotionLabel`自由ラベル）, `pattern`（任意文字列）, `sortOrder`（小さいほど先頭）
    - 新規アップロード画像は末尾に追加（最大の `sortOrder` + 1 を付与）
    - ドラッグ＆ドロップで入替、`sortOrder` を 0..N-1 に再採番して保存
    - 保存トースト／削除は取り消し可能トースト（5秒）
    - 出典: `apps/frontend/pages/my/characters/[id].vue`

## API と型（実装の出典）

- 型の出典
  - 共通型: `packages/types/src/index.ts`（`Asset`, `Character`, `CharacterImage`, `CharacterEmotion` など）
- 署名URL（GET/PUT）
  - GET（閲覧用）: `GET /uploads/signed-get?key=...&ttl=...` → JSON `{ url }`
    - 出典: `apps/api/src/uploads/uploads.controller.ts#getSignedGetUrl`
  - PUT（アップロード用）: `POST /uploads/signed-url` → 直PUTまたはフォームPOSTの情報
    - 出典: `apps/api/src/uploads/uploads.controller.ts#getSignedUrl`
- アセット（Favorites 含む）
  - 公開一覧: `GET /assets`、検索: `GET /search/assets`
    - 出典: `apps/frontend/composables/useAssets.ts`（`listPublic`, `searchMine`）と `apps/api/src/search/search.controller.ts`
  - お気に入り一覧: `GET /favorites`（配列は `normalizeAssetFavorite` で正規化）
  - お気に入り登録: `POST /assets/:id/favorite`
  - お気に入り解除: `DELETE /assets/:id/favorite`
    - 出典: フロント `apps/frontend/composables/useAssets.ts`（`listFavorites`, `favorite`, `unfavorite`, `applyFavorites`）/ サーバ `apps/api/src/favorites/*.ts`
- キャラクター
  - 公開一覧: `GET /characters`（`publicOnly` 省略時は公開のみ）
  - 公開詳細: `GET /characters/:id`
  - 作成: `POST /my/characters`
  - 取得（自分）: `GET /my/characters/:id`
  - 更新: `PATCH /my/characters/:id`
  - 削除: `DELETE /my/characters/:id`
  - 画像メタ追加: `POST /my/characters/:id/images`
  - 画像メタ更新: `PATCH /my/characters/:id/images/:imageId`
  - 画像削除: `DELETE /my/characters/:id/images/:imageId`
    - 出典: `apps/frontend/composables/useCharacters.ts` と `apps/api/src/characters/*.controller.ts`
  - お気に入り登録: `POST /characters/:id/favorite`
  - お気に入り解除: `DELETE /characters/:id/favorite`
  - お気に入り一覧（キャラ）: `GET /my/favorites/characters`
    - 出典: フロント `apps/frontend/composables/useCharacters.ts`（`favorite`, `unfavorite`, `listFavorites`）/ サーバ `apps/api/src/characters/character-favorites.*`

## お気に入り（Favorites）統一仕様

- 楽観的更新 → API 反映 → 失敗時ロールバック
  - 出典: アセット `apps/frontend/composables/useFavoriteToggle.ts`、キャラ `apps/frontend/composables/useFavoriteToggleCharacter.ts`
- 表示同期
  - 一覧フェッチ後に `applyFavorites()` で `isFavorited` を上書き
  - 出典: `apps/frontend/composables/useAssets.ts#applyFavorites`
- 返却データの表記ゆれを正規化
  - `normalizeAssetFavorite()` で `isFavorited` を付与（`isFavorite`/`favorited` 等を吸収）
  - 出典: `apps/frontend/composables/useAssets.ts#normalizeAssetFavorite`

## 検索 / フィルタ / URL 同期

- `/assets`（公開）と `/my/assets`（自分）
  - クエリ: `q`, `contentType`, `primaryTag`, `tags`, `sort` をURLに反映・復元
  - 出典: `apps/frontend/pages/assets/index.vue`, `apps/frontend/pages/my/assets/index.vue`, APIは `apps/api/src/search/search.controller.ts`
- `/characters`（公開一覧）
  - クエリ: `q`, `tags`, `sort` をURLに反映・復元
  - 出典: `apps/frontend/pages/characters/index.vue`

## サムネ / 署名URL 取扱

- 取得フロー: `GET /uploads/signed-get` で JSON `{ url }` を受け取り、`<img src>` に適用
  - 出典: `apps/frontend/composables/useSignedUrl.ts` と `apps/frontend/components/character/CharacterImageThumb.vue`
- TTL切れ時の再取得: 403 を検知して再署名を行うヘルパーあり
  - 出典: `apps/frontend/composables/useAutoRefreshUrl.ts`
- スケルトン表示: URL未取得時はプレースホルダ表示
  - 出典: `apps/frontend/components/character/CharacterImageThumb.vue`
- 直 fetch 禁止 / `$api` 経由
  - 認証トークン付与・401時の自動リトライ等を行う `$api` を使用
  - 出典: `apps/frontend/plugins/api-auth.client.ts`, `apps/frontend/composables/useApi.ts`

## 既知の落とし穴 & 対処

- 401/403
  - `$api` 経由で Authorization を付与。401時は Supabase のセッション更新→再試行
  - 出典: `apps/frontend/plugins/api-auth.client.ts`
- 署名URL TTL 切れ
  - 403 検知で再取得（`useAutoRefreshUrl`）、もしくは `useSignedUrl.refresh()` を呼ぶ
  - 出典: `apps/frontend/composables/useAutoRefreshUrl.ts`, `apps/frontend/composables/useSignedUrl.ts`
- CI `ERR_PNPM_OUTDATED_LOCKFILE`
  - `pnpm install --frozen-lockfile` を前提に lockfile（`pnpm-lock.yaml`）も必ずコミット

## テスト / E2E TODO（抜粋）

- ♡トグル（アセット/キャラ）：楽観更新とロールバックの確認
- 署名GET再取得：403後の自動再取得
- キャラクター編集：並び替えD&D、`sortOrder` 保存、削除の取り消しトースト
- アップロード一連：PUT 署名→登録→サムネ表示

---

## ゲーム制作（β）仕様

### 目的
Talking 上で"シーン→ノード"の順にテキスト/演出を組み立て、プレビューしながら ADV 風ゲームを制作できる。

### ルーティング / 画面
- **エディタ**: `/my/games/:id/edit`
  - 左:シーン一覧、中央:ノード一覧、右:プロパティ(プレビュー含む)
  - 右ペインは「通常表示 / 全画面」をトグル(UI: *全画面 / 通常表示*, F で切替・Esc で閉じる)
  - ステージは 16:9 比率で **StageCanvas** に統一。通常・全画面・テストプレイすべてで**同一スケール・比率**で描画（`useStageScale` で実高さpxをCSS変数 `--stage-h-px` に流し、フォント・余白を clamp() でスケール）
  - **「シナリオ全体設定」**ボタンから**メッセージウィンドウテーマ**を編集可能
    - 背景色・枠線・角丸・余白・名前帯表示・文字色・文字サイズ・行間・タイプ速度を含む
  - ノード編集欄では「開始ノードに設定」ボタンでシーンの `startNodeId` を更新
  - 「次ノード」は **NodePicker（モーダル＋検索・冒頭プレビュー付き）** から選択（キーボード操作・詳細プレビューは今後拡張）

<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue, apps/frontend/components/game/NodePicker.vue -->
#### エディタのキーボードショートカット
- **Ctrl/⌘+Enter**: 「保存して次のノードへ」を実行（保存→新規作成→nextNodeId連結→遷移、`saving` 状態で連打防止）
- **Ctrl/⌘+K**: 次ノードID欄にフォーカス中に NodePicker を即起動（既存の選択処理と統合）
- **F**: プロパティペインの全画面⇔通常表示を切替
- **Esc**: 全画面プロパティペインを閉じる

- **テストプレイ**: `/games/:id/play`
  - クエリ `?sceneId=&nodeId=` を受け取り、指定がない場合は **scene.startNodeId → 先頭ノード**の順で自動補完
  - 初回は **音声同意オーバーレイ**を表示。クリックで `AudioContext.resume()` を呼び出し、BGM自動再生を試みる（失敗時は次の操作で再試行）
  - ノードに `sfxAssetId` が設定されている場合、そのノードへ遷移したタイミングで効果音(SE)を1回再生する
  - 効果音(SE)の再生も音声同意(`audioConsent`)に従う。BGMまたは効果音のいずれかが存在する場合は、初回に音声同意オーバーレイを表示する
  - フルスクリーン化してもノード状態は維持される
  - **カメラ（zoom/cx/cy）は StageCanvas に反映**され、背景とキャラクターに拡大・パン変換を適用（メッセージウィンドウは拡大しない）
  - **セリフ継続表示**: `continuesPreviousText` が true のノードでは、前ノードのテキストを消さずに残し、現在のノードのテキストを追加表示する。連続する継続フラグを遡って累積表示する（会話の流れを維持したまま演出可能）

### ドメイン / モデル(Prisma 正)
- `GameProject { id, ownerId, title, summary?, messageTheme Json?, deletedAt? ... }`
  - `messageTheme`: メッセージウィンドウテーマ設定（後述）
- `GameScene { id, projectId(FK), name, order, startNodeId String?, createdAt, updatedAt }`
  - `startNodeId`: シーン開始ノードID（テストプレイ初期位置に使用）
- `GameNode  { id, sceneId(FK), order, text, speakerCharacterId?, speakerDisplayName?, bgAssetId?, musicAssetId?, sfxAssetId?, portraits Json?, camera Json?, cameraFx Json?, continuesPreviousText Boolean?, createdAt, updatedAt }`
  - `continuesPreviousText`: 前ノードのセリフを消さずに継続表示するフラグ（省略時 false）。true の場合、このノードのテキストを前ノードのテキストに追加して表示する。エディタでは「前ノードのセリフを消さずに続ける」チェックボックスで設定。
- `GameChoice { id, nodeId(FK), order, label, nextNodeId? }`

#### Node.camera JSON
```ts
type Camera = { zoom: number /*100–300*/; cx: number /*0–100*/; cy: number /*0–100*/ }
// 既定: { zoom:100, cx:50, cy:50 }（％はステージ基準）
```

#### Node.cameraFx JSON（カメラ演出）

```ts
type Camera = { zoom: number; cx: number; cy: number }

type CameraPoint = {
  zoom?: number  // 100–300 (%)
  cx?: number   // 0–100 (%)
  cy?: number   // 0–100 (%)
}

type CameraFxMode = 'cut' | 'together' | 'pan-then-zoom' | 'zoom-then-pan'

type GameNodeCameraFx = {
  from?: CameraPoint    // ノード開始時のカメラ（省略時は前ノードの camera または現在カメラ）
  to?: CameraPoint      // ノード終了時のカメラ（省略時はこのノードの camera）
  durationMs?: number   // アニメーション時間(ms)。0 以下 or 未指定ではアニメなし
  mode?: CameraFxMode   // アニメの順序。省略時 'together'
}
```

* テストプレイでは、ノードに入ったタイミングで以下のルールでカメラを決定し、`StageCanvas` に反映する:
  * 開始カメラ:
    * `cameraFx.from` があればそれを使う（不足プロパティは前ノードの camera を補完）
    * なければ前ノードの camera（先頭ノードでは `{zoom:100,cx:50,cy:50}`）
  * 終了カメラ:
    * `cameraFx.to` があればそれを使う（不足プロパティはこのノードの camera を補完）
    * なければこのノードの `camera`

* `mode` / `durationMs` に応じて、ズームとパンを `requestAnimationFrame` で補間して動かす。
* `cameraFx` が未設定、`mode: "cut"`、`durationMs <= 0` の場合は、従来どおりカット切替。

※ UI では当面、from/to の詳細編集は行わず、「前ノード → このノード」のパターンに対するモードと時間を指定する簡易 UI を提供する。

**エディタでの設定**:
- 「カメラ演出」セクションで有効/無効をチェックボックスで切り替え
- モード選択: 「ズーム＋パン同時」「パン → ズーム」「ズーム → パン」「カット切替」
- アニメーション時間（ms）を数値入力（0以下または未設定でアニメなし）
- 通常表示・全画面表示の両方で設定可能

#### Node.portraits JSON（複数）
```ts
type Portrait = {
  characterId: string
  imageId: string
  thumb?: string
  x: number /*0–100*/      // ％: 左上(0,0) – 右下(100,100)
  y: number /*0–100*/      // ％: 立ち位置。MiniStage 側で translate(-50%,-100%)
  scale?: number /*%*/     // ステージ高さに対する％。MiniStage は >60 を 1/3 に近似（150→50）
  z?: number               // 前後関係。大きいほど手前
}
```

### アセットの扱い
- 画像/音声は **直リンク禁止**。必ず `/uploads/signed-get?key=...` を経由して取得（TTL 失効時は再署名）。
- フロントは `useAssetMeta().signedFromId()` を利用。
- 取得 UI:
  - AssetPicker: 「自分のアセット / お気に入り」タブ + 検索
  - CharacterPicker → CharacterImagePicker: キャラ→その画像を段階選択

### メッセージウィンドウ（全体設定）
<!-- impl: apps/frontend/components/game/MessageThemeModal.vue, apps/frontend/utils/themeUtils.ts -->
`MessageThemeModal.vue` で定義される共通テーマ。保存は `PATCH /games/:id` に `{ messageTheme }` を送信。

#### v2（プリセット中心の新仕様）
<!-- impl: packages/types/src/index.ts (MessageThemeV2, RGBA, FONT_K 等の定数), apps/frontend/utils/themeUtils.ts (resolveThemeV2, migrateToV2) -->
v2 では px 直指定から「1〜10段階のプリセット」中心へ移行。色はRGBA対応。既存データは自動でプリセットへ丸め込み。

```ts
interface MessageThemeV2 {
  themeVersion: 2;
  
  // 既存（継続）
  rows?: 1|2|3|4|5|6;          // 表示行数（既定3）
  scale?: 'sm'|'md'|'lg';       // ウィンドウサイズ（既定md、互換用）
  
  // 新プリセット（1〜10）
  fontPreset?: 1|...|10;        // 文字サイズ 既定5
  windowPreset?: 1|...|10;      // ウィンドウサイズ 既定6（md相当）
  paddingPreset?: 1|...|10;     // 内側余白 既定5
  radiusPreset?: 1|...|10;      // 角丸 既定5
  borderPreset?: 1|...|10;      // 枠線太さ 既定3
  shadowPreset?: 1|...|10;      // 影強度 既定4
  typeSpeedPreset?: 1|...|10;   // タイプ速度 既定6（1=ゆっくり、10=高速）
  
  // 色（RGBA or HEX string）
  frameBg?: RGBA | string;      // メッセージ枠背景
  frameBorder?: RGBA | string;  // 枠線色
  nameBg?: RGBA | string;       // 名前背景色
  textColor?: RGBA | string;    // 文字色
  
  // グラデーション
  gradientDirection?: 'none'|'to-b'|'to-t'|'to-r'|'to-l';  // グラデーション方向（既定 'none'）
  gradientColor?: RGBA | string;  // グラデーション終点色（方向が'none'以外の場合に使用）
  
  // フォントスタイル
  fontWeight?: 'normal'|'bold';   // フォント太さ（既定 'normal'）
  fontStyle?: 'normal'|'italic';  // フォントスタイル（既定 'normal'）
  
  // 旧値（fallback用、v1互換）
  frame?: {...};
  name?: {...};
  text?: {...};
  typewriter?: {...};
}

interface RGBA {
  r: number;  // 0-255
  g: number;  // 0-255
  b: number;  // 0-255
  a: number;  // 0-1
}
```

**プリセットテーブル（定数）**:
<!-- impl: packages/types/src/index.ts -->

| プリセット | 項目 | 値（index 1..10） | 意味 |
|---|---|---|---|
| `FONT_K` | 文字サイズ倍率 | [0, 0.70, 0.80, 0.90, 0.95, 1.00, 1.08, 1.16, 1.25, 1.35, 1.48] | 基準16px × 係数（既定5 = 1.00） |
| `PADDING_K` | 内側余白倍率 | [0, 0.70, 0.80, 0.90, 0.95, 1.00, 1.10, 1.20, 1.30, 1.40, 1.55] | 基準16px × 係数（既定5 = 1.00） |
| `RADIUS_PX` | 角丸（px） | [0, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24] | 絶対値（既定5 = 12px） |
| `BORDER_PX` | 枠線太さ（px） | [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 10] | 絶対値（既定3 = 2px） |
| `TYPE_MS` | タイプ速度（ms/文字） | [0, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15] | 1=ゆっくり、10=高速（既定6 = 35ms） |
| `WINDOW_PRESET` | ウィンドウサイズ | 各 `{ w, h, mb, mw }` | 1=小(84%), 6=標準(92%, md), 10=大(98%) |
| `SHADOW_PRESET` | 影強度 | [0, 'none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] | Tailwind影クラス（既定4 = 'md'） |

**フォントスケールの根拠**:
<!-- impl: apps/frontend/composables/useStageScale.ts, apps/frontend/components/game/MessageWindow.vue -->
- ステージの実高さpx (`--stage-h-px`) を基準に `clamp()` でフォントサイズを算出：
  - `font-size: clamp(12px, calc(16px * fontK * var(--stage-scale, 1)), 28px)`
  - `--stage-scale = var(--stage-h-px) / 720` （720pxを基準）
- 通常表示・全画面・テストプレイで**同一のバランス**で見えるよう設計

**行数とスクロール抑止**:
<!-- impl: apps/frontend/components/game/MessageWindow.vue -->
- `rows` で表示行数（1〜6）を指定。メッセージ本文は `-webkit-line-clamp` / `line-clamp` で固定高さに制限し、**スクロール禁止**

**色入力とプレビュー**:
<!-- impl: apps/frontend/components/game/MessageThemeModal.vue, ColorField.vue -->
- ColorField コンポーネントで RGB+Alpha ピッカー、HEX入力（#RRGGBB）、RGBA文字列入力、プリセットパレットを提供
- コントラスト比（WCAG基準）を計算し、閾値（4.5:1/3.0:1）を下回ると警告表示

**互換性**:
- 旧データ（v1）は読み込み時に `migrateToV2()` で自動変換
- px値から最寄りプリセットへ丸め（例: 文字16px → fontPreset=5）
- 保存時に `themeVersion: 2` を付与

**上級設定**:
- 折り畳みで px 直接入力も可能（上限値として動作、画面サイズに応じて自動調整）

**出典**:
- 型定義: `packages/types/src/index.ts` （`MessageThemeV2`, `RGBA`, プリセット定数）
- 編集UI: `apps/frontend/components/game/MessageThemeModal.vue`
- ユーティリティ: `apps/frontend/utils/themeUtils.ts` （変換・コントラスト計算）
- 描画: `apps/frontend/components/game/MessageWindow.vue`, `apps/frontend/components/game/StageCanvas.vue`

<!-- impl: apps/frontend/components/game/MessageThemeModal.vue -->
**保存処理の堅牢化**:
- `$api` は関数内で取得（`useNuxtApp()` をsave関数内で呼び出し）してSSR問題を回避
- `saving` ref で保存中状態を管理し、ボタンを無効化（連打防止）
- エラー時：HTTPステータスとメッセージをトーストで詳細表示（例: `保存エラー (400): フィールドが不正です`）
- 成功時：`saved` イベントで親に `messageTheme` を即時反映し、プレビューを更新

**API仕様**:
<!-- impl: apps/api/src/games/games.controller.ts, apps/api/src/games/games.service.ts -->
- **エンドポイント**: `PATCH /games/:id`
- **リクエストボディ**: `{ messageTheme: MessageThemeV2, themeVersion?: 2 }`
- **レスポンス**: 更新後のゲームオブジェクト（`messageTheme` を含む）
- **認可**: SupabaseAuthGuard（所有者のみ）
- **バリデーション**: JSON型として受理、色フィールドはRGBA/HEX文字列を許容

#### v1（旧仕様、互換維持）
```ts
interface MessageTheme {
  frame: { bg: string; borderColor: string; borderWidth: number; radius: number; padding: number };
  name: { show: boolean; bg: string; color: string; padding: number; radius: number };
  text: { color: string; size: number; lineHeight: number; fontPreset?: 1|...|10; rows?: 1|...|6 };
  typewriter: { msPerChar: number };
  scale?: 'sm'|'md'|'lg';
}
```

プレビューは **StageCanvas** 上で `MessageWindow` を重ねて確認。通常・全画面・テストプレイいずれでも同一比率で表示。

### エディタ操作(右ペイン)
<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue -->
- 台詞（text）
- 話者キャラ（speakerCharacterId）と **話者表記（自由入力）** …匿名演出（`???` 等）やあだ名に対応
- 背景（bgAssetId） … サムネ表示
- BGM（musicAssetId） … `<audio controls>` で再生/停止可
- 効果音（SE, sfxAssetId） … エディタ上のラベルは「効果音(SE)」。`<audio controls>` で試聴可
- **キャラクター配置（portraits[]）** … 複数行。各行で画像変更 / 削除 / `x,y,scale,z` を個別調整

<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue -->
#### 次ノードの設定
- 次ノードID欄はフォーカス可能（`tabindex="0"`）で、クリックまたは **Ctrl/⌘+K** で **NodePicker** を起動
- NodePicker は全シーン・全ノードから検索可能で、Scene番号/#ノード番号/台詞冒頭（20文字）を表示
- 選択後は `nodeDraft.nextNodeId` に反映し、モーダルを閉じる

#### 将来課題: 削除導線と参照整合
- 現状のゲームエディタはノード削除 API を前提にした編集仕様を持つが、**ゲーム削除 / シーン削除 / ノード削除**の管理導線と事前警告は今後の整備課題として扱う
- 削除操作は **owner のみ実行可能** とし、実行前に確認ダイアログを必須とする
- 削除時は参照切れを防ぐため、少なくとも以下の参照元を点検対象とする
  - `GameScene.startNodeId`
  - `GameNode.nextNodeId`
  - `GameChoice.nextNodeId`
  - その他 `sceneId` / `nodeId` を保持する派生フィールド
- ノード削除では、他ノードから参照されている件数を事前集計して警告できることを将来要件とする
  - 例: 「このノードは 3 件の遷移先として使用されています。削除すると遷移が解除されます。」
- 削除方式は未確定。**ソフトデリート / 物理削除 / 関連参照の解除方針**を今後の設計検討事項として残す
- ゲーム削除後の公開導線、シーン削除後の `startSceneId` 相当の再解決、ノード削除後の遷移解除・代替遷移設定は、UI と API を分けて設計判断する

#### 将来課題: シーンラベルと管理性
- 現状のシーン分割は編集体験上の差別化が弱いため、シーンを **章 / 場面 / 管理用ラベル** として扱える表示改善を今後の課題とする
- 画面上では、シーン一覧・NodePicker・プレビュー導線でシーン名を分かりやすく表示できることを目標とする
- 代表例: `第1章`, `プロローグ`, `森の入口`, `バトル前`, `エンディングA`
- 既存モデルの `GameScene.name` を活用できる場合はそれを優先し、不足する場合は `label` または `title` 相当フィールド追加を将来課題として記録する

#### 将来課題: NodePicker の二段選択
- NodePicker は将来的に **シーン → ノード** の二段選択を基本 UX とする
- 初期表示では現在編集中のシーンを選択状態にし、そのシーン内ノードを優先して選びやすくする
- ただし大規模シナリオ向けに、全シーン横断検索は補助導線として残す
- 検索対象はノード名、本文、シーンラベルを候補とし、選択時に「どのシーンのどのノードへ遷移するか」が分かる表示を行う

<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue (saveAndCreateNext) -->
#### 「保存して次のノードへ」の動作フロー
1. 現在のノードを保存（`nodeDraft` から `portraits` の `thumb` を除外して送信）
2. コピー対象項目（背景/キャラ/BGM/カメラ）を抽出：
   - `copyOpts` オブジェクト（`{ bg, chars, bgm, camera }`）で制御
   - LocalStorage（`talking_copy_opts_v1`）に永続化
3. 新規ノードを作成（テキスト/話者/選択肢は空、コピー項目のみ継承）
4. 現在ノードの `nextNodeId` を新規ノードIDに更新
5. ノード一覧を再取得し、新規ノードへ遷移（`selectNode()`）
6. トースト通知（成功/失敗）

**例外処理**:
- 保存失敗時：トーストでエラー表示、ノード一覧は更新しない
- `saving` ref で連打防止（実行中は `Ctrl/⌘+Enter` を無視）

- **開始ノードの設定**: 各ノード列の「▶開始ノードに設定」ボタンで `GameScene.startNodeId` を PATCH 保存
- **カメラ** … 編集UIは実装済み（倍率 zoom 100–300%、中心 cx,cy 0–100%）。StageCanvas への反映済み（MiniStage にも適用済み）
- **カメラ演出（cameraFx）** … エディタで「カメラ演出」セクションから設定可能。テストプレイでは `requestAnimationFrame` で滑らかなカメラアニメーションを実現
- **ビジュアルエフェクト（visualFx）** … 「ビジュアルエフェクト」セクションで設定。画面揺れ（shake）とフラッシュ（flash）の2種類、それぞれ小・中・大の3段階強度を選択可能。エディタではプレビューボタンで即座に確認でき、テストプレイではノード表示時に自動再生。画面全体（背景・キャラクター・メッセージウィンドウ含む）に適用され、`requestAnimationFrame` ベースの滑らかなアニメーション
- **セリフ継続表示（continuesPreviousText）** … 「前ノードのセリフを消さずに続ける」チェックボックスで設定。会話の流れを維持した演出が可能

**プレビュー**:
- 通常表示：右ペインに16:9のステージを表示、幅プリセット（S/M/L）で調整可能
- 全画面表示：左にステージ、右にフォームを2カラム配置。ステージは最大72vh、アスペクト比16:9を維持
- どちらも `StageCanvas` + `MessageWindow` で描画し、**同一の相対バランス**で見える

### API 概要（認可: 所有者）
- `GET /games/:id/scenes` / `POST /games/:id/scenes`（Upsert）
- `GET /games/scenes/:sceneId/nodes` / `POST /games/scenes/:sceneId/nodes`（choices 同梱で Upsert）
- `DELETE /games/nodes/:nodeId`
  - 新規 Node 追加時は `order = (scene内 max + 1)` （`GamesService.upsertNode` 参照）
  - 既存更新は `id` 有無で分岐

**GameNode データ構造**:
<!-- impl: apps/api/prisma/schema.prisma, packages/types/src/index.ts -->
```ts
interface GameNode {
  id: string;
  sceneId: string;
  type: 'DIALOG';
  order: number;
  speakerCharacterId?: string;
  speakerDisplayName?: string;
  text?: string;
  bgAssetId?: string;
  musicAssetId?: string;
  sfxAssetId?: string;
  nextNodeId?: string;
  continuesPreviousText?: boolean;
  portraits?: Array<{
    characterId: string;
    imageId: string;
    key?: string;
    x: number;  // 0-100%
    y: number;  // 0-100%
    scale: number;  // %
    z?: number;
  }>;
  camera?: {
    zoom: number;  // 100-300%
    cx: number;    // 0-100% (center x)
    cy: number;    // 0-100% (center y)
  };
  cameraFx?: {
    from?: { zoom?: number; cx?: number; cy?: number };
    to?: { zoom?: number; cx?: number; cy?: number };
    durationMs?: number;
    mode?: 'cut' | 'together' | 'pan-then-zoom' | 'zoom-then-pan';
  };
  visualFx?: {
    type: 'shake' | 'flash';
    intensity: 'small' | 'medium' | 'large';
  };
  choices?: Array<{
    id: string;
    label: string;
    targetNodeId: string;
  }>;
}
```

**ビジュアルエフェクト詳細**:
<!-- impl: apps/frontend/composables/useVisualEffects.ts -->
- **画面揺れ (shake)**:
  - small: 強度5px, 300ms, 30Hz
  - medium: 強度12px, 500ms, 30Hz
  - large: 強度25px, 700ms, 30Hz
  - 減衰する振動（`decay = 1 - progress`）、X軸とY軸で異なる振幅
- **フラッシュ (flash)**:
  - small: 不透明度0.4, 200ms, 白色
  - medium: 不透明度0.7, 300ms, 白色
  - large: 不透明度1.0, 400ms, 白色
  - フェードアウトアニメーション

**エフェクト実装**:
<!-- impl: apps/frontend/components/game/StageCanvas.vue -->
- `.stage` 全体に `transform` でshake適用（背景・キャラ・メッセージ含む）
- エフェクトレイヤー（`.effect-layer`）でflashを表示（z-index: 50）
- `requestAnimationFrame` ベースの滑らかなアニメーション
- クリーンアップ処理（`cancelAnimationFrame`）で適切に停止

### 既知の制限 / TODO
- 音声同意は `localStorage('talking_audio_consent_v1')` で保持
- 選択肢（choices）の UI は最小
- NodePicker: キーボード操作・詳細プレビューは今後拡張予定
- ゲーム / シーン / ノード削除は API と内部操作の有無に対して、エディタ上の管理導線・参照警告・削除方式の整理が不足している
- シーンの管理ラベル表示と NodePicker のシーン別二段選択は未着手
- ノード参照切れ警告、到達不能ノード検出、フローチャート可視化は将来課題
- 画像の遅延読込・AVIF/WebP 最適化は別タスク

---

### ChangeLog (chat handover)

- 2025-11-02: 実装を根拠にキャラクター機能のモデル/画面/APIを正規化。Favorites をアセット/キャラ横断で統一（楽観更新・一覧同期・正規化関数）。検索/URL 同期のクエリ項目を明記。署名URLの取得/再取得方針と `$api` 経由の根拠を出典付きで追記。既知の落とし穴とテストTODOを整理。
- 2025-11-04: ゲーム制作（β）仕様を追加。シーン/ノード構造、portraits 配置、カメラ操作、署名 URL 経由の画像/音声取得を明記。
- 2025-12-07: ゲーム制作機能を拡張。`continuesPreviousText`（セリフ継続表示）と `cameraFx`（カメラ演出）フィールドを追加。MessageThemeV2 にグラデーション（`gradientDirection`, `gradientColor`）とフォントスタイル（`fontWeight`, `fontStyle`）プロパティを追加。カメラ演出では4つのアニメーションモード（together/pan-then-zoom/zoom-then-pan/cut）を実装し、`requestAnimationFrame` で滑らかな動きを実現。エディタではキーボードショートカット（Ctrl/⌘+Enter, Ctrl/⌘+K, F, Esc）を拡充し、NodePicker による次ノード選択と「保存して次のノードへ」機能を強化。`visualFx`（ビジュアルエフェクト）を追加し、画面揺れ（shake）とフラッシュ（flash）の2種類×3段階強度のプリセットエフェクトを実装。エディタでのプレビュー機能とテストプレイでの自動再生に対応。
- 2026-05-01: 将来課題として、ゲーム/シーン/ノード削除の管理導線、参照整合警告、シーンラベルによる管理性改善、NodePicker の「シーン → ノード」二段選択方針を追記。

