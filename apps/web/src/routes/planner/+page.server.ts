import { listCategories } from '$lib/server/mealdb';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const categories = await listCategories();
		return { categories, browseError: null as string | null };
	} catch (error) {
		console.error('[planner load]', error);
		return { categories: [] as string[], browseError: 'Recipe catalog is temporarily unavailable.' };
	}
};
