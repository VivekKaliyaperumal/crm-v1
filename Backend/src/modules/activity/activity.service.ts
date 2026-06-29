import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../../auth/auth-user.interface';

/** Reads the universal audit_logs trail as a per-entity activity timeline. */
@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async forEntity(user: AuthUser, entityType: string, entityId: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: { orgId: user.orgId, entity: entityType, entityId },
      orderBy: { at: 'desc' },
      take: 100,
    });

    const actorIds = [...new Set(logs.map((l) => l.actorId).filter((x): x is string => Boolean(x)))];
    const profiles = actorIds.length
      ? await this.prisma.profile.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, fullName: true, email: true },
        })
      : [];
    const nameById = new Map(profiles.map((p) => [p.id, p.fullName ?? p.email ?? 'Unknown']));

    return logs.map((l) => ({
      id: l.id,
      action: l.action,
      at: l.at,
      actor: l.actorId ? (nameById.get(l.actorId) ?? 'Unknown') : 'System',
    }));
  }
}
