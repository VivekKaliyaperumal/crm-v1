import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';

const projectStatusEnum = z.nativeEnum(ProjectStatus);

/** Fields a client may set when creating a project. org/createdBy come from auth. */
export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  code: z.string().trim().max(60).optional(),
  location: z.string().trim().max(500).optional(),
  description: z.string().trim().max(5000).optional(),
  totalAreaSqft: z.coerce.number().nonnegative().optional(),
  totalPlots: z.coerce.number().int().nonnegative().optional(),
  status: projectStatusEnum.default(ProjectStatus.planning),
  coverImageUrl: z.string().trim().max(1000).optional(),
  launchDate: z.coerce.date().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const listProjectsQuerySchema = z.object({
  status: projectStatusEnum.optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export class CreateProjectDto extends createZodDto(createProjectSchema) {}
export class UpdateProjectDto extends createZodDto(updateProjectSchema) {}
export class ListProjectsQueryDto extends createZodDto(listProjectsQuerySchema) {}
