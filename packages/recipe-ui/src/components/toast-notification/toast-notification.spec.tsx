import { describe, expect, h, it, render } from '@stencil/vitest';

describe('toast-notification', () => {
  it('renders message for each type', async () => {
    for (const type of ['success', 'error', 'info'] as const) {
      const { root } = await render(
        <toast-notification message={`${type} toast`} type={type} duration={60_000} />,
      );
      expect(root).toHaveTextContent(`${type} toast`);
      expect(root.shadowRoot?.querySelector(`.toast--${type}`)).toBeTruthy();
    }
  });

  it('auto-dismisses after duration', async () => {
    const { root, waitForChanges } = await render(
      <toast-notification message="Saved" type="success" duration={80} />,
    );

    expect(root.shadowRoot?.querySelector('.toast')).toBeTruthy();

    await new Promise((resolve) => setTimeout(resolve, 120));
    await waitForChanges();

    expect(root.shadowRoot?.querySelector('.toast')).toBeFalsy();
  }, 10_000);

  it('hides when visible is false', async () => {
    const { root } = await render(
      <toast-notification message="Hidden" visible={false} />,
    );

    expect(root.shadowRoot?.querySelector('.toast')).toBeFalsy();
  });
});
