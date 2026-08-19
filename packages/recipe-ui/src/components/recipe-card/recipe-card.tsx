import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

/**
 * Presentational recipe summary card for discovery/list views.
 *
 * | Event | Payload | When |
 * | --- | --- | --- |
 * | `recipeSelect` | `{ recipeId?: string }` | Card body activated (open details) |
 * | `favoriteToggle` | `{ recipeId?: string; favorited: boolean }` | Favorite control toggled |
 *
 * `recipeId` is included in payloads only when the parent sets the prop.
 * Slot: default footer/badge area below meta.
 */
@Component({
  tag: 'recipe-card',
  styleUrl: 'recipe-card.css',
  shadow: true,
})
export class RecipeCard {
  /** Optional opaque id from the host (MealDB or user) — never invented here. */
  @Prop() recipeId?: string;

  /**
   * Recipe display name (plan name: `title`).
   * Named `heading` to avoid clashing with the native HTMLElement `title` attribute.
   */
  @Prop() heading = '';

  /** Image URL; alt text is derived from `heading`. */
  @Prop() image = '';

  /** Cook time in minutes. Omitted from the UI when unset or ≤ 0. */
  @Prop() cookTime?: number;

  /** Category / cuisine labels shown as chips. */
  @Prop() tags: string[] = [];

  /** Display rating (0–5). Hidden when unset. */
  @Prop() rating?: number;

  /** Visual favorite state controlled by the parent. */
  @Prop() favorited = false;

  @Event() recipeSelect!: EventEmitter<{ recipeId?: string }>;

  @Event() favoriteToggle!: EventEmitter<{ recipeId?: string; favorited: boolean }>;

  private idPayload(): { recipeId?: string } {
    return this.recipeId ? { recipeId: this.recipeId } : {};
  }

  private onSelect = () => {
    this.recipeSelect.emit(this.idPayload());
  };

  private onFavoriteClick = (event: Event) => {
    event.stopPropagation();
    this.favoriteToggle.emit({
      ...this.idPayload(),
      favorited: !this.favorited,
    });
  };

  private onKeyActivate = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onSelect();
    }
  };

  render() {
    const tags = Array.isArray(this.tags) ? this.tags : [];
    const showCook = typeof this.cookTime === 'number' && this.cookTime > 0;
    const showRating = typeof this.rating === 'number' && this.rating > 0;

    return (
      <article class="card" part="card">
        <button
          type="button"
          class="media"
          part="media"
          aria-label={this.heading ? `Open ${this.heading}` : 'Open recipe'}
          onClick={this.onSelect}
          onKeyDown={this.onKeyActivate}
        >
          {this.image ? (
            <img src={this.image} alt={this.heading || 'Recipe'} loading="lazy" />
          ) : (
            <div class="media__placeholder" aria-hidden="true" />
          )}
        </button>

        <div class="body" part="body">
          <div class="header">
            <h3 class="heading" part="heading" onClick={this.onSelect}>
              {this.heading}
            </h3>
            <button
              type="button"
              class={{ favorite: true, 'favorite--on': this.favorited }}
              part="favorite"
              aria-pressed={this.favorited ? 'true' : 'false'}
              aria-label={this.favorited ? 'Remove from favorites' : 'Add to favorites'}
              onClick={this.onFavoriteClick}
            >
              <span aria-hidden="true">{this.favorited ? '★' : '☆'}</span>
            </button>
          </div>

          <div class="meta" part="meta">
            {showCook && <span class="meta__item">{this.cookTime} min</span>}
            {showRating && (
              <span class="meta__item" aria-label={`Rating ${this.rating} of 5`}>
                ★ {Number(this.rating).toFixed(1)}
              </span>
            )}
          </div>

          {tags.length > 0 && (
            <ul class="tags" part="tags">
              {tags.map((tag) => (
                <li class="tag">{tag}</li>
              ))}
            </ul>
          )}

          <div class="footer" part="footer">
            <slot />
          </div>
        </div>
      </article>
    );
  }
}
