import { KEYS } from './keys';
import { migrate, readJson, writeJson } from './storage';
import { getCurrentUser } from './auth';
import type { Favorite, RecipeSource } from './types';
import { toggleFavoriteSchema } from '$lib/validation/planner';

function requireUserId(): string {
	const user = getCurrentUser();
	if (!user) throw new Error('Not authenticated');
	return user.id;
}

function allFavorites(): Favorite[] {
	migrate();
	return readJson<Favorite[]>(KEYS.favorites, []);
}

function saveFavorites(favorites: Favorite[]): void {
	writeJson(KEYS.favorites, favorites);
}

export function list(): Favorite[] {
	const userId = requireUserId();
	return allFavorites().filter((f) => f.userId === userId);
}

export function isFavorited(recipeId: string): boolean {
	const user = getCurrentUser();
	if (!user) return false;
	return allFavorites().some((f) => f.userId === user.id && f.recipeId === recipeId);
}

export function toggle(recipeId: string, source: RecipeSource): { favorited: boolean } {
	const userId = requireUserId();
	const parsed = toggleFavoriteSchema.safeParse({ recipeId, source });
	if (!parsed.success) {
		throw new Error(parsed.error.issues[0]?.message ?? 'Invalid favorite');
	}

	const favorites = allFavorites();
	const existing = favorites.findIndex(
		(f) => f.userId === userId && f.recipeId === parsed.data.recipeId
	);

	if (existing >= 0) {
		favorites.splice(existing, 1);
		saveFavorites(favorites);
		return { favorited: false };
	}

	favorites.push({
		userId,
		recipeId: parsed.data.recipeId,
		source: parsed.data.source,
		addedAt: new Date().toISOString()
	});
	saveFavorites(favorites);
	return { favorited: true };
}
