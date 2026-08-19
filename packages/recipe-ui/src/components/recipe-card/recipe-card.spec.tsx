import { describe, expect, h, it, render } from '@stencil/vitest';

describe('recipe-card', () => {
  it('renders title, cook time, tags, and slotted footer', async () => {
    const { root } = await render(
      <recipe-card heading="Tomato Soup" cookTime={25} rating={4} tags={['Soup', 'Veg']}>
        <span>Badge</span>
      </recipe-card>,
    );

    expect(root).toHaveTextContent('Tomato Soup');
    expect(root).toHaveTextContent('25 min');
    expect(root).toHaveTextContent('Soup');
    expect(root).toHaveLightTextContent('Badge');
  });

  it('emits recipeSelect with recipeId when provided', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      <recipe-card recipeId="mealdb:52772" heading="Teriyaki" />,
    );
    const selectSpy = spyOnEvent('recipeSelect');

    root.shadowRoot?.querySelector('.heading')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await waitForChanges();

    expect(selectSpy).toHaveReceivedEventTimes(1);
    expect(selectSpy).toHaveReceivedEventDetail({ recipeId: 'mealdb:52772' });
  });

  it('emits favoriteToggle without inventing an id', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      <recipe-card heading="Plain" favorited={false} />,
    );
    const favSpy = spyOnEvent('favoriteToggle');

    const btn = root.shadowRoot?.querySelector('.favorite') as HTMLButtonElement;
    btn.click();
    await waitForChanges();

    expect(favSpy).toHaveReceivedEventTimes(1);
    expect(favSpy).toHaveReceivedEventDetail({ favorited: true });
  });
});
