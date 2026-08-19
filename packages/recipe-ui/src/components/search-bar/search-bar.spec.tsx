import { describe, expect, h, it, render } from '@stencil/vitest';

describe('search-bar', () => {
  it('renders search input with accessible label', async () => {
    const { root } = await render(
      <search-bar placeholder="Find meals" value="pasta" label="Recipe search" />,
    );

    const input = root.shadowRoot?.querySelector('input[type="search"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.placeholder).toBe('Find meals');
    expect(input.value).toBe('pasta');
    expect(root.shadowRoot?.querySelector('label')?.textContent).toContain('Recipe search');
  });

  it('emits searchSubmit with current value', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(<search-bar value="curry" />);
    const submitSpy = spyOnEvent('searchSubmit');

    const form = root.shadowRoot?.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await waitForChanges();

    expect(submitSpy).toHaveReceivedEventTimes(1);
    expect(submitSpy).toHaveReceivedEventDetail({ value: 'curry' });
  });

  it(
    'emits debounced searchChange after typing',
    async () => {
      const { root, spyOnEvent, waitForChanges } = await render(<search-bar value="" />);
      const changeSpy = spyOnEvent('searchChange');

      const input = root.shadowRoot?.querySelector('input') as HTMLInputElement;
      input.value = 'soup';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await waitForChanges();

      expect(changeSpy).toHaveReceivedEventTimes(0);

      await new Promise((resolve) => setTimeout(resolve, 400));
      await waitForChanges();

      expect(changeSpy).toHaveReceivedEventTimes(1);
      expect(changeSpy).toHaveReceivedEventDetail({ value: 'soup' });
    },
    10_000,
  );
});
