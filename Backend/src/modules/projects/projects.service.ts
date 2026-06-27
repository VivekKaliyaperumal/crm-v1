import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { isManager, type AuthUser } from '../../auth/auth-user.interface';
import type { CreateProjectDto, ListProjectsQueryDto, UpdateProjectDto } from './projects.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser, query: ListProjectsQueryDto) {
    const where: Prisma.ProjectWhereInput = { orgId: user.orgId };
    if (query.status) where.status = query.status;
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const skip = (query.page - 1) * query.pageSize;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.project.count({ where }),
    ]);

    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  async get(user: AuthUser, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, orgId: user.orgId },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(user: AuthUser, dto: CreateProjectDto) {
    if (!isManager(user.roles)) {
      throw new ForbiddenException('Only managers can create projects');
    }
    return this.prisma.project.create({
      data: {
        ...dto,
        orgId: user.orgId,
        createdBy: user.id,
      },
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateProjectDto) {
    if (!isManager(user.roles)) {
      throw new ForbiddenException('Only managers can update projects');
    }
    const existing = await this.prisma.project.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Project not found');

    return this.prisma.project.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(user: AuthUser, id: string) {
    if (!isManager(user.roles)) {
      throw new ForbiddenException('Only managers can delete projects');
    }
    const existing = await this.prisma.project.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Project not found');

    await this.prisma.project.delete({ where: { id } });
    return { id, deleted: true };
  }
}
