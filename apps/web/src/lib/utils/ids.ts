import type { RecipeSource } from '$lib/types/recipe';

export type ParsedRecipeId = {
	source: RecipeSource;
	rawId: string;
};

const MEALDB_PREFIX = 'mealdb:';
const USER_PREFIX = 'user:';

export function toMealDbId(id: string): string {
	return `${MEALDB_PREFIX}${id}`;
}

export function toUserId(id: string): string {
	return `${USER_PREFIX}${id}`;
}

export function parseRecipeId(id: string): ParsedRecipeId | null {
	if (id.startsWith(MEALDB_PREFIX)) {
		const rawId = id.slice(MEALDB_PREFIX.length);
		return rawId ? { source: 'mealdb', rawId } : null;
	}
	if (id.startsWith(USER_PREFIX)) {
		const rawId = id.slice(USER_PREFIX.length);
		return rawId ? { source: 'user', rawId } : null;
	}
	return null;
}
