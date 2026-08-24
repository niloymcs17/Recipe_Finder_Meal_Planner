<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { toggleFavoriteFromEvent } from '$lib/favorites/actions';
	import { remove } from '$lib/local-db/recipes';
	import type { MealType, WeekDay } from '$lib/local-db/types';
	import { authStore } from '$lib/stores/auth.svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import { plannerStore } from '$lib/stores/planner.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { formatWeekRange, weekDayMeta } from '$lib/utils/dates';
	import { parseRecipeId } from '$lib/utils/ids';
	import { ceBind } from '$lib/ui/ce-bind';
	import LoadingIndicator from '$lib/ui/LoadingIndicator.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const MEAL_TYPES: { value: MealType | ''; label: string }[] = [
		{ value: '', label: 'Any meal' },
		{ value: 'breakfast', label: 'Breakfast' },
		{ value: 'lunch', label: 'Lunch' },
		{ value: 'dinner', label: 'Dinner' }
	];

	let deleteOpen = $state(false);
	let planOpen = $state(false);
	let modalEl = $state<HTMLElement | null>(null);
	let planModalEl = $state<HTMLElement | null>(null);
	let planDay = $state<WeekDay>('monday');
	let planMealType = $state<MealType | ''>('');

	const isOwner = $derived(
		data.recipe?.source === 'user' &&
			Boolean(authStore.user) &&
			data.recipe.ownerId === authStore.user?.id
	);

	const isFavorited = $derived(Boolean(data.recipe && favoritesStore.isFavorited(data.recipe.id)));
	const onThisWeek = $derived(Boolean(data.recipe && plannerStore.hasRecipe(data.recipe.id)));
	const weekDays = $derived(weekDayMeta(plannerStore.weekStart));
	const weekLabel = $derived(formatWeekRange(plannerStore.weekStart));

	const rawId = $derived(parseRecipeId(data.recipe?.id ?? '')?.rawId ?? data.rawId);

	function metaBits(): string[] {
		if (!data.recipe) return [];
		const bits: string[] = [];
		if (data.recipe.category) bits.push(data.recipe.category);
		if (data.recipe.area) bits.push(data.recipe.area);
		if (data.recipe.cookTimeMinutes) bits.push(`${data.recipe.cookTimeMinutes} min`);
		if (data.recipe.servings) bits.push(`${data.recipe.servings} serving${data.recipe.servings === 1 ? '' : 's'}`);
		return bits;
	}

	function onFavorite() {
		if (!data.recipe) return;
		if (!authStore.user) {
			toastStore.show('Sign in to save favorites.', 'info');
			void goto(`/login?next=${encodeURIComponent(`/recipe/${data.recipe.id}`)}`);
			return;
		}
		toggleFavoriteFromEvent(data.recipe.id);
	}

	function openPlan() {
		if (!data.recipe) return;
		if (!authStore.user) {
			toastStore.show('Sign in to add recipes to your plan.', 'info');
			void goto(`/login?next=${encodeURIComponent(`/recipe/${data.recipe.id}`)}`);
			return;
		}
		planDay = weekDays[0]?.day ?? 'monday';
		planMealType = '';
		planOpen = true;
	}

	function closePlan() {
		planOpen = false;
	}

	function confirmPlan() {
		planOpen = false;
		if (!data.recipe) return;
		try {
			plannerStore.assign({
				recipeId: data.recipe.id,
				day: planDay,
				source: data.recipe.source,
				mealType: planMealType || null
			});
			toastStore.show('Added to this week’s plan.', 'success');
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Could not update the meal plan.';
			if (message === 'Not authenticated') {
				toastStore.show('Sign in to add recipes to your plan.', 'info');
				return;
			}
			toastStore.show(message, 'error');
		}
	}

	function closeDelete() {
		deleteOpen = false;
	}

	function confirmDelete() {
		deleteOpen = false;
		if (!isOwner) {
			toastStore.show('You cannot delete this recipe.', 'error');
			return;
		}
		try {
			remove(rawId);
			toastStore.show('Recipe deleted.', 'success');
			void goto('/');
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Could not delete recipe.';
			if (message === 'Forbidden' || message === 'Not authenticated') {
				toastStore.show('You cannot delete this recipe.', 'error');
				return;
			}
			toastStore.show(message, 'error');
		}
	}

	onMount(() => {
		const node = modalEl;
		const plan = planModalEl;
		node?.addEventListener('close', closeDelete);
		node?.addEventListener('confirm', confirmDelete);
		plan?.addEventListener('close', closePlan);
		plan?.addEventListener('confirm', confirmPlan);
		return () => {
			node?.removeEventListener('close', closeDelete);
			node?.removeEventListener('confirm', confirmDelete);
			plan?.removeEventListener('close', closePlan);
			plan?.removeEventListener('confirm', confirmPlan);
		};
	});
</script>

<svelte:head>
	<title>{data.recipe?.title ?? 'Recipe'} · Recipe Finder</title>
</svelte:head>

