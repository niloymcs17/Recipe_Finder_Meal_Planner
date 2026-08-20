# rf-modal



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description                                                                                                         | Type      | Default     |
| -------------- | --------------- | ------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| `cancelLabel`  | `cancel-label`  |                                                                                                                     | `string`  | `'Cancel'`  |
| `confirmLabel` | `confirm-label` |                                                                                                                     | `string`  | `'Confirm'` |
| `heading`      | `heading`       | Dialog title (plan name: `title`). Named `heading` to avoid clashing with the native HTMLElement `title` attribute. | `string`  | `''`        |
| `hideConfirm`  | `hide-confirm`  | Hide the confirm button when only dismiss is needed.                                                                | `boolean` | `false`     |
| `open`         | `open`          | Whether the dialog is visible.                                                                                      | `boolean` | `false`     |


## Events

| Event     | Description | Type                |
| --------- | ----------- | ------------------- |
| `close`   |             | `CustomEvent<void>` |
| `confirm` |             | `CustomEvent<void>` |


## Slots

| Slot | Description      |
| ---- | ---------------- |
|      | The default slot |


## Shadow Parts

| Part         | Description |
| ------------ | ----------- |
| `"backdrop"` |             |
| `"body"`     |             |
| `"cancel"`   |             |
| `"confirm"`  |             |
| `"dialog"`   |             |
| `"footer"`   |             |
| `"header"`   |             |
| `"heading"`  |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
