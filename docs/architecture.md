# Architecture & flow

High-level structure of the Recipe Finder & Meal Planner monorepo: how packages fit together, where data lives, and how requests move through the app.

For product assumptions, see [ASSUMPTIONS.md](./ASSUMPTIONS.md). For server validation details, see [server-side-validation.md](./server-side-validation.md).

---

## Monorepo overview

```mermaid
flowchart TB
  subgraph monorepo["pnpm monorepo"]
    UI["packages/recipe-ui<br/>@recipe-finder/ui<br/>(Stencil)"]
    WEB["apps/web<br/>@recipe-finder/web<br/>(SvelteKit)"]
  end

  NPM["npm registry<br/>@recipe-finder/ui@1.0.1"]
  NETLIFY["Netlify<br/>(SSR + static)"]
  MEALDB["TheMealDB API"]

  UI -->|"build → dist/"| WEB
  NPM -.->|"apps/web dependency<br/>(or workspace:*)"| WEB
  WEB --> NETLIFY
  WEB -->|"server proxy only"| MEALDB
```

| Package | Role | Tech |
| --- | --- | --- |
| `packages/recipe-ui` | Presentational UI (custom elements) | Stencil |
| `apps/web` | App shell, routing, data orchestration | SvelteKit 2, Svelte 5 runes |

**Build order:** UI must build before web (`pnpm build` runs UI first).

---

## Application layers

```mermaid
flowchart TB
  subgraph browser["Browser"]
    ROUTES["SvelteKit routes<br/>(+page.svelte)"]
    STORES["Rune stores<br/>auth, favorites, planner, toast"]
    REPOS["local-db repositories<br/>auth, recipes, favorites, planner"]
    LS[("localStorage<br/>rfmp:* keys")]
    CE["Stencil custom elements<br/>@recipe-finder/ui"]
  end

  subgraph sveltekit["SvelteKit server"]
    LOAD["+page.server.ts loads"]
    API["/api/* routes"]
    MEALDB_LIB["$lib/server/mealdb"]
  end

  MEALDB["TheMealDB"]

  ROUTES --> STORES
  ROUTES --> CE
  STORES --> REPOS
  REPOS --> LS
  ROUTES -->|"fetch /api/*"| API
  LOAD --> MEALDB_LIB
  API --> MEALDB_LIB
  MEALDB_LIB --> MEALDB
```

| Layer | Responsibility |
| --- | --- |
| **Routes** | Pages, layout, navigation, compose UI |
| **Stores** | In-memory UI cache; hydrate from repositories on mount |
| **Repositories** (`$lib/local-db/`) | Read/write localStorage; filter by signed-in user |
| **`@recipe-finder/ui`** | Dumb components only — no fetch or persistence |
| **SvelteKit server** | Proxy TheMealDB, validate recipe form POSTs, SSR |

---

## Data storage model

```mermaid
flowchart LR
  subgraph remote["Remote"]
    MEALDB["TheMealDB<br/>browse / search / lookup"]
  end

  subgraph server["SvelteKit server"]
    PROXY["mealdb.ts proxy<br/>(no user DB)"]
  end

  subgraph local["This browser only"]
    USERS["rfmp:users"]
    SESSION["rfmp:session"]
    RECIPES["rfmp:recipes"]
    FAVS["rfmp:favorites"]
    PLAN["rfmp:meal_plan"]
  end

  MEALDB <--> PROXY
  PROXY -->|"SSR / API JSON"| UI2["Svelte pages"]
  USERS & SESSION & RECIPES & FAVS & PLAN --> UI2
```

| Data | Location | Sync |
| --- | --- | --- |
| TheMealDB catalog | Remote API (via server proxy) | Read-only |
| Accounts, session | localStorage | Per browser |
| User-created recipes | localStorage | Per browser |
| Favorites | localStorage | Per browser |
| Meal plan | localStorage | Per browser |

User-owned rows are scoped by `userId` / `ownerId` from the local session — never from untrusted form fields alone.

---

## Auth flow (client-only)

Sign-up and login run entirely in the browser. Passwords are hashed with Web Crypto SHA-256 (demo-grade, not production auth).

