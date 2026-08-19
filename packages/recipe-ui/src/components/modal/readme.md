# rf-modal



<!-- Auto Generated Below -->


## Overview

Confirm/cancel dialog with a default body slot.

| Event | Payload | When |
| --- | --- | --- |
| `close` | `void` | Cancel, backdrop, Escape, or explicit dismiss |
| `confirm` | `void` | Confirm button activated |

Plan prop `title` maps to `heading` (avoids clashing with HTMLElement.title).
Tag is `rf-modal` (custom elements require a hyphen; folder stays `modal`).
When `open` is false the dialog is not rendered, so nothing inside stays tabbable.
Focus is trapped while open; previous focus is restored on close.

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
