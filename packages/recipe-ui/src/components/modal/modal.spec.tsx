import { describe, expect, h, it, render } from '@stencil/vitest';

describe('rf-modal', () => {
  it('renders nothing interactive when closed', async () => {
    const { root } = await render(
      <rf-modal open={false} heading="Delete recipe">
        <p>Are you sure?</p>
      </rf-modal>,
    );

    expect(root.shadowRoot?.querySelector('.dialog')).toBeFalsy();
    expect(root.shadowRoot?.querySelector('button')).toBeFalsy();
  });

  it('renders heading, body slot, and footer when open', async () => {
    const { root } = await render(
      <rf-modal open={true} heading="Add to plan">
        <p>Pick a day</p>
      </rf-modal>,
    );

    expect(root.shadowRoot?.querySelector('.heading')).toHaveTextContent('Add to plan');
    expect(root).toHaveLightTextContent('Pick a day');
    expect(root.shadowRoot?.querySelector('[part="confirm"]')).toBeTruthy();
    expect(root.shadowRoot?.querySelector('[part="cancel"]')).toBeTruthy();
  });

  it('emits close and confirm from footer actions', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      <rf-modal open={true} heading="Confirm delete" />,
    );
    const closeSpy = spyOnEvent('close');
    const confirmSpy = spyOnEvent('confirm');

    (root.shadowRoot?.querySelector('[part="cancel"]') as HTMLButtonElement).click();
    await waitForChanges();
    expect(closeSpy).toHaveReceivedEventTimes(1);

    (root.shadowRoot?.querySelector('[part="confirm"]') as HTMLButtonElement).click();
    await waitForChanges();
    expect(confirmSpy).toHaveReceivedEventTimes(1);
  });
});