<section class="details">
	{#if data.userPending}
		<LoadingIndicator label="Loading recipe…" />
	{:else if data.mealdbError}
		<empty-state icon="inbox" message={data.mealdbError}>
			<a href="/">Back to discovery</a>
		</empty-state>
	{:else if !data.recipe}
		<empty-state
			icon="search"
			message={data.source === 'user'
				? 'This recipe is not in this browser. User recipes stay on the device that created them.'
				: 'This recipe was not found.'}
		>
			<a href="/">Back to discovery</a>
		</empty-state>
	{:else}
		<article>
			{#if data.recipe.image}
				<img class="hero" src={data.recipe.image} alt="" />
			{/if}

			<p class="source">
				{data.recipe.source === 'user' ? 'Your recipe' : 'TheMealDB'}
			</p>
			<h1>{data.recipe.title}</h1>

			{#if data.recipe.rating}
				<rating-stars
					use:ceBind={{ value: data.recipe.rating, readonly: true }}
				></rating-stars>
			{/if}

			{#if metaBits().length}
				<p class="meta">{metaBits().join(' · ')}</p>
			{/if}

			<div class="toolbar">
				{#if isOwner}
					<a class="btn" href={`/recipe/${encodeURIComponent(data.recipe.id)}/edit`}>Edit</a>
					<button type="button" class="btn btn--danger" onclick={() => (deleteOpen = true)}>
						Delete
					</button>
				{/if}
				<button type="button" class="btn btn--ghost" onclick={onFavorite}>
					{isFavorited ? 'Unfavorite' : 'Favorite'}
				</button>
				<button type="button" class="btn btn--ghost" onclick={openPlan}>Add to plan</button>
			</div>

			{#if isFavorited || onThisWeek}
				<p class="status-line">
					{#if isFavorited}Saved to favorites.{/if}
					{#if onThisWeek} On this week’s plan ({weekLabel}).{/if}
				</p>
			{/if}

			{#if data.recipe.ingredients.length}
				<h2>Ingredients</h2>
				<ul>
					{#each data.recipe.ingredients as item, i (i)}
						<li>
							{#if item.quantity}
								<span class="qty">{item.quantity}</span>
							{/if}
							{item.name}
						</li>
					{/each}
				</ul>
			{/if}

			{#if data.recipe.steps.length}
				<h2>Steps</h2>
				<ol>
					{#each data.recipe.steps as step, i (i)}
						<li>{step}</li>
					{/each}
				</ol>
			{/if}

			{#if data.recipe.source === 'user'}
				<p class="hint">
					Saved in this browser only. Refresh keeps it; clearing site data or another browser will
					not.
				</p>
			{/if}

			<p class="back"><a href="/">Back to discovery</a></p>
		</article>
	{/if}

	<rf-modal
		bind:this={modalEl}
		heading="Delete this recipe?"
		confirm-label="Delete"
		cancel-label="Cancel"
		use:ceBind={{ open: deleteOpen, confirmLabel: 'Delete', cancelLabel: 'Cancel' }}
	>
		This cannot be undone. The recipe is removed from this browser’s local storage.
	</rf-modal>

	<rf-modal
		bind:this={planModalEl}
		heading="Add to this week’s plan"
		confirm-label="Add"
		cancel-label="Cancel"
		use:ceBind={{ open: planOpen }}
	>
		<p class="status-line">Week of {weekLabel}</p>
		<label class="field">
			Day
			<select bind:value={planDay}>
				{#each weekDays as day (day.day)}
					<option value={day.day}>{day.label}</option>
				{/each}
			</select>
		</label>
		<label class="field">
			Meal type
			<select bind:value={planMealType}>
				{#each MEAL_TYPES as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</label>
	</rf-modal>
</section>

<style>
	.details {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 40rem;
	}

	.status-line {
		margin: 0.65rem 0 0;
		font-size: 0.9rem;
		opacity: 0.8;
	}

	.hero {
		width: 100%;
		max-height: 22rem;
		object-fit: cover;
		border-radius: 0.5rem;
		background: #e8e4dc;
	}

	.source {
		margin: 0;
		font-size: 0.85rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		opacity: 0.7;
	}

	h1 {
		margin: 0.15rem 0 0;
		color: var(--rf-color-primary, #1f5c3a);
	}

	h2 {
		margin: 1.25rem 0 0.5rem;
		font-size: 1.15rem;
	}

	.meta {
		margin: 0.35rem 0 0;
		opacity: 0.8;
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-top: 1rem;
	}

	.btn,
	.toolbar a {
		font: inherit;
		text-decoration: none;
		cursor: pointer;
		border: none;
		padding: 0.45rem 0.9rem;
		background: var(--rf-color-primary, #1f5c3a);
		color: #fff;
	}

	.btn--danger {
		background: #8b1e1e;
	}

	.btn--ghost,
	.btn:disabled {
		background: transparent;
		color: #1a1a1a;
		border: 1px solid rgba(26, 26, 26, 0.2);
	}

	.btn:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		margin: 0.75rem 0 0;
		font-size: 0.95rem;
	}

	select {
		font: inherit;
		padding: 0.45rem 0.55rem;
	}

	ul,
	ol {
		margin: 0;
		padding-left: 1.2rem;
	}

	li + li {
		margin-top: 0.4rem;
	}

	.qty {
		font-weight: 700;
		margin-right: 0.35rem;
	}

	.hint {
		margin: 1.5rem 0 0;
		font-size: 0.9rem;
		opacity: 0.8;
	}

	.back {
		margin: 1.25rem 0 0;
	}

	article a,
	:global(empty-state a) {
		color: var(--rf-color-primary, #1f5c3a);
	}
</style>
