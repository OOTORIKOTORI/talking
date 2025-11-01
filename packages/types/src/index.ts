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
