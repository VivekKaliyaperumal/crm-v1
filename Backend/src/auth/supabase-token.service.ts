import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from 'jose';

/**
 * Verifies Supabase-issued access tokens, scheme-agnostically:
 *  1. Local verification — asymmetric JWKS (default for new projects) or, if
 *     SUPABASE_JWT_SECRET is set, legacy symmetric HS256. Fast, offline.
 *  2. Remote fallback — if local verification can't validate the token (e.g. a
 *     legacy HS256 project with no secret configured), the token is validated
 *     directly against Supabase's /auth/v1/user endpoint using the anon key.
 *
 * This means auth works without the operator having to know/declare the scheme.
 */
@Injectable()
export class SupabaseTokenService {
  private readonly logger = new Logger(SupabaseTokenService.name);
  private readonly issuer: string;
  private readonly supabaseUrl: string;
  private readonly anonKey?: string;
  private readonly jwks?: JWTVerifyGetKey;
  private readonly hs256Secret?: Uint8Array;

  constructor(config: ConfigService) {
    this.supabaseUrl = config.getOrThrow<string>('SUPABASE_URL');
    this.issuer = `${this.supabaseUrl}/auth/v1`;
    this.anonKey =
      config.get<string>('SUPABASE_ANON_KEY') ?? config.get<string>('SUPABASE_PUBLISHABLE_KEY');

    const jwtSecret = config.get<string>('SUPABASE_JWT_SECRET');
    if (jwtSecret) {
      this.hs256Secret = new TextEncoder().encode(jwtSecret);
      this.logger.log('Supabase token verification: local HS256 (shared secret)');
    } else {
      this.jwks = createRemoteJWKSet(new URL(`${this.issuer}/.well-known/jwks.json`));
      this.logger.log('Supabase token verification: local JWKS (+ remote fallback if available)');
    }
  }

  async verify(token: string): Promise<JWTPayload> {
    // 1. Local verification.
    try {
      const options = { issuer: this.issuer, audience: 'authenticated' };
      const { payload } = this.hs256Secret
        ? await jwtVerify(token, this.hs256Secret, options)
        : await jwtVerify(token, this.jwks!, options);
      if (payload.sub) return payload;
    } catch {
      // fall through to the remote fallback
    }

    // 2. Remote fallback — let Supabase validate the token for us.
    const remote = await this.verifyRemotely(token);
    if (remote) return remote;

    throw new UnauthorizedException('Invalid or expired token');
  }

  private async verifyRemotely(token: string): Promise<JWTPayload | null> {
    if (!this.anonKey) return null;
    try {
      const res = await fetch(`${this.issuer}/user`, {
        headers: { apikey: this.anonKey, Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const user = (await res.json()) as { id?: string; email?: string };
      if (!user.id) return null;
      return { sub: user.id, email: user.email } as JWTPayload;
    } catch {
      return null;
    }
  }
}
