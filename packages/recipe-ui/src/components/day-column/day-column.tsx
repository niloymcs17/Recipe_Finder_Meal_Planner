import { Component, Event, EventEmitter, h, Prop, State } from '@stencil/core';

/** Presentational meal entry for a planner day. */
interface DayMealItem {
  /** Entry id used for remove payloads. */
  id: string;
  /** Display title. */
  title: string;
  /** Optional recipe id (also accepted on remove when present). */
  recipeId?: string;
}

/** MIME type for HTML5 recipe-id drag data. */
const RECIPE_DRAG_MIME = 'application/x-recipe-id';

@Component({
  tag: 'day-column',
  styleUrl: 'day-column.css',
  shadow: true,
})
export class DayColumn {
  /** Stable day key included in event payloads (e.g. `monday`). */
  @Prop() day = '';

  /** Display label; falls back to `day` when empty. */
  @Prop() label = '';

  /** Assigned meals for this day. */
  @Prop() meals: DayMealItem[] = [];

  /**
   * Recipe id waiting to be assigned (host selection).
   * Enables the tap-to-assign control when set.
   */
  @Prop() pendingRecipeId = '';

  @Event() mealDrop!: EventEmitter<{ recipeId: string; day: string }>;

  @Event() mealRemove!: EventEmitter<{ entryId: string; day: string; recipeId?: string }>;

  @State() private dragOver = false;

  private emitDrop(recipeId: string) {
    const id = recipeId?.trim();
    if (!id || !this.day) {
      return;
    }
    this.mealDrop.emit({ recipeId: id, day: this.day });
  }

  private onDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    this.dragOver = true;
  };

  private onDragLeave = () => {
    this.dragOver = false;
  };

  private onDrop = (event: DragEvent) => {
    event.preventDefault();
    this.dragOver = false;
    const dt = event.dataTransfer;
    if (!dt) {
      return;
    }
    const recipeId =
      dt.getData(RECIPE_DRAG_MIME) ||
      dt.getData('text/plain') ||
      '';
    this.emitDrop(recipeId);
  };

  private onTapAssign = () => {
    this.emitDrop(this.pendingRecipeId);
  };

  private onRemove = (meal: DayMealItem) => {
    if (!this.day || !meal?.id) {
      return;
    }
    const payload: { entryId: string; day: string; recipeId?: string } = {
      entryId: meal.id,
      day: this.day,
    };
    if (meal.recipeId) {
      payload.recipeId = meal.recipeId;
    }
    this.mealRemove.emit(payload);
  };

  render() {
    const meals = Array.isArray(this.meals) ? this.meals : [];
    const empty = meals.length === 0;
    const heading = (this.label || this.day || 'Day').trim();
    const canTapAssign = Boolean(this.pendingRecipeId?.trim());

    return (
      <section
        class={{ column: true, 'column--over': this.dragOver }}
        part="root"
        aria-label={heading}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onDrop={this.onDrop}
      >
        <header class="header" part="header">
          <h3 class="heading" part="heading">
            {heading}
          </h3>
          {canTapAssign && (
            <button type="button" class="assign" part="assign" onClick={this.onTapAssign}>
              Assign here
            </button>
          )}
        </header>

        {empty ? (
          <div class="empty" part="empty">
            <slot />
          </div>
        ) : (
          <ul class="meals" part="meals">
            {meals.map((meal) => (
              <li class="meal" part="meal" key={meal.id}>
                <span class="meal__title">{meal.title}</span>
                <button
                  type="button"
                  class="meal__remove"
                  part="remove"
                  aria-label={`Remove ${meal.title}`}
                  onClick={() => this.onRemove(meal)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }
}
