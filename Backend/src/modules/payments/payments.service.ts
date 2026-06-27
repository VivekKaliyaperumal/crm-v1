import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../../auth/auth-user.interface';
import type {
  CreatePaymentDto,
  ListPaymentsQueryDto,
  UpdatePaymentDto,
} from './payments.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser, query: ListPaymentsQueryDto) {
    const where: Prisma.PaymentWhereInput = { orgId: user.orgId };
    if (query.status) where.status = query.status;

    const skip = (query.page - 1) * query.pageSize;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  async get(user: AuthUser, id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, orgId: user.orgId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async create(user: AuthUser, dto: CreatePaymentDto) {
    return this.prisma.payment.create({
      data: {
        ...dto,
        orgId: user.orgId,
      },
    });
  }

  async update(user: AuthUser, id: string, dto: UpdatePaymentDto) {
    const existing = await this.prisma.payment.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Payment not found');

    return this.prisma.payment.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(user: AuthUser, id: string) {
    const existing = await this.prisma.payment.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Payment not found');

    await this.prisma.payment.delete({ where: { id } });
    return { id, deleted: true };
  }
}
