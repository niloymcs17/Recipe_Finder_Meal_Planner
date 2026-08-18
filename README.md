# Recipe Finder & Meal Planner

pnpm monorepo for a SvelteKit app and a Stencil UI component library.

## Layout

```text
Recipe_Finder_Meal_Planner/
├── apps/web/                 # SvelteKit (@recipe-finder/web)
├── packages/recipe-ui/       # Stencil (@recipe-finder/ui)
├── task/                     # phased implementation plans
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Prerequisites

- Node.js 20+ (LTS)
- pnpm 9+

## Setup

```bash
pnpm install
```

Copy `.env.example` to `apps/web/.env` when you reach Phase 02 (Supabase). Root `.npmrc` sets `shamefully-hoist=true` to ease Stencil dependency resolution in the workspace, and pins the public npm registry.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev:ui` | Stencil library dev server (`@recipe-finder/ui`) |
| `pnpm dev:web` | SvelteKit app (`@recipe-finder/web`) |
| `pnpm build` | Build UI, then web |
| `pnpm check` | Type-check the web app |
| `pnpm test` | Run UI package tests |

## Phases

See [task/phases-overview.md](./task/phases-overview.md) for the full roadmap.
