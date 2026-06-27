import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SupabaseAdminService } from '../../supabase/supabase-admin.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, SupabaseAdminService],
})
export class UsersModule {}
