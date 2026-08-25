# Recipe Finder & Meal Planner

pnpm monorepo for a SvelteKit app and a Stencil UI component library.

**Live app:** [https://niloy-meal-planner.netlify.app](https://niloy-meal-planner.netlify.app)

Assumptions for this project (local-first demo, localStorage, TheMealDB, demo auth) live in **[docs/ASSUMPTIONS.md](./docs/ASSUMPTIONS.md)**.

## Setup

### Prerequisites

- Node.js 20+ (LTS)
- pnpm 9+
- No cloud DB account required

### Install

From the repository root:

```bash
pnpm install
```

Root `.npmrc` sets `shamefully-hoist=true` to ease Stencil dependency resolution in the workspace, and pins the public npm registry.

### Env (MealDB only)

Copy the example env and set TheMealDB base URL if needed (free public API; no key for core endpoints):

```bash
cp .env.example apps/web/.env
# or: cp apps/web/.env.example apps/web/.env
```

PowerShell:

```powershell
Copy-Item .env.example apps/web/.env
```

```env
MEALDB_BASE_URL=https://www.themealdb.com/api/json/v1/1
```


| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `MEALDB_BASE_URL` | No | `https://www.themealdb.com/api/json/v1/1` | TheMealDB API base (proxied by SvelteKit) |

If set, `MEALDB_BASE_URL` must be a valid URL — validated on the server at startup (`src/lib/server/env.ts`).

Primary auth path: **local email + password** (`/signup`, `/login`) stored in the browser. Logout clears the local session.

Build order: `@recipe-finder/ui` must build before `@recipe-finder/web`.

```bash
pnpm --filter @recipe-finder/ui build
```

## Starting the development server

Start the SvelteKit app from the repository root:

```bash
pnpm dev:web
```

This runs `vite dev` for `@recipe-finder/web`. Open the URL printed in the terminal (typically `http://localhost:5173`).

To work on the Stencil library with live reload:

```bash
pnpm dev:ui
```

| Command | Description |
|---------|-------------|
| `pnpm dev:web` | SvelteKit app (`@recipe-finder/web`) |
| `pnpm dev:ui` | Stencil library dev server (`@recipe-finder/ui`) |
| `pnpm build` | Build UI, then web |
| `pnpm check` | Type-check the web app |
| `pnpm test` | Run UI package tests |

**Local production preview:**

```bash
pnpm build
pnpm --filter @recipe-finder/web preview
```

After deploy, each visitor’s browser keeps its own localStorage data — same as local dev. Data does not sync across browsers or devices.

## Deploy (Netlify)

[`netlify.toml`](./netlify.toml) at the repo root configures build, publish directory, Node version, and `MEALDB_BASE_URL`.

**Git connect:** import the repo on Netlify — settings are read from `netlify.toml` automatically.

**Without Git:** install [Netlify CLI](https://docs.netlify.com/cli/get-started/), then:

```bash
netlify login
netlify init
pnpm --filter @recipe-finder/web build
netlify deploy --prod --no-build
```

Run `netlify deploy` from the **repo root** (where `netlify.toml` lives). If you are in `apps/web`, use `netlify deploy --prod --no-build --dir=build` instead.

## Links

- **Stencil UI library on npm:** [https://www.npmjs.com/package/@recipe-finder/ui](https://www.npmjs.com/package/@recipe-finder/ui)
- **GitHub repository:** [https://github.com/niloymcs17/Recipe_Finder_Meal_Planner](https://github.com/niloymcs17/Recipe_Finder_Meal_Planner)
- **Assumptions:** [docs/ASSUMPTIONS.md](./docs/ASSUMPTIONS.md)
- **Server-side validation:** [docs/server-side-validation.md](./docs/server-side-validation.md)
- **UI package usage:** [packages/recipe-ui/readme.md](./packages/recipe-ui/readme.md)
- **Publishing the UI package:** [docs/publish-ui-package.md](./docs/publish-ui-package.md)
