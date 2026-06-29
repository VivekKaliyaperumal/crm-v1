import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { assertInOrg } from '../../common/org-refs';
import { isManager, type AuthUser } from '../../auth/auth-user.interface';
import type {
  CreateSiteVisitDto,
  ListSiteVisitsQueryDto,
  UpdateSiteVisitDto,
} from './site-visits.dto';

@Injectable()
export class SiteVisitsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Row-visibility filter mirroring the old RLS "scoped by role" policy:
   * managers (admin/sales_manager) see every site visit in the org; everyone else
   * sees only site visits assigned to them or created by them.
   */
  private visibilityWhere(user: AuthUser): Prisma.SiteVisitWhereInput {
    if (isManager(user.roles)) {
      return { orgId: user.orgId };
    }
    return {
      orgId: user.orgId,
      OR: [{ assignedTo: user.id }, { createdBy: user.id }],
    };
  }

  async list(user: AuthUser, query: ListSiteVisitsQueryDto) {
    const where: Prisma.SiteVisitWhereInput = { ...this.visibilityWhere(user) };
    if (query.status) where.status = query.status;
    if (query.assignedTo) where.assignedTo = query.assignedTo;

    const skip = (query.page - 1) * query.pageSize;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.siteVisit.findMany({
        where,
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.siteVisit.count({ where }),
    ]);

    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  async get(user: AuthUser, id: string) {
    const siteVisit = await this.prisma.siteVisit.findFirst({
      where: { id, ...this.visibilityWhere(user) },
    });
    if (!siteVisit) throw new NotFoundException('Site visit not found');
    return siteVisit;
  }

  async create(user: AuthUser, dto: CreateSiteVisitDto) {
    await assertInOrg(
      this.prisma.lead.count({
        where: { id: dto.leadId, orgId: user.orgId },
      }),
      'Lead',
    );

    return this.prisma.siteVisit.create({
      data: {
        ...dto,
        orgId: user.orgId,
        createdBy: user.id,
      },
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateSiteVisitDto) {
    // Enforce visibility before mutating.
    const existing = await this.prisma.siteVisit.findFirst({
      where: { id, ...this.visibilityWhere(user) },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Site visit not found');

    if (dto.leadId !== undefined) {
      await assertInOrg(
        this.prisma.lead.count({
          where: { id: dto.leadId, orgId: user.orgId },
        }),
        'Lead',
      );
    }

    return this.prisma.siteVisit.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(user: AuthUser, id: string) {
    // Mirrors RLS "Managers can delete site visits".
    if (!isManager(user.roles)) {
      throw new ForbiddenException('Only managers can delete site visits');
    }
    const existing = await this.prisma.siteVisit.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Site visit not found');

    await this.prisma.siteVisit.delete({ where: { id } });
    return { id, deleted: true };
  }
}
