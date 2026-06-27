import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { LeadSource, LeadStatus } from '@prisma/client';

const leadSourceEnum = z.nativeEnum(LeadSource);
const leadStatusEnum = z.nativeEnum(LeadStatus);

/** Fields a client may set when creating a lead. org/createdBy come from auth. */
export const createLeadSchema = z.object({
  fullName: z.string().trim().min(1, 'Name is required').max(200),
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().email().max(200).optional().or(z.literal('')),
  propertyInterest: z.string().trim().max(500).optional(),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  timeline: z.string().trim().max(120).optional(),
  source: leadSourceEnum.default(LeadSource.manual),
  status: leadStatusEnum.default(LeadStatus.new),
  assignedTo: z.string().uuid().optional(),
  notes: z.string().trim().max(5000).optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const listLeadsQuerySchema = z.object({
  status: leadStatusEnum.optional(),
  source: leadSourceEnum.optional(),
  assignedTo: z.string().uuid().optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export class CreateLeadDto extends createZodDto(createLeadSchema) {}
export class UpdateLeadDto extends createZodDto(updateLeadSchema) {}
export class ListLeadsQueryDto extends createZodDto(listLeadsQuerySchema) {}
