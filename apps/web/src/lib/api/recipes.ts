import type { Recipe } from '$lib/types/recipe';

export async function fetchMealDbRecipes(
	params: { q?: string; category?: string; area?: string; ingredient?: string },
	signal?: AbortSignal
): Promise<Recipe[]> {
	const search = new URLSearchParams();
	if (params.q) search.set('q', params.q);
	if (params.category) search.set('category', params.category);
	if (params.area) search.set('area', params.area);
	if (params.ingredient) search.set('ingredient', params.ingredient);

	const query = search.toString();
	const response = await fetch(query ? `/api/recipes?${query}` : '/api/recipes', { signal });
	const data = (await response.json()) as { recipes?: Recipe[]; error?: string };
	if (!response.ok) {
		throw new Error(data.error ?? 'Could not load recipes.');
	}
	return Array.isArray(data.recipes) ? data.recipes : [];
}
