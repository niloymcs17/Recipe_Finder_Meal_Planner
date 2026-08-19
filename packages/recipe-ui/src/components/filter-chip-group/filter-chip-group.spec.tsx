import { describe, expect, h, it, render } from '@stencil/vitest';

describe('filter-chip-group', () => {
  const options = [
    { label: 'Seafood', value: 'seafood' },
    { label: 'Vegan', value: 'vegan' },
  ];

  it('renders option labels', async () => {
    const { root } = await render(<filter-chip-group options={options} selected={[]} />);
    expect(root).toHaveTextContent('Seafood');
    expect(root).toHaveTextContent('Vegan');
  });

  it('emits filterChange with updated selection', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      <filter-chip-group options={options} selected={['seafood']} />,
    );
    const changeSpy = spyOnEvent('filterChange');

    const chips = Array.from(root.shadowRoot?.querySelectorAll('.chip') ?? []) as HTMLButtonElement[];
    chips[1].click();
    await waitForChanges();

    expect(changeSpy).toHaveReceivedEventTimes(1);
    expect(changeSpy).toHaveReceivedEventDetail({ values: ['seafood', 'vegan'] });
  });

  it('deselects an active chip', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      <filter-chip-group options={options} selected={['seafood']} />,
    );
    const changeSpy = spyOnEvent('filterChange');

    const chip = root.shadowRoot?.querySelector('.chip') as HTMLButtonElement;
    chip.click();
    await waitForChanges();

    expect(changeSpy).toHaveReceivedEventDetail({ values: [] });
  });
});
