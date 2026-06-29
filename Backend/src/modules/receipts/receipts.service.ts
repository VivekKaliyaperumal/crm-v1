import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { assertInOrg } from '../../common/org-refs';
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
    const checks: Promise<void>[] = [];
    if (dto.paymentId) {
      checks.push(
        assertInOrg(
          this.prisma.payment.count({
            where: { id: dto.paymentId, orgId: user.orgId },
          }),
          'Payment',
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
    await Promise.all(checks);

    if (dto.receiptNumber) {
      return this.prisma.receipt.create({
        data: {
          ...dto,
          receiptNumber: dto.receiptNumber,
          orgId: user.orgId,
          issuedBy: user.id,
        },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const count = await tx.receipt.count({ where: { orgId: user.orgId } });
      const receiptNumber = `RCP/${new Date().getFullYear()}/${String(
        count + 1,
      ).padStart(4, '0')}`;
      return tx.receipt.create({
        data: {
          ...dto,
          receiptNumber,
          orgId: user.orgId,
          issuedBy: user.id,
        },
      });
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateReceiptDto) {
    const existing = await this.prisma.receipt.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Receipt not found');

    const checks: Promise<void>[] = [];
    if (dto.paymentId !== undefined) {
      checks.push(
        assertInOrg(
          this.prisma.payment.count({
            where: { id: dto.paymentId, orgId: user.orgId },
          }),
          'Payment',
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
    await Promise.all(checks);

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
