<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fetchMealDbRecipes } from '$lib/api/recipes';
	import { loadMyRecipes } from '$lib/recipes/local';
	import { filterRecipes, mergeDiscovery } from '$lib/recipes/merge';
	import { toggleFavoriteFromEvent } from '$lib/favorites/actions';
	import { authStore } from '$lib/stores/auth.svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import type { Recipe } from '$lib/types/recipe';
	import { ceBind } from '$lib/ui/ce-bind';
	import type { PageData } from './$types';

	const MINE_VALUE = '__mine__';

	let { data }: { data: PageData } = $props();

	let query = $state('');
	let selectedFilters = $state<string[]>([]);
	let clientMealdb = $state<Recipe[] | null>(null);
	let clientError = $state<string | null | undefined>(undefined);
	let loading = $state(false);

	let abort: AbortController | null = null;
	let requestSeq = 0;
	let clientReady = $state(false);
	let rootEl = $state<HTMLElement | null>(null);

	const mealdbRecipes = $derived(clientMealdb ?? data.recipes);
	const errorMessage = $derived(clientError !== undefined ? clientError : data.error);
	const mineOnly = $derived(selectedFilters.includes(MINE_VALUE));
	const selectedCategories = $derived(selectedFilters.filter((value) => value !== MINE_VALUE));

	const filterOptions = $derived([
		{ label: 'My recipes', value: MINE_VALUE },
		...data.categories.map((name) => ({ label: name, value: name }))
	]);

	const myRecipes = $derived.by(() => {
		void authStore.ready;
		void authStore.user;
		if (!browser || !clientReady) return [] as Recipe[];
		return loadMyRecipes();
	});

	const visibleRecipes = $derived.by(() => {
		const mine = filterRecipes(myRecipes, {
			q: query,
			categories: selectedCategories
		});
		if (mineOnly) return mine;
		return mergeDiscovery(mealdbRecipes, mine);
	});

	onMount(() => {
		clientReady = true;
		if (data.error) toastStore.show(data.error, 'error');

		const root = rootEl;
		if (!root) return;

		root.addEventListener('searchChange', onSearch);
		root.addEventListener('searchSubmit', onSearch);
		root.addEventListener('filterChange', onFilterChange);
		root.addEventListener('recipeSelect', onRecipeSelect);
		root.addEventListener('favoriteToggle', onFavoriteToggle);

		return () => {
			root.removeEventListener('searchChange', onSearch);
			root.removeEventListener('searchSubmit', onSearch);
			root.removeEventListener('filterChange', onFilterChange);
			root.removeEventListener('recipeSelect', onRecipeSelect);
			root.removeEventListener('favoriteToggle', onFavoriteToggle);
		};
	});

	function recipeTags(recipe: Recipe): string[] {
		const tags = [recipe.category, recipe.area].filter((tag): tag is string => Boolean(tag));
		if (recipe.source === 'user') tags.unshift('My recipe');
		return tags;
	}

	async function refreshMealDb() {
		abort?.abort();
		if (!browser || mineOnly) {
			loading = false;
			return;
		}
		const controller = new AbortController();
		abort = controller;
		const seq = ++requestSeq;
		loading = true;
		clientError = null;

		try {
			const recipes = await fetchMealDbRecipes(
				{
					q: query || undefined,
					category: selectedCategories.length ? selectedCategories.join(',') : undefined
				},
				controller.signal
			);
			if (seq !== requestSeq) return;
			clientMealdb = recipes;
		} catch (error) {
			if (controller.signal.aborted || seq !== requestSeq) return;
			if (error instanceof DOMException && error.name === 'AbortError') return;
			const message =
				error instanceof Error
					? error.message
					: 'Recipe catalog is temporarily unavailable. Please try again shortly.';
			clientError = message;
			toastStore.show(message, 'error');
		} finally {
			if (seq === requestSeq) loading = false;
		}
	}

	function onSearch(event: Event) {
		const value = (event as CustomEvent<{ value: string }>).detail?.value ?? '';
		query = value;
		void refreshMealDb();
	}

	function onFilterChange(event: Event) {
		const values = (event as CustomEvent<{ values: string[] }>).detail?.values ?? [];
		const wasMine = selectedFilters.includes(MINE_VALUE);
		selectedFilters = values;
		const nowMine = values.includes(MINE_VALUE);

		if (nowMine && !wasMine && !authStore.user) {
			toastStore.show('Sign in to see recipes saved in this browser.', 'info');
		}

		void refreshMealDb();
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
</script>

<section class="discovery" bind:this={rootEl}>
	<header class="hero">
		<h1>Discover recipes</h1>
		<p>
			Search TheMealDB and, when you’re signed in, recipes you saved in this browser. Nothing is
			stored in a cloud database.
		</p>
		{#if authStore.user}
			<p class="create-link"><a href="/recipe/new">Add your own recipe</a></p>
		{/if}
	</header>

	<search-bar
		label="Search recipes"
		placeholder="Search recipes…"
		value={query}
	></search-bar>

	<filter-chip-group
		label="Filters"
		use:ceBind={{ options: filterOptions, selected: selectedFilters }}
	></filter-chip-group>

	<p class="status" aria-live="polite">
		{#if loading}
			Loading recipes…
		{:else if visibleRecipes.length > 0}
			{visibleRecipes.length} recipe{visibleRecipes.length === 1 ? '' : 's'}
		{/if}
	</p>

	{#if visibleRecipes.length === 0 && !loading}
		<empty-state
			icon={errorMessage ? 'inbox' : 'search'}
			message={errorMessage
				? errorMessage
				: mineOnly
					? authStore.user
						? 'No matching recipes in this browser yet.'
						: 'Sign in to see recipes you have saved in this browser.'
					: 'No recipes match that search. Try another term or clear filters.'}
		>
			{#if mineOnly && authStore.user && !errorMessage}
				<a href="/recipe/new">Create a recipe</a>
			{/if}
		</empty-state>
	{:else}
		<recipe-grid columns={3} aria-busy={loading ? 'true' : 'false'}>
			{#each visibleRecipes as recipe (recipe.id)}
				<recipe-card
					recipe-id={recipe.id}
					heading={recipe.title}
					image={recipe.image ?? ''}
					use:ceBind={{
						tags: recipeTags(recipe),
						cookTime: recipe.cookTimeMinutes ?? 0,
						favorited: favoritesStore.isFavorited(recipe.id)
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

	.discovery {
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

	.create-link {
		margin-top: 0.75rem;
	}

	.create-link a {
		color: var(--rf-color-primary, #1f5c3a);
	}

	.status {
		margin: 0;
		min-height: 1.25rem;
		font-size: 0.9rem;
		opacity: 0.75;
	}
</style>
