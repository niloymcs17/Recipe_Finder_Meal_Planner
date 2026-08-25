# @recipe-finder/web

SvelteKit app for Recipe Finder & Meal Planner.

## Auth & database

- **Browser localStorage only** — no Supabase / cloud DB
- Local email/password auth + repositories under `src/lib/local-db/`
- Password hashing is **demo-grade** (Web Crypto SHA-256 in the client) — not production security
- Env: MealDB base URL only (see `.env.example`); validated in `src/lib/server/env.ts`

```bash
# from monorepo root
pnpm --filter @recipe-finder/web dev
```

Routes: `/login`, `/signup`, `/auth/logout`, `/favorites`, `/planner`, `/recipe/new`, `/recipe/[id]`, `/recipe/[id]/edit`.

Favorites and meal-plan entries are stored in **this browser’s localStorage** for the signed-in local user. They are not shared across browsers or profiles.

User recipes are saved in **this browser’s localStorage**. Refresh keeps them; clearing site data or using another browser does not.

## Stencil UI

Depends on `@recipe-finder/ui@1.0.1` from npm.

- **Registration:** `$lib/ui/register.ts` is called once from `+layout.svelte` (`onMount`, browser-only).
- **Theme:** `src/app.css` imports `@recipe-finder/ui/global.css` and overrides a few `--rf-*` tokens.
- **Vite:** `ssr.noExternal: ['@recipe-finder/ui']` — see `packages/recipe-ui/README.md` for the full SSR story.

```bash
pnpm --filter @recipe-finder/ui build
pnpm --filter @recipe-finder/web dev
```

## Build & deploy

```bash
pnpm --filter @recipe-finder/ui build
pnpm --filter @recipe-finder/web build
pnpm --filter @recipe-finder/web preview   # local production preview
```

**Netlify:** see [`netlify.toml`](../../netlify.toml) at the monorepo root (`pnpm build`, publish `apps/web/build`, Node 20, `MEALDB_BASE_URL`). Override env vars in the Netlify dashboard if needed.

## UX polish (Phase 10)

- Global error boundary (`+error.svelte`)
- Delayed loading indicators on discovery grid, favorites, planner week, and recipe details
- Toasts on auth, CRUD, favorites, and planner mutations
- Site-wide localStorage notice in root layout
