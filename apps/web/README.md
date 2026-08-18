# @recipe-finder/web

SvelteKit app for Recipe Finder & Meal Planner.

## Auth & database (Phase 02)

- **Browser localStorage only** — no Supabase / cloud DB
- Local email/password auth + repositories under `src/lib/local-db/`
- Env: MealDB base URL only (see `.env.example`)

```bash
# from monorepo root
pnpm --filter @recipe-finder/web dev
```

Routes: `/login`, `/signup`, `/auth/logout`.
