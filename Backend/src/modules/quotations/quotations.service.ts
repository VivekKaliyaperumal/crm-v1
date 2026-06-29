import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { assertInOrg } from '../../common/org-refs';
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
    const checks: Promise<void>[] = [];
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
    if (dto.leadId) {
      checks.push(
        assertInOrg(
          this.prisma.lead.count({
            where: { id: dto.leadId, orgId: user.orgId },
          }),
          'Lead',
        ),
      );
    }
    if (dto.plotId) {
      checks.push(
        assertInOrg(
          this.prisma.plot.count({
            where: { id: dto.plotId, orgId: user.orgId },
          }),
          'Plot',
        ),
      );
    }
    if (dto.projectId) {
      checks.push(
        assertInOrg(
          this.prisma.project.count({
            where: { id: dto.projectId, orgId: user.orgId },
          }),
          'Project',
        ),
      );
    }
    await Promise.all(checks);

    if (dto.quotationNumber) {
      return this.prisma.quotation.create({
        data: {
          ...dto,
          quotationNumber: dto.quotationNumber,
          orgId: user.orgId,
          createdBy: user.id,
        },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const count = await tx.quotation.count({ where: { orgId: user.orgId } });
      const quotationNumber = `QUO/${new Date().getFullYear()}/${String(
        count + 1,
      ).padStart(4, '0')}`;
      return tx.quotation.create({
        data: {
          ...dto,
          quotationNumber,
          orgId: user.orgId,
          createdBy: user.id,
        },
      });
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateQuotationDto) {
    const existing = await this.prisma.quotation.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Quotation not found');

    const checks: Promise<void>[] = [];
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
    if (dto.leadId !== undefined) {
      checks.push(
        assertInOrg(
          this.prisma.lead.count({
            where: { id: dto.leadId, orgId: user.orgId },
          }),
          'Lead',
        ),
      );
    }
    if (dto.plotId !== undefined) {
      checks.push(
        assertInOrg(
          this.prisma.plot.count({
            where: { id: dto.plotId, orgId: user.orgId },
          }),
          'Plot',
        ),
      );
    }
    if (dto.projectId !== undefined) {
      checks.push(
        assertInOrg(
          this.prisma.project.count({
            where: { id: dto.projectId, orgId: user.orgId },
          }),
          'Project',
        ),
      );
    }
    await Promise.all(checks);

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
