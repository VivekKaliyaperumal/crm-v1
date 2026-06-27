import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../../auth/auth-user.interface';
import type {
  CreateQuotationDto,
  ListQuotationsQueryDto,
  UpdateQuotationDto,
} from './quotations.dto';

@Injectable()
export class QuotationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser, query: ListQuotationsQueryDto) {
    const where: Prisma.QuotationWhereInput = { orgId: user.orgId };
    if (query.status) where.status = query.status;

    const skip = (query.page - 1) * query.pageSize;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.quotation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.quotation.count({ where }),
    ]);

    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  async get(user: AuthUser, id: string) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, orgId: user.orgId },
    });
    if (!quotation) throw new NotFoundException('Quotation not found');
    return quotation;
  }

  async create(user: AuthUser, dto: CreateQuotationDto) {
    return this.prisma.quotation.create({
      data: {
        ...dto,
        orgId: user.orgId,
        createdBy: user.id,
      },
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateQuotationDto) {
    const existing = await this.prisma.quotation.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Quotation not found');

    return this.prisma.quotation.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(user: AuthUser, id: string) {
    const existing = await this.prisma.quotation.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Quotation not found');

    await this.prisma.quotation.delete({ where: { id } });
    return { id, deleted: true };
  }
}
