import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtVerify, createRemoteJWKSet } from 'jose';

@Injectable()
export class OptionalSupabaseAuthGuard implements CanActivate {
  private jwtSecret: Uint8Array | null = null;
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
  private isConfigured: boolean;

  constructor(private configService: ConfigService) {
    const jwksUrl = this.configService.get<string>('SUPABASE_JWKS_URL');
    const jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET');

    this.isConfigured = false;

    if (jwksUrl && jwksUrl.length > 0 && !jwksUrl.includes('${')) {
      try {
        this.jwks = createRemoteJWKSet(new URL(jwksUrl));
        this.isConfigured = true;
      } catch {
        this.jwks = null;
      }
    }

    if (!!jwtSecret && jwtSecret.length > 0 && !jwtSecret.includes('${')) {
      this.jwtSecret = new TextEncoder().encode(jwtSecret);
      this.isConfigured = true;
    }
  }

  private async verifyToken(token: string) {
    if (this.jwks) {
      try {
        return await jwtVerify(token, this.jwks);
      } catch {
        // If JWKS verification fails, try legacy secret as fallback.
      }
    }

    if (this.jwtSecret) {
      return await jwtVerify(token, this.jwtSecret);
    }

    throw new Error('No auth verifier configured');
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
      const { payload } = await this.verifyToken(token);

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
