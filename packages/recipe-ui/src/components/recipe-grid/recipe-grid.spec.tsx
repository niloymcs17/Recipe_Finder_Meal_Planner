import { describe, expect, h, it, render } from '@stencil/vitest';

describe('recipe-grid', () => {
  it('renders slotted children', async () => {
    const { root } = await render(
      <recipe-grid columns={2}>
        <div class="child-a">A</div>
        <div class="child-b">B</div>
      </recipe-grid>,
    );

    expect(root).toHaveLightTextContent('A');
    expect(root).toHaveLightTextContent('B');
    expect((root as HTMLElement & { columns: number }).columns).toBe(2);
  });

  it('defaults columns to 3', async () => {
    const { root } = await render(<recipe-grid />);
    expect((root as HTMLElement & { columns: number }).columns).toBe(3);
  });
});
