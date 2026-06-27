import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from 'jose';

/**
 * Verifies Supabase-issued access tokens.
 *
 * Supports both signing schemes Supabase uses:
 *  - Asymmetric (recommended, default for new projects): verified against the
 *    project's published JWKS — no secret needed.
 *  - Legacy symmetric HS256: verified with SUPABASE_JWT_SECRET if provided.
 */
@Injectable()
export class SupabaseTokenService {
  private readonly logger = new Logger(SupabaseTokenService.name);
  private readonly issuer: string;
  private readonly jwks?: JWTVerifyGetKey;
  private readonly hs256Secret?: Uint8Array;

  constructor(config: ConfigService) {
    const supabaseUrl = config.getOrThrow<string>('SUPABASE_URL');
    this.issuer = `${supabaseUrl}/auth/v1`;

    const jwtSecret = config.get<string>('SUPABASE_JWT_SECRET');
    if (jwtSecret) {
      this.hs256Secret = new TextEncoder().encode(jwtSecret);
      this.logger.log('Supabase token verification: legacy HS256 (shared secret)');
    } else {
      this.jwks = createRemoteJWKSet(new URL(`${this.issuer}/.well-known/jwks.json`));
      this.logger.log('Supabase token verification: asymmetric (JWKS)');
    }
  }

  async verify(token: string): Promise<JWTPayload> {
    try {
      const options = { issuer: this.issuer, audience: 'authenticated' };
      const { payload } = this.hs256Secret
        ? await jwtVerify(token, this.hs256Secret, options)
        : await jwtVerify(token, this.jwks!, options);
      if (!payload.sub) {
        throw new UnauthorizedException('Token has no subject');
      }
      return payload;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
