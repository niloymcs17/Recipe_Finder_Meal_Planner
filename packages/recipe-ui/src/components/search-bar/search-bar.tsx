import { Component, Event, EventEmitter, h, Prop, State, Watch } from '@stencil/core';
import { debounce } from '../../utils/debounce';

/**
 * Controlled search field with internal debounce on change.
 *
 * | Event | Payload | When |
 * | --- | --- | --- |
 * | `searchChange` | `{ value: string }` | Debounced (~350ms) after typing |
 * | `searchSubmit` | `{ value: string }` | Form submit / Enter |
 *
 * Parent owns `value`; update it from `searchChange` / `searchSubmit`.
 * A local draft keeps the input responsive between parent updates.
 */
@Component({
  tag: 'search-bar',
  styleUrl: 'search-bar.css',
  shadow: true,
})
export class SearchBar {
  @Prop() placeholder = 'Search recipes…';

  /** Controlled value from the parent. */
  @Prop() value = '';

  /** Accessible name for the input (visually hidden label text). */
  @Prop() label = 'Search';

  @Event() searchChange!: EventEmitter<{ value: string }>;

  @Event() searchSubmit!: EventEmitter<{ value: string }>;

  @State() private draft = '';

  private inputId = `rf-search-${Math.random().toString(36).slice(2, 9)}`;

  private emitChange = debounce((next: string) => {
    this.searchChange.emit({ value: next });
  }, 350);

  componentWillLoad() {
    this.draft = this.value ?? '';
  }

  @Watch('value')
  protected syncFromParent(next: string) {
    if (next !== this.draft) {
      this.draft = next ?? '';
    }
  }

  private onInput = (event: Event) => {
    const next = (event.target as HTMLInputElement).value;
    this.draft = next;
    this.emitChange(next);
  };

  private onSubmit = (event: Event) => {
    event.preventDefault();
    this.searchSubmit.emit({ value: this.draft ?? '' });
  };

  render() {
    return (
      <form class="search" part="root" role="search" onSubmit={this.onSubmit}>
        <label class="label" htmlFor={this.inputId}>
          {this.label}
        </label>
        <input
          id={this.inputId}
          class="input"
          part="input"
          type="search"
          name="q"
          autocomplete="off"
          placeholder={this.placeholder}
          value={this.draft}
          onInput={this.onInput}
        />
        <button class="submit" part="submit" type="submit">
          Search
        </button>
      </form>
    );
  }
}
