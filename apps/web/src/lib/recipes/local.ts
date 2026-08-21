import { getCurrentUser } from '$lib/local-db/auth';
import { listMine } from '$lib/local-db/recipes';
import type { Recipe as LocalRecipe } from '$lib/local-db/types';
import type { Recipe } from '$lib/types/recipe';
import { toUserId } from '$lib/utils/ids';

export function localRecipeToDiscovery(recipe: LocalRecipe): Recipe {
	return {
		id: toUserId(recipe.id),
		source: 'user',
		title: recipe.title,
		image: recipe.imageUrl,
		category: recipe.category,
		area: recipe.area,
		cookTimeMinutes: recipe.cookTimeMinutes,
		servings: recipe.servings,
		ingredients: recipe.ingredients,
		steps: recipe.steps,
		ownerId: recipe.ownerId
	};
}

/** Browser-only. Returns [] when signed out. */
export function loadMyRecipes(): Recipe[] {
	if (typeof localStorage === 'undefined') return [];
	if (!getCurrentUser()) return [];
	return listMine().map(localRecipeToDiscovery);
}
