<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { toggleFavoriteFromEvent } from '$lib/favorites/actions';
	import { loadMyRecipes } from '$lib/recipes/local';
	import { resolveRecipes } from '$lib/recipes/resolve';
	import { aggregateIngredients } from '$lib/planner/shopping';
	import { authStore } from '$lib/stores/auth.svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import { plannerStore } from '$lib/stores/planner.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import type { MealPlanEntry, MealType, WeekDay } from '$lib/local-db/types';
	import type { Recipe } from '$lib/types/recipe';
	import { ceBind } from '$lib/ui/ce-bind';
	import { addWeeks, formatWeekRange, startOfWeek, weekDayMeta } from '$lib/utils/dates';
	import { parseRecipeId } from '$lib/utils/ids';

	const RECIPE_DRAG_MIME = 'application/x-recipe-id';
	const MEAL_TYPES: { value: MealType | ''; label: string }[] = [
		{ value: '', label: 'Any meal' },
		{ value: 'breakfast', label: 'Breakfast' },
		{ value: 'lunch', label: 'Lunch' },
		{ value: 'dinner', label: 'Dinner' }
	];

	type DayMeal = { id: string; title: string; recipeId?: string };

	let rootEl = $state<HTMLElement | null>(null);
	let shoppingModal = $state<HTMLElement | null>(null);
	let assignModal = $state<HTMLElement | null>(null);
	let pendingRecipeId = $state('');
	let cache = $state<Record<string, Recipe | 'missing'>>({});
	let shoppingOpen = $state(false);
	let assignOpen = $state(false);
	let assignDay = $state<WeekDay>('monday');
	let assignMealType = $state<MealType | ''>('');
	let requestSeq = 0;

	const days = $derived(weekDayMeta(plannerStore.weekStart));
	const weekLabel = $derived(formatWeekRange(plannerStore.weekStart));

	const myRecipes = $derived.by(() => {
		void authStore.user;
		if (!browser) return [] as Recipe[];
		return loadMyRecipes();
	});

	const trayRecipes = $derived.by(() => {
		const seen = new Set<string>();
		const list: Recipe[] = [];
		for (const recipe of myRecipes) {
			if (seen.has(recipe.id)) continue;
			seen.add(recipe.id);
			list.push(recipe);
		}
		for (const item of favoritesStore.items) {
			const recipe = cache[item.recipeId];
			if (!recipe || recipe === 'missing' || seen.has(recipe.id)) continue;
			seen.add(recipe.id);
			list.push(recipe);
		}
		return list;
	});

	const neededIds = $derived.by(() => {
		const ids = [
			...favoritesStore.items.map((item) => item.recipeId),
			...plannerStore.entries.map((entry) => entry.recipeId)
		];
		return [...new Set(ids)];
	});

	const shoppingLines = $derived.by(() => {
		const ingredients = plannerStore.entries.flatMap((entry) => {
			const recipe = cache[entry.recipeId];
			if (!recipe || recipe === 'missing') return [];
			return recipe.ingredients;
		});
		return aggregateIngredients(ingredients);
	});

	$effect(() => {
		if (!browser || myRecipes.length === 0) return;
		const next = { ...cache };
		let changed = false;
		for (const recipe of myRecipes) {
			if (next[recipe.id] === undefined) {
				next[recipe.id] = recipe;
				changed = true;
			}
		}
		if (changed) cache = next;
	});

	$effect(() => {
		const ids = neededIds;
		if (!browser) return;
		const pending = ids.filter((id) => cache[id] === undefined);
		if (pending.length === 0) return;
		const seq = ++requestSeq;
		void resolveRecipes(pending).then((map) => {
			if (seq !== requestSeq) return;
			const next = { ...cache };
			for (const id of pending) {
				next[id] = map.get(id) ?? 'missing';
			}
			cache = next;
		});
	});

	function recipeTitle(recipeId: string): string {
		const recipe = cache[recipeId];
		if (recipe && recipe !== 'missing') return recipe.title;
		if (recipe === 'missing') return 'Unavailable recipe';
		return 'Loading…';
	}

	function mealTitle(entry: MealPlanEntry): string {
		const title = recipeTitle(entry.recipeId);
		if (!entry.mealType) return title;
		const meal = entry.mealType[0].toUpperCase() + entry.mealType.slice(1);
		return `${meal} · ${title}`;
	}

	function mealsFor(day: WeekDay): DayMeal[] {
		return plannerStore.entries
			.filter((entry) => entry.day === day)
			.map((entry) => ({
				id: entry.id,
				title: mealTitle(entry),
				recipeId: entry.recipeId
			}));
	}

	function recipeTags(recipe: Recipe): string[] {
		const tags = [recipe.category, recipe.area].filter((tag): tag is string => Boolean(tag));
		if (recipe.source === 'user') tags.unshift('My recipe');
		return tags;
	}

	function goWeek(delta: number) {
		plannerStore.setWeek(addWeeks(plannerStore.weekStart, delta));
	}

	function goThisWeek() {
		plannerStore.setWeek(startOfWeek(new Date()));
	}

	function onDragStart(event: DragEvent, recipeId: string) {
		const dt = event.dataTransfer;
		if (!dt) return;
		dt.setData(RECIPE_DRAG_MIME, recipeId);
		dt.setData('text/plain', recipeId);
		dt.effectAllowed = 'copy';
		pendingRecipeId = recipeId;
	}

	function openAssign(recipeId: string, day: WeekDay) {
		pendingRecipeId = recipeId;
		assignDay = day;
		assignMealType = '';
		assignOpen = true;
	}

	function assignRecipe(recipeId: string, day: WeekDay, mealType?: MealType | null) {
		const parsed = parseRecipeId(recipeId);
		if (!parsed) {
			toastStore.show('Could not add that recipe to the plan.', 'error');
			return;
		}
		try {
			plannerStore.assign({
				recipeId,
				day,
				source: parsed.source,
				mealType: mealType ?? null
			});
			toastStore.show('Added to this week’s plan.', 'success');
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Could not update the meal plan.';
			if (message === 'Not authenticated') {
				toastStore.show('Sign in to update your meal plan.', 'info');
				return;
			}
			toastStore.show(message, 'error');
		}
	}

	function onMealDrop(event: Event) {
		const detail = (event as CustomEvent<{ recipeId: string; day: string }>).detail;
		if (!detail?.recipeId || !detail.day) return;
		openAssign(detail.recipeId, detail.day as WeekDay);
	}

	function onMealRemove(event: Event) {
		const entryId = (event as CustomEvent<{ entryId: string }>).detail?.entryId;
		if (!entryId) return;
		try {
			plannerStore.remove(entryId);
			toastStore.show('Removed from the plan.', 'success');
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Could not update the meal plan.';
			toastStore.show(message, 'error');
		}
	}

	function confirmAssign() {
		assignOpen = false;
		if (!pendingRecipeId) return;
		assignRecipe(pendingRecipeId, assignDay, assignMealType || null);
	}

	function closeAssign() {
		assignOpen = false;
	}

	function closeShopping() {
		shoppingOpen = false;
	}

	function onRecipeSelect(event: Event) {
		const recipeId = (event as CustomEvent<{ recipeId?: string }>).detail?.recipeId;
		if (!recipeId) return;
		pendingRecipeId = pendingRecipeId === recipeId ? '' : recipeId;
	}

	function onFavoriteToggle(event: Event) {
		const recipeId = (event as CustomEvent<{ recipeId?: string }>).detail?.recipeId;
		toggleFavoriteFromEvent(recipeId);
	}

	onMount(() => {
		const root = rootEl;
		const assign = assignModal;
		const shopping = shoppingModal;
		if (!root) return;

		root.addEventListener('mealDrop', onMealDrop);
		root.addEventListener('mealRemove', onMealRemove);
		root.addEventListener('recipeSelect', onRecipeSelect);
		root.addEventListener('favoriteToggle', onFavoriteToggle);
		assign?.addEventListener('close', closeAssign);
		assign?.addEventListener('confirm', confirmAssign);
		shopping?.addEventListener('close', closeShopping);
		shopping?.addEventListener('confirm', closeShopping);

		return () => {
			root.removeEventListener('mealDrop', onMealDrop);
			root.removeEventListener('mealRemove', onMealRemove);
			root.removeEventListener('recipeSelect', onRecipeSelect);
			root.removeEventListener('favoriteToggle', onFavoriteToggle);
			assign?.removeEventListener('close', closeAssign);
			assign?.removeEventListener('confirm', confirmAssign);
			shopping?.removeEventListener('close', closeShopping);
			shopping?.removeEventListener('confirm', closeShopping);
		};
	});
