import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { FollowupPriority, FollowupStatus } from '@prisma/client';

const followupPriorityEnum = z.nativeEnum(FollowupPriority);
const followupStatusEnum = z.nativeEnum(FollowupStatus);

/** Fields a client may set when creating a follow-up. org/createdBy come from auth. */
export const createFollowUpSchema = z.object({
  leadId: z.string().uuid(),
  assignedTo: z.string().uuid().optional(),
  dueAt: z.coerce.date(),
  priority: followupPriorityEnum.default(FollowupPriority.medium),
  status: followupStatusEnum.default(FollowupStatus.pending),
  notes: z.string().trim().max(5000).optional(),
  outcome: z.string().trim().max(5000).optional(),
});

export const updateFollowUpSchema = createFollowUpSchema.partial();

export const listFollowUpsQuerySchema = z.object({
  status: followupStatusEnum.optional(),
  priority: followupPriorityEnum.optional(),
  assignedTo: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export class CreateFollowUpDto extends createZodDto(createFollowUpSchema) {}
export class UpdateFollowUpDto extends createZodDto(updateFollowUpSchema) {}
export class ListFollowUpsQueryDto extends createZodDto(listFollowUpsQuerySchema) {}
