# `@recipe-finder/ui`

Stencil custom-elements library for Recipe Finder & Meal Planner. Presentational components only; theming via CSS custom properties (`--rf-*`).

## Scripts (from monorepo root)

```bash
pnpm --filter @recipe-finder/ui start   # Stencil www preview
pnpm --filter @recipe-finder/ui build   # production dist + custom-elements
pnpm --filter @recipe-finder/ui test
```

Or from this package: `pnpm start` / `pnpm build`.

## Build outputs

| Path | Purpose |
| --- | --- |
| `dist/` | Library bundle + collection |
| `dist/components/` | **Custom elements** (`dist-custom-elements`, `bundle` export) |
| `loader/` | Lazy `defineCustomElements` from the `dist` target |
| `dist/recipe-ui/recipe-ui.css` | Bundled global theme tokens (`@recipe-finder/ui/global.css`) |

Published tarball includes only `dist/` and `loader/` (see `"files"` in `package.json`).

## Consume in the monorepo (day-to-day)

`apps/web` depends on `"@recipe-finder/ui": "workspace:*"`. Root `pnpm build` builds UI before web so `dist` exists for CI/deploy.

## Register custom elements (SvelteKit)

Preferred one-shot registration from the custom-elements bundle:

```ts
import { defineCustomElements } from '@recipe-finder/ui';

defineCustomElements();
```

Lazy loader alternative:

```ts
import { defineCustomElements } from '@recipe-finder/ui/loader';

defineCustomElements();
```

Call **once** in the browser (root layout via `$lib/ui/register.ts` — `browser` guard + dynamic import). Do not register per route.

### SSR / Vite notes (chosen approach)

1. Register only on the client (`browser` / `onMount` + dynamic `import('@recipe-finder/ui')`) so Node never executes CE `define` during SSR.
2. In `apps/web/vite.config.ts`, set `ssr.noExternal: ['@recipe-finder/ui']` so Vite can resolve the package if it is pulled into the SSR graph, and `optimizeDeps.include` for the client prebundle.

## Theming

Tokens live only in `src/global/global.css` and ship as `@recipe-finder/ui/global.css`.

Load the stylesheet once in the host app, then override any `--rf-*` variable on `:root` or `html`:

```css
@import '@recipe-finder/ui/global.css';

:root {
  --rf-color-primary: #1f5c3a;
  --rf-font-sans: 'Your Font', sans-serif;
}
```

Dark mode:

- Automatic: `@media (prefers-color-scheme: dark)` when `data-theme` is unset
- Explicit: set `data-theme="dark"` or `data-theme="light"` on `<html>`

## Publish to npm (assignment / demo)

Local development stays on `workspace:*`. Publish only when you need a public package (demo, external consumer). No tokens or secrets belong in this repo — use `npm login` on your machine.

```bash
# 1. Build artifacts
pnpm --filter @recipe-finder/ui build

# 2. Bump version in packages/recipe-ui/package.json (keep 0.x while unstable)

# 3. Allow publish (package is "private": true in the monorepo)
#    Temporarily set "private": false, or remove the field.

# 4. Publish
cd packages/recipe-ui
npm publish --access public
```

Consumers then install `@recipe-finder/ui` from npm instead of `workspace:*`. Switch back to workspace linking for local monorepo work.

**Graders / monorepo demos:** keep `"@recipe-finder/ui": "workspace:*"` in `apps/web/package.json` and run `pnpm build` from the repo root — no npm publish required.

## Utils

- `debounce` — shared helper for search-bar internal debounce (~300–400ms). Source: `src/utils/debounce.ts`.

## Components

| Tag | Key props | Events |
| --- | --- | --- |
| `recipe-card` | `heading` (display title), `image`, `cookTime`, `tags`, `rating`, `recipeId?`, `favorited` | `recipeSelect`, `favoriteToggle` |
| `recipe-grid` | `columns` | — (default slot) |
| `search-bar` | `placeholder`, `value`, `label` | `searchChange` (debounced), `searchSubmit` |
| `filter-chip-group` | `options`, `selected`, `label` | `filterChange` |
| `rating-stars` | `value`, `readonly` (integer 1–5) | `ratingChange` |
| `empty-state` | `message`, `icon` | — (action slot) |
| `form-input` | `label`, `value`, `error`, `required`, `type`, `name`, `disabled` | `valueChange` |
| `rf-modal` | `open`, `heading` (plan: title), `confirmLabel`, `cancelLabel` | `close`, `confirm` |
| `toast-notification` | `message`, `type` (`success`\|`error`\|`info`), `visible`, auto-dismiss **3500ms** | — |
| `day-column` | `day`, `label`, `meals` (`{ id, title, recipeId? }[]`), `pendingRecipeId` | `mealDrop`, `mealRemove` |

`rf-modal` uses a hyphenated tag (custom elements require one); source folder remains `modal/`.
`day-column` `mealDrop` payload `{ recipeId, day }` is identical for HTML5 drag-and-drop and the tap “Assign here” fallback.

Preview: `pnpm --filter @recipe-finder/ui start` then open the Stencil www page.
