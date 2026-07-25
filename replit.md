# Barbie Fun (Degen Launchpad)

A multi-chain fair-launch token launchpad ("Barbie Fun") — lets users launch, trade, bridge, and track tokens across 6 EVM chains plus X1 and Solana.

## Run & Operate

- Workflows (auto-managed by the artifacts system, start via Replit UI or `WorkflowsRestart`):
  - `artifacts/launchpad: web` — frontend (Vite/React), served at `/`
  - `artifacts/api-server: API Server` — Express API, served at `/api` (health check: `/api/healthz`)
  - `artifacts/mockup-sandbox: Component Preview Server` — design/canvas sandbox
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages (frontend build needs `PORT`/`BASE_PATH` env, which the artifact workflow/deploy system injects automatically — don't run it bare from the shell)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (already configured)

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- Frontend: React + Vite, wagmi/viem (EVM wallets), Tailwind, shadcn/radix components
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Contracts: Hardhat (`contracts/`)

## Where things live

- `artifacts/launchpad` — React/Vite public launchpad and admin dashboard.
- `artifacts/api-server` — Express API, including launch records, live-stream settings, and object-storage routes.
- `lib/db/src/schema` — Drizzle source of truth for PostgreSQL tables.
- `lib/api-spec/openapi.yaml` — source of truth for generated API client/Zod types.
- `artifacts/launchpad/src/pages/Home.tsx` — public live section with embed, uploaded-video, and no-stream states.
- `artifacts/launchpad/src/pages/Admin.tsx` — admin Live Stream tab for Go Live links, embeds, and video uploads.

## Architecture decisions

- Live-stream configuration is stored as one database row (`default`) so all visitors see the same current settings.
- Uploaded videos use the existing two-step presigned Object Storage flow; the API receives metadata and the browser sends file bytes directly to storage.
- The public page prioritizes an uploaded video over an embed, then shows a useful no-stream state instead of rendering a broken hard-coded iframe.
- Stream settings are public to read, while the current admin password remains a client-side UX gate and is not a security boundary.

## Product

Barbie Fun is a multi-chain fair-launch token platform. Visitors can browse launches, inspect supported chains, connect wallets, launch tokens, bridge assets, and follow community activity. Admins can review launches and configure the public live-stream experience.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Start the managed services from the Replit workflow list: `artifacts/launchpad: web` and `artifacts/api-server: API Server`.
- `pnpm run typecheck` is the canonical workspace verification command.
- Run `pnpm --filter @workspace/db run push` after changing Drizzle schemas, then regenerate API types with `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml`.
- Public video uploads are limited to supported video MIME types and 100 MB; token logos remain limited to images and 2 MB.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
