import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { isManager, type AuthUser } from '../../auth/auth-user.interface';
import type { CreateLeadDto, ListLeadsQueryDto, UpdateLeadDto } from './leads.dto';

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
    return this.prisma.lead.create({
      data: {
        ...dto,
        email: dto.email || null,
        orgId: user.orgId,
        createdBy: user.id,
      },
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateLeadDto) {
    // Enforce visibility before mutating.
    const existing = await this.prisma.lead.findFirst({
      where: { id, ...this.visibilityWhere(user) },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Lead not found');

    return this.prisma.lead.update({
      where: { id },
      data: { ...dto, ...(dto.email !== undefined ? { email: dto.email || null } : {}) },
    });
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
