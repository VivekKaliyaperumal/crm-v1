import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { QuotationStatus } from '@prisma/client';

const quotationStatusEnum = z.nativeEnum(QuotationStatus);

/** Fields a client may set when creating a quotation. org/createdBy come from auth. */
export const createQuotationSchema = z.object({
  // Auto-generated server-side when omitted.
  quotationNumber: z.string().min(1).optional(),
  customerId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  plotId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  amount: z.coerce.number().optional(),
  tax: z.coerce.number().optional(),
  discount: z.coerce.number().optional(),
  total: z.coerce.number().optional(),
  status: quotationStatusEnum.default(QuotationStatus.draft),
  validUntil: z.coerce.date().optional(),
  notes: z.string().trim().max(5000).optional(),
});

export const updateQuotationSchema = createQuotationSchema.partial();

export const listQuotationsQuerySchema = z.object({
  status: quotationStatusEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export class CreateQuotationDto extends createZodDto(createQuotationSchema) {}
export class UpdateQuotationDto extends createZodDto(updateQuotationSchema) {}
export class ListQuotationsQueryDto extends createZodDto(listQuotationsQuerySchema) {}
