import { describe, expect, h, it, render } from '@stencil/vitest';

describe('empty-state', () => {
  it('renders message and icon', async () => {
    const { root } = await render(
      <empty-state message="No favorites yet" icon="heart" />,
    );

    expect(root).toHaveTextContent('No favorites yet');
    expect(root.shadowRoot?.querySelector('.icon')).toBeTruthy();
  });

  it('renders slotted action content', async () => {
    const { root } = await render(
      <empty-state message="No results">
        <button type="button">Browse recipes</button>
      </empty-state>,
    );

    expect(root).toHaveLightTextContent('Browse recipes');
  });
});
