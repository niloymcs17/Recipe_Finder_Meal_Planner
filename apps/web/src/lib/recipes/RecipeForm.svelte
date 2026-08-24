<script lang="ts">
	import { onMount } from 'svelte';
	import { ceBind } from '$lib/ui/ce-bind';
	import {
		emptyRecipeForm,
		formFromLocalRecipe,
		parseRecipeForm,
		type FieldErrors,
		type RecipeFormFields,
		type RecipeWritePayload
	} from '$lib/validation/recipe';
	import type { Recipe as LocalRecipe } from '$lib/local-db/types';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { toUserId } from '$lib/utils/ids';

	type Props = {
		initial?: LocalRecipe | null;
		submitLabel: string;
		onSave: (payload: RecipeWritePayload) => Promise<void>;
	};

	let { initial = null, submitLabel, onSave }: Props = $props();

	let form = $state<RecipeFormFields>(emptyRecipeForm());
	let errors = $state<FieldErrors>({});
	let submitting = $state(false);
	let formEl = $state<HTMLFormElement | null>(null);

	$effect.pre(() => {
		if (initial) form = formFromLocalRecipe(initial);
	});

	function clearError(key: string) {
		if (!(key in errors)) return;
		const next = { ...errors };
		delete next[key];
		errors = next;
	}

	function onValueChange(event: Event) {
		const name = (event.target as HTMLElement | null)?.getAttribute?.('name');
		const value = (event as CustomEvent<{ value: string }>).detail?.value ?? '';
		if (!name) return;

		const ingName = /^ing-name-(\d+)$/.exec(name);
		if (ingName) {
			const index = Number(ingName[1]);
			form.ingredients[index].name = value;
			clearError(`ingredients.${index}.name`);
			clearError('ingredients');
			return;
		}

		const ingQty = /^ing-qty-(\d+)$/.exec(name);
		if (ingQty) {
			const index = Number(ingQty[1]);
			form.ingredients[index].quantity = value;
			clearError(`ingredients.${index}.quantity`);
			clearError('ingredients');
			return;
		}

		const stepMatch = /^step-(\d+)$/.exec(name);
		if (stepMatch) {
			const index = Number(stepMatch[1]);
			form.steps[index] = value;
			clearError(`steps.${index}`);
			clearError('steps');
			return;
		}

		switch (name) {
			case 'title':
				form.title = value;
				break;
			case 'imageUrl':
				form.imageUrl = value;
				break;
			case 'category':
				form.category = value;
				break;
			case 'area':
				form.area = value;
				break;
			case 'cookTimeMinutes':
				form.cookTimeMinutes = value;
				break;
			case 'servings':
				form.servings = value;
				break;
			default:
				return;
		}
		clearError(name);
	}

	function addIngredient() {
		form.ingredients.push({ name: '', quantity: '' });
		clearError('ingredients');
	}

	function removeIngredient(index: number) {
		if (form.ingredients.length <= 1) return;
		form.ingredients.splice(index, 1);
		errors = Object.fromEntries(
			Object.entries(errors).filter(([key]) => !key.startsWith('ingredients'))
		);
	}

	function addStep() {
		form.steps.push('');
		clearError('steps');
	}

	function removeStep(index: number) {
		if (form.steps.length <= 1) return;
		form.steps.splice(index, 1);
		errors = Object.fromEntries(
			Object.entries(errors).filter(([key]) => !key.startsWith('steps'))
		);
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		errors = {};
		submitting = true;
		const parsed = parseRecipeForm(form);
		if (!parsed.ok) {
			errors = parsed.errors;
			toastStore.show('Please fix the highlighted fields.', 'error');
			submitting = false;
			return;
		}

		try {
			await onSave(parsed.data);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Could not save recipe.';
			if (message === 'Forbidden') {
				toastStore.show('You cannot change this recipe.', 'error');
			} else if (message === 'Not authenticated') {
				toastStore.show('Sign in to save recipes in this browser.', 'error');
			} else {
				toastStore.show(message, 'error');
			}
		} finally {
			submitting = false;
		}
	}

	onMount(() => {
		const node = formEl;
		if (!node) return;
		node.addEventListener('valueChange', onValueChange);
		return () => node.removeEventListener('valueChange', onValueChange);
	});
</script>

