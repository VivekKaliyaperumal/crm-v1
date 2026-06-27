import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';

const taskStatusEnum = z.nativeEnum(TaskStatus);
const taskPriorityEnum = z.nativeEnum(TaskPriority);

/** Fields a client may set when creating a task. org/createdBy come from auth. */
export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(300),
  description: z.string().trim().max(5000).optional(),
  status: taskStatusEnum.default(TaskStatus.open),
  priority: taskPriorityEnum.default(TaskPriority.medium),
  dueAt: z.coerce.date().optional(),
  assignedTo: z.string().uuid().optional(),
  relatedLeadId: z.string().uuid().optional(),
  relatedCustomerId: z.string().uuid().optional(),
  relatedOpportunityId: z.string().uuid().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const listTasksQuerySchema = z.object({
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  assignedTo: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export class CreateTaskDto extends createZodDto(createTaskSchema) {}
export class UpdateTaskDto extends createZodDto(updateTaskSchema) {}
export class ListTasksQueryDto extends createZodDto(listTasksQuerySchema) {}
