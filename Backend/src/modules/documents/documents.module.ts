import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { SupabaseAdminService } from '../../supabase/supabase-admin.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, SupabaseAdminService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
