import { error } from '@sveltejs/kit';
import { lookupById, MealDbUnavailableError } from '$lib/server/mealdb';
import { parseRecipeId } from '$lib/utils/ids';
import type { PageServerLoad } from './$types';

const SAFE_ERROR = 'Recipe catalog is temporarily unavailable. Please try again shortly.';

export const load: PageServerLoad = async ({ params }) => {
	const parsed = parseRecipeId(params.id ?? '');
	if (!parsed) {
		error(404, 'Recipe not found');
	}

	if (parsed.source === 'user') {
		return {
			source: 'user' as const,
			rawId: parsed.rawId,
			recipe: null,
			mealdbError: null as string | null
		};
	}

	try {
		const recipe = await lookupById(parsed.rawId);
		return {
			source: 'mealdb' as const,
			rawId: parsed.rawId,
			recipe,
			mealdbError: null as string | null
		};
	} catch (err) {
		if (!(err instanceof MealDbUnavailableError)) {
			console.error('[recipe details]', err);
		}
		return {
			source: 'mealdb' as const,
			rawId: parsed.rawId,
			recipe: null,
			mealdbError: SAFE_ERROR
		};
	}
};
