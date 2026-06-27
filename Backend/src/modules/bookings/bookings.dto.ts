import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { BookingStatus } from '@prisma/client';

const bookingStatusEnum = z.nativeEnum(BookingStatus);

/** Fields a client may set when creating a booking. org/createdBy come from auth. */
export const createBookingSchema = z.object({
  bookingNumber: z.string().min(1, 'Booking number is required'),
  quotationId: z.string().uuid().optional(),
  customerId: z.string().uuid(),
  plotId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  bookingAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  agreementDate: z.coerce.date().optional(),
  status: bookingStatusEnum.default(BookingStatus.pending),
  notes: z.string().trim().max(5000).optional(),
});

export const updateBookingSchema = createBookingSchema.partial();

export const listBookingsQuerySchema = z.object({
  status: bookingStatusEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export class CreateBookingDto extends createZodDto(createBookingSchema) {}
export class UpdateBookingDto extends createZodDto(updateBookingSchema) {}
export class ListBookingsQueryDto extends createZodDto(listBookingsQuerySchema) {}
