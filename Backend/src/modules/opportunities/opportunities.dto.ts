import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { OpportunityStage } from '@prisma/client';

const opportunityStageEnum = z.nativeEnum(OpportunityStage);

/** Fields a client may set when creating an opportunity. org/owner come from auth. */
export const createOpportunitySchema = z.object({
  leadId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  plotId: z.string().uuid().optional(),
  title: z.string().trim().min(1, 'Title is required').max(200),
  stage: opportunityStageEnum.default(OpportunityStage.qualification),
  value: z.coerce.number().nonnegative().default(0),
  probability: z.coerce.number().int().min(0).max(100).default(20),
  expectedClose: z.coerce.date().optional(),
  notes: z.string().trim().max(5000).optional(),
});

export const updateOpportunitySchema = createOpportunitySchema.partial();

export const listOpportunitiesQuerySchema = z.object({
  stage: opportunityStageEnum.optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export class CreateOpportunityDto extends createZodDto(createOpportunitySchema) {}
export class UpdateOpportunityDto extends createZodDto(updateOpportunitySchema) {}
export class ListOpportunitiesQueryDto extends createZodDto(
  listOpportunitiesQuerySchema,
) {}
