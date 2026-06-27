import { z } from 'zod';

/** Validated at boot — the app refuses to start with a broken environment. */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().min(1).optional(),
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_PROJECT_ID: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_JWT_SECRET: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  PORT: z.coerce.number().int().positive().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  CORS_ORIGINS: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  DOCUMENTS_BUCKET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = JSON.stringify(parsed.error.flatten().fieldErrors);
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  return parsed.data;
}
