import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE, APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ZodValidationPipe } from 'nestjs-zod';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health.controller';
import { validateEnv } from './config/env.validation';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { AuditInterceptor } from './common/audit.interceptor';

import { MeModule } from './modules/me/me.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { LeadsModule } from './modules/leads/leads.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { DealsModule } from './modules/deals/deals.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { PlotsModule } from './modules/plots/plots.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { QuotationsModule } from './modules/quotations/quotations.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { SiteVisitsModule } from './modules/site-visits/site-visits.module';
import { FollowUpsModule } from './modules/follow-ups/follow-ups.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuthModule,
    MeModule,
    DashboardModule,
    PermissionsModule,
    UsersModule,
    OrganizationModule,
    LeadsModule,
    CustomersModule,
    OpportunitiesModule,
    DealsModule,
    ProjectsModule,
    PlotsModule,
    CampaignsModule,
    QuotationsModule,
    BookingsModule,
    PaymentsModule,
    ReceiptsModule,
    DocumentsModule,
    TasksModule,
    SiteVisitsModule,
    FollowUpsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
