<script lang="ts">
	import { goto } from '$app/navigation';
	import { create } from '$lib/local-db/recipes';
	import RecipeForm from '$lib/recipes/RecipeForm.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { toUserId } from '$lib/utils/ids';
	import type { RecipeWritePayload } from '$lib/validation/recipe';

	async function handleSave(payload: RecipeWritePayload) {
		const recipe = create(payload);
		toastStore.show('Recipe saved in this browser.', 'success');
		await goto(`/recipe/${encodeURIComponent(toUserId(recipe.id))}`);
	}
</script>

<section class="create">
	<h1>New recipe</h1>
	<p>Create a recipe stored only in this browser. Sign-in is required so we can mark you as owner.</p>
	<RecipeForm submitLabel="Create recipe" onSave={handleSave} />
</section>

<style>
	.create {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-width: 40rem;
	}

	h1 {
		margin: 0;
		color: var(--rf-color-primary, #1f5c3a);
	}

	p {
		margin: 0 0 0.5rem;
		opacity: 0.85;
	}
</style>
