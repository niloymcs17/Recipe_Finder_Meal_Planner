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

### Connect `@recipe-finder/ui` locally (monorepo)

`apps/web` pins **`@recipe-finder/ui@1.0.1`** from npm so deploys and clones without the workspace still resolve the published package. To develop against the **local** Stencil library in `packages/recipe-ui`, link the workspace package:

1. In `apps/web/package.json`, change the dependency:

```json
"@recipe-finder/ui": "workspace:*"
```

2. Reinstall from the repo root:

```bash
pnpm install
```

3. Build the UI once (or keep the Stencil dev server running):

```bash
pnpm --filter @recipe-finder/ui build
# or, for live component reload:
pnpm dev:ui
```

4. Start the web app:

```bash
pnpm dev:web
```

pnpm will resolve `@recipe-finder/ui` to `packages/recipe-ui` instead of npm. Edit components under `packages/recipe-ui/src/`; after Stencil rebuilds, refresh the SvelteKit app to see changes.

**Two-terminal workflow (UI + web):**

| Terminal | Command |
|----------|---------|
| 1 | `pnpm dev:ui` — Stencil watch/build |
| 2 | `pnpm dev:web` — SvelteKit dev server |

**Switch back to npm** before deploy or when testing the published package — set `"@recipe-finder/ui": "1.0.1"` again and run `pnpm install`. See [docs/publish-ui-package.md](./docs/publish-ui-package.md) for publishing.

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


## Links

- **Stencil UI library on npm:** [https://www.npmjs.com/package/@recipe-finder/ui](https://www.npmjs.com/package/@recipe-finder/ui)
- **GitHub repository:** [https://github.com/niloymcs17/Recipe_Finder_Meal_Planner](https://github.com/niloymcs17/Recipe_Finder_Meal_Planner)
- **Assumptions:** [docs/ASSUMPTIONS.md](./docs/ASSUMPTIONS.md)
- **Server-side validation:** [docs/server-side-validation.md](./docs/server-side-validation.md)
- **UI package usage:** [packages/recipe-ui/readme.md](./packages/recipe-ui/readme.md)
- **Publishing the UI package:** [docs/publish-ui-package.md](./docs/publish-ui-package.md)
