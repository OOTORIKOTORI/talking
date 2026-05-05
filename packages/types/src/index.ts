/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export * from './favorites';

/**
 * Primary tag for asset categorization
 */
export type PrimaryTag = 
  | 'IMAGE_BG'
  | 'IMAGE_CG'
  | 'IMAGE_OTHER'
  | 'AUDIO_BGM'
  | 'AUDIO_SE'
  | 'AUDIO_VOICE'
  | 'AUDIO_OTHER';

/**
 * Asset entity (uploaded file metadata)
 */
export interface Asset {
  id: string;
  key: string;
  title?: string;
  description?: string;
  tags: string[];
  primaryTag: PrimaryTag;
  contentType: string;
  size: number;
  url: string;
  ownerId?: string;
  thumbKey?: string;
    thumbKeyWebp?: string;
    thumbKeyAvif?: string;
  thumbWidth?: number;
  thumbHeight?: number;
  createdAt: Date;
  favoriteCount?: number;
  isFavorite?: boolean;
  isFavorited?: boolean;
}

/**
 * Signed URL request payload
 */
export interface SignedUrlRequest {
  filename: string;
  contentType: string;
}

/**
 * Signed URL response payload
 */
export interface SignedUrlResponse {
  url: string;
  key: string;
  bucket: string;
  region?: string;
  fields?: Record<string, string>;
}

/**
 * Health check response
 */
export interface HealthResponse {
  ok: boolean;
  timestamp?: string;
  service?: string;
}

// === Characters =======================
export type CharacterEmotion =
  | 'NEUTRAL' | 'HAPPY' | 'SAD' | 'ANGRY' | 'SURPRISED' | 'FEAR' | 'DISGUST' | 'SHY' | 'SLEEPY' | 'THINKING' | 'OTHER'

export interface CharacterImage {
  id: string
  characterId: string
  key: string
  thumbKey?: string
  width?: number
  height?: number
  contentType: string
  size?: number
  emotion: CharacterEmotion
  emotionLabel?: string
  pattern?: string
  sortOrder: number
  createdAt: string | Date
  updatedAt: string | Date
}

export interface Character {
  id: string
  ownerId: string
  name: string
  displayName: string
  description?: string
  isPublic: boolean
  createdAt: string | Date
  updatedAt: string | Date
  deletedAt?: string | Date | null
  images?: CharacterImage[]
  tags?: string[]
  isFavorite?: boolean
}

// === Message Theme =====================
export type FontPreset = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type MessageRows = 1 | 2 | 3 | 4 | 5 | 6;
export type MessageScale = 'sm' | 'md' | 'lg';

// RGBA color object (0-255 for RGB, 0-1 for alpha)
export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

// v1 互換用（旧型）
export interface MessageTheme {
  frame?: {
    bg?: string;
    borderColor?: string;
    borderWidth?: number;
    radius?: number;
    padding?: number;
    shadow?: boolean;
  };
  name?: {
    show?: boolean;
    bg?: string;
    color?: string;
    padding?: number;
    radius?: number;
  };
  text?: {
    color?: string;
    size?: number; // 旧仕様(px)、fontPreset が優先
    fontPreset?: FontPreset; // 1〜10のプリセット
    lineHeight?: number;
    rows?: MessageRows; // 表示行数（1〜6）
  };
  typewriter?: {
    msPerChar?: number;
  };
  scale?: MessageScale; // メッセージウィンドウのサイズプリセット
}

// v2 新型（プリセット中心）
export interface MessageThemeV2 {
  themeVersion: 2;
  
  // 既存（継続）
  rows?: MessageRows;          // 表示行数（1〜6）既定3
  scale?: MessageScale;         // ウィンドウサイズ（sm/md/lg）既定md
  
  // 新プリセット（1〜10）
  fontPreset?: FontPreset;      // 既定5
  windowPreset?: FontPreset;    // 既定6（md相当）
  paddingPreset?: FontPreset;   // 既定5
  radiusPreset?: FontPreset;    // 既定5
  borderPreset?: FontPreset;    // 既定3
  shadowPreset?: FontPreset;    // 既定4
  typeSpeedPreset?: FontPreset; // 既定6（早すぎず遅すぎず）
  
  // 色（RGBA or HEX string）
  frameBg?: RGBA | string;      // メッセージ枠背景
  frameBorder?: RGBA | string;  // 枠線色
  nameBg?: RGBA | string;       // 名前背景色
  textColor?: RGBA | string;    // 文字色
  
  // フォント装飾
  fontWeight?: 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic';
  fontFamily?: string; // フォントファミリー（ゴシック、明朝など）
  
  // 文字の縁取り
  textStrokeColor?: RGBA | string; // 縁取り色
  textStrokeWidth?: number; // 縁取り太さ（px）
  
  // 旧値（fallback用、v1互換）
  frame?: MessageTheme['frame'];
  name?: MessageTheme['name'];
  text?: MessageTheme['text'];
  typewriter?: MessageTheme['typewriter'];
}

