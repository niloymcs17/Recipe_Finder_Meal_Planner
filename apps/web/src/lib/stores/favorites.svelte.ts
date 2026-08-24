import * as favoritesApi from '$lib/local-db/favorites';
import type { Favorite, RecipeSource } from '$lib/local-db/types';
import { authStore } from './auth.svelte';

let items = $state<Favorite[]>([]);
let ready = $state(false);

function snapshot(): Favorite[] {
	return items.map((item) => ({ ...item }));
}

export const favoritesStore = {
	get items() {
		return items;
	},
	get ready() {
		return ready;
	},
	isFavorited(recipeId: string): boolean {
		return items.some((item) => item.recipeId === recipeId);
	},
	hydrate() {
		if (!authStore.user) {
			items = [];
			ready = true;
			return;
		}
		try {
			items = favoritesApi.list();
		} catch {
			items = [];
		}
		ready = true;
	},
	toggle(recipeId: string, source: RecipeSource): { favorited: boolean } {
		const previous = snapshot();
		const existing = items.find((item) => item.recipeId === recipeId);
		if (existing) {
			items = items.filter((item) => item.recipeId !== recipeId);
		} else {
			items = [
				...items,
				{
					userId: authStore.user?.id ?? '',
					recipeId,
					source,
					addedAt: new Date().toISOString()
				}
			];
		}

		try {
			const result = favoritesApi.toggle(recipeId, source);
			items = favoritesApi.list();
			return result;
		} catch (error) {
			items = previous;
			throw error;
		}
	}
};
