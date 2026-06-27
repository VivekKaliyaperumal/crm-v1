import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/** Fields a client may set when creating a receipt. org/issuedBy come from auth. */
export const createReceiptSchema = z.object({
  receiptNumber: z.string().min(1, 'Receipt number is required'),
  paymentId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  amount: z.coerce.number(),
  issuedAt: z.coerce.date().optional(),
  notes: z.string().trim().max(5000).optional(),
});

export const updateReceiptSchema = createReceiptSchema.partial();

export const listReceiptsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export class CreateReceiptDto extends createZodDto(createReceiptSchema) {}
export class UpdateReceiptDto extends createZodDto(updateReceiptSchema) {}
export class ListReceiptsQueryDto extends createZodDto(listReceiptsQuerySchema) {}
