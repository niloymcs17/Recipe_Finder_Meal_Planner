# rating-stars



<!-- Auto Generated Below -->


## Overview

Integer star rating control (1–5). No fractional/half-star API.

| Event | Payload | When |
| --- | --- | --- |
| `ratingChange` | `{ value: number }` | Star chosen while not `readonly` |

## Properties

| Property   | Attribute  | Description                                         | Type      | Default |
| ---------- | ---------- | --------------------------------------------------- | --------- | ------- |
| `max`      | `max`      | Max stars (fixed at 5 unless overridden).           | `number`  | `5`     |
| `readonly` | `readonly` | When true, display only — no `ratingChange` events. | `boolean` | `false` |
| `value`    | `value`    | Current rating 0–5 (integers).                      | `number`  | `0`     |


## Events

| Event          | Description | Type                              |
| -------------- | ----------- | --------------------------------- |
| `ratingChange` |             | `CustomEvent<{ value: number; }>` |


## Shadow Parts

| Part     | Description |
| -------- | ----------- |
| `"root"` |             |
| `"star"` |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
