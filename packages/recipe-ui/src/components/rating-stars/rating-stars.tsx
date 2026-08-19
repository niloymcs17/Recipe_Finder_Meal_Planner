import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

/**
 * Integer star rating control (1–5). No fractional/half-star API.
 *
 * | Event | Payload | When |
 * | --- | --- | --- |
 * | `ratingChange` | `{ value: number }` | Star chosen while not `readonly` |
 */
@Component({
  tag: 'rating-stars',
  styleUrl: 'rating-stars.css',
  shadow: true,
})
export class RatingStars {
  /** Current rating 0–5 (integers). */
  @Prop() value = 0;

  /** When true, display only — no `ratingChange` events. */
  @Prop() readonly = false;

  /** Max stars (fixed at 5 unless overridden). */
  @Prop() max = 5;

  @Event() ratingChange!: EventEmitter<{ value: number }>;

  private onPick = (next: number) => {
    if (this.readonly) {
      return;
    }
    this.ratingChange.emit({ value: next });
  };

  render() {
    const max = Math.min(10, Math.max(1, Number(this.max) || 5));
    const current = Math.min(max, Math.max(0, Math.round(Number(this.value) || 0)));
    const stars = Array.from({ length: max }, (_, i) => i + 1);

    return (
      <div
        class={{ rating: true, 'rating--readonly': this.readonly }}
        part="root"
        role={this.readonly ? 'img' : 'group'}
        aria-label={`Rating ${current} of ${max}`}
      >
        {stars.map((n) => {
          const filled = n <= current;
          const label = `${n} star${n === 1 ? '' : 's'}`;

          if (this.readonly) {
            return (
              <span
                class={{ star: true, 'star--filled': filled }}
                part="star"
                aria-hidden="true"
              >
                {filled ? '★' : '☆'}
              </span>
            );
          }

          return (
            <button
              type="button"
              class={{ star: true, 'star--filled': filled }}
              part="star"
              aria-label={label}
              aria-pressed={filled && n === current ? 'true' : 'false'}
              onClick={() => this.onPick(n)}
            >
              <span aria-hidden="true">{filled ? '★' : '☆'}</span>
            </button>
          );
        })}
      </div>
    );
  }
}
