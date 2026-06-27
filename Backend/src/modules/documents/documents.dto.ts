import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/** Fields a client may set when creating a document. org/uploadedBy come from auth. */
export const createDocumentSchema = z.object({
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  storagePath: z.string().min(1, 'Storage path is required'),
  mimeType: z.string().trim().max(200).optional(),
  sizeBytes: z.number().int().optional(),
});

export const updateDocumentSchema = createDocumentSchema.partial();

export const listDocumentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export class CreateDocumentDto extends createZodDto(createDocumentSchema) {}
export class UpdateDocumentDto extends createZodDto(updateDocumentSchema) {}
export class ListDocumentsQueryDto extends createZodDto(listDocumentsQuerySchema) {}
