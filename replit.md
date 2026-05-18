# AJN — مجموعة علي جان

Full-stack Arabic RTL platform for Ali Jan Group. The project now runs as a single Next.js application from the repository root: public site, admin dashboard, delivery panel, and API routes all live in one deployable app.

## Run & Operate

- `npm install` — install root dependencies and local workspace packages
- `npm run dev` — run Next.js from the root; frontend and API are served together
- `npm run typecheck` — typecheck the app plus shared API/DB packages
- `npm run build` — production build for Vercel
- `npm run db:setup` — print/apply database setup instructions
- `npm run db:seed` — seed initial data when the database is ready
- `npm run db:check` — verify required database tables

## Stack

- Next.js 16 App Router + Pages API route catch-all
- React 19, React Router in client-only mode for the existing route tree
- TanStack Query generated hooks from OpenAPI
- PostgreSQL/Supabase connection through `DATABASE_URL`
- Drizzle ORM table definitions in `lib/db`
- Tailwind v4, shadcn/ui components, Cairo font, RTL black/gold theme
- HttpOnly admin session cookie with username/password login

## Where Things Live

- `src/app/[[...slug]]/` — Next catch-all shell for the client app
- `src/views/` — public, admin, delivery, cart, checkout, product, tracking views
- `src/pages/api/[...path].ts` — single Next API entrypoint
- `src/server/api/` — API routes, auth helpers, permissions, and middleware
- `src/components/` — UI components
- `src/lib/` — cart store and shared frontend helpers
- `lib/api-spec/openapi.yaml` — API contract source
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas
- `lib/db/src/schema/` — Drizzle schema
- `supabase/` — clean schema/seed/migrations for a new Supabase database

## Environment

Use `.env.example` as the template. Required for database-backed API routes:

- `DATABASE_URL`
- `SESSION_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## Product Scope

- Public site: home, services, service request forms, store, product details, cart, checkout, tracking, gallery, account
- Admin: dashboard, orders, products, services/bookings, customers, inventory, accounting, gallery, delivery, reviews, employees/permissions
- Delivery panel: shipped orders and delivery status updates
- Auth: admin login via username/password and protected admin/API routes

## Notes

- The app intentionally deploys as one Vercel project; no separate backend server is required.
- Do not run database push/migration commands against production without an explicit instruction.
- Keep generated OpenAPI client files in sync by running `npm run codegen` after API contract changes.
