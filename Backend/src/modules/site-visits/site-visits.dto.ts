import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { VisitStatus } from '@prisma/client';

const visitStatusEnum = z.nativeEnum(VisitStatus);

/** Fields a client may set when creating a site visit. org/createdBy come from auth. */
export const createSiteVisitSchema = z.object({
  leadId: z.string().uuid(),
  assignedTo: z.string().uuid().optional(),
  scheduledAt: z.coerce.date(),
  location: z.string().trim().min(1, 'Location is required').max(500),
  status: visitStatusEnum.default(VisitStatus.scheduled),
  preChecklist: z.any().optional(),
  postReport: z.any().optional(),
  notes: z.string().trim().max(5000).optional(),
});

export const updateSiteVisitSchema = createSiteVisitSchema.partial();

export const listSiteVisitsQuerySchema = z.object({
  status: visitStatusEnum.optional(),
  assignedTo: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export class CreateSiteVisitDto extends createZodDto(createSiteVisitSchema) {}
export class UpdateSiteVisitDto extends createZodDto(updateSiteVisitSchema) {}
export class ListSiteVisitsQueryDto extends createZodDto(listSiteVisitsQuerySchema) {}
