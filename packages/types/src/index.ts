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
 * Asset entity (uploaded file metadata)
 */
export interface Asset {
  id: string;
  key: string;
  title?: string;
  contentType: string;
  size: number;
  url: string;
  createdAt: Date;
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