<form bind:this={formEl} class="recipe-form" novalidate onsubmit={handleSubmit}>
	<form-input
		label="Title"
		name="title"
		required={true}
		placeholder="e.g. Lemon herb pasta"
		use:ceBind={{ value: form.title, error: errors.title ?? '', disabled: submitting }}
	></form-input>

	<form-input
		label="Image URL"
		name="imageUrl"
		type="url"
		placeholder="https://"
		use:ceBind={{ value: form.imageUrl, error: errors.imageUrl ?? '', disabled: submitting }}
	></form-input>

	<div class="row">
		<form-input
			label="Category"
			name="category"
			placeholder="e.g. Pasta"
			use:ceBind={{ value: form.category, error: errors.category ?? '', disabled: submitting }}
		></form-input>
		<form-input
			label="Cuisine / area"
			name="area"
			placeholder="e.g. Italian"
			use:ceBind={{ value: form.area, error: errors.area ?? '', disabled: submitting }}
		></form-input>
	</div>

	<div class="row">
		<form-input
			label="Cook time (minutes)"
			name="cookTimeMinutes"
			type="number"
			required={true}
			use:ceBind={{
				value: form.cookTimeMinutes,
				error: errors.cookTimeMinutes ?? '',
				disabled: submitting
			}}
		></form-input>
		<form-input
			label="Servings"
			name="servings"
			type="number"
			required={true}
			use:ceBind={{ value: form.servings, error: errors.servings ?? '', disabled: submitting }}
		></form-input>
	</div>

	<fieldset class="list">
		<legend>Ingredients</legend>
		{#if errors.ingredients}
			<p class="list-error" role="alert">{errors.ingredients}</p>
		{/if}
		{#each form.ingredients as ingredient, i (i)}
			<div class="item">
				<form-input
					label="Ingredient name"
					name={`ing-name-${i}`}
					required={true}
					placeholder="e.g. Lemon"
					use:ceBind={{
						value: ingredient.name,
						error: errors[`ingredients.${i}.name`] ?? '',
						disabled: submitting
					}}
				></form-input>
				<form-input
					label="Quantity"
					name={`ing-qty-${i}`}
					required={true}
					placeholder="e.g. 1 tbsp"
					use:ceBind={{
						value: ingredient.quantity,
						error: errors[`ingredients.${i}.quantity`] ?? '',
						disabled: submitting
					}}
				></form-input>
				<button
					type="button"
					class="ghost"
					disabled={submitting || form.ingredients.length <= 1}
					onclick={() => removeIngredient(i)}
				>
					Remove
				</button>
			</div>
		{/each}
		<button type="button" class="ghost" disabled={submitting} onclick={addIngredient}>
			Add ingredient
		</button>
	</fieldset>

	<fieldset class="list">
		<legend>Steps</legend>
		{#if errors.steps}
			<p class="list-error" role="alert">{errors.steps}</p>
		{/if}
		{#each form.steps as step, i (i)}
			<div class="item item--step">
				<form-input
					label={`Step ${i + 1}`}
					name={`step-${i}`}
					required={true}
					placeholder="What to do in this step"
					use:ceBind={{
						value: step,
						error: errors[`steps.${i}`] ?? '',
						disabled: submitting
					}}
				></form-input>
				<button
					type="button"
					class="ghost"
					disabled={submitting || form.steps.length <= 1}
					onclick={() => removeStep(i)}
				>
					Remove
				</button>
			</div>
		{/each}
		<button type="button" class="ghost" disabled={submitting} onclick={addStep}>Add step</button>
	</fieldset>

	<p class="hint">
		Saved in this browser only. Refresh keeps the recipe; clearing site data or using another
		browser removes it.
	</p>

	<div class="actions">
		<button type="submit" disabled={submitting}>
			{submitting ? 'Saving…' : submitLabel}
		</button>
		<a href={initial ? `/recipe/${encodeURIComponent(toUserId(initial.id))}` : '/'}>Cancel</a>
	</div>
</form>

<style>
	.recipe-form {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}

	.row {
		display: grid;
		gap: 1rem;
	}

	@media (min-width: 36rem) {
		.row {
			grid-template-columns: 1fr 1fr;
		}
	}

	.list {
		margin: 0;
		padding: 1rem;
		border: 1px solid rgba(26, 26, 26, 0.12);
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	legend {
		padding: 0 0.35rem;
		font-weight: 700;
		color: var(--rf-color-primary, #1f5c3a);
	}

	.item {
		display: grid;
		gap: 0.75rem;
		align-items: end;
	}

	@media (min-width: 36rem) {
		.item {
			grid-template-columns: 1fr 1fr auto;
		}

		.item--step {
			grid-template-columns: 1fr auto;
		}
	}

	.list-error {
		margin: 0;
		color: #8b1e1e;
		font-size: 0.9rem;
	}

	.hint {
		margin: 0;
		font-size: 0.9rem;
		opacity: 0.8;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	button[type='submit'] {
		font: inherit;
		cursor: pointer;
		background: var(--rf-color-primary, #1f5c3a);
		color: #fff;
		border: none;
		padding: 0.55rem 1.1rem;
	}

	button[type='submit']:disabled {
		opacity: 0.7;
		cursor: wait;
	}

	.ghost,
	.actions a {
		font: inherit;
		color: var(--rf-color-primary, #1f5c3a);
		background: transparent;
		border: 1px solid color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 45%, transparent);
		padding: 0.4rem 0.75rem;
		cursor: pointer;
		text-decoration: none;
	}

	.ghost:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
</style>
