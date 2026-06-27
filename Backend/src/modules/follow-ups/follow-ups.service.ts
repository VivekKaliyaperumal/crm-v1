import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { isManager, type AuthUser } from '../../auth/auth-user.interface';
import type {
  CreateFollowUpDto,
  ListFollowUpsQueryDto,
  UpdateFollowUpDto,
} from './follow-ups.dto';

@Injectable()
export class FollowUpsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Row-visibility filter mirroring the old RLS "scoped by role" policy:
   * managers (admin/sales_manager) see every follow-up in the org; everyone else
   * sees only follow-ups assigned to them or created by them.
   */
  private visibilityWhere(user: AuthUser): Prisma.FollowUpWhereInput {
    if (isManager(user.roles)) {
      return { orgId: user.orgId };
    }
    return {
      orgId: user.orgId,
      OR: [{ assignedTo: user.id }, { createdBy: user.id }],
    };
  }

  async list(user: AuthUser, query: ListFollowUpsQueryDto) {
    const where: Prisma.FollowUpWhereInput = { ...this.visibilityWhere(user) };
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.assignedTo) where.assignedTo = query.assignedTo;

    const skip = (query.page - 1) * query.pageSize;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.followUp.findMany({
        where,
        orderBy: { dueAt: 'asc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.followUp.count({ where }),
    ]);

    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  async get(user: AuthUser, id: string) {
    const followUp = await this.prisma.followUp.findFirst({
      where: { id, ...this.visibilityWhere(user) },
    });
    if (!followUp) throw new NotFoundException('Follow-up not found');
    return followUp;
  }

  async create(user: AuthUser, dto: CreateFollowUpDto) {
    return this.prisma.followUp.create({
      data: {
        ...dto,
        orgId: user.orgId,
        createdBy: user.id,
      },
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateFollowUpDto) {
    // Enforce visibility before mutating.
    const existing = await this.prisma.followUp.findFirst({
      where: { id, ...this.visibilityWhere(user) },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Follow-up not found');

    return this.prisma.followUp.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(user: AuthUser, id: string) {
    // Mirrors RLS "Managers can delete follow-ups".
    if (!isManager(user.roles)) {
      throw new ForbiddenException('Only managers can delete follow-ups');
    }
    const existing = await this.prisma.followUp.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Follow-up not found');

    await this.prisma.followUp.delete({ where: { id } });
    return { id, deleted: true };
  }
}
