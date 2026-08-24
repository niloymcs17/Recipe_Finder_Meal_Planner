import { browser } from '$app/environment';
import { getById } from '$lib/local-db/recipes';
import { localRecipeToDiscovery } from '$lib/recipes/local';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ data }) => {
	if (data.source === 'mealdb') {
		return { ...data, userPending: false };
	}

	if (!browser) {
		return { ...data, recipe: null, userPending: true };
	}

	const local = getById(data.rawId);
	return {
		...data,
		recipe: local ? localRecipeToDiscovery(local) : null,
		userPending: false
	};
};
