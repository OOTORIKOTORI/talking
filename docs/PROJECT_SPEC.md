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
  - シーン一覧では「このシーンから開始」操作で `GameProject.startSceneId` を更新可能
    - 対象シーンの `startNodeId` が設定済みなら維持
    - 未設定ならシーン内先頭ノードを `startNodeId` に自動設定
    - ノード0件のシーンは開始シーンに設定せず、ノード追加を案内
  - 「次ノード」は **NodePicker（モーダル＋検索・冒頭プレビュー付き）** から選択
    - 「シーン → ノード」二段階選択UI（左ペイン: シーン一覧、右ペイン: 選択中シーンのノード一覧）
    - キーボード操作: 検索欄初期フォーカス・右ペインで `↑` / `↓` / `Enter` / `Esc` 操作可能
    - 詳細プレビュー: 所属シーン・Node番号・本文プレビュー・選択肢数・nextNode設定有無・開始ノード表示
    - 検索時は全シーン横断検索、現在シーンの最新ノード反映と他シーン候補維持に対応

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
  - **キーボード操作**: ゲームプレイ画面で以下のキー操作が可能（実装済み）
    - `Enter` / `Space`: タイプライター中は全文表示、完了後は次のノードへ進む（選択肢表示中はハイライト選択肢を決定）
    - `↑` / `↓`: 選択肢表示中にハイライト移動（末尾/先頭でループ）
    - 数字キー `1`〜`9`: 対応する番号の選択肢を直接選択
    - `Esc`: セーブ/ロードモーダル → バックログ → フルスクリーンの優先順に閉じる
    - `input` / `textarea` / `select` / `button` / `[contenteditable]` フォーカス時はショートカット無効
    - IME 変換中（`event.isComposing` / `key === 'Process'`）はキー処理をスキップ
    - セーブ/ロードモーダルまたはバックログ表示中は Esc 以外でゲーム進行しない
  - 出典: `apps/frontend/pages/games/[id]/play.vue`, `apps/frontend/components/game/MessageWindow.vue`

### ドメイン / モデル(Prisma 正)
- `GameProject { id, ownerId, title, summary?, startSceneId String?, messageTheme Json?, deletedAt? ... }`
  - `startSceneId`: ゲーム全体の開始シーンID
  - `messageTheme`: メッセージウィンドウテーマ設定（後述）
- `GameScene { id, projectId(FK), name, order, startNodeId String?, createdAt, updatedAt }`
  - `startNodeId`: シーン開始ノードID（ゲーム開始時は `GameProject.startSceneId` のシーンにある `startNodeId` を使用）
- `GameNode  { id, sceneId(FK), order, text, speakerCharacterId?, speakerDisplayName?, bgAssetId?, musicAssetId?, sfxAssetId?, portraits Json?, camera Json?, cameraFx Json?, continuesPreviousText Boolean?, createdAt, updatedAt }`
  - `continuesPreviousText`: 前ノードのセリフを消さずに継続表示するフラグ（省略時 false）。true の場合、このノードのテキストを前ノードのテキストに追加して表示する。エディタでは「前ノードのセリフを消さずに続ける」チェックボックスで設定。
- `GameChoice { id, nodeId(FK), label, targetNodeId?, condition?, effects?, alternateTargetNodeId?, alternateCondition? }`
  - `targetNodeId` 未設定は `null`（空文字 `''` は未使用）

#### 開始地点モデルの再検討課題

- 現状のゲーム開始地点は `GameProject.startSceneId` と `GameScene.startNodeId` の組み合わせで表現している
- ただし通常のシナリオ遷移は `GameNode.nextNodeId` / `GameChoice.targetNodeId` / `GameChoice.alternateTargetNodeId` による nodeId 直指定であり、現時点では「シーンへ移動する」機能は存在しない
- そのため、ゲーム開始時に本質的に必要なのは開始ノードIDだけであり、開始ノードの所属シーンは node から逆引きできる
- 将来的には `GameProject.startNodeId` に単純化する余地がある
- 一方で、シーン単位ジャンプ、章選択、シーン単位テストプレイ、フローチャート表示を実装するなら `GameScene.startNodeId` は意味を持つ
- 現時点では既存実装を維持し、この点は将来の設計課題として扱う
- 今後シーン単位ジャンプを実装しない方針が固まるなら、`GameProject.startNodeId` への移行を再検討する

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