```mermaid
sequenceDiagram
  participant User
  participant Page as /signup or /login
  participant Store as authStore
  participant Repo as local-db/auth
  participant LS as localStorage

  User->>Page: submit email + password
  Page->>Store: signup() or login()
  Store->>Repo: hash + read/write users
  Repo->>LS: rfmp:users, rfmp:session
  Repo-->>Store: PublicUser
  Store-->>Page: ok / error
  Page->>User: redirect or toast
```

Logout clears `rfmp:session` only; user records remain in `rfmp:users`.

---

## Recipe discovery (TheMealDB)

Browse and search never call TheMealDB from the browser directly. The SvelteKit server proxies requests using `MEALDB_BASE_URL`.

```mermaid
sequenceDiagram
  participant Browser
  participant Home as / (+page)
  participant Server as +page.server.ts
  participant API as GET /api/recipes
  participant MealDB as TheMealDB

  Note over Browser,MealDB: Initial load (SSR)
  Browser->>Home: navigate /
  Home->>Server: load()
  Server->>MealDB: listCategories + search
  MealDB-->>Server: JSON
  Server-->>Home: recipes, categories
  Home-->>Browser: rendered grid

  Note over Browser,MealDB: Client filter / search
  Browser->>API: GET /api/recipes?q=...
  API->>MealDB: searchRecipes()
  MealDB-->>API: JSON
  API-->>Browser: { recipes }
```

Recipe IDs from TheMealDB use the `mealdb:` prefix (see `$lib/utils/ids.ts`).

---

## User recipe create / edit

The server validates the form; the client persists only after a successful response.

```mermaid
sequenceDiagram
  participant User
  participant Form as RecipeForm.svelte
  participant API as POST /api/user-recipes
  participant Zod as recipeFormSchema
  participant Repo as local-db/recipes
  participant LS as localStorage

  User->>Form: submit
  Form->>API: JSON body
  API->>Zod: parse + sanitize
  alt invalid
    Zod-->>Form: 400 + field errors
  else valid
    Zod-->>Form: 200 + RecipeWritePayload
    Form->>Repo: create / update
    Repo->>LS: rfmp:recipes
    Form-->>User: toast + redirect
  end
```

---

## Favorites & meal planner

Both features are **client-only** after auth. Stores mirror repository state for reactive UI.

```mermaid
flowchart TB
  subgraph fav["Favorites"]
    FC["recipe-card favorite event"]
    FA["favorites/actions.ts"]
    FS["favoritesStore"]
    FR["local-db/favorites"]
  end

  subgraph plan["Meal planner"]
    PP["/planner +page.svelte"]
    PS["plannerStore"]
    PR["local-db/planner"]
  end

  LS[("localStorage")]

  FC --> FA --> FS --> FR --> LS
  PP --> PS --> PR --> LS
```

Planner week data can be seeded from `+page.server.ts` (ISO week start); assignments and shopping list logic stay on the client.

---

## UI package integration

Stencil custom elements register once on the client. SSR bundles the package but does not run registration during server render.

For property binding, custom events, slots, and per-route usage, see **[sveltekit-stencil-integration.md](./sveltekit-stencil-integration.md)**.

```mermaid
sequenceDiagram
  participant Layout as +layout.svelte
  participant Reg as $lib/ui/register
  participant UI as @recipe-finder/ui
  participant Page as route pages

  Note over Layout,Page: onMount (browser only)
  Layout->>Reg: registerRecipeUi()
  Reg->>UI: defineCustomElements()
  Page->>UI: rf-* custom elements
  Page->>Page: ceBind for events/props
```

Theme tokens load from `@recipe-finder/ui/global.css` in `app.css` (`--rf-*` variables).

---


## Related docs

- [ASSUMPTIONS.md](./ASSUMPTIONS.md) — local-first demo constraints
- [sveltekit-stencil-integration.md](./sveltekit-stencil-integration.md) — props, events, slots, and route usage
- [server-side-validation.md](./server-side-validation.md) — Zod rules and API contracts
- [publish-ui-package.md](./publish-ui-package.md) — npm vs workspace linking
