import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtVerify, decodeJwt } from 'jose';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private jwtSecret: Uint8Array | null = null;
  private isConfigured: boolean;

  constructor(private configService: ConfigService) {
    const jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET');
    this.isConfigured = !!jwtSecret && jwtSecret.length > 0 && !jwtSecret.includes('${');
    
    if (this.isConfigured) {
      this.jwtSecret = new TextEncoder().encode(jwtSecret);
    } else {
      console.warn('⚠️  SUPABASE_JWT_SECRET is not configured - Auth guard is DISABLED');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // If Supabase is not configured, allow all requests (dev mode)
    if (!this.isConfigured) {
      console.log('[SupabaseAuthGuard] Auth disabled (dev mode)');
      request.user = {
        userId: 'dev-user-123',
        email: 'dev@example.com',
      };
      return true;
    }

    const authHeader = request.headers.authorization;
    
    console.log('[SupabaseAuthGuard] JWT Secret configured:', this.isConfigured);
    console.log('[SupabaseAuthGuard] Auth header:', authHeader ? 'present' : 'missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[SupabaseAuthGuard] Missing or invalid authorization header');
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    try {
      // 署名検証前に iss/aud を確認
      const preview = decodeJwt(token);
      console.log('[SupabaseAuthGuard] Token iss:', preview.iss, 'aud:', preview.aud, 'sub:', preview.sub);
    } catch (err) {
      console.log('[SupabaseAuthGuard] Failed to decode JWT preview:', err.message);
    }

    try {
      const { payload } = await jwtVerify(token, this.jwtSecret!);

      // Attach user info to request
      request.user = {
        userId: payload.sub,
        email: payload.email,
      };

      console.log('[SupabaseAuthGuard] Auth successful:', payload.email);
      return true;
    } catch (error) {
      console.log('[SupabaseAuthGuard] JWT verification failed:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
