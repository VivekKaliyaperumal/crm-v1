# SmartAgro Land CRM

A multi-tenant real-estate / farmland CRM — leads, sales pipeline, plot inventory,
billing and campaigns — built on the SmartAgro standard stack.

## Stack

| Layer | Technology |
|---|---|
| Backend API | NestJS 11 + Fastify + Prisma 6 |
| Database | PostgreSQL 17 (Supabase-hosted) |
| Auth | Supabase Auth (JWT verified by NestJS; stored in httpOnly cookies) |
| Frontend | Next.js 16 (App Router) + React 19 |
| UI | Tailwind CSS 4 + TanStack Query 5 |
| Validation | Zod (shared between API DTOs and forms) |

## Layout

```
Backend/    NestJS API — modules per domain (leads, customers, deals, …) + Prisma schema
Frontend/   Next.js app — login, dashboard, and config-driven module pages
supabase/   SQL migrations (the database source of truth)
```

## Running locally

1. **Backend**
   ```bash
   cd Backend
   cp .env.example .env        # then fill DATABASE_URL + DIRECT_URL from Supabase
   npm install
   npm run prisma:generate
   npm run start:dev           # http://localhost:3001/api  (docs: /api/docs)
   ```
2. **Frontend**
   ```bash
   cd Frontend
   npm install
   npm run dev                 # http://localhost:3000
   ```
3. Sign in with a seeded user (e.g. `admin@demo.test` / `Demo!2345`).

## Architecture notes

- Multi-tenancy: every row is scoped by `org_id`. The Postgres RLS rules from the
  original schema are re-implemented in the NestJS service layer (Prisma connects
  with a privileged connection that bypasses RLS).
- Money is stored and handled as `Decimal` (never floating point).
- The frontend never holds a JWT in JS: login hands the Supabase session to a
  server route that sets httpOnly cookies; a BFF proxy injects the token per request.
