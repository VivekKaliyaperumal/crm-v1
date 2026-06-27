import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { DealStatus } from '@prisma/client';

const dealStatusEnum = z.nativeEnum(DealStatus);

/** Fields a client may set when creating a deal. org/owner come from auth. */
export const createDealSchema = z.object({
  opportunityId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  plotId: z.string().uuid().optional(),
  title: z.string().trim().min(1, 'Title is required').max(200),
  amount: z.coerce.number().nonnegative().default(0),
  status: dealStatusEnum.default(DealStatus.open),
  closedAt: z.coerce.date().optional(),
});

export const updateDealSchema = createDealSchema.partial();

export const listDealsQuerySchema = z.object({
  status: dealStatusEnum.optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export class CreateDealDto extends createZodDto(createDealSchema) {}
export class UpdateDealDto extends createZodDto(updateDealSchema) {}
export class ListDealsQueryDto extends createZodDto(listDealsQuerySchema) {}
