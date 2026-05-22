# S N Homes PWA

Production-ready V1 scaffold for **S N Homes**, a Kerala real estate matchmaking PWA and internal CRM.

## Stack

- Next.js 15 App Router, TypeScript, Tailwind CSS
- Supabase Auth, Database, RLS, and Storage-ready schema
- TanStack Query, React Hook Form, Zod
- PWA manifest, service worker, offline shell
- Supabase-first backend with secure Next.js server routes for form submissions
- Monorepo with `apps/web`, `packages/types`, and `supabase`
- Docker and Vercel-friendly structure

## Project Structure

```text
apps/
  web/        Next.js PWA, public forms, admin CRM, secure server routes
packages/
  types/      Shared constants, Zod schemas, TypeScript types
supabase/
  schema.sql  Database schema, relations, RLS policies
  seed.sql    V1 seed data
```

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Fill Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

4. Run database SQL in Supabase:

```bash
supabase/schema.sql
supabase/seed.sql
```

5. Start the web app:

```bash
pnpm dev
```

## Routes

- `/` landing page
- `/buy` buy/rent requirement form
- `/sell` property submission form
- `/success` request confirmation
- `/track` request status lookup
- `/admin/login` Supabase admin login
- `/admin` dashboard
- `/admin/leads`, `/admin/properties`, `/admin/matching`, `/admin/followups`, `/admin/visits`, `/admin/activity`, `/admin/analytics`, `/admin/settings`

## PWA

The app includes:

- `app/manifest.ts`
- `public/sw.js`
- `public/icon.svg`
- `/offline` fallback shell

The service worker registers in production builds.

## Docker

```bash
docker compose up --build
```

Web runs on `http://localhost:3000`. Supabase is the backend.

## Notes

- Public users do not create accounts.
- Admin auth uses Supabase email/password.
- All persistent backend data and auth live in Supabase.
- Next.js `/api/*` routes are server-side form handlers that validate input and call Supabase with the service role key.
- WhatsApp actions are placeholder links for V1.
- Photo upload UI is present; Supabase Storage wiring can be expanded in the next iteration.
