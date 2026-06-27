import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateOrganizationSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    branding: z.record(z.any()).optional(),
    settings: z.record(z.any()).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update' });

export class UpdateOrganizationDto extends createZodDto(updateOrganizationSchema) {}