</script>

<svelte:head>
	<title>Meal planner · Recipe Finder</title>
</svelte:head>

<section class="planner" bind:this={rootEl}>
	<header class="hero">
		<h1>Meal planner</h1>
		<p>
			Plan meals for the week starting Monday. Entries stay in this browser for your account —
			refresh keeps them; another browser will not see them.
		</p>
	</header>

	<div class="week-nav">
		<button type="button" onclick={() => goWeek(-1)}>Previous week</button>
		<div class="week-label">
			<strong>{weekLabel}</strong>
			<button type="button" class="linkish" onclick={goThisWeek}>This week</button>
		</div>
		<button type="button" onclick={() => goWeek(1)}>Next week</button>
		<button type="button" class="secondary" onclick={() => (shoppingOpen = true)}>
			Shopping list
		</button>
	</div>

	<section class="tray">
		<h2>Assign a recipe</h2>
		<p class="hint">
			Drag a card onto a day, or tap a card and then <strong>Assign here</strong>. Optional meal
			type is asked before saving.
		</p>
		{#if trayRecipes.length === 0}
			<empty-state
				icon="search"
				message="Favorite a recipe or create your own, then assign it to a day."
			>
				<a href="/">Browse recipes</a>
			</empty-state>
		{:else}
			<recipe-grid columns={4}>
				{#each trayRecipes as recipe (recipe.id)}
					<div
						class="tray-item"
						class:selected={pendingRecipeId === recipe.id}
						role="group"
						aria-label="Drag {recipe.title} onto a day"
						draggable="true"
						ondragstart={(event) => onDragStart(event, recipe.id)}
					>
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
					</div>
				{/each}
			</recipe-grid>
		{/if}
	</section>

	<div class="week">
		{#each days as day (`${authStore.user?.id ?? 'anon'}-${plannerStore.weekStart}-${day.day}`)}
			<day-column
				day={day.day}
				label={day.label}
				use:ceBind={{
					label: day.label,
					meals: mealsFor(day.day),
					pendingRecipeId
				}}
			>
				<empty-state icon="inbox" message="No meals yet. Drop or assign a recipe."></empty-state>
			</day-column>
		{/each}
	</div>

	<rf-modal
		bind:this={assignModal}
		heading="Add to plan"
		confirm-label="Add"
		cancel-label="Cancel"
		use:ceBind={{ open: assignOpen }}
	>
		<p class="modal-copy">
			{pendingRecipeId ? recipeTitle(pendingRecipeId) : 'Recipe'}
		</p>
		<label class="field">
			Day
			<select bind:value={assignDay}>
				{#each days as day (day.day)}
					<option value={day.day}>{day.label}</option>
				{/each}
			</select>
		</label>
		<label class="field">
			Meal type
			<select bind:value={assignMealType}>
				{#each MEAL_TYPES as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</label>
	</rf-modal>

	<rf-modal
		bind:this={shoppingModal}
		heading="Shopping list"
		confirm-label="Close"
		cancel-label="Close"
		hide-confirm={true}
		use:ceBind={{ open: shoppingOpen, hideConfirm: true }}
	>
		{#if shoppingLines.length === 0}
			<empty-state icon="inbox" message="Assign recipes this week to build a shopping list."
			></empty-state>
		{:else}
			<ul class="shopping">
				{#each shoppingLines as line (line.name)}
					<li>
						{#if line.quantity}
							<span class="qty">{line.quantity}</span>
						{/if}
						{line.name}
					</li>
				{/each}
			</ul>
		{/if}
	</rf-modal>
</section>

<style>
	:global(main) {
		max-width: 90rem;
	}

	.planner {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.hero h1 {
		margin: 0 0 0.4rem;
		font-size: 2rem;
		color: var(--rf-color-primary, #1f5c3a);
	}

	.hero p,
	.hint {
		margin: 0;
		opacity: 0.85;
		max-width: 46rem;
	}

	.week-nav {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
	}

	.week-label {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 12rem;
	}

	.week-nav button,
	.secondary {
		font: inherit;
		cursor: pointer;
		border: none;
		padding: 0.45rem 0.85rem;
		background: var(--rf-color-primary, #1f5c3a);
		color: #fff;
	}

	.secondary {
		background: transparent;
		color: #1a1a1a;
		border: 1px solid rgba(26, 26, 26, 0.2);
		margin-left: auto;
	}

	.linkish {
		align-self: flex-start;
		background: none !important;
		color: var(--rf-color-primary, #1f5c3a) !important;
		padding: 0 !important;
		text-decoration: underline;
	}

	.tray h2 {
		margin: 0 0 0.35rem;
		font-size: 1.2rem;
	}

	.tray {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.tray-item {
		cursor: grab;
	}

	.tray-item.selected {
		outline: 2px solid var(--rf-color-primary, #1f5c3a);
		outline-offset: 3px;
	}

	.week {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.modal-copy {
		margin: 0 0 0.75rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		margin-bottom: 0.75rem;
		font-size: 0.95rem;
	}

	select {
		font: inherit;
		padding: 0.45rem 0.55rem;
	}

	.shopping {
		margin: 0;
		padding-left: 1.1rem;
	}

	.shopping li + li {
		margin-top: 0.35rem;
	}

	.qty {
		font-weight: 700;
		margin-right: 0.35rem;
	}

	:global(empty-state a) {
		color: var(--rf-color-primary, #1f5c3a);
	}

	@media (max-width: 70rem) {
		.week {
			grid-template-columns: 1fr;
		}
	}
</style>
