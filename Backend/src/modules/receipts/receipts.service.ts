import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../../auth/auth-user.interface';
import type {
  CreateReceiptDto,
  ListReceiptsQueryDto,
  UpdateReceiptDto,
} from './receipts.dto';

@Injectable()
export class ReceiptsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser, query: ListReceiptsQueryDto) {
    const where: Prisma.ReceiptWhereInput = { orgId: user.orgId };

    const skip = (query.page - 1) * query.pageSize;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.receipt.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.receipt.count({ where }),
    ]);

    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  async get(user: AuthUser, id: string) {
    const receipt = await this.prisma.receipt.findFirst({
      where: { id, orgId: user.orgId },
    });
    if (!receipt) throw new NotFoundException('Receipt not found');
    return receipt;
  }

  async create(user: AuthUser, dto: CreateReceiptDto) {
    return this.prisma.receipt.create({
      data: {
        ...dto,
        orgId: user.orgId,
        issuedBy: user.id,
      },
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateReceiptDto) {
    const existing = await this.prisma.receipt.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Receipt not found');

    return this.prisma.receipt.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(user: AuthUser, id: string) {
    const existing = await this.prisma.receipt.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Receipt not found');

    await this.prisma.receipt.delete({ where: { id } });
    return { id, deleted: true };
  }
}
