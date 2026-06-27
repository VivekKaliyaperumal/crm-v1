import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    // Skip the DB connection when only generating the OpenAPI spec offline.
    if (process.env.GENERATE_OPENAPI === '1') return;
    await this.$connect();
    this.logger.log('Connected to PostgreSQL (Supabase) via Prisma');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
