import { Injectable } from '@nestjs/common';
import { DealStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../../auth/auth-user.interface';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async stats(user: AuthUser) {
    const orgId = user.orgId;

    const [
      leads,
      customers,
      opportunities,
      deals,
      plots,
      bookings,
    ] = await this.prisma.$transaction([
      this.prisma.lead.count({ where: { orgId } }),
      this.prisma.customer.count({ where: { orgId } }),
      this.prisma.opportunity.count({ where: { orgId } }),
      this.prisma.deal.count({ where: { orgId } }),
      this.prisma.plot.count({ where: { orgId } }),
      this.prisma.booking.count({ where: { orgId } }),
    ]);

    const [leadsByStatusRaw, dealsByStatusRaw, plotsByStatusRaw, wonAgg] =
      await Promise.all([
        this.prisma.lead.groupBy({
          by: ['status'],
          where: { orgId },
          _count: { _all: true },
        }),
        this.prisma.deal.groupBy({
          by: ['status'],
          where: { orgId },
          _count: { _all: true },
        }),
        this.prisma.plot.groupBy({
          by: ['status'],
          where: { orgId },
          _count: { _all: true },
        }),
        this.prisma.deal.aggregate({
          where: { orgId, status: DealStatus.won },
          _sum: { amount: true },
        }),
      ]);

    return {
      totals: { leads, customers, opportunities, deals, plots, bookings },
      leadsByStatus: leadsByStatusRaw.map((g) => ({
        status: g.status,
        count: g._count._all,
      })),
      dealsByStatus: dealsByStatusRaw.map((g) => ({
        status: g.status,
        count: g._count._all,
      })),
      plotsByStatus: plotsByStatusRaw.map((g) => ({
        status: g.status,
        count: g._count._all,
      })),
      wonDealValue: Number(wonAgg._sum.amount ?? 0),
    };
  }
}
