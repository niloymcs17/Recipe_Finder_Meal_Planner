# search-bar



<!-- Auto Generated Below -->


## Overview

Controlled search field with internal debounce on change.

| Event | Payload | When |
| --- | --- | --- |
| `searchChange` | `{ value: string }` | Debounced (~350ms) after typing |
| `searchSubmit` | `{ value: string }` | Form submit / Enter |

Parent owns `value`; update it from `searchChange` / `searchSubmit`.
A local draft keeps the input responsive between parent updates.

## Properties

| Property      | Attribute     | Description                                                 | Type     | Default             |
| ------------- | ------------- | ----------------------------------------------------------- | -------- | ------------------- |
| `label`       | `label`       | Accessible name for the input (visually hidden label text). | `string` | `'Search'`          |
| `placeholder` | `placeholder` |                                                             | `string` | `'Search recipes…'` |
| `value`       | `value`       | Controlled value from the parent.                           | `string` | `''`                |


## Events

| Event          | Description | Type                              |
| -------------- | ----------- | --------------------------------- |
| `searchChange` |             | `CustomEvent<{ value: string; }>` |
| `searchSubmit` |             | `CustomEvent<{ value: string; }>` |


## Shadow Parts

| Part       | Description |
| ---------- | ----------- |
| `"input"`  |             |
| `"root"`   |             |
| `"submit"` |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
