import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
  private isConfigured: boolean;

  constructor(private configService: ConfigService) {
    const jwksUrl = this.configService.get<string>('SUPABASE_JWKS_URL');
    this.isConfigured = !!jwksUrl && jwksUrl.length > 0 && !jwksUrl.includes('${');
    
    if (this.isConfigured) {
      this.jwks = createRemoteJWKSet(new URL(jwksUrl));
    } else {
      console.warn('⚠️  SUPABASE_JWKS_URL is not configured - Auth guard is DISABLED');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // If Supabase is not configured, allow all requests (dev mode)
    if (!this.isConfigured) {
      const request = context.switchToHttp().getRequest();
      request.user = {
        userId: 'dev-user-123',
        email: 'dev@example.com',
      };
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    try {
      const { payload } = await jwtVerify(token, this.jwks!);

      // Attach user info to request
      request.user = {
        userId: payload.sub,
        email: payload.email,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
