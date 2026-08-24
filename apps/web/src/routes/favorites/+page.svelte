<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { toggleFavoriteFromEvent } from '$lib/favorites/actions';
	import { resolveRecipes } from '$lib/recipes/resolve';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import type { Recipe } from '$lib/types/recipe';
	import { ceBind } from '$lib/ui/ce-bind';

	let rootEl = $state<HTMLElement | null>(null);
	let cache = $state<Record<string, Recipe | 'missing'>>({});
	let loading = $state(false);
	let requestSeq = 0;

	const favoriteIds = $derived(favoritesStore.items.map((item) => item.recipeId));

	const recipes = $derived(
		favoriteIds
			.map((id) => cache[id])
			.filter((recipe): recipe is Recipe => Boolean(recipe) && recipe !== 'missing')
	);

	const unresolved = $derived(favoriteIds.filter((id) => cache[id] === 'missing').length);

	$effect(() => {
		const ids = favoriteIds;
		if (!browser) return;
		const pending = ids.filter((id) => cache[id] === undefined);
		if (pending.length === 0) {
			loading = false;
			return;
		}

		const seq = ++requestSeq;
		loading = true;
		void resolveRecipes(pending).then((map) => {
			if (seq !== requestSeq) return;
			const next = { ...cache };
			for (const id of pending) {
				next[id] = map.get(id) ?? 'missing';
			}
			cache = next;
			loading = false;
		});
	});

	function recipeTags(recipe: Recipe): string[] {
		const tags = [recipe.category, recipe.area].filter((tag): tag is string => Boolean(tag));
		if (recipe.source === 'user') tags.unshift('My recipe');
		return tags;
	}

	function onRecipeSelect(event: Event) {
		const recipeId = (event as CustomEvent<{ recipeId?: string }>).detail?.recipeId;
		if (!recipeId) return;
		void goto(`/recipe/${encodeURIComponent(recipeId)}`);
	}

	function onFavoriteToggle(event: Event) {
		const recipeId = (event as CustomEvent<{ recipeId?: string }>).detail?.recipeId;
		toggleFavoriteFromEvent(recipeId);
	}

	onMount(() => {
		const root = rootEl;
		if (!root) return;
		root.addEventListener('recipeSelect', onRecipeSelect);
		root.addEventListener('favoriteToggle', onFavoriteToggle);
		return () => {
			root.removeEventListener('recipeSelect', onRecipeSelect);
			root.removeEventListener('favoriteToggle', onFavoriteToggle);
		};
	});
</script>

<svelte:head>
	<title>Favorites · Recipe Finder</title>
</svelte:head>

<section class="favorites" bind:this={rootEl}>
	<header class="hero">
		<h1>Favorites</h1>
		<p>
			Saved in this browser for your account. Refresh keeps them; clearing site data or another
			browser will not.
		</p>
	</header>

	<p class="status" aria-live="polite">
		{#if loading}
			Loading favorites…
		{:else if recipes.length > 0}
			{recipes.length} favorite{recipes.length === 1 ? '' : 's'}
			{#if unresolved}
				· {unresolved} no longer available
			{/if}
		{/if}
	</p>

	{#if !loading && recipes.length === 0}
		<empty-state
			icon="inbox"
			message={unresolved
				? 'Those recipes are no longer available in this browser.'
				: 'No favorites yet. Browse recipes and tap the star to save them here.'}
		>
			<a href="/">Browse recipes</a>
		</empty-state>
	{:else if recipes.length > 0}
		<recipe-grid columns={3}>
			{#each recipes as recipe (recipe.id)}
				<recipe-card
					recipe-id={recipe.id}
					heading={recipe.title}
					image={recipe.image ?? ''}
					use:ceBind={{
						tags: recipeTags(recipe),
						cookTime: recipe.cookTimeMinutes ?? 0,
						favorited: true
					}}
				></recipe-card>
			{/each}
		</recipe-grid>
	{/if}
</section>

<style>
	:global(main) {
		max-width: 72rem;
	}

	.favorites {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.hero h1 {
		margin: 0 0 0.4rem;
		font-size: 2rem;
		color: var(--rf-color-primary, #1f5c3a);
	}

	.hero p {
		margin: 0;
		opacity: 0.85;
		max-width: 40rem;
	}

	.status {
		margin: 0;
		min-height: 1.25rem;
		font-size: 0.9rem;
		opacity: 0.75;
	}

	:global(empty-state a) {
		color: var(--rf-color-primary, #1f5c3a);
	}
</style>
