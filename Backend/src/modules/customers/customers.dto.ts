import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { KycStatus } from '@prisma/client';

const kycStatusEnum = z.nativeEnum(KycStatus);

/** Fields a client may set when creating a customer. org/owner come from auth. */
export const createCustomerSchema = z.object({
  leadId: z.string().uuid().optional(),
  fullName: z.string().trim().min(1, 'Name is required').max(200),
  email: z.string().trim().email().max(200).optional().or(z.literal('')),
  phone: z.string().trim().min(1, 'Phone is required').max(40),
  pan: z.string().trim().max(40).optional(),
  address: z.string().trim().max(500).optional(),
  city: z.string().trim().max(120).optional(),
  state: z.string().trim().max(120).optional(),
  pincode: z.string().trim().max(20).optional(),
  kycStatus: kycStatusEnum.default(KycStatus.pending),
  notes: z.string().trim().max(5000).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const listCustomersQuerySchema = z.object({
  kycStatus: kycStatusEnum.optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export class CreateCustomerDto extends createZodDto(createCustomerSchema) {}
export class UpdateCustomerDto extends createZodDto(updateCustomerSchema) {}
export class ListCustomersQueryDto extends createZodDto(listCustomersQuerySchema) {}
