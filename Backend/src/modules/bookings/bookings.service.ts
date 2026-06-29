import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { assertInOrg } from '../../common/org-refs';
import type { AuthUser } from '../../auth/auth-user.interface';
import type {
  CreateBookingDto,
  ListBookingsQueryDto,
  UpdateBookingDto,
} from './bookings.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser, query: ListBookingsQueryDto) {
    const where: Prisma.BookingWhereInput = { orgId: user.orgId };
    if (query.status) where.status = query.status;

    const skip = (query.page - 1) * query.pageSize;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  async get(user: AuthUser, id: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, orgId: user.orgId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async create(user: AuthUser, dto: CreateBookingDto) {
    const checks: Promise<void>[] = [
      assertInOrg(
        this.prisma.customer.count({
          where: { id: dto.customerId, orgId: user.orgId },
        }),
        'Customer',
      ),
      assertInOrg(
        this.prisma.plot.count({
          where: { id: dto.plotId, orgId: user.orgId },
        }),
        'Plot',
      ),
    ];
    if (dto.quotationId) {
      checks.push(
        assertInOrg(
          this.prisma.quotation.count({
            where: { id: dto.quotationId, orgId: user.orgId },
          }),
          'Quotation',
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

    if (dto.bookingNumber) {
      return this.prisma.booking.create({
        data: {
          ...dto,
          bookingNumber: dto.bookingNumber,
          orgId: user.orgId,
          createdBy: user.id,
        },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const count = await tx.booking.count({ where: { orgId: user.orgId } });
      const bookingNumber = `BKG/${new Date().getFullYear()}/${String(
        count + 1,
      ).padStart(4, '0')}`;
      return tx.booking.create({
        data: {
          ...dto,
          bookingNumber,
          orgId: user.orgId,
          createdBy: user.id,
        },
      });
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateBookingDto) {
    const existing = await this.prisma.booking.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Booking not found');

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
    if (dto.quotationId !== undefined) {
      checks.push(
        assertInOrg(
          this.prisma.quotation.count({
            where: { id: dto.quotationId, orgId: user.orgId },
          }),
          'Quotation',
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

    return this.prisma.booking.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(user: AuthUser, id: string) {
    const existing = await this.prisma.booking.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Booking not found');

    // Guard against silent cascade loss of financial records.
    const paymentCount = await this.prisma.payment.count({ where: { bookingId: id } });
    if (paymentCount > 0) {
      throw new ConflictException(
        'Cannot delete a booking that has payments. Remove its payments first.',
      );
    }

    await this.prisma.booking.delete({ where: { id } });
    return { id, deleted: true };
  }
}