#### 右ペインセクション化MVP（2026-05-02 実装）
<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue -->
- ノード編集欄を次のセクションに分割し、各見出しをクリックで開閉可能にした
  - 基本情報
  - 表示・素材
  - 演出
  - 遷移・分岐
  - 危険操作
- 通常表示だけでなく、ノード全画面表示（2カラム右フォーム）にも同等のセクション分類と開閉挙動を反映した
- セクション開閉状態は `sectionOpen` で管理する（初期値: 基本情報/表示・素材/遷移・分岐は開、演出/危険操作は閉）
- 各入力ブロックの表示制御は `v-if` で行い、既存の編集・保存・削除・選択肢編集機能は維持する
- `遷移・分岐` セクションには `次ノードID`、`次ノード作成時のコピー対象`、`選択肢` を含める
- `危険操作` セクションにはノード削除導線を配置する
- 今回はフォーム共通コンポーネント化までは行わず、通常表示/全画面表示のフォーム重複は将来課題として扱う

<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue -->
#### 次ノードの設定
- 次ノードID欄はフォーカス可能（`tabindex="0"`）で、クリックまたは **Ctrl/⌘+K** で **NodePicker** を起動
- NodePicker は全シーン・全ノードから検索可能で、Scene番号/#ノード番号/台詞冒頭（20文字）を表示
- 選択後は `nodeDraft.nextNodeId` に反映し、モーダルを閉じる

#### 削除導線と参照整合（現状）
- **ノード削除MVPは実装済み**（owner 限定、存在しない対象は 404、非ownerは 403）
- **シーン削除MVPは実装済み**（owner 限定、存在しない対象は 404、非ownerは 403、最後の1シーンは削除不可）
- **ゲーム削除導線は実装済み**（`/my/games` から削除確認付きで soft delete 可能）
  - 削除済みゲームは `/my/games` / `/games` / `/games/:id` / `/games/:id/play` / `/my/games/:id/edit` から見えない
  - 完全削除・purge は将来課題として残す
- 削除前確認ダイアログと参照件数表示は実装済み
  - ノード: 開始ノード参照 / nextNode参照 / choice遷移先参照
  - シーン: 削除されるノード数 / シーン内ノードへの外部参照件数
- ノード削除・シーン削除時は参照解除を明示実行する
  - `GameScene.startNodeId`
  - `GameNode.nextNodeId`
  - `GameChoice.targetNodeId`
  - `GameChoice.alternateTargetNodeId`
  - （シーン削除時）`GameProject.startSceneId`
- `GameChoice.targetNodeId` / `GameChoice.alternateTargetNodeId` は参照解除時に `null` を設定する
- 既存の `targetNodeId = ''` データは migration で `null` に移行する

#### 選択肢と通常遷移先の優先順位（2026-05-02 更新）
- `choice.targetNodeId !== null` の選択肢のみ「表示可能な選択肢」とする
- 表示可能な選択肢が1件以上ある場合、プレイ時は選択肢を表示し、`nextNodeId` は使用しない
- 表示可能な選択肢が0件の場合のみ、`nextNodeId` があれば通常進行する
- `nextNodeId` もない場合は終了扱いにする
- `targetNodeId = null` の選択肢は編集画面で警告表示し、プレイ画面では表示しない（MVP）
- 編集画面で `nextNodeId` と表示可能な選択肢が同時設定の場合は注意文を表示する

#### シナリオチェックMVP（2026-05-02 実装）
<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue -->
- 編集画面右ペイン上部に「シナリオチェック」パネルを追加（折りたたみ可）
- 結果を `error` / `warning` / `info` の3分類で一覧表示
- 件数サマリ（エラーn件・警告n件・情報n件）を表示
- 各項目に関連シーン/ノード情報を表示し、可能な項目は「対象へ移動」で該当シーン/ノードへジャンプ可能
- 0件時は「問題は見つかりませんでした」を表示

