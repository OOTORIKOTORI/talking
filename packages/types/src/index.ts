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
  isFavorite?: boolean;
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
