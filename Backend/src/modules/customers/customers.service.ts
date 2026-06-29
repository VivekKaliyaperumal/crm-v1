import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { isManager, type AuthUser } from '../../auth/auth-user.interface';
import type {
  CreateCustomerDto,
  ListCustomersQueryDto,
  UpdateCustomerDto,
} from './customers.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser, query: ListCustomersQueryDto) {
    const where: Prisma.CustomerWhereInput = { orgId: user.orgId };
    if (query.kycStatus) where.kycStatus = query.kycStatus;
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const skip = (query.page - 1) * query.pageSize;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  async get(user: AuthUser, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, orgId: user.orgId },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  /** Customer-360: every record linked to this customer, for a single screen. */
  async related(user: AuthUser, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const orgId = user.orgId;
    const recent = { orderBy: { createdAt: 'desc' as const }, take: 10 };
    const [opportunities, deals, quotations, bookings, payments, receipts, documents] =
      await this.prisma.$transaction([
        this.prisma.opportunity.findMany({ where: { orgId, customerId: id }, ...recent }),
        this.prisma.deal.findMany({ where: { orgId, customerId: id }, ...recent }),
        this.prisma.quotation.findMany({ where: { orgId, customerId: id }, ...recent }),
        this.prisma.booking.findMany({ where: { orgId, customerId: id }, ...recent }),
        this.prisma.payment.findMany({ where: { orgId, customerId: id }, ...recent }),
        this.prisma.receipt.findMany({ where: { orgId, customerId: id }, ...recent }),
        this.prisma.document.findMany({ where: { orgId, entityId: id }, ...recent }),
      ]);

    return { opportunities, deals, quotations, bookings, payments, receipts, documents };
  }

  async create(user: AuthUser, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        ...dto,
        email: dto.email || null,
        orgId: user.orgId,
        ownerId: user.id,
      },
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateCustomerDto) {
    const existing = await this.prisma.customer.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true, ownerId: true },
    });
    if (!existing) throw new NotFoundException('Customer not found');

    if (!isManager(user.roles) && existing.ownerId !== user.id) {
      throw new ForbiddenException('You can only update your own customers');
    }

    return this.prisma.customer.update({
      where: { id },
      data: { ...dto, ...(dto.email !== undefined ? { email: dto.email || null } : {}) },
    });
  }

  async remove(user: AuthUser, id: string) {
    if (!isManager(user.roles)) {
      throw new ForbiddenException('Only managers can delete customers');
    }
    const existing = await this.prisma.customer.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Customer not found');

    await this.prisma.customer.delete({ where: { id } });
    return { id, deleted: true };
  }
}
