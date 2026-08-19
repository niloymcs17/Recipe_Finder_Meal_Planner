import { describe, expect, h, it, render } from '@stencil/vitest';

describe('rating-stars', () => {
  it('renders filled stars for the value', async () => {
    const { root } = await render(<rating-stars value={3} readonly />);
    const filled = root.shadowRoot?.querySelectorAll('.star--filled') ?? [];
    expect(filled.length).toBe(3);
  });

  it('emits ratingChange when interactive', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(<rating-stars value={1} />);
    const changeSpy = spyOnEvent('ratingChange');

    const stars = Array.from(root.shadowRoot?.querySelectorAll('button.star') ?? []) as HTMLButtonElement[];
    stars[3].click();
    await waitForChanges();

    expect(changeSpy).toHaveReceivedEventTimes(1);
    expect(changeSpy).toHaveReceivedEventDetail({ value: 4 });
  });

  it('does not emit when readonly', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(<rating-stars value={2} readonly />);
    const changeSpy = spyOnEvent('ratingChange');

    const star = root.shadowRoot?.querySelector('.star') as HTMLElement;
    star.click();
    await waitForChanges();

    expect(changeSpy).toHaveReceivedEventTimes(0);
  });
});
