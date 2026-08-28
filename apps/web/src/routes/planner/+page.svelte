<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { fetchMealDbRecipes } from '$lib/api/recipes';
	import { toggleFavoriteFromEvent } from '$lib/favorites/actions';
	import { loadMyRecipes } from '$lib/recipes/local';
	import { filterRecipes, mergeDiscovery } from '$lib/recipes/merge';
	import { resolveRecipes } from '$lib/recipes/resolve';
	import { aggregateIngredients } from '$lib/planner/shopping';
	import { authStore } from '$lib/stores/auth.svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import { plannerStore } from '$lib/stores/planner.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import type { MealPlanEntry, MealType, WeekDay } from '$lib/local-db/types';
	import type { Recipe } from '$lib/types/recipe';
	import { ceBind } from '$lib/ui/ce-bind';
	import LoadingIndicator from '$lib/ui/LoadingIndicator.svelte';
	import { addWeeks, formatWeekRange, startOfWeek, weekDayMeta, WEEK_DAY_SHORT } from '$lib/utils/dates';
	import { scheduleDelayedLoading } from '$lib/utils/delayed-loading';
	import { parseRecipeId } from '$lib/utils/ids';
	import type { PageData } from './$types';

	const RECIPE_DRAG_MIME = 'application/x-recipe-id';
	const MINE_VALUE = '__mine__';

	const MEAL_COLUMNS: { value: MealType; label: string }[] = [
		{ value: 'breakfast', label: 'Breakfast' },
		{ value: 'lunch', label: 'Lunch' },
		{ value: 'dinner', label: 'Dinner' }
	];

	const PICKER_TABS = [
		{ id: 'favorites', label: 'Favourite recipe', icon: '❤️' },
		{ id: 'browse', label: 'Browse recipe', icon: '🔍' }
	] as const;

	type PickerTab = (typeof PICKER_TABS)[number]['id'];
	type TargetCell = { day: WeekDay; mealType: MealType };

	let { data }: { data: PageData } = $props();

	let rootEl = $state<HTMLElement | null>(null);
	let shoppingModal = $state<HTMLElement | null>(null);
	let assignModal = $state<HTMLElement | null>(null);
	let pickerModal = $state<HTMLElement | null>(null);
	let pendingRecipeId = $state('');
	let cache = $state<Record<string, Recipe | 'missing'>>({});
	let shoppingOpen = $state(false);
	let assignOpen = $state(false);
	let pickerOpen = $state(false);
	let assignDay = $state<WeekDay>('monday');
	let assignMealType = $state<MealType | ''>('');
	let pickerTab = $state<PickerTab>('favorites');
	let targetCell = $state<TargetCell | null>(null);
	let dragOverCell = $state<string | null>(null);
	let requestSeq = 0;
	let resolving = $state(false);
	let browseQuery = $state('');
	let browseFilters = $state<string[]>([]);
	let clientMealdb = $state<Recipe[] | null>(null);
	let browseLoading = $state(false);
	let browseShowLoading = $state(false);
	let browseAbort: AbortController | null = null;
	let browseRequestSeq = 0;
	let browseStopLoading: (() => void) | null = null;

	const days = $derived(weekDayMeta(plannerStore.weekStart));
	const weekLabel = $derived(formatWeekRange(plannerStore.weekStart));
	const currentWeekStart = $derived(startOfWeek(new Date()));
	const canGoPreviousWeek = $derived(plannerStore.weekStart > currentWeekStart);
	const pickerHeading = $derived.by(() => {
		const cell = targetCell;
		if (!cell) return 'Add a recipe';
		const meal =
			MEAL_COLUMNS.find((column) => column.value === cell.mealType)?.label ?? cell.mealType;
		return `Add ${meal} for ${WEEK_DAY_SHORT[cell.day]}`;
	});

	const myRecipes = $derived.by(() => {
		void authStore.user;
		if (!browser) return [] as Recipe[];
		return loadMyRecipes();
	});

	const favoriteRecipes = $derived(
		favoritesStore.items
			.map((item) => cache[item.recipeId])
			.filter((recipe): recipe is Recipe => Boolean(recipe) && recipe !== 'missing')
	);

	const browseMineOnly = $derived(browseFilters.includes(MINE_VALUE));
	const browseCategories = $derived(browseFilters.filter((value) => value !== MINE_VALUE));
	const browseFilterOptions = $derived([
		{ label: 'My recipes', value: MINE_VALUE },
		...data.categories.map((name) => ({ label: name, value: name }))
	]);

	const browseVisibleRecipes = $derived.by(() => {
		const mine = filterRecipes(myRecipes, {
			q: browseQuery,
			categories: browseCategories
		});
		if (browseMineOnly) return mine;
		return mergeDiscovery(clientMealdb ?? [], mine);
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
		if (pending.length === 0) {
			resolving = false;
			return;
		}
		const seq = ++requestSeq;
		const stopDelayed = scheduleDelayedLoading((value) => {
			if (seq === requestSeq) resolving = value;
		});
		void resolveRecipes(pending).then((map) => {
			stopDelayed();
			if (seq !== requestSeq) return;
			const next = { ...cache };
			for (const id of pending) {
				next[id] = map.get(id) ?? 'missing';
			}
			cache = next;
		});
	});

	function cellKey(day: WeekDay, mealType: MealType): string {
		return `${day}-${mealType}`;
	}

	function entryFor(day: WeekDay, mealType: MealType): MealPlanEntry | undefined {
		const exact = plannerStore.entries.find(
			(entry) => entry.day === day && entry.mealType === mealType
		);
		if (exact) return exact;
		if (mealType === 'lunch') {
			return plannerStore.entries.find((entry) => entry.day === day && !entry.mealType);
		}
		return undefined;
	}

	function recipeTitle(recipeId: string): string {
		const recipe = cache[recipeId];
		if (recipe && recipe !== 'missing') return recipe.title;
		if (recipe === 'missing') return 'Unavailable recipe';
		return 'Loading…';
	}

	function recipeImage(recipeId: string): string {
		const recipe = cache[recipeId];
		if (recipe && recipe !== 'missing' && recipe.image) return recipe.image;
		return '';
	}

	function recipeTags(recipe: Recipe): string[] {
		const tags = [recipe.category, recipe.area].filter((tag): tag is string => Boolean(tag));
		if (recipe.source === 'user') tags.unshift('My recipe');
		return tags;
	}

	function goPreviousWeek() {
		if (!canGoPreviousWeek) return;
		plannerStore.setWeek(addWeeks(plannerStore.weekStart, -1));
	}

	function goNextWeek() {
		plannerStore.setWeek(addWeeks(plannerStore.weekStart, 1));
	}

	$effect(() => {
		if (plannerStore.weekStart < currentWeekStart) {
			plannerStore.setWeek(currentWeekStart);
		}
	});

	function onEmptyCellClick(day: WeekDay, mealType: MealType) {
		targetCell = { day, mealType };
		pickerTab = favoriteRecipes.length > 0 ? 'favorites' : 'browse';
		pickerOpen = true;
	}

	function closePicker() {
		pickerOpen = false;
		targetCell = null;
	}

	$effect(() => {
		if (!browser || !pickerOpen) return;
		const { body } = document;
		const previousOverflow = body.style.overflow;
		body.style.overflow = 'hidden';
		return () => {
			body.style.overflow = previousOverflow;
		};
	});

	async function refreshBrowseRecipes() {
		browseAbort?.abort();
		if (!browser || browseMineOnly) {
			browseLoading = false;
			return;
		}
		const controller = new AbortController();
		browseAbort = controller;
		const seq = ++browseRequestSeq;
		browseLoading = true;
		browseStopLoading?.();
		browseStopLoading = scheduleDelayedLoading((value) => {
			if (seq === browseRequestSeq) browseShowLoading = value;
		});

		try {
			const recipes = await fetchMealDbRecipes(
				{
					q: browseQuery || undefined,
					category: browseCategories.length ? browseCategories.join(',') : undefined
				},
				controller.signal
			);
			if (seq !== browseRequestSeq) return;
			clientMealdb = recipes;
		} catch (error) {
			if (controller.signal.aborted || seq !== browseRequestSeq) return;
			if (error instanceof DOMException && error.name === 'AbortError') return;
			const message =
				error instanceof Error
					? error.message
					: 'Recipe catalog is temporarily unavailable. Please try again shortly.';
			toastStore.show(message, 'error');
		} finally {
			if (seq === browseRequestSeq) {
				browseLoading = false;
				browseStopLoading?.();
				browseStopLoading = null;
				browseShowLoading = false;
			}
		}
	}

	function onBrowseSearch(event: Event) {
		const value = (event as CustomEvent<{ value: string }>).detail?.value ?? '';
		browseQuery = value;
		void refreshBrowseRecipes();
	}

	function onBrowseFilterChange(event: Event) {
		const values = (event as CustomEvent<{ values: string[] }>).detail?.values ?? [];
		const wasMine = browseFilters.includes(MINE_VALUE);
		browseFilters = values;
		const nowMine = values.includes(MINE_VALUE);

		if (nowMine && !wasMine && !authStore.user) {
			toastStore.show('Sign in to see recipes saved in this browser.', 'info');
		}

		void refreshBrowseRecipes();
	}

	function onCellDragOver(event: DragEvent, day: WeekDay, mealType: MealType) {
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'copy';
		}
		dragOverCell = cellKey(day, mealType);
	}

	function onCellDragLeave(day: WeekDay, mealType: MealType) {
		if (dragOverCell === cellKey(day, mealType)) {
			dragOverCell = null;
		}
	}

	function onCellDrop(event: DragEvent, day: WeekDay, mealType: MealType) {
		event.preventDefault();
		dragOverCell = null;
		const dt = event.dataTransfer;
		if (!dt) return;
		const recipeId = dt.getData(RECIPE_DRAG_MIME) || dt.getData('text/plain');
		if (!recipeId) return;
		assignRecipe(recipeId, day, mealType);
	}

	function openAssign(recipeId: string, day: WeekDay, mealType?: MealType | null) {
		pendingRecipeId = recipeId;
		assignDay = day;
		assignMealType = mealType ?? '';
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
			targetCell = null;
			pickerOpen = false;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Could not update the meal plan.';
			if (message === 'Not authenticated') {
				toastStore.show('Sign in to update your meal plan.', 'info');
				return;
			}
			toastStore.show(message, 'error');
		}
	}

	function removeEntry(entryId: string) {
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

		const known =
			favoriteRecipes.find((recipe) => recipe.id === recipeId) ??
			browseVisibleRecipes.find((recipe) => recipe.id === recipeId);
		if (known && cache[recipeId] === undefined) {
			cache = { ...cache, [recipeId]: known };
		}

		if (targetCell) {
			assignRecipe(recipeId, targetCell.day, targetCell.mealType);
			return;
		}

		pendingRecipeId = pendingRecipeId === recipeId ? '' : recipeId;
	}

	function onFavoriteToggle(event: Event) {
		const recipeId = (event as CustomEvent<{ recipeId?: string }>).detail?.recipeId;
		toggleFavoriteFromEvent(recipeId);
	}

	onMount(() => {
		if (data.browseError) toastStore.show(data.browseError, 'error');
		void refreshBrowseRecipes();

		const root = rootEl;
		const assign = assignModal;
		const shopping = shoppingModal;
		const picker = pickerModal;
		if (!root) return;

		root.addEventListener('recipeSelect', onRecipeSelect);
		root.addEventListener('favoriteToggle', onFavoriteToggle);
		root.addEventListener('searchChange', onBrowseSearch);
		root.addEventListener('searchSubmit', onBrowseSearch);
		root.addEventListener('filterChange', onBrowseFilterChange);
		assign?.addEventListener('close', closeAssign);
		assign?.addEventListener('confirm', confirmAssign);
		shopping?.addEventListener('close', closeShopping);
		shopping?.addEventListener('confirm', closeShopping);
		picker?.addEventListener('close', closePicker);

		return () => {
			root.removeEventListener('recipeSelect', onRecipeSelect);
			root.removeEventListener('favoriteToggle', onFavoriteToggle);
			root.removeEventListener('searchChange', onBrowseSearch);
			root.removeEventListener('searchSubmit', onBrowseSearch);
			root.removeEventListener('filterChange', onBrowseFilterChange);
			assign?.removeEventListener('close', closeAssign);
			assign?.removeEventListener('confirm', confirmAssign);
			shopping?.removeEventListener('close', closeShopping);
			shopping?.removeEventListener('confirm', closeShopping);
			picker?.removeEventListener('close', closePicker);
			browseAbort?.abort();
		};
	});
