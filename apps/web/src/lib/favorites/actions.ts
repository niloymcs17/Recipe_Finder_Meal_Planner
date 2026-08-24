import { authStore } from '$lib/stores/auth.svelte';
import { favoritesStore } from '$lib/stores/favorites.svelte';
import { toastStore } from '$lib/stores/toast.svelte';
import { parseRecipeId } from '$lib/utils/ids';

export function toggleFavoriteFromEvent(recipeId: string | undefined): boolean {
	if (!recipeId) return false;

	const parsed = parseRecipeId(recipeId);
	if (!parsed) {
		toastStore.show('Could not update favorites.', 'error');
		return false;
	}

	if (!authStore.user) {
		toastStore.show('Sign in to save favorites.', 'info');
		return false;
	}

	try {
		const { favorited } = favoritesStore.toggle(recipeId, parsed.source);
		toastStore.show(favorited ? 'Added to favorites.' : 'Removed from favorites.', 'success');
		return true;
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Could not update favorites.';
		if (message === 'Not authenticated') {
			toastStore.show('Sign in to save favorites.', 'info');
			return false;
		}
		toastStore.show(message, 'error');
		return false;
	}
}
