import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseTokenService } from './supabase-token.service';
import type { AuthUser } from './auth-user.interface';

/**
 * Authenticates every request: verifies the Supabase JWT, then loads the user's
 * organization + roles and attaches an AuthUser to the request. This replaces the
 * Postgres RLS auth.uid()/current_org_id() context that the old Supabase-direct
 * app relied on — org-scoping is now enforced by services using request.user.orgId.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokens: SupabaseTokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<FastifyRequest>();
    const token = this.extractToken(req);
    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const payload = await this.tokens.verify(token);
    const userId = payload.sub as string;

    const [profile, roles] = await Promise.all([
      this.prisma.profile.findUnique({ where: { id: userId } }),
      this.prisma.userRole.findMany({ where: { userId } }),
    ]);

    if (!profile?.orgId) {
      throw new ForbiddenException('User is not attached to an organization');
    }

    const user: AuthUser = {
      id: userId,
      email: profile.email ?? (typeof payload.email === 'string' ? payload.email : null),
      orgId: profile.orgId,
      roles: roles.filter((r) => r.orgId === profile.orgId).map((r) => r.role),
    };

    (req as FastifyRequest & { user: AuthUser }).user = user;
    return true;
  }

  private extractToken(req: FastifyRequest): string | null {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      return header.slice('Bearer '.length).trim() || null;
    }
    // Fallback: httpOnly cookie set by the Next.js frontend.
    const cookie = (req as FastifyRequest & { cookies?: Record<string, string> }).cookies;
    return cookie?.['sb-access-token'] ?? null;
  }
}
