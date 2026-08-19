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
| `dist/recipe-ui/recipe-ui.css` | Bundled global theme tokens |

## Register custom elements (SvelteKit / Phase 06)

Preferred one-shot registration from the custom-elements bundle:

```ts
import { defineCustomElements } from '@recipe-finder/ui';

defineCustomElements();
```

Lazy loader alternative (same API name, from the `dist` output):

```ts
import { defineCustomElements } from '@recipe-finder/ui/loader';

defineCustomElements();
```

Call once in the browser (e.g. root layout `onMount` / `browser` guard). Do not register per route.

## Theming

Tokens live only in `src/global/global.css` and ship as `@recipe-finder/ui/global.css`.

Load the stylesheet once in the host app, then override any `--rf-*` variable on `:root` or `html`:

```css
@import '@recipe-finder/ui/global.css';

:root {
  --rf-color-primary: #0d9488;
  --rf-font-sans: 'Your Font', sans-serif;
}
```

Dark mode:

- Automatic: `@media (prefers-color-scheme: dark)` when `data-theme` is unset
- Explicit: set `data-theme="dark"` or `data-theme="light"` on `<html>`

Token categories: colors (`--rf-color-*`), spacing (`--rf-space-*`), radii, fonts/sizes, shadows. Components must use these variables — no hardcoded palettes.

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
