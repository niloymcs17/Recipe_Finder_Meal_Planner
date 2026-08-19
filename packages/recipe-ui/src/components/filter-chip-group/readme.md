# filter-chip-group



<!-- Auto Generated Below -->


## Overview

Multi-select chip group.

| Event | Payload | When |
| --- | --- | --- |
| `filterChange` | `{ values: string[] }` | Selection toggled |

Props: `options` (`{ label, value }[]`), `selected` (string[] of values).

## Properties

| Property   | Attribute | Description                       | Type                 | Default     |
| ---------- | --------- | --------------------------------- | -------------------- | ----------- |
| `label`    | `label`   | Accessible group label.           | `string`             | `'Filters'` |
| `options`  | --        | Available chips.                  | `FilterChipOption[]` | `[]`        |
| `selected` | --        | Currently selected option values. | `string[]`           | `[]`        |


## Events

| Event          | Description | Type                                 |
| -------------- | ----------- | ------------------------------------ |
| `filterChange` |             | `CustomEvent<{ values: string[]; }>` |


## Shadow Parts

| Part     | Description |
| -------- | ----------- |
| `"chip"` |             |
| `"root"` |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
