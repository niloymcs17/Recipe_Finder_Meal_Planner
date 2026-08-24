<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { update } from '$lib/local-db/recipes';
	import RecipeForm from '$lib/recipes/RecipeForm.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { toUserId } from '$lib/utils/ids';
	import type { RecipeWritePayload } from '$lib/validation/recipe';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	onMount(() => {
		if (data.status === 'forbidden') {
			toastStore.show('You cannot edit this recipe.', 'error');
		}
	});

	async function handleSave(payload: RecipeWritePayload) {
		if (!data.recipe) return;
		update(data.recipe.id, payload);
		toastStore.show('Recipe updated.', 'success');
		await goto(`/recipe/${encodeURIComponent(toUserId(data.recipe.id))}`);
	}
</script>

<section class="edit">
	{#if data.status === 'forbidden'}
		<empty-state icon="inbox" message="You cannot edit this recipe.">
			<a href="/">Back to discovery</a>
		</empty-state>
	{:else if data.status === 'notfound' || !data.recipe}
		<empty-state
			icon="search"
			message="This recipe is not in this browser. User recipes stay on the device that created them."
		>
			<a href="/">Back to discovery</a>
		</empty-state>
	{:else}
		<h1>Edit recipe</h1>
		<p>Changes stay in this browser. Refresh will still show the updated recipe.</p>
		<RecipeForm initial={data.recipe} submitLabel="Save changes" onSave={handleSave} />
	{/if}
</section>

<style>
	.edit {
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

	a {
		color: var(--rf-color-primary, #1f5c3a);
	}
</style>
