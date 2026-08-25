# `@recipe-finder/ui`

Stencil custom-elements library for recipe browsing and meal planning UIs. Components are **presentational only** — they do not fetch data or persist state. Theme with CSS custom properties (`--rf-*`).

## Install

```bash
npm install @recipe-finder/ui
# or
pnpm add @recipe-finder/ui
# or
yarn add @recipe-finder/ui
```

Requires a modern browser with [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) support.

## Quick start

**1. Load theme tokens** (once in your app entry or global CSS):

```css
@import '@recipe-finder/ui/global.css';
```

**2. Register custom elements** (once, in the browser):

```ts
import { defineCustomElements } from '@recipe-finder/ui';

defineCustomElements();
```

**3. Use components in HTML or your framework:**

```html
<recipe-card
  heading="Pasta Primavera"
  image="https://example.com/pasta.jpg"
  cook-time="25 min"
  rating="4"
  favorited="false"
></recipe-card>
```

## Package exports

| Import | Purpose |
| --- | --- |
| `@recipe-finder/ui` | Register all components (`defineCustomElements`) |
| `@recipe-finder/ui/loader` | Lazy loader variant of `defineCustomElements` |
| `@recipe-finder/ui/global.css` | Design tokens and base component styles |

## Register custom elements

Call `defineCustomElements()` **once** when your app loads in the browser. Do not register on every route or during server-side rendering.

**Eager (recommended):**

```ts
import { defineCustomElements } from '@recipe-finder/ui';

defineCustomElements();
```

**Lazy loader:**

```ts
import { defineCustomElements } from '@recipe-finder/ui/loader';

defineCustomElements();
```

### Framework notes

**React / Next.js** — register in a client-only module (e.g. `useEffect` or a `"use client"` bootstrap file).

**SvelteKit / Vite SSR** — register only on the client (`onMount`, `browser` guard, or dynamic `import()`). If the package is pulled into the SSR graph, add `@recipe-finder/ui` to `ssr.noExternal` in `vite.config.ts` and include it in `optimizeDeps.include` for the client bundle.

**Plain HTML** — load the bundle and call `defineCustomElements()` from a `<script type="module">` before using tags.

## Theming

All visual tokens are CSS variables prefixed with `--rf-*`. Import the global stylesheet, then override tokens on `:root` or `html`:

```css
@import '@recipe-finder/ui/global.css';

:root {
  --rf-color-primary: #1f5c3a;
  --rf-font-sans: 'Your Font', system-ui, sans-serif;
  --rf-radius-md: 0.5rem;
}
```

**Dark mode**

- Automatic: follows `prefers-color-scheme: dark` when `data-theme` is not set on `<html>`
- Explicit: set `data-theme="dark"` or `data-theme="light"` on `<html>`

## Components

| Tag | Key props | Events |
| --- | --- | --- |
| `recipe-card` | `heading`, `image`, `cookTime`, `tags`, `rating`, `recipeId?`, `favorited` | `recipeSelect`, `favoriteToggle` |
| `recipe-grid` | `columns` | — (default slot for cards) |
| `search-bar` | `placeholder`, `value`, `label` | `searchChange` (debounced ~300–400ms), `searchSubmit` |
| `filter-chip-group` | `options`, `selected`, `label` | `filterChange` |
| `rating-stars` | `value`, `readonly` (integer 1–5) | `ratingChange` |
| `empty-state` | `message`, `icon` | — (action slot) |
| `form-input` | `label`, `value`, `error`, `required`, `type`, `name`, `disabled` | `valueChange` |
| `rf-modal` | `open`, `heading`, `confirmLabel`, `cancelLabel` | `close`, `confirm` |
| `toast-notification` | `message`, `type` (`success` \| `error` \| `info`), `visible` | auto-dismiss after **3500ms** |
| `day-column` | `day`, `label`, `meals` (`{ id, title, recipeId? }[]`), `pendingRecipeId` | `mealDrop`, `mealRemove` |

Notes:

- `rf-modal` uses a hyphenated tag name (required for custom elements).
- `day-column` emits `mealDrop` with `{ recipeId, day }` for both drag-and-drop and the tap “Assign here” fallback.

## Usage examples

### Recipe card with events

```html
<recipe-card id="card"></recipe-card>

<script>
  const card = document.getElementById('card');
  card.heading = 'Tomato Soup';
  card.cookTime = '20 min';
  card.rating = 5;

  card.addEventListener('recipeSelect', (e) => {
    console.log('Selected', e.detail);
  });

  card.addEventListener('favoriteToggle', (e) => {
    console.log('Favorite toggled', e.detail);
  });
</script>
```

### Search bar (controlled value)

```html
<search-bar placeholder="Search recipes…" value="pasta"></search-bar>

<script>
  const bar = document.querySelector('search-bar');
  bar.addEventListener('searchChange', (e) => {
    console.log('Debounced query', e.detail);
  });
</script>
```

### Meal planner column

```html
<day-column day="monday" label="Monday"></day-column>

<script>
  const col = document.querySelector('day-column');
  col.meals = [
    { id: '1', title: 'Oatmeal', recipeId: 'r1' },
    { id: '2', title: 'Salad', recipeId: 'r2' }
  ];

  col.addEventListener('mealDrop', (e) => {
    console.log('Assign meal', e.detail); // { recipeId, day }
  });
</script>
```

## License

MIT
