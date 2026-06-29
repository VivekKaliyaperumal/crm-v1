import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/auth-user.interface';

const MUTATING = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

/**
 * Records every successful mutating request to `audit_logs` (who changed what,
 * when, and the payload). Fire-and-forget so it never blocks or fails the
 * response. Doubles as the universal per-entity activity timeline source.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<FastifyRequest & { user?: AuthUser }>();
    if (!MUTATING.has(req.method)) return next.handle();

    return next.handle().pipe(
      tap((result) => {
        const user = req.user;
        if (!user?.orgId) return;

        const entity = this.entityFromUrl(req.url);
        if (!entity || entity === 'auth' || entity === 'me') return;

        const entityId = this.extractId(result);
        const diff = this.safeDiff(req.body);

        this.prisma.auditLog
          .create({
            data: {
              orgId: user.orgId,
              actorId: user.id,
              entity,
              entityId,
              action: req.method,
              diff,
            },
          })
          .catch(() => {
            /* auditing must never break the request */
          });
      }),
    );
  }

  /** "/api/bookings/123" -> "bookings" */
  private entityFromUrl(url: string): string {
    const path = url.split('?')[0].replace(/^\/api\//, '');
    return path.split('/')[0] ?? '';
  }

  private extractId(result: unknown): string | null {
    if (result && typeof result === 'object' && 'id' in result) {
      const id = (result as { id?: unknown }).id;
      return typeof id === 'string' ? id : null;
    }
    return null;
  }

  private safeDiff(body: unknown): Prisma.InputJsonValue {
    if (!body || typeof body !== 'object') return {};
    return body as Prisma.InputJsonValue;
  }
}
