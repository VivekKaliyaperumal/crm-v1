import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { assertInOrg } from '../../common/org-refs';
import { isManager, type AuthUser } from '../../auth/auth-user.interface';
import type {
  CreateOpportunityDto,
  ListOpportunitiesQueryDto,
  UpdateOpportunityDto,
} from './opportunities.dto';

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser, query: ListOpportunitiesQueryDto) {
    const where: Prisma.OpportunityWhereInput = { orgId: user.orgId };
    if (query.stage) where.stage = query.stage;
    if (query.search) {
      where.OR = [{ title: { contains: query.search, mode: 'insensitive' } }];
    }

    const skip = (query.page - 1) * query.pageSize;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.opportunity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.opportunity.count({ where }),
    ]);

    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  async get(user: AuthUser, id: string) {
    const opportunity = await this.prisma.opportunity.findFirst({
      where: { id, orgId: user.orgId },
    });
    if (!opportunity) throw new NotFoundException('Opportunity not found');
    return opportunity;
  }

  async create(user: AuthUser, dto: CreateOpportunityDto) {
    const checks: Promise<void>[] = [];
    if (dto.leadId) {
      checks.push(
        assertInOrg(
          this.prisma.lead.count({
            where: { id: dto.leadId, orgId: user.orgId },
          }),
          'Lead',
        ),
      );
    }
    if (dto.customerId) {
      checks.push(
        assertInOrg(
          this.prisma.customer.count({
            where: { id: dto.customerId, orgId: user.orgId },
          }),
          'Customer',
        ),
      );
    }
    if (dto.projectId) {
      checks.push(
        assertInOrg(
          this.prisma.project.count({
            where: { id: dto.projectId, orgId: user.orgId },
          }),
          'Project',
        ),
      );
    }
    if (dto.plotId) {
      checks.push(
        assertInOrg(
          this.prisma.plot.count({
            where: { id: dto.plotId, orgId: user.orgId },
          }),
          'Plot',
        ),
      );
    }
    await Promise.all(checks);

    return this.prisma.opportunity.create({
      data: {
        ...dto,
        orgId: user.orgId,
        ownerId: user.id,
      },
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateOpportunityDto) {
    const existing = await this.prisma.opportunity.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true, ownerId: true },
    });
    if (!existing) throw new NotFoundException('Opportunity not found');

    if (!isManager(user.roles) && existing.ownerId !== user.id) {
      throw new ForbiddenException('You can only update your own opportunities');
    }

    const checks: Promise<void>[] = [];
    if (dto.leadId !== undefined) {
      checks.push(
        assertInOrg(
          this.prisma.lead.count({
            where: { id: dto.leadId, orgId: user.orgId },
          }),
          'Lead',
        ),
      );
    }
    if (dto.customerId !== undefined) {
      checks.push(
        assertInOrg(
          this.prisma.customer.count({
            where: { id: dto.customerId, orgId: user.orgId },
          }),
          'Customer',
        ),
      );
    }
    if (dto.projectId !== undefined) {
      checks.push(
        assertInOrg(
          this.prisma.project.count({
            where: { id: dto.projectId, orgId: user.orgId },
          }),
          'Project',
        ),
      );
    }
    if (dto.plotId !== undefined) {
      checks.push(
        assertInOrg(
          this.prisma.plot.count({
            where: { id: dto.plotId, orgId: user.orgId },
          }),
          'Plot',
        ),
      );
    }
    await Promise.all(checks);

    return this.prisma.opportunity.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(user: AuthUser, id: string) {
    if (!isManager(user.roles)) {
      throw new ForbiddenException('Only managers can delete opportunities');
    }
    const existing = await this.prisma.opportunity.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Opportunity not found');

    await this.prisma.opportunity.delete({ where: { id } });
    return { id, deleted: true };
  }
}
