# Recipe Finder & Meal Planner

pnpm monorepo for a SvelteKit app and a Stencil UI component library.

## Assumptions

This project is a **local-first demo**, not a production multi-user service. 

### Data and persistence

- **Browser localStorage is the source of truth** for accounts, user-created recipes, favorites, and meal-plan entries.
- **No cloud database** — no cloud infra, Postgres, or multi-device sync.
- **TheMealDB is the only remote recipe data** — browse/search runs through a SvelteKit proxy; user-owned data never leaves the device.
- **Refresh keeps data; a new browser, private/incognito window, or “clear site data” starts empty** — that is expected, not a bug.
- **Favorites and planner rows are scoped to the signed-in local user on this browser** — they are not shared across browsers or profiles.

### Auth and security

- **Sign-up and login are local email + password**, stored in this browser only. Logout clears the local session.
- **Auth is demo-grade**, not production security (password hashing via Web Crypto in the client; no server-side identity provider).
- **Do not treat this as real multi-user security** — suitable for learning and single-browser use, not for protecting sensitive accounts.

### Architecture

- **The SvelteKit server does not own user data** — it proxies TheMealDB; CRUD for recipes, favorites, and planner happens in client-side repositories (`apps/web/src/lib/local-db/`).
- **Svelte rune stores are a UI cache** — repositories write to localStorage; stores hydrate from them and roll back on failure.
- **Ownership is implicit** — rows belong to whoever is signed in on this browser; repositories filter by `userId` / `ownerId` from the session, never from untrusted form fields alone.

### Environment and tooling

- **Node.js 20+** and **pnpm 9+**; no cloud DB account required.
- **Env is MealDB-only** (`MEALDB_BASE_URL`) — do not add cloud DB keys.
- **Monorepo build order:** `@recipe-finder/ui` builds before `@recipe-finder/web`.

### UI

- **`@recipe-finder/ui` (Stencil) is presentational only** — no fetching or persistence inside components.
- **Custom elements register once on the client** (root layout, browser-only) — not during SSR.
- **Theming uses `--rf-*` CSS variables** loaded from `@recipe-finder/ui/global.css`.



## Storage model (quick reference)

| What | Where it lives |
|------|----------------|
| TheMealDB browse/search | Remote API (proxied by SvelteKit) |
| Accounts, user recipes, favorites, planner | This browser’s localStorage |
| Multi-device sync | Not supported |
| Clear site data / new browser / private mode | Starts empty |

Recipes you create under `/recipe/new` are stored in this browser only. Refresh keeps them; they are **not** visible in another browser or after clearing site data.


## Prerequisites

- Node.js 20+ (LTS)
- pnpm 9+
- No cloud DB account required

## Setup

```bash
pnpm install
```

### Env (MealDB only)

Copy the example env and set TheMealDB base URL if needed (free public API; no key for core endpoints):

```bash
cp .env.example apps/web/.env
# or: cp apps/web/.env.example apps/web/.env
```

```env
MEALDB_BASE_URL=https://www.themealdb.com/api/json/v1/1
```

Do **not** add Supabase URL/keys — they are out of scope for this project.

Primary auth path: **local email + password** (`/signup`, `/login`) stored in the browser. Logout clears the local session.

Root `.npmrc` sets `shamefully-hoist=true` to ease Stencil dependency resolution in the workspace, and pins the public npm registry.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev:ui` | Stencil library dev server (`@recipe-finder/ui`) |
| `pnpm dev:web` | SvelteKit app (`@recipe-finder/web`) |
| `pnpm build` | Build UI, then web |
| `pnpm check` | Type-check the web app |
| `pnpm test` | Run UI package tests |

### Env vars (MealDB only)

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `MEALDB_BASE_URL` | No | `https://www.themealdb.com/api/json/v1/1` | TheMealDB API base (proxied by SvelteKit) |

Copy `.env.example` to `apps/web/.env`. If set, `MEALDB_BASE_URL` must be a valid URL — validated on the server at startup (`src/lib/server/env.ts`). No Supabase or other cloud DB keys.



**Build (from repo root):**

```bash
pnpm install
pnpm --filter @recipe-finder/ui build
pnpm --filter @recipe-finder/web build
```

**Host settings:**

- Root directory: monorepo root (or set build to run from root)
- Build command: `pnpm build` (UI must build before web)
- Output: SvelteKit adapter output under `apps/web/build` (or host-specific)
- Env: set `MEALDB_BASE_URL` in the host dashboard (optional; defaults to public TheMealDB)

**Local production preview:**

```bash
pnpm --filter @recipe-finder/web preview
```

**After deploy:** each visitor’s browser keeps its own localStorage data — same as local dev. Sign up, create recipes, favorite, and plan meals on the deployed URL; data does not sync across browsers or devices.

### UI package publish

Day-to-day development uses `"@recipe-finder/ui": "workspace:*"`. To publish to npm for external consumers, follow [packages/recipe-ui/readme.md](./packages/recipe-ui/readme.md). Graders running the monorepo should use `workspace:*` and `pnpm build` from the root.

