import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { assertInOrg } from '../../common/org-refs';
import { isManager, type AuthUser } from '../../auth/auth-user.interface';
import type { CreateDealDto, ListDealsQueryDto, UpdateDealDto } from './deals.dto';

@Injectable()
export class DealsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser, query: ListDealsQueryDto) {
    const where: Prisma.DealWhereInput = { orgId: user.orgId };
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [{ title: { contains: query.search, mode: 'insensitive' } }];
    }

    const skip = (query.page - 1) * query.pageSize;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.deal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.deal.count({ where }),
    ]);

    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  async get(user: AuthUser, id: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id, orgId: user.orgId },
    });
    if (!deal) throw new NotFoundException('Deal not found');
    return deal;
  }

  async create(user: AuthUser, dto: CreateDealDto) {
    const checks: Promise<void>[] = [];
    if (dto.opportunityId) {
      checks.push(
        assertInOrg(
          this.prisma.opportunity.count({
            where: { id: dto.opportunityId, orgId: user.orgId },
          }),
          'Opportunity',
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

    return this.prisma.deal.create({
      data: {
        ...dto,
        orgId: user.orgId,
        ownerId: user.id,
      },
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateDealDto) {
    const existing = await this.prisma.deal.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true, ownerId: true },
    });
    if (!existing) throw new NotFoundException('Deal not found');

    if (!isManager(user.roles) && existing.ownerId !== user.id) {
      throw new ForbiddenException('You can only update your own deals');
    }

    const checks: Promise<void>[] = [];
    if (dto.opportunityId !== undefined) {
      checks.push(
        assertInOrg(
          this.prisma.opportunity.count({
            where: { id: dto.opportunityId, orgId: user.orgId },
          }),
          'Opportunity',
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

    return this.prisma.deal.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(user: AuthUser, id: string) {
    if (!isManager(user.roles)) {
      throw new ForbiddenException('Only managers can delete deals');
    }
    const existing = await this.prisma.deal.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Deal not found');

    await this.prisma.deal.delete({ where: { id } });
    return { id, deleted: true };
  }
}
