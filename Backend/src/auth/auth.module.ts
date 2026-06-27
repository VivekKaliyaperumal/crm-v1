import { Global, Module } from '@nestjs/common';
import { SupabaseTokenService } from './supabase-token.service';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';

@Global()
@Module({
  providers: [SupabaseTokenService, AuthGuard, RolesGuard],
  exports: [SupabaseTokenService, AuthGuard, RolesGuard],
})
export class AuthModule {}
