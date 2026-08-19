# recipe-card



<!-- Auto Generated Below -->


## Overview

Presentational recipe summary card for discovery/list views.

| Event | Payload | When |
| --- | --- | --- |
| `recipeSelect` | `{ recipeId?: string }` | Card body activated (open details) |
| `favoriteToggle` | `{ recipeId?: string; favorited: boolean }` | Favorite control toggled |

`recipeId` is included in payloads only when the parent sets the prop.
Slot: default footer/badge area below meta.

## Properties

| Property    | Attribute   | Description                                                                                                                | Type       | Default     |
| ----------- | ----------- | -------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------- |
| `cookTime`  | `cook-time` | Cook time in minutes. Omitted from the UI when unset or ≤ 0.                                                               | `number`   | `undefined` |
| `favorited` | `favorited` | Visual favorite state controlled by the parent.                                                                            | `boolean`  | `false`     |
| `heading`   | `heading`   | Recipe display name (plan name: `title`). Named `heading` to avoid clashing with the native HTMLElement `title` attribute. | `string`   | `''`        |
| `image`     | `image`     | Image URL; alt text is derived from `heading`.                                                                             | `string`   | `''`        |
| `rating`    | `rating`    | Display rating (0–5). Hidden when unset.                                                                                   | `number`   | `undefined` |
| `recipeId`  | `recipe-id` | Optional opaque id from the host (MealDB or user) — never invented here.                                                   | `string`   | `undefined` |
| `tags`      | --          | Category / cuisine labels shown as chips.                                                                                  | `string[]` | `[]`        |


## Events

| Event            | Description | Type                                                      |
| ---------------- | ----------- | --------------------------------------------------------- |
| `favoriteToggle` |             | `CustomEvent<{ recipeId?: string; favorited: boolean; }>` |
| `recipeSelect`   |             | `CustomEvent<{ recipeId?: string; }>`                     |


## Slots

| Slot | Description      |
| ---- | ---------------- |
|      | The default slot |


## Shadow Parts

| Part         | Description |
| ------------ | ----------- |
| `"body"`     |             |
| `"card"`     |             |
| `"favorite"` |             |
| `"footer"`   |             |
| `"heading"`  |             |
| `"media"`    |             |
| `"meta"`     |             |
| `"tags"`     |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
