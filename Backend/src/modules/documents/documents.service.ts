import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseAdminService } from '../../supabase/supabase-admin.service';
import type { AuthUser } from '../../auth/auth-user.interface';
import type {
  CreateDocumentDto,
  ListDocumentsQueryDto,
  UpdateDocumentDto,
} from './documents.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly admin: SupabaseAdminService,
  ) {}

  /** Issue a signed URL the browser uploads the file to, before creating the row. */
  async createUploadTarget(user: AuthUser, filename: string) {
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
    const path = `${user.orgId}/${Date.now()}-${safe}`;
    return this.admin.createSignedUploadUrl(path);
  }

  async getDownloadUrl(user: AuthUser, id: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, orgId: user.orgId },
      select: { storagePath: true },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return { url: await this.admin.createSignedDownloadUrl(doc.storagePath) };
  }

  async list(user: AuthUser, query: ListDocumentsQueryDto) {
    const where: Prisma.DocumentWhereInput = { orgId: user.orgId };

    const skip = (query.page - 1) * query.pageSize;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.document.count({ where }),
    ]);

    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  async get(user: AuthUser, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, orgId: user.orgId },
    });
    if (!document) throw new NotFoundException('Document not found');
    return document;
  }

  async create(user: AuthUser, dto: CreateDocumentDto) {
    return this.prisma.document.create({
      data: {
        ...dto,
        orgId: user.orgId,
        uploadedBy: user.id,
      },
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateDocumentDto) {
    const existing = await this.prisma.document.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Document not found');

    return this.prisma.document.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(user: AuthUser, id: string) {
    const existing = await this.prisma.document.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Document not found');

    await this.prisma.document.delete({ where: { id } });
    return { id, deleted: true };
  }
}
