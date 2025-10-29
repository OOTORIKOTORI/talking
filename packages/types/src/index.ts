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
