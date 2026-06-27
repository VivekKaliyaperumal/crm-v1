import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { isManager, type AuthUser } from '../../auth/auth-user.interface';
import type { CreateTaskDto, ListTasksQueryDto, UpdateTaskDto } from './tasks.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Row-visibility filter mirroring the old RLS "scoped by role" policy:
   * managers (admin/sales_manager) see every task in the org; everyone else sees
   * only tasks assigned to them or created by them.
   */
  private visibilityWhere(user: AuthUser): Prisma.TaskWhereInput {
    if (isManager(user.roles)) {
      return { orgId: user.orgId };
    }
    return {
      orgId: user.orgId,
      OR: [{ assignedTo: user.id }, { createdBy: user.id }],
    };
  }

  async list(user: AuthUser, query: ListTasksQueryDto) {
    const where: Prisma.TaskWhereInput = { ...this.visibilityWhere(user) };
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.assignedTo) where.assignedTo = query.assignedTo;

    const skip = (query.page - 1) * query.pageSize;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.task.count({ where }),
    ]);

    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  async get(user: AuthUser, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, ...this.visibilityWhere(user) },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(user: AuthUser, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        ...dto,
        orgId: user.orgId,
        createdBy: user.id,
      },
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateTaskDto) {
    // Enforce visibility before mutating.
    const existing = await this.prisma.task.findFirst({
      where: { id, ...this.visibilityWhere(user) },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Task not found');

    return this.prisma.task.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(user: AuthUser, id: string) {
    // Mirrors RLS "Managers can delete tasks".
    if (!isManager(user.roles)) {
      throw new ForbiddenException('Only managers can delete tasks');
    }
    const existing = await this.prisma.task.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Task not found');

    await this.prisma.task.delete({ where: { id } });
    return { id, deleted: true };
  }
}
