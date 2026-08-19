# form-input



<!-- Auto Generated Below -->


## Overview

Labeled text control with optional validation message.

| Event | Payload | When |
| --- | --- | --- |
| `valueChange` | `{ value: string }` | Input value changes |

Parent owns `value` and `error`. Label is associated via `for`/`id`.
When `error` is set, the control is `aria-invalid` and described by the error text.

## Properties

| Property       | Attribute      | Description                                                 | Type      | Default  |
| -------------- | -------------- | ----------------------------------------------------------- | --------- | -------- |
| `autocomplete` | `autocomplete` | Accessible autocomplete hint when relevant.                 | `string`  | `''`     |
| `disabled`     | `disabled`     |                                                             | `boolean` | `false`  |
| `error`        | `error`        | Validation message; empty/undefined hides the error region. | `string`  | `''`     |
| `label`        | `label`        |                                                             | `string`  | `''`     |
| `name`         | `name`         |                                                             | `string`  | `''`     |
| `placeholder`  | `placeholder`  |                                                             | `string`  | `''`     |
| `required`     | `required`     |                                                             | `boolean` | `false`  |
| `type`         | `type`         | Native input type (text, email, password, number, …).       | `string`  | `'text'` |
| `value`        | `value`        | Controlled value from the parent.                           | `string`  | `''`     |


## Events

| Event         | Description | Type                              |
| ------------- | ----------- | --------------------------------- |
| `valueChange` |             | `CustomEvent<{ value: string; }>` |


## Shadow Parts

| Part      | Description |
| --------- | ----------- |
| `"error"` |             |
| `"input"` |             |
| `"label"` |             |
| `"root"`  |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
