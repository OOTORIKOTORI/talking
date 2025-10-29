import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtVerify, decodeJwt } from 'jose';

@Injectable()
export class OptionalSupabaseAuthGuard implements CanActivate {
  private jwtSecret: Uint8Array | null = null;
  private isConfigured: boolean;

  constructor(private configService: ConfigService) {
    const jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET');
    this.isConfigured = !!jwtSecret && jwtSecret.length > 0 && !jwtSecret.includes('${');
    
    if (this.isConfigured) {
      this.jwtSecret = new TextEncoder().encode(jwtSecret);
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // If Supabase is not configured, allow all requests without user (dev mode)
    if (!this.isConfigured) {
      request.user = null;
      return true;
    }

    const authHeader = request.headers.authorization;
    
    // No auth header is OK for optional guard
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      request.user = null;
      return true;
    }

    const token = authHeader.substring(7);

    try {
      const { payload } = await jwtVerify(token, this.jwtSecret!);

      // Attach user info to request
      request.user = {
        userId: payload.sub,
        email: payload.email,
      };

      return true;
    } catch (error) {
      // Invalid token - allow request but without user
      request.user = null;
      return true;
    }
  }
}
