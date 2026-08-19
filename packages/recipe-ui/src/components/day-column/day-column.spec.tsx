import { describe, expect, h, it, render } from '@stencil/vitest';

const RECIPE_DRAG_MIME = 'application/x-recipe-id';

describe('day-column', () => {
  it('renders day label and slotted empty state when no meals', async () => {
    const { root } = await render(
      <day-column day="monday" label="Monday">
        <span>No meals yet</span>
      </day-column>,
    );

    expect(root.shadowRoot?.querySelector('.heading')).toHaveTextContent('Monday');
    expect(root).toHaveLightTextContent('No meals yet');
  });

  it('emits mealDrop with the same payload from tap assign', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      <day-column day="tuesday" label="Tuesday" pendingRecipeId="mealdb:42" />,
    );
    const dropSpy = spyOnEvent('mealDrop');

    const assign = root.shadowRoot?.querySelector('.assign') as HTMLButtonElement;
    expect(assign).toBeTruthy();
    assign.click();
    await waitForChanges();

    expect(dropSpy).toHaveReceivedEventTimes(1);
    expect(dropSpy).toHaveReceivedEventDetail({ recipeId: 'mealdb:42', day: 'tuesday' });
  });

  it('emits mealDrop from HTML5 drop with matching payload shape', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      <day-column day="wednesday" label="Wednesday" />,
    );
    const dropSpy = spyOnEvent('mealDrop');

    const column = root.shadowRoot?.querySelector('.column') as HTMLElement;
    const store: Record<string, string> = {
      [RECIPE_DRAG_MIME]: 'user:7',
      'text/plain': 'user:7',
    };
    const dataTransfer = {
      getData: (type: string) => store[type] ?? '',
      setData: () => undefined,
      clearData: () => undefined,
      dropEffect: 'copy',
      effectAllowed: 'copy',
      files: [] as unknown as FileList,
      items: [] as unknown as DataTransferItemList,
      types: Object.keys(store),
    } as unknown as DataTransfer;

    const event = new Event('drop', { bubbles: true, cancelable: true }) as DragEvent;
    Object.defineProperty(event, 'dataTransfer', { value: dataTransfer });
    column.dispatchEvent(event);
    await waitForChanges();

    expect(dropSpy).toHaveReceivedEventTimes(1);
    expect(dropSpy).toHaveReceivedEventDetail({ recipeId: 'user:7', day: 'wednesday' });
  });

  it('emits mealRemove with entry id and day', async () => {
    const meals = [{ id: 'entry-1', title: 'Pasta', recipeId: 'mealdb:1' }];
    const { root, spyOnEvent, waitForChanges } = await render(
      <day-column day="friday" label="Friday" meals={meals} />,
    );
    const removeSpy = spyOnEvent('mealRemove');

    const btn = root.shadowRoot?.querySelector('.meal__remove') as HTMLButtonElement;
    btn.click();
    await waitForChanges();

    expect(removeSpy).toHaveReceivedEventTimes(1);
    expect(removeSpy).toHaveReceivedEventDetail({
      entryId: 'entry-1',
      day: 'friday',
      recipeId: 'mealdb:1',
    });
  });
});