#### シナリオチェック表示改善（2026-05-02 追補）
<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue -->
- 結果一覧の表示順を `error → warning → info` に統一
- severity フィルタ（`すべて / エラー / 警告 / 情報`）を追加し、各フィルタに件数を表示
- フィルタ後の0件時は「この条件のチェック項目はありません。」を表示
- 情報（info）は配色を控えめにし、`すべて` 表示時は情報群を折りたたみ可能にして、エラー/警告を先に確認しやすくした
- 件数サマリはエラーを最も目立つ見た目にし、警告を次点、情報を控えめに表示
- 既存の「対象へ移動」動線は維持し、フィルタ後の一覧からも従来どおりジャンプ可能

検出項目:
- 開始設定不備
  - `GameProject.startSceneId` 未設定/参照切れ
  - 開始シーンの `startNodeId` 未設定/参照切れ
  - 開始シーンが空（ノード0件）
- 存在しない参照
  - `GameNode.nextNodeId`
  - `GameChoice.targetNodeId`
  - `GameChoice.alternateTargetNodeId`
- 未設定選択肢
  - `GameChoice.targetNodeId === null`（warning）
- 選択肢と `nextNodeId` の併用注意
  - 表示可能な選択肢が1件以上あり、かつ `nextNodeId` も設定されているノード（info）
- 到達不能ノード
  - 開始ノードから到達できないノード（warning）
- 空シーン
  - ノード0件のシーン（warning）
- 終端ノード
  - 到達可能ノードのうち、表示可能な選択肢0件かつ `nextNodeId` なし（info）

到達可能性の計算ルール:
- 始点は `GameProject.startSceneId` のシーンにある `startNodeId`
- ノード遷移
  - 表示可能な選択肢が1件以上ある場合:
    - `choice.targetNodeId` を候補に含める
    - `choice.alternateTargetNodeId` も「到達しうる候補」として含める
    - このとき `nextNodeId` は通常遷移として使わない
  - 表示可能な選択肢が0件の場合:
    - `nextNodeId` があれば遷移
    - なければ終端
- 存在しない参照は到達計算では無視し、別途エラーとして報告
- 変数条件（`condition` / `alternateCondition`）の厳密評価はMVPでは行わない

将来課題:
- 変数条件の厳密評価を含む到達可能性判定
- フローチャート可視化

#### シーンラベル・シーン管理性改善（2026-05-02 実装済み）
- `GameScene.name` をシーンラベルとして活用（DB変更・マイグレーションなし）
- edit画面左ペインのシーン一覧に Scene番号・シーン名・ノード数を表示
- 選択中シーンの名前を入力欄で編集可能（Enter or blur で `PATCH /games/scenes/:sceneId { name }` 保存）
- 入力欄ラベルを「選択中シーン名」に簡略化（補足文は削除）
- シーン名が空の場合は `Scene N` フォールバック表示（シーン一覧・NodePicker共通）
- シーン名変更後: `scene.value` / `scenes.value` / `game.value.scenes` を即時同期→ NodePicker ・ `findNodeLabel`（遷移先ラベル）に自動反映
- NodePicker のシーン準の表示は既実装済み（`Scene N: name` 形式、ノード数、現在シーンバッジ、検索・詳細プレビュー）
- 将来課題（実装外）: シーン並び替え / シーン説明文 / シーンサムネイル / フローチャート表示

#### NodePicker の現状と残課題

NodePicker の「シーン → ノード」二段階選択UIは**実装済み**。

- 左ペインでシーン選択、右ペインで選択中シーンのノードを選択
- 検索欄に入力すると全シーン横断検索モードに切り替わり、クリア後は選択中シーンのノード一覧に戻る
- 現在シーンの最新ノード反映と他シーン候補維持に対応
- キーボード操作: 検索欄初期フォーカス・右ペイン `↑` / `↓` / `Enter` / `Esc` で操作可能
- 詳細プレビュー（所属シーン・Node番号/ID・本文プレビュー・選択肢数・nextNode設定有無・開始ノード表示）を実装済み

残課題:
- シーン一覧（左ペイン）のキーボード操作
- `←` / `→` または `Ctrl+↑` / `Ctrl+↓` によるシーン切り替え
- Tab 移動時のフォーカス設計
- スクロール位置保持
- キーボード操作と検索入力の干渉防止のさらなる改善

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

- **開始地点の設定**:
  - ノード側: 各ノード列の「▶このノードから開始」ボタンで `GameScene.startNodeId` を PATCH 保存し、同時に所属シーンを `GameProject.startSceneId` に同期
  - シーン側: シーン一覧の「このシーンから開始」で `GameProject.startSceneId` を更新
    - 既存の `startNodeId` があれば維持
    - 未設定なら先頭ノードを `startNodeId` に自動設定
    - ノード0件シーンは設定せず警告表示

