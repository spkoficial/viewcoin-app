---
name: ViewCoin App
description: Setup quirks, key file locations, and decisions for the ViewCoin App project
---

## Project summary
Simulador de celular (iPhone mockup) onde usuários ganham Viewcoins assistindo lives. React + Vite frontend dentro de moldura de iPhone, Express backend com auth stateful em memória.

## Critical setup detail
The phone frame image must exist at `attached_assets/image_1785729593271.png`. It is referenced in `artifacts/viewcoin-app/src/components/phone-layout.tsx` via the `@assets` alias. If the image is missing, Vite throws a 500 error and the entire app fails to load.

**Why:** The ZIP export from the original repl didn't include `attached_assets/` in the working tree — it had to be extracted from the ZIP's git objects manually.

## Auth
- Tokens stored in a `Map` in memory in `artifacts/api-server/src/lib/auth.ts` — lost on server restart
- Password hash: `sha256(password + "viewcoin-salt-2024")`
- Default admin: email `admin@viewcoin.tv`, password `admin123`, hash `511e4a3b6ef312c6c7b9479b5cc3250bb23f450b7feb6639c342c321def1d489`
- Admin user must exist in the database (seeded via `executeSql`)

## OpenAPI / codegen
- Spec at `lib/api-spec/openapi.yaml`
- Avoid `format: email` and `type: integer` in the spec — Orval + Zod v4 generates incompatible syntax for those
- Run `pnpm --filter @workspace/api-spec run codegen` after any spec change

## DB schema
- `users`, `schedule_slots`, `viewcoin_transactions` tables
- Run `pnpm --filter @workspace/db run push` to apply schema changes
