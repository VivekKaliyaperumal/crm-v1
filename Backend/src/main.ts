import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';
import { patchNestJsSwagger } from 'nestjs-zod';
import { AppModule } from './app.module';

// Allow BigInt values (e.g. Document.sizeBytes) to survive JSON serialization.
declare global {
  interface BigInt {
    toJSON(): string;
  }
}
BigInt.prototype.toJSON = function (): string {
  return this.toString();
};

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.register(fastifyCookie);

  app.setGlobalPrefix('api');

  const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());
  app.enableCors({ origin: corsOrigins, credentials: true });

  // Make @nestjs/swagger understand Zod DTOs.
  patchNestJsSwagger();
  const config = new DocumentBuilder()
    .setTitle('SmartAgro CRM API')
    .setDescription('Land CRM — leads, sales, inventory, billing')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
  Logger.log(`API running on http://localhost:${port}/api  (docs: /api/docs)`, 'Bootstrap');
}

void bootstrap();
