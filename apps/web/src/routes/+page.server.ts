import { listCategories, searchRecipes } from '$lib/server/mealdb';
import type { PageServerLoad } from './$types';

const SAFE_ERROR = 'Recipe catalog is temporarily unavailable. Please try again shortly.';

export const load: PageServerLoad = async () => {
	const categories = await listCategories();
	try {
		const recipes = await searchRecipes({ q: '', category: '', area: '', ingredient: '' });
		return { recipes, categories, error: null as string | null };
	} catch (error) {
		console.error('[discovery load]', error);
		return { recipes: [], categories, error: SAFE_ERROR };
	}
};
