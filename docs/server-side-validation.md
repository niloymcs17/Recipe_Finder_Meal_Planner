# Server-side validation

This document lists validation that runs on the **SvelteKit server** (API routes, server loads, and server env). User-owned data (accounts, saved recipes, favorites, meal plans) is still stored in **browser localStorage** after validation — the server checks input shape and rules, but does not persist that data to a database.

---

## Summary

| Area | Server endpoint / location | Validated on server? |
| --- | --- | --- |
| Create / edit user recipe form | `POST /api/user-recipes` | **Yes** (Zod) |
| TheMealDB search query params | `GET /api/recipes` | **Yes** (trim + max length) |
| TheMealDB recipe lookup | `GET /api/recipes/lookup` | **Yes** (required `id`) |
| Recipe detail route param | `recipe/[id]/+page.server.ts` | **Yes** (recipe id format) |
| Server environment | `$lib/server/env.ts` | **Yes** (`MEALDB_BASE_URL` URL) |
| Sign-up / login | Client only | No |
| Favorites toggle | Client only | No |
| Meal planner assign / remove | Client only | No |
| Saving recipe after validation | Client (`localStorage`) | No (uses server-validated payload) |

---

## User recipe form (create & edit)

**Route:** `POST /api/user-recipes`  
**Implementation:** [`apps/web/src/routes/api/user-recipes/+server.ts`](../apps/web/src/routes/api/user-recipes/+server.ts)  
**Schema:** [`apps/web/src/lib/validation/recipe.ts`](../apps/web/src/lib/validation/recipe.ts) (`recipeFormSchema` via `parseRecipeFormFromJson`)

Used by [`RecipeForm.svelte`](../apps/web/src/lib/recipes/RecipeForm.svelte) on **New recipe** (`/recipe/new`) and **Edit recipe** (`/recipe/[id]/edit`). On submit, the client POSTs the form JSON to the server; only if the server returns `200` does the client write to localStorage.

### Request

- **Method:** `POST`
- **Content-Type:** `application/json`
- **Body:** `RecipeFormFields` (same shape as the form state)

### Pre-schema checks

| Check | Error key | Message |
| --- | --- | --- |
| Body is not valid JSON | `_form` | `Request body must be valid JSON.` |
| Body is not a plain object | `_form` | `Invalid request body.` |
| `ingredients` or `steps` is not an array | `_form` | `Invalid recipe form.` |

Before Zod runs, string fields are normalized via `sanitizeFormFields()` (HTML stripped from text fields).

### Field rules (`recipeFormSchema`)

| Field | Rules | Example error messages |
| --- | --- | --- |
| **title** | Required; trimmed; 3–100 characters | `Title must be 3–100 characters` |
| **imageUrl** | Optional; if non-empty, must be `http:` or `https:` URL | `Enter a valid image URL` |
| **category** | String (optional content) | — |
| **area** | String (optional content) | — |
| **cookTimeMinutes** | Required; whole number; 1–1440 | `Cook time is required`, `Cook time must be a whole number`, `Cook time must be at least 1`, `Cook time cannot exceed 1440 minutes` |
| **servings** | Required; whole number; 1–50 | `Servings is required`, `Servings must be a whole number`, `Servings must be at least 1`, `Servings cannot exceed 50` |
| **ingredients** | At least one row | `Add at least one ingredient` |
| **ingredients[].name** | Required after trim | `Ingredient name is required` |
| **ingredients[].quantity** | Required after trim | `Quantity is required` |
| **steps** | At least one step | `Add at least one step` |
| **steps[]** | Each step non-empty after trim | `Step cannot be empty` |

### Responses

| Status | Body | Meaning |
| --- | --- | --- |
| `200` | `{ "data": RecipeWritePayload }` | Valid; client may save to localStorage |
| `400` | `{ "errors": { "field": "message", ... } }` | Validation failed; keys match form fields (e.g. `title`, `ingredients.0.name`, `steps.1`) |

Optional text fields (`category`, `area`, empty `imageUrl`) are returned as `null` in `data` when blank after validation.

---

## TheMealDB proxy APIs

### Search — `GET /api/recipes`

**Implementation:** [`apps/web/src/routes/api/recipes/+server.ts`](../apps/web/src/routes/api/recipes/+server.ts)  
**Parser:** [`parseRecipeQuery()`](../apps/web/src/lib/validation/recipes-query.ts)

| Query param | Validation |
| --- | --- |
| `q` | Trimmed; max **80** characters |
| `category` | Trimmed; max **80** characters |
| `area` | Trimmed; max **80** characters |
| `ingredient` | Trimmed; max **80** characters |

Invalid or missing params become empty strings; the handler then calls TheMealDB. Upstream failures return `502` with a generic message (not field-level Zod errors).

### Lookup by id — `GET /api/recipes/lookup`

**Implementation:** [`apps/web/src/routes/api/recipes/lookup/+server.ts`](../apps/web/src/routes/api/recipes/lookup/+server.ts)

| Query param | Validation | Response if invalid |
| --- | --- | --- |
| `id` | Required; trimmed | `400` — `Missing recipe id.` |

---

## Recipe detail server load

**File:** [`apps/web/src/routes/recipe/[id]/+page.server.ts`](../apps/web/src/routes/recipe/[id]/+page.server.ts)

| Input | Validation | Response if invalid |
| --- | --- | --- |
| `params.id` | Parsed with `parseRecipeId()` (expects `user:…` or `mealdb:…` style id) | `404` — `Recipe not found` |

User recipes are resolved on the client from localStorage; MealDB recipes are fetched on the server after the id check.

---

## Server environment

**File:** [`apps/web/src/lib/server/env.ts`](../apps/web/src/lib/server/env.ts)

| Variable | Validation |
| --- | --- |
| `MEALDB_BASE_URL` | Optional; if set, must be a valid URL (Zod `z.string().url()`). Invalid values throw on first server use with a descriptive error. |

Default when unset: `https://www.themealdb.com/api/json/v1/1`

---

## Client-only validation (not server-side)

These use Zod or checks in the browser / `localStorage` layer only. They are **not** duplicated on the server today:

| Feature | Location | Notes |
| --- | --- | --- |
| Auth (sign-up, login) | `$lib/local-db/auth.ts` | Email/password rules in client |
| Favorites toggle | `$lib/local-db/favorites.ts` | `toggleFavoriteSchema` |
| Planner assign | `$lib/local-db/planner.ts` | `assignMealSchema` |
| Recipe ownership on save | `$lib/local-db/recipes.ts` | Requires signed-in user; HTML sanitization on write |

---


## Related docs

- [README — storage & auth assumptions](../README.md)
- [Publishing `@recipe-finder/ui`](./publish-ui-package.md)
