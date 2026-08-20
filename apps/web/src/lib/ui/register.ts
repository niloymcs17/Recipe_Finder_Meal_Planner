import { browser } from '$app/environment';

let registered = false;

export async function registerRecipeUi(): Promise<void> {
	if (!browser || registered) return;
	registered = true;

	const { defineCustomElements } = await import('@recipe-finder/ui');
	defineCustomElements();
}
