# @recipe-finder/web

SvelteKit app for Recipe Finder & Meal Planner.

## Auth & database 

- **Browser localStorage only** — no Supabase / cloud DB
- Local email/password auth + repositories under `src/lib/local-db/`
- Env: MealDB base URL only (see `.env.example`)

```bash
# from monorepo root
pnpm --filter @recipe-finder/web dev
```

Routes: `/login`, `/signup`, `/auth/logout`, `/favorites`, `/planner`, `/recipe/new`, `/recipe/[id]`, `/recipe/[id]/edit`.

Favorites and meal-plan entries are stored in **this browser’s localStorage** for the signed-in local user. They are not shared across browsers or profiles.

User recipes are saved in **this browser’s localStorage**. Refresh keeps them; clearing site data or using another browser does not.

## Stencil UI 

Depends on `@recipe-finder/ui` via `workspace:*`.

- **Registration:** `$lib/ui/register.ts` is called once from `+layout.svelte` (`onMount`, browser-only).
- **Theme:** `src/app.css` imports `@recipe-finder/ui/global.css` and overrides a few `--rf-*` tokens.
- **Smoke:** open [`/dev/ui`](http://localhost:5173/dev/ui) to exercise `search-bar`, `recipe-card`, and `empty-state`.
- **Vite:** `ssr.noExternal: ['@recipe-finder/ui']` — see `packages/recipe-ui/README.md` for the full SSR story.

```bash
pnpm --filter @recipe-finder/ui build
pnpm --filter @recipe-finder/web dev
```
