import { describe, expect, h, it, render } from '@stencil/vitest';

describe('form-input', () => {
  it('renders label associated with the control', async () => {
    const { root } = await render(
      <form-input label="Recipe name" value="Soup" name="title" required />,
    );

    const input = root.shadowRoot?.querySelector('input') as HTMLInputElement;
    const label = root.shadowRoot?.querySelector('label') as HTMLLabelElement;

    expect(label.textContent).toContain('Recipe name');
    expect(label.htmlFor).toBe(input.id);
    expect(input.value).toBe('Soup');
    expect(input.required).toBe(true);
  });

  it('shows error with aria-invalid and aria-describedby', async () => {
    const { root } = await render(
      <form-input label="Email" value="" error="Email is required" />,
    );

    const input = root.shadowRoot?.querySelector('input') as HTMLInputElement;
    const error = root.shadowRoot?.querySelector('.error') as HTMLElement;

    expect(error).toHaveTextContent('Email is required');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(error.id);
  });

  it('emits valueChange with the new value', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      <form-input label="Title" value="" />,
    );
    const changeSpy = spyOnEvent('valueChange');

    const input = root.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.value = 'Pasta';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await waitForChanges();

    expect(changeSpy).toHaveReceivedEventTimes(1);
    expect(changeSpy).toHaveReceivedEventDetail({ value: 'Pasta' });
  });
});
