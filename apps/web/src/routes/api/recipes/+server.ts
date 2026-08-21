import { json } from '@sveltejs/kit';
import { MealDbUnavailableError, searchRecipes } from '$lib/server/mealdb';
import { parseRecipeQuery } from '$lib/validation/recipes-query';
import type { RequestHandler } from './$types';

const SAFE_ERROR = 'Recipe catalog is temporarily unavailable. Please try again shortly.';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const recipes = await searchRecipes(parseRecipeQuery(url));
		return json({ recipes });
	} catch (error) {
		if (!(error instanceof MealDbUnavailableError)) {
			console.error('[api/recipes]', error);
		}
		return json({ error: SAFE_ERROR }, { status: 502 });
	}
};
