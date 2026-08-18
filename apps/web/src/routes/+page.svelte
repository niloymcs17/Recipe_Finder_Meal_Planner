<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';

	$effect(() => {
		authStore.hydrate();
	});
</script>

<section>
	<h1>Recipe Finder & Meal Planner</h1>
	<p>
		Discover recipes, save favorites, and plan your week. Your account and saved data stay in
		this browser (localStorage) — nothing is sent to a cloud database.
	</p>

	{#if authStore.ready && authStore.user}
		<p class="status">
			Signed in as <strong>{authStore.user.email}</strong>
			<span class="muted">(id: {authStore.user.id})</span>
		</p>
	{:else if authStore.ready}
		<p class="status">
			You are signed out. <a href="/signup">Create an account</a> or
			<a href="/login">log in</a>.
		</p>
	{/if}
</section>

<style>
	h1 {
		margin-top: 0;
		font-size: 2rem;
		color: #1f5c3a;
	}

	.status {
		margin-top: 1.5rem;
		padding: 1rem;
		background: rgba(31, 92, 58, 0.08);
		border-left: 3px solid #1f5c3a;
	}

	.muted {
		display: block;
		margin-top: 0.35rem;
		font-size: 0.85rem;
		opacity: 0.7;
		font-family: ui-monospace, monospace;
		word-break: break-all;
	}

	a {
		color: #1f5c3a;
	}
</style>
