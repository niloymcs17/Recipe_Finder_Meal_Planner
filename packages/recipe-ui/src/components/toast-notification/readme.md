# toast-notification



<!-- Auto Generated Below -->


## Overview

Informational toast. Auto-dismisses after 3500ms by default.

No output events — display only. Toggle `visible` (or remount) to re-show.

| Prop | Notes |
| --- | --- |
| `message` | Body text |
| `type` | `success` \| `error` \| `info` |
| `visible` | Host can hide/show or remount to re-trigger the timer |
| `duration` | Dismiss delay in ms (default 3500) |

## Properties

| Property   | Attribute  | Description                                                                      | Type                             | Default  |
| ---------- | ---------- | -------------------------------------------------------------------------------- | -------------------------------- | -------- |
| `duration` | `duration` | Override dismiss duration (ms). Defaults to 3500.                                | `number`                         | `3500`   |
| `message`  | `message`  |                                                                                  | `string`                         | `''`     |
| `type`     | `type`     |                                                                                  | `"error" \| "info" \| "success"` | `'info'` |
| `visible`  | `visible`  | When false, the toast is hidden. Flipping false→true restarts the dismiss timer. | `boolean`                        | `true`   |


## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"message"` |             |
| `"root"`    |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
