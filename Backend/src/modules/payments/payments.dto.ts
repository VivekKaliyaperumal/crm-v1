import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaymentMode, PaymentStatus } from '@prisma/client';

const paymentModeEnum = z.nativeEnum(PaymentMode);
const paymentStatusEnum = z.nativeEnum(PaymentStatus);

/** Fields a client may set when creating a payment. org comes from auth. */
export const createPaymentSchema = z.object({
  bookingId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  mode: paymentModeEnum.default(PaymentMode.bank_transfer),
  status: paymentStatusEnum.default(PaymentStatus.scheduled),
  dueDate: z.coerce.date().optional(),
  paidAt: z.coerce.date().optional(),
  reference: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(5000).optional(),
});

export const updatePaymentSchema = createPaymentSchema.partial();

export const listPaymentsQuerySchema = z.object({
  status: paymentStatusEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export class CreatePaymentDto extends createZodDto(createPaymentSchema) {}
export class UpdatePaymentDto extends createZodDto(updatePaymentSchema) {}
export class ListPaymentsQueryDto extends createZodDto(listPaymentsQuerySchema) {}
