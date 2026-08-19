import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

/** Option shape for `filter-chip-group`. */
export interface FilterChipOption {
  label: string;
  value: string;
}

/**
 * Multi-select chip group.
 *
 * | Event | Payload | When |
 * | --- | --- | --- |
 * | `filterChange` | `{ values: string[] }` | Selection toggled |
 *
 * Props: `options` (`{ label, value }[]`), `selected` (string[] of values).
 */
@Component({
  tag: 'filter-chip-group',
  styleUrl: 'filter-chip-group.css',
  shadow: true,
})
export class FilterChipGroup {
  /** Available chips. */
  @Prop() options: FilterChipOption[] = [];

  /** Currently selected option values. */
  @Prop() selected: string[] = [];

  /** Accessible group label. */
  @Prop() label = 'Filters';

  @Event() filterChange!: EventEmitter<{ values: string[] }>;

  private isSelected(value: string): boolean {
    const selected = Array.isArray(this.selected) ? this.selected : [];
    return selected.includes(value);
  }

  private toggle = (value: string) => {
    const current = Array.isArray(this.selected) ? [...this.selected] : [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    this.filterChange.emit({ values: next });
  };

  render() {
    const options = Array.isArray(this.options) ? this.options : [];

    return (
      <div class="group" part="root" role="group" aria-label={this.label}>
        {options.map((option) => {
          const on = this.isSelected(option.value);
          return (
            <button
              type="button"
              class={{ chip: true, 'chip--on': on }}
              part="chip"
              aria-pressed={on ? 'true' : 'false'}
              onClick={() => this.toggle(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }
}
