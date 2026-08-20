# day-column



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute           | Description                                                                                    | Type            | Default |
| ----------------- | ------------------- | ---------------------------------------------------------------------------------------------- | --------------- | ------- |
| `day`             | `day`               | Stable day key included in event payloads (e.g. `monday`).                                     | `string`        | `''`    |
| `label`           | `label`             | Display label; falls back to `day` when empty.                                                 | `string`        | `''`    |
| `meals`           | --                  | Assigned meals for this day.                                                                   | `DayMealItem[]` | `[]`    |
| `pendingRecipeId` | `pending-recipe-id` | Recipe id waiting to be assigned (host selection). Enables the tap-to-assign control when set. | `string`        | `''`    |


## Events

| Event        | Description | Type                                                                |
| ------------ | ----------- | ------------------------------------------------------------------- |
| `mealDrop`   |             | `CustomEvent<{ recipeId: string; day: string; }>`                   |
| `mealRemove` |             | `CustomEvent<{ entryId: string; day: string; recipeId?: string; }>` |


## Slots

| Slot | Description      |
| ---- | ---------------- |
|      | The default slot |


## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"assign"`  |             |
| `"empty"`   |             |
| `"header"`  |             |
| `"heading"` |             |
| `"meal"`    |             |
| `"meals"`   |             |
| `"remove"`  |             |
| `"root"`    |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
