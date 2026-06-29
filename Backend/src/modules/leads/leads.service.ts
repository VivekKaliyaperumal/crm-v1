import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ActivityType, AppRole, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { isManager, type AuthUser } from '../../auth/auth-user.interface';
import type { CreateLeadDto, ListLeadsQueryDto, UpdateLeadDto } from './leads.dto';

const ASSIGNABLE_ROLES: AppRole[] = [
  AppRole.sales_executive,
  AppRole.sales_manager,
  AppRole.telecaller,
];

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Row-visibility filter mirroring the old RLS "scoped by role" policy:
   * managers (admin/sales_manager) see every lead in the org; everyone else sees
   * only leads assigned to them or created by them.
   */
  private visibilityWhere(user: AuthUser): Prisma.LeadWhereInput {
    if (isManager(user.roles)) {
      return { orgId: user.orgId };
    }
    return {
      orgId: user.orgId,
      OR: [{ assignedTo: user.id }, { createdBy: user.id }],
    };
  }

  private logActivity(
    user: AuthUser,
    leadId: string,
    type: ActivityType,
    payload: Prisma.InputJsonValue,
  ) {
    return this.prisma.leadActivity.create({
      data: { orgId: user.orgId, leadId, type, payload, actorId: user.id },
    });
  }

  /** Round-robin the next sales user for a new unassigned lead (uses assignment_pointer). */
  private async pickAssignee(orgId: string): Promise<string | undefined> {
    const roles = await this.prisma.userRole.findMany({
      where: { orgId, role: { in: ASSIGNABLE_ROLES } },
      select: { userId: true },
    });
    const candidates = [...new Set(roles.map((r) => r.userId))].sort();
    if (candidates.length === 0) return undefined;

    const pointer = await this.prisma.assignmentPointer.findUnique({ where: { orgId } });
    const lastIdx = pointer?.lastAssignedUserId
      ? candidates.indexOf(pointer.lastAssignedUserId)
      : -1;
    const next = candidates[(lastIdx + 1) % candidates.length];

    await this.prisma.assignmentPointer.upsert({
      where: { orgId },
      update: { lastAssignedUserId: next },
      create: { orgId, lastAssignedUserId: next },
    });
    return next;
  }

  async list(user: AuthUser, query: ListLeadsQueryDto) {
    const where: Prisma.LeadWhereInput = { ...this.visibilityWhere(user) };
    if (query.status) where.status = query.status;
    if (query.source) where.source = query.source;
    if (query.assignedTo) where.assignedTo = query.assignedTo;
    if (query.search) {
      // Use AND so the search does not clobber the visibility OR (assigned/created)
      // that visibilityWhere() sets for non-managers.
      where.AND = [
        {
          OR: [
            { fullName: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const skip = (query.page - 1) * query.pageSize;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.lead.count({ where }),
    ]);

    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  async get(user: AuthUser, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, ...this.visibilityWhere(user) },
      include: {
        activities: { orderBy: { occurredAt: 'desc' }, take: 50 },
        followUps: { orderBy: { dueAt: 'asc' } },
        siteVisits: { orderBy: { scheduledAt: 'desc' } },
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async create(user: AuthUser, dto: CreateLeadDto) {
    const assignedTo = dto.assignedTo ?? (await this.pickAssignee(user.orgId));

    const lead = await this.prisma.lead.create({
      data: {
        ...dto,
        email: dto.email || null,
        orgId: user.orgId,
        createdBy: user.id,
        assignedTo,
        lastActivityAt: new Date(),
      },
    });

    await this.logActivity(user, lead.id, ActivityType.note, { text: 'Lead created' });
    return lead;
  }

  async update(user: AuthUser, id: string, dto: UpdateLeadDto) {
    // Enforce visibility before mutating.
    const existing = await this.prisma.lead.findFirst({
      where: { id, ...this.visibilityWhere(user) },
      select: { id: true, status: true },
    });
    if (!existing) throw new NotFoundException('Lead not found');

    const lead = await this.prisma.lead.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.email !== undefined ? { email: dto.email || null } : {}),
        lastActivityAt: new Date(),
      },
    });

    if (dto.status && dto.status !== existing.status) {
      await this.logActivity(user, id, ActivityType.status_change, {
        from: existing.status,
        to: dto.status,
      });
    }
    return lead;
  }

  async remove(user: AuthUser, id: string) {
    // Mirrors RLS "Managers can delete leads".
    if (!isManager(user.roles)) {
      throw new ForbiddenException('Only managers can delete leads');
    }
    const existing = await this.prisma.lead.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Lead not found');

    await this.prisma.lead.delete({ where: { id } });
    return { id, deleted: true };
  }
}
