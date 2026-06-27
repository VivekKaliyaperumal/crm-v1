import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { isManager, type AuthUser } from '../../auth/auth-user.interface';
import type { CreateCampaignDto, ListCampaignsQueryDto, UpdateCampaignDto } from './campaigns.dto';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser, query: ListCampaignsQueryDto) {
    const where: Prisma.CampaignWhereInput = { orgId: user.orgId };
    if (query.status) where.status = query.status;
    if (query.channel) where.channel = query.channel;
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const skip = (query.page - 1) * query.pageSize;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.campaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  async get(user: AuthUser, id: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, orgId: user.orgId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async create(user: AuthUser, dto: CreateCampaignDto) {
    if (!isManager(user.roles)) {
      throw new ForbiddenException('Only managers can create campaigns');
    }
    return this.prisma.campaign.create({
      data: {
        ...dto,
        orgId: user.orgId,
        createdBy: user.id,
      },
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateCampaignDto) {
    if (!isManager(user.roles)) {
      throw new ForbiddenException('Only managers can update campaigns');
    }
    const existing = await this.prisma.campaign.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Campaign not found');

    return this.prisma.campaign.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(user: AuthUser, id: string) {
    if (!isManager(user.roles)) {
      throw new ForbiddenException('Only managers can delete campaigns');
    }
    const existing = await this.prisma.campaign.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Campaign not found');

    await this.prisma.campaign.delete({ where: { id } });
    return { id, deleted: true };
  }
}
