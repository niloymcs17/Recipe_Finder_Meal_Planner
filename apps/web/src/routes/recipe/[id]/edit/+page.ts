import { getCurrentUser } from '$lib/local-db/auth';
import { getById } from '$lib/local-db/recipes';
import { requireLocalUser } from '$lib/recipes/require-user';
import { parseRecipeId } from '$lib/utils/ids';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = ({ params, url }) => {
	const user = requireLocalUser(url.pathname);
	const parsed = parseRecipeId(params.id ?? '');

	if (!parsed || parsed.source !== 'user') {
		return { status: 'forbidden' as const, recipe: null };
	}

	const recipe = getById(parsed.rawId);
	if (!recipe) {
		return { status: 'notfound' as const, recipe: null };
	}

	const current = getCurrentUser() ?? user;
	if (recipe.ownerId !== current.id) {
		return { status: 'forbidden' as const, recipe: null };
	}

	return { status: 'ok' as const, recipe };
};
