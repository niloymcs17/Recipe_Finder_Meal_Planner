# form-input



<!-- Auto Generated Below -->


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
