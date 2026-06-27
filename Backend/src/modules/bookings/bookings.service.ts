import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
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
    return this.prisma.booking.create({
      data: {
        ...dto,
        orgId: user.orgId,
        createdBy: user.id,
      },
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateBookingDto) {
    const existing = await this.prisma.booking.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Booking not found');

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

    await this.prisma.booking.delete({ where: { id } });
    return { id, deleted: true };
  }
}
