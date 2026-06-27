/* Generates openapi.json from the Nest app WITHOUT a database connection.
 * Run: npm run openapi:generate  →  writes Backend/openapi.json
 * The Frontend then turns it into typed definitions (npm run api:types). */
process.env.GENERATE_OPENAPI = '1';
process.env.DATABASE_URL ||= 'postgresql://user:pass@localhost:5432/db';
process.env.SUPABASE_URL ||= 'https://example.supabase.co';

async function main(): Promise<void> {
  const { NestFactory } = await import('@nestjs/core');
  const { FastifyAdapter } = await import('@nestjs/platform-fastify');
  const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
  const { writeFileSync } = await import('fs');
  const { AppModule } = await import('./app.module');

  const app = await NestFactory.create(AppModule, new FastifyAdapter(), { logger: false });
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('SmartAgro CRM API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  writeFileSync('openapi.json', JSON.stringify(document, null, 2));
  await app.close();
  // eslint-disable-next-line no-console
  console.log('Wrote openapi.json');
}

void main();
