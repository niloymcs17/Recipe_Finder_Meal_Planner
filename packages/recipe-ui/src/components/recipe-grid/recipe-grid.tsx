import { Component, h, Prop } from '@stencil/core';

/**
 * Responsive CSS grid layout for child `recipe-card` (or other) elements.
 * Presentational only — no data fetching.
 *
 * | Prop | Description |
 * | --- | --- |
 * | `columns` | Target column count at wide viewports (1–6). Defaults to 3. |
 *
 * Slot: default — place cards as light-DOM children.
 */
@Component({
  tag: 'recipe-grid',
  styleUrl: 'recipe-grid.css',
  shadow: true,
})
export class RecipeGrid {
  /**
   * Preferred column count on large screens.
   * Smaller breakpoints collapse automatically via CSS.
   */
  @Prop() columns = 3;

  render() {
    const cols = Math.min(6, Math.max(1, Number(this.columns) || 3));

    return (
      <div
        class="grid"
        part="grid"
        style={{ '--rf-grid-columns': String(cols) } as Record<string, string>}
      >
        <slot />
      </div>
    );
  }
}
