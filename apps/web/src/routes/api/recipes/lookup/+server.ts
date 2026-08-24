import { json } from '@sveltejs/kit';
import { lookupById, MealDbUnavailableError } from '$lib/server/mealdb';
import type { RequestHandler } from './$types';

const SAFE_ERROR = 'Recipe catalog is temporarily unavailable. Please try again shortly.';

export const GET: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id')?.trim() ?? '';
	if (!id) {
		return json({ error: 'Missing recipe id.' }, { status: 400 });
	}

	try {
		const recipe = await lookupById(id);
		if (!recipe) {
			return json({ recipe: null }, { status: 404 });
		}
		return json({ recipe });
	} catch (error) {
		if (!(error instanceof MealDbUnavailableError)) {
			console.error('[api/recipes/lookup]', error);
		}
		return json({ error: SAFE_ERROR }, { status: 502 });
	}
};