// Preset tables (constants)
export const FONT_K = [0, 0.70, 0.80, 0.90, 0.95, 1.00, 1.08, 1.16, 1.25, 1.35, 1.48]; // index 1..10
export const PADDING_K = [0, 0.70, 0.80, 0.90, 0.95, 1.00, 1.10, 1.20, 1.30, 1.40, 1.55];
export const RADIUS_PX = [0, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24];
export const BORDER_PX = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 10];
export const SHADOW_PRESET = [0, 'none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
export const TYPE_MS = [0, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15]; // 1=ゆっくり,10=高速

// Window preset (width, height, margin-bottom, max-width)
export const WINDOW_PRESET: Record<number, { w: string; h: string; mb: string; mw: string }> = {
  1: { w: '84%', h: '18%', mb: '5%', mw: '1000px' },
  2: { w: '86%', h: '19%', mb: '4.5%', mw: '1040px' },
  3: { w: '88%', h: '20%', mb: '4%', mw: '1080px' },
  4: { w: '90%', h: '21%', mb: '3.5%', mw: '1120px' },
  5: { w: '92%', h: '22%', mb: '3%', mw: '1180px' },
  6: { w: '92%', h: '22%', mb: '3%', mw: '1180px' }, // 標準（md）
  7: { w: '94%', h: '24%', mb: '2.5%', mw: '1240px' },
  8: { w: '96%', h: '26%', mb: '2%', mw: '1280px' },
  9: { w: '97%', h: '27%', mb: '2%', mw: '1320px' },
  10: { w: '98%', h: '28%', mb: '2%', mw: '1360px' },
};

// === Game UI Theme (save/load screen, buttons, etc.) ====
export interface GameUiTheme {
  /** セーブ/ロードモーダルの背景オーバーレイ色 (CSS color string) */
  modalOverlayColor?: string;
  /** モーダル本体の背景色 */
  modalBgColor?: string;
  /** モーダル本体のテキスト色 */
  modalTextColor?: string;
  /** モーダル本体のアクセントカラー (セーブボタンなど) */
  modalAccentColor?: string;
  /** モーダル本体のロードアクセント色 */
  modalLoadAccentColor?: string;
  /** モーダル本体の枠線色 */
  modalBorderColor?: string;
  /** モーダル角丸 (px) */
  modalRadius?: number;
  /** スロットカードの背景色（空） */
  slotEmptyBg?: string;
  /** スロットカードの背景色（データあり） */
  slotFilledBg?: string;
  /** 選択中スロット枠線色 */
  slotSelectedBorder?: string;
  /** SAVE/LOADボタンの背景色 */
  quickButtonBg?: string;
  /** SAVE/LOADボタンのテキスト色 */
  quickButtonText?: string;

  // --- ボタン・ラベルの文言カスタマイズ ---
  /** バックログボタンのラベル（デフォルト: "LOG"）*/
  backlogButtonLabel?: string;
  /** SAVEクイックボタンのラベル（デフォルト: "SAVE"）*/
  saveButtonLabel?: string;
  /** LOADクイックボタンのラベル（デフォルト: "LOAD"）*/
  loadButtonLabel?: string;
  /** セーブ・ロードモーダルのタイトル（デフォルト: "セーブ / ロード"）*/
  saveModalTitle?: string;
  /** セーブ実行ボタンのラベル（デフォルト: "この枠にセーブ"）*/
  saveActionLabel?: string;
  /** ロード実行ボタンのラベル（デフォルト: "この枠をロード"）*/
  loadActionLabel?: string;
  /** 手動スロットのタブ名（デフォルト: "手動"）*/
  slotManualLabel?: string;
  /** オートセーブスロットのタブ名（デフォルト: "オート"）*/
  slotAutoLabel?: string;
  /** クイックスロットのタブ名（デフォルト: "クイック"）*/
  slotQuickLabel?: string;
}

/** バックログの1エントリ */
export interface BacklogEntry {
  /** ノードID（将来の場面ジャンプ用に保持） */
  nodeId: string
  /** 話者名。ナレーションなど話者なしの場合は null */
  speakerName: string | null
  /** タイプライター完了後の全文テキスト */
  text: string
}

/** バックログモーダルのテーマ設定 */
export interface BacklogTheme {
  /** 1〜10段階プリセット（MessageThemeV2 と同じ段階感） */
  preset: number
  /** 背景色 RGBA文字列（例: rgba(0,0,0,0.88)） */
  bgColor: string
  /** テキスト色（例: #e8e8e8） */
  textColor: string
  /** 話者名の色（例: #ffd700） */
  speakerColor: string
  /** フォントサイズ (px) */
  fontSize: number
}

/** BacklogTheme のデフォルト値 */
export const DEFAULT_BACKLOG_THEME: BacklogTheme = {
  preset: 5,
  bgColor: 'rgba(0, 0, 0, 0.88)',
  textColor: '#e8e8e8',
  speakerColor: '#ffd700',
  fontSize: 15,
}

/**
 * プリセット番号 (1〜10) から BacklogTheme の bgColor と fontSize を返す。
 * themeUtils.ts の resolveThemeV2 と同じ段階感で設計。
 */
export const resolveBacklogPreset = (preset: number): Pick<BacklogTheme, 'bgColor' | 'fontSize'> => {
  const p = Math.max(1, Math.min(10, preset))
  const opacity = 0.55 + p * 0.04
  const fontSize = 11 + p
  return {
    bgColor: `rgba(0, 0, 0, ${opacity.toFixed(2)})`,
    fontSize,
  }
}

// === Visual Effects ===================
export type VisualEffectType = 'shake' | 'flash';
export type VisualEffectIntensity = 'small' | 'medium' | 'large';

export interface VisualEffect {
  type: VisualEffectType;
  intensity: VisualEffectIntensity;
}

// === Color Filter (Screen overlay) ====
export type ColorFilterType = 'none' | 'sepia' | 'monochrome' | 'dark' | 'night' | 'dream';

export interface ColorFilter {
  type: ColorFilterType;
  opacity?: number; // 0-100, default 50
  durationMs?: number; // フェード時間、default 500ms
}


// === Creator Profiles ===================
export interface CreatorProfile {
  userId: string
  displayName: string
  bio?: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

export interface MyCreatorProfile {
  userId: string
  displayName: string | null
  bio: string | null
  isConfigured: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}
