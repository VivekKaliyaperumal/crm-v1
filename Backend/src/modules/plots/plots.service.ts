import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { isManager, type AuthUser } from '../../auth/auth-user.interface';
import type { CreatePlotDto, ListPlotsQueryDto, UpdatePlotDto } from './plots.dto';

@Injectable()
export class PlotsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser, query: ListPlotsQueryDto) {
    const where: Prisma.PlotWhereInput = { orgId: user.orgId };
    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.plotNumber = { contains: query.search, mode: 'insensitive' };
    }

    const skip = (query.page - 1) * query.pageSize;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.plot.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.plot.count({ where }),
    ]);

    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  async get(user: AuthUser, id: string) {
    const plot = await this.prisma.plot.findFirst({
      where: { id, orgId: user.orgId },
      include: { project: true },
    });
    if (!plot) throw new NotFoundException('Plot not found');
    return plot;
  }

  async create(user: AuthUser, dto: CreatePlotDto) {
    if (!isManager(user.roles)) {
      throw new ForbiddenException('Only managers can create plots');
    }
    return this.prisma.plot.create({
      data: {
        ...dto,
        orgId: user.orgId,
      },
    });
  }

  async update(user: AuthUser, id: string, dto: UpdatePlotDto) {
    if (!isManager(user.roles)) {
      throw new ForbiddenException('Only managers can update plots');
    }
    const existing = await this.prisma.plot.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Plot not found');

    return this.prisma.plot.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(user: AuthUser, id: string) {
    if (!isManager(user.roles)) {
      throw new ForbiddenException('Only managers can delete plots');
    }
    const existing = await this.prisma.plot.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Plot not found');

    await this.prisma.plot.delete({ where: { id } });
    return { id, deleted: true };
  }
}
