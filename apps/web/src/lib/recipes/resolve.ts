import { getById } from '$lib/local-db/recipes';
import { fetchMealDbRecipeById } from '$lib/api/recipes';
import { localRecipeToDiscovery } from '$lib/recipes/local';
import type { Recipe } from '$lib/types/recipe';
import { parseRecipeId } from '$lib/utils/ids';

export async function resolveRecipe(recipeId: string): Promise<Recipe | null> {
	const parsed = parseRecipeId(recipeId);
	if (!parsed) return null;

	if (parsed.source === 'user') {
		const local = getById(parsed.rawId);
		return local ? localRecipeToDiscovery(local) : null;
	}

	try {
		return await fetchMealDbRecipeById(parsed.rawId);
	} catch {
		return null;
	}
}

export async function resolveRecipes(recipeIds: string[]): Promise<Map<string, Recipe>> {
	const unique = [...new Set(recipeIds.filter(Boolean))];
	const resolved = await Promise.all(unique.map((id) => resolveRecipe(id)));
	const map = new Map<string, Recipe>();
	for (let i = 0; i < unique.length; i += 1) {
		const recipe = resolved[i];
		if (recipe) map.set(unique[i], recipe);
	}
	return map;
}
