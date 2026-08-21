import type { Recipe } from '$lib/types/recipe';

export function filterRecipes(
	recipes: Recipe[],
	opts: { q?: string; categories?: string[]; area?: string }
): Recipe[] {
	const q = opts.q?.trim().toLowerCase() ?? '';
	const categories = opts.categories?.filter(Boolean) ?? [];
	const area = opts.area?.trim().toLowerCase() ?? '';

	return recipes.filter((recipe) => {
		if (q) {
			const hay = [
				recipe.title,
				recipe.category ?? '',
				recipe.area ?? '',
				...recipe.ingredients.map((item) => item.name)
			]
				.join(' ')
				.toLowerCase();
			if (!hay.includes(q)) return false;
		}
		if (categories.length > 0) {
			if (!recipe.category || !categories.includes(recipe.category)) return false;
		}
		if (area && (recipe.area ?? '').toLowerCase() !== area) return false;
		return true;
	});
}

/** User recipes first, then MealDB; de-dupe by prefixed id. */
export function mergeDiscovery(mealdb: Recipe[], mine: Recipe[]): Recipe[] {
	const seen = new Set<string>();
	const out: Recipe[] = [];
	for (const recipe of [...mine, ...mealdb]) {
		if (seen.has(recipe.id)) continue;
		seen.add(recipe.id);
		out.push(recipe);
	}
	return out;
}
