import { Component, h, Prop } from '@stencil/core';


@Component({
  tag: 'empty-state',
  styleUrl: 'empty-state.css',
  shadow: true,
})
export class EmptyState {
  @Prop() message = 'Nothing here yet.';

  /** Named icon key or absolute/relative image URL. */
  @Prop() icon = 'inbox';

  private isUrl(value: string): boolean {
    return /^(https?:|data:|\/|\.\/)/i.test(value);
  }

  private glyph(name: string): string {
    switch (name) {
      case 'search':
        return '⌕';
      case 'heart':
        return '♡';
      case 'calendar':
        return '▦';
      case 'inbox':
      default:
        return '▤';
    }
  }

  render() {
    const icon = (this.icon || 'inbox').trim();
    const useImage = this.isUrl(icon);

    return (
      <div class="empty" part="root" role="status">
        <div class="icon" part="icon" aria-hidden="true">
          {useImage ? <img src={icon} alt="" /> : <span class="icon__glyph">{this.glyph(icon)}</span>}
        </div>
        <p class="message" part="message">
          {this.message}
        </p>
        <div class="action" part="action">
          <slot />
        </div>
      </div>
    );
  }
}