</script>

<svelte:head>
	<title>Meal Planning · Recipe Finder</title>
</svelte:head>

<section class="planner" bind:this={rootEl}>
	<div class="planner-card">
		<header class="planner-header">
			<h1>Meal Planning</h1>
			<div class="header-actions">
				<button type="button" class="ghost-btn" onclick={() => (shoppingOpen = true)}>
					Shopping list
				</button>
			</div>
		</header>

		<div class="week-controls">
			<button
				type="button"
				class="week-btn"
				onclick={goPreviousWeek}
				disabled={!canGoPreviousWeek}
				aria-label="Previous week"
			>
				‹
			</button>
			<span class="week-label">{weekLabel}</span>
			<button type="button" class="week-btn" onclick={goNextWeek} aria-label="Next week">›</button>
		</div>

		{#if resolving}
			<LoadingIndicator label="Loading week…" />
		{/if}

		<div class="meal-grid" aria-label="Weekly meal plan">
			<div class="grid-corner" aria-hidden="true"></div>
			{#each MEAL_COLUMNS as column (column.value)}
				<div class="meal-col-header">{column.label}</div>
			{/each}

			{#each days as day (`${authStore.user?.id ?? 'anon'}-${plannerStore.weekStart}-${day.day}`)}
				<div class="day-label">{WEEK_DAY_SHORT[day.day]}</div>
				{#each MEAL_COLUMNS as column (column.value)}
					{@const entry = entryFor(day.day, column.value)}
					{@const key = cellKey(day.day, column.value)}
					<div
						class="meal-cell"
						class:meal-cell--over={dragOverCell === key}
						class:meal-cell--target={targetCell?.day === day.day &&
							targetCell?.mealType === column.value}
						role="group"
						ondragover={(event) => onCellDragOver(event, day.day, column.value)}
						ondragleave={() => onCellDragLeave(day.day, column.value)}
						ondrop={(event) => onCellDrop(event, day.day, column.value)}
					>
						{#if entry}
							<article
								class="meal-card filled"
								style={recipeImage(entry.recipeId)
									? `background-image: url("${recipeImage(entry.recipeId)}")`
									: undefined}
							>
								<div class="meal-card__shade"></div>
								<p class="meal-card__title">{recipeTitle(entry.recipeId)}</p>
								<button
									type="button"
									class="meal-card__remove"
									aria-label={`Remove ${recipeTitle(entry.recipeId)}`}
									onclick={() => removeEntry(entry.id)}
								>
									✕
								</button>
							</article>
						{:else}
							<button
								type="button"
								class="meal-card empty"
								aria-label={`Add ${column.label} for ${WEEK_DAY_SHORT[day.day]}`}
								onclick={() => onEmptyCellClick(day.day, column.value)}
							>
								<span aria-hidden="true">+</span>
							</button>
						{/if}
					</div>
				{/each}
			{/each}
		</div>
	</div>

	<rf-modal
		class="picker-modal"
		bind:this={pickerModal}
		heading={pickerHeading}
		cancel-label="Close"
		hide-confirm={true}
		use:ceBind={{ open: pickerOpen, hideConfirm: true, heading: pickerHeading }}
	>
		<nav class="picker-tabs" aria-label="Choose recipes">
			{#each PICKER_TABS as tab (tab.id)}
				<button
					type="button"
					class:active={pickerTab === tab.id}
					onclick={() => (pickerTab = tab.id)}
				>
					<span class="tab-icon" aria-hidden="true">{tab.icon}</span>
					{tab.label}
				</button>
			{/each}
		</nav>

		{#if pickerTab === 'favorites'}
			<section class="recipe-panel">
				{#if favoriteRecipes.length === 0}
					<empty-state
						icon="inbox"
						message="No favourite recipes yet. Browse recipes and tap the heart to save them."
					>
						<button type="button" class="link-btn" onclick={() => (pickerTab = 'browse')}>
							Browse recipes
						</button>
					</empty-state>
				{:else}
					<recipe-grid columns={3}>
						{#each favoriteRecipes as recipe (recipe.id)}
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
		{:else}
			<section class="recipe-panel">
				<search-bar
					label="Search recipes"
					placeholder="Search recipes…"
					value={browseQuery}
				></search-bar>

				<filter-chip-group
					label="Filters"
					use:ceBind={{ options: browseFilterOptions, selected: browseFilters }}
				></filter-chip-group>

				<p class="browse-status" aria-live="polite">
					{#if browseShowLoading}
						<LoadingIndicator label="Loading recipes…" />
					{:else if browseVisibleRecipes.length > 0}
						{browseVisibleRecipes.length} recipe{browseVisibleRecipes.length === 1 ? '' : 's'}
					{/if}
				</p>

				{#if browseVisibleRecipes.length === 0 && !browseLoading}
					<empty-state
						icon={data.browseError ? 'inbox' : 'search'}
						message={data.browseError
							? data.browseError
							: browseMineOnly
								? authStore.user
									? 'No matching recipes in this browser yet.'
									: 'Sign in to see recipes you have saved in this browser.'
								: 'No recipes match that search. Try another term or clear filters.'}
					>
						{#if browseMineOnly && authStore.user && !data.browseError}
							<a href="/recipe/new">Create a recipe</a>
						{/if}
					</empty-state>
				{:else}
					<recipe-grid columns={3} aria-busy={browseLoading ? 'true' : 'false'}>
						{#each browseVisibleRecipes as recipe (recipe.id)}
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
		{/if}
	</rf-modal>

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
				{#each MEAL_COLUMNS as option (option.value)}
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
	.planner {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.planner-card {
		background: var(--rf-color-surface, #fff);
		border-radius: var(--rf-radius-2xl, 1.75rem);
		padding: clamp(1.25rem, 2vw, 2rem);
		box-shadow: var(--rf-shadow-md, 0 4px 12px rgb(28 25 23 / 8%));
	}

	.planner-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	.planner-header h1 {
		margin: 0;
		font-family: var(--rf-font-display);
		font-size: clamp(1.75rem, 3vw, 2.25rem);
		font-weight: 700;
		color: var(--rf-color-text, #1a1a1a);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.ghost-btn {
		font: inherit;
		font-family: var(--rf-font-sans);
		font-size: 0.9rem;
		cursor: pointer;
		border: 1px solid color-mix(in srgb, var(--rf-color-text) 15%, transparent);
		padding: 0.45rem 0.85rem;
		border-radius: 999px;
		background: transparent;
		color: var(--rf-color-text-muted, #78716c);
	}

	.week-controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
		flex-wrap: wrap;
	}

	.week-label {
		font-family: var(--rf-font-sans);
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--rf-color-text, #1a1a1a);
		min-width: 9rem;
		text-align: center;
	}

	.week-btn {
		font: inherit;
		font-family: var(--rf-font-sans);
		cursor: pointer;
		border: 1px solid color-mix(in srgb, var(--rf-color-text) 12%, transparent);
		background: var(--rf-color-surface, #fff);
		color: var(--rf-color-text, #1a1a1a);
		width: 2rem;
		height: 2rem;
		border-radius: 999px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.week-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	:global(.picker-modal::part(dialog)) {
		width: min(56rem, calc(100vw - 2rem));
		max-width: 100%;
		max-height: min(90dvh, 52rem);
		min-width: 0;
		min-height: 0;
		overflow: hidden;
		box-sizing: border-box;
	}

	:global(.picker-modal::part(body)) {
		flex: 1 1 auto;
		min-width: 0;
		min-height: 0;
		overflow: auto;
		-webkit-overflow-scrolling: touch;
		overscroll-behavior: contain;
	}

	.recipe-panel {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		min-width: 0;
		max-width: 100%;
	}

	:global(.picker-modal search-bar),
	:global(.picker-modal filter-chip-group),
	:global(.picker-modal recipe-grid) {
		min-width: 0;
		max-width: 100%;
	}

	.picker-tabs {
		display: flex;
		gap: clamp(1rem, 3vw, 2rem);
		border-bottom: 1px solid var(--rf-color-border, #e7e5e4);
		margin-bottom: 0.35rem;
		overflow-x: auto;
	}

	.picker-tabs button {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font: inherit;
		font-family: var(--rf-font-sans);
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		border: none;
		background: none;
		padding: 0.5rem 0 0.7rem;
		color: var(--rf-color-text-muted, #78716c);
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.picker-tabs button.active {
		color: var(--rf-color-primary, #1f5c3a);
		border-bottom-color: var(--rf-color-primary, #1f5c3a);
	}

	.tab-icon {
		font-size: 1rem;
		line-height: 1;
	}

	.meal-grid {
		display: grid;
		grid-template-columns: minmax(2.5rem, auto) repeat(3, minmax(0, 1fr));
		gap: 0.85rem 1rem;
		align-items: stretch;
	}

	.grid-corner {
		min-height: 1px;
	}

	.meal-col-header {
		text-align: center;
		font-family: var(--rf-font-display);
		font-style: italic;
		font-size: clamp(1.1rem, 2vw, 1.45rem);
		font-weight: 500;
		color: var(--rf-color-meal-header, #9a7b5a);
		padding-bottom: 0.15rem;
	}

	.day-label {
		display: flex;
		align-items: center;
		font-family: var(--rf-font-sans);
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--rf-color-text, #1a1a1a);
		padding-right: 0.35rem;
	}

	.meal-cell {
		min-width: 0;
	}

	.meal-cell--over .meal-card,
	.meal-cell--target .meal-card {
		outline: 2px solid var(--rf-color-primary, #1f5c3a);
		outline-offset: 2px;
	}

	.meal-card {
		width: 100%;
		aspect-ratio: 4 / 3;
		border: none;
		border-radius: var(--rf-radius-xl, 1.25rem);
		overflow: hidden;
		position: relative;
	}

	.meal-card.empty {
		cursor: pointer;
		background: var(--rf-color-cell-empty, #f0ece4);
		display: flex;
		align-items: center;
		justify-content: center;
		color: color-mix(in srgb, var(--rf-color-text) 28%, transparent);
		font-size: 1.75rem;
		font-weight: 300;
		transition: background-color 120ms ease;
	}

	.meal-card.empty:hover {
		background: color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 8%, var(--rf-color-cell-empty, #f0ece4));
		color: var(--rf-color-primary, #1f5c3a);
	}

	.meal-card.filled {
		background-color: var(--rf-color-cell-filled, #d6d0c4);
		background-size: cover;
		background-position: center;
	}

	.meal-card__shade {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.62) 0%, rgba(0, 0, 0, 0.08) 55%, transparent 100%);
	}

	.meal-card__title {
		position: absolute;
		left: 0.75rem;
		right: 0.75rem;
		bottom: 0.65rem;
		margin: 0;
		font-family: var(--rf-font-sans);
		font-size: 0.88rem;
		font-weight: 600;
		line-height: 1.25;
		color: #fff;
		z-index: 1;
		overflow-wrap: anywhere;
	}

	.meal-card__remove {
		position: absolute;
		top: 0.45rem;
		right: 0.45rem;
		z-index: 2;
		width: 1.65rem;
		height: 1.65rem;
		border: none;
		border-radius: 999px;
		background: color-mix(in srgb, var(--rf-color-surface) 88%, transparent);
		color: var(--rf-color-text-muted, #78716c);
		font-size: 0.75rem;
		cursor: pointer;
		opacity: 0;
		transition: opacity 120ms ease;
	}

	.meal-card.filled:hover .meal-card__remove,
	.meal-card__remove:focus-visible {
		opacity: 1;
	}

	.browse-status {
		margin: 0;
		min-height: 1.25rem;
		font-family: var(--rf-font-sans);
		font-size: 0.9rem;
		color: var(--rf-color-text-muted, #78716c);
	}

	.link-btn {
		font: inherit;
		font-family: var(--rf-font-sans);
		cursor: pointer;
		border: none;
		background: none;
		padding: 0;
		color: var(--rf-color-primary, #1f5c3a);
		text-decoration: underline;
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

	@media (max-width: 52rem) {
		.meal-grid {
			grid-template-columns: minmax(2rem, auto) repeat(3, minmax(5.5rem, 1fr));
			gap: 0.55rem 0.45rem;
		}

		.meal-col-header {
			font-size: 0.95rem;
		}

		.day-label {
			font-size: 0.82rem;
		}

		.meal-card__title {
			font-size: 0.72rem;
		}
	}

	@media (max-width: 40rem) {
		:global(.picker-modal::part(backdrop)) {
			padding: 0;
			place-items: stretch;
		}

		:global(.picker-modal::part(dialog)) {
			width: 100%;
			max-width: 100%;
			height: 100dvh;
			max-height: 100dvh;
			border-radius: 0;
			gap: 0.75rem;
			padding: max(0.85rem, env(safe-area-inset-top, 0px)) 0.9rem
				max(0.85rem, env(safe-area-inset-bottom, 0px));
		}

		:global(.picker-modal::part(heading)) {
			font-size: 1.15rem;
		}

		:global(.picker-modal::part(footer)) {
			justify-content: stretch;
		}

		:global(.picker-modal::part(cancel)) {
			width: 100%;
			min-height: 2.75rem;
		}

		.picker-tabs {
			gap: 0;
		}

		.picker-tabs button {
			flex: 1;
			justify-content: center;
			min-height: 2.75rem;
			padding: 0.55rem 0.35rem;
			font-size: 0.85rem;
		}

		.recipe-panel {
			gap: 0.7rem;
		}

		:global(.picker-modal search-bar::part(root)) {
			flex-wrap: wrap;
		}

		:global(.picker-modal search-bar::part(input)),
		:global(.picker-modal search-bar::part(submit)) {
			min-height: 2.75rem;
		}

		:global(.picker-modal search-bar::part(submit)) {
			flex: 1;
		}

		:global(.picker-modal filter-chip-group::part(root)) {
			flex-wrap: nowrap;
			overflow-x: auto;
			padding-bottom: 0.2rem;
			-webkit-overflow-scrolling: touch;
			scrollbar-width: thin;
		}

		:global(.picker-modal filter-chip-group::part(chip)) {
			flex-shrink: 0;
			min-height: 2.25rem;
			padding: 0.4rem 0.75rem;
		}

		:global(.picker-modal recipe-card::part(media)) {
			aspect-ratio: 16 / 9;
		}

		:global(.picker-modal recipe-card::part(heading)) {
			font-size: 1rem;
		}

		:global(.picker-modal recipe-card::part(favorite)) {
			width: 2.5rem;
			height: 2.5rem;
		}
	}

	@media (max-width: 24rem) {
		:global(.picker-modal search-bar::part(root)) {
			flex-direction: column;
		}

		:global(.picker-modal search-bar::part(submit)) {
			width: 100%;
		}
	}
</style>
