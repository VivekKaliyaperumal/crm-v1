import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AppRole } from '@prisma/client';

export const updateUserSchema = z
  .object({
    roles: z.array(z.nativeEnum(AppRole)).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((v) => v.roles !== undefined || v.isActive !== undefined, {
    message: 'Provide roles and/or isActive',
  });

export class UpdateUserDto extends createZodDto(updateUserSchema) {}

export const inviteUserSchema = z.object({
  email: z.string().email('A valid email is required'),
  roles: z.array(z.nativeEnum(AppRole)).min(1, 'Pick at least one role'),
});

export class InviteUserDto extends createZodDto(inviteUserSchema) {}
