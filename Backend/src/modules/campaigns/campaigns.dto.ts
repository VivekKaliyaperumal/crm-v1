import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CampaignChannel, CampaignStatus } from '@prisma/client';

const campaignChannelEnum = z.nativeEnum(CampaignChannel);
const campaignStatusEnum = z.nativeEnum(CampaignStatus);

/** Fields a client may set when creating a campaign. org/createdBy come from auth. */
export const createCampaignSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  channel: campaignChannelEnum.default(CampaignChannel.other),
  status: campaignStatusEnum.default(CampaignStatus.draft),
  budget: z.number().nonnegative().optional(),
  spent: z.number().nonnegative().optional(),
  leadsCount: z.number().int().nonnegative().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  notes: z.string().trim().max(5000).optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial();

export const listCampaignsQuerySchema = z.object({
  status: campaignStatusEnum.optional(),
  channel: campaignChannelEnum.optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export class CreateCampaignDto extends createZodDto(createCampaignSchema) {}
export class UpdateCampaignDto extends createZodDto(updateCampaignSchema) {}
export class ListCampaignsQueryDto extends createZodDto(listCampaignsQuerySchema) {}