**確認ログ（2026-05-02）**:
- `pnpm -w build`: ❌ `apps/api prisma:generate` の `query_engine-windows.dll.node` rename で `EPERM`（ファイルロック）
- `pnpm -C apps/frontend test`: ✅ 2 files / 7 tests passed
- 未実行: ブラウザ手動確認（シーン側開始設定UI操作・公開/テストプレイ開始地点の実画面確認）
  - 理由: この実行環境ではブラウザ手動E2Eを実施していないため
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
- `GameChoice.targetNodeId` の `''` 運用は暫定であり、nullable 化または未設定表現の整理が必要
- target未設定の選択肢をプレイ時にどう扱うかは将来課題
- NodePicker シーン一覧（左ペイン）のキーボード操作・フォーカス設計・スクロール位置保持は残課題
- ノード参照切れ警告、到達不能ノード検出、フローチャート可視化は将来課題
- キーコンフィグ・AUTO再生・Skip機能・プレイヤーごとのセーブデータ設計は将来課題
- スマホ/タブレット向けプレイ操作最適化は将来課題
- 画像の遅延読込・AVIF/WebP 最適化は別タスク

---

### ChangeLog (chat handover)

- 2025-11-02: 実装を根拠にキャラクター機能のモデル/画面/APIを正規化。Favorites をアセット/キャラ横断で統一（楽観更新・一覧同期・正規化関数）。検索/URL 同期のクエリ項目を明記。署名URLの取得/再取得方針と `$api` 経由の根拠を出典付きで追記。既知の落とし穴とテストTODOを整理。
- 2025-11-04: ゲーム制作（β）仕様を追加。シーン/ノード構造、portraits 配置、カメラ操作、署名 URL 経由の画像/音声取得を明記。
- 2025-12-07: ゲーム制作機能を拡張。`continuesPreviousText`（セリフ継続表示）と `cameraFx`（カメラ演出）フィールドを追加。MessageThemeV2 にグラデーション（`gradientDirection`, `gradientColor`）とフォントスタイル（`fontWeight`, `fontStyle`）プロパティを追加。カメラ演出では4つのアニメーションモード（together/pan-then-zoom/zoom-then-pan/cut）を実装し、`requestAnimationFrame` で滑らかな動きを実現。エディタではキーボードショートカット（Ctrl/⌘+Enter, Ctrl/⌘+K, F, Esc）を拡充し、NodePicker による次ノード選択と「保存して次のノードへ」機能を強化。`visualFx`（ビジュアルエフェクト）を追加し、画面揺れ（shake）とフラッシュ（flash）の2種類×3段階強度のプリセットエフェクトを実装。エディタでのプレビュー機能とテストプレイでの自動再生に対応。
- 2026-05-01: ノード削除MVP・シーン削除MVPを実装。削除前確認と参照件数表示、削除時の参照解除を反映。ゲーム削除導線と `GameChoice.targetNodeId` の未設定表現は将来課題として整理。
- 2026-05-01: ゲーム削除導線を実装済みに更新（`/my/games` から確認付き soft delete、削除済みゲームの各画面遮断）。NodePicker「シーン → ノード」二段階選択UI・キーボード操作MVP・詳細プレビューを実装済みとして反映し、残課題（左ペインキーボード操作・フォーカス設計・スクロール保持）を整理。ゲームプレイ画面キーボード操作MVPの仕様（Enter/Space・↑/↓・数字キー・Esc）を追加。PROJECT_SPEC.md と ROADMAP.md を最新コード基準で整合。今回はドキュメント更新のみで build/test は不要。
- 2026-05-02: シーンラベル・シーン管理性改善MVPを実装。`GameScene.name` をシーンラベルとして活用（DB変更・マイグレーションなし）。edit画面左ペインのシーン一覧に Scene番号・シーン名・ノード数を表示。選択中シーンの名前を入力欄で編集可能に（Enter/blurで保存）。シーン名変更後のシーン一覧・NodePicker・遷移先ラベルへの即時反映を実装。未対応将来課題（並び替え・説明文・サムネイル・フローチャート）をROADMAPに記録。
