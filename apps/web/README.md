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

## Stencil UI (Phase 06)

Depends on `@recipe-finder/ui` via `workspace:*`.

- **Registration:** `$lib/ui/register.ts` is called once from `+layout.svelte` (`onMount`, browser-only).
- **Theme:** `src/app.css` imports `@recipe-finder/ui/global.css` and overrides a few `--rf-*` tokens.
- **Smoke:** open [`/dev/ui`](http://localhost:5173/dev/ui) to exercise `search-bar`, `recipe-card`, and `empty-state`.
- **Vite:** `ssr.noExternal: ['@recipe-finder/ui']` — see `packages/recipe-ui/README.md` for the full SSR story.

```bash
pnpm --filter @recipe-finder/ui build
pnpm --filter @recipe-finder/web dev
```
