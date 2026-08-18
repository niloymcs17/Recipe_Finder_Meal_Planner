<script lang="ts">
	import { goto } from '$app/navigation';
	import favicon from '$lib/assets/favicon.svg';
	import { authStore } from '$lib/stores/auth.svelte';

	let { children } = $props();

	$effect(() => {
		authStore.hydrate();
	});

	function handleLogout() {
		authStore.logout();
		goto('/');
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Recipe Finder & Meal Planner</title>
</svelte:head>

<header class="site-header">
	<a class="brand" href="/">Recipe Finder</a>
	<nav>
		{#if authStore.ready && authStore.user}
			<span class="user-email">{authStore.user.email}</span>
			<button type="button" onclick={handleLogout}>Log out</button>
		{:else if authStore.ready}
			<a href="/login">Log in</a>
			<a href="/signup">Sign up</a>
		{/if}
	</nav>
</header>

<main>
	{@render children()}
</main>

<style>
	:global(body) {
		margin: 0;
		font-family: Georgia, 'Times New Roman', serif;
		color: #1a1a1a;
		background:
			radial-gradient(ellipse at top left, rgba(46, 125, 80, 0.08), transparent 45%),
			radial-gradient(ellipse at bottom right, rgba(180, 120, 40, 0.06), transparent 40%),
			#f7f5f0;
		min-height: 100vh;
	}

	.site-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid rgba(26, 26, 26, 0.08);
	}

	.brand {
		font-size: 1.25rem;
		font-weight: 700;
		color: #1f5c3a;
		text-decoration: none;
	}

	nav {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	nav a {
		color: #1a1a1a;
		text-decoration: none;
	}

	nav a:hover {
		text-decoration: underline;
	}

	.user-email {
		font-size: 0.9rem;
		opacity: 0.8;
	}

	nav button {
		font: inherit;
		cursor: pointer;
		background: #1f5c3a;
		color: #fff;
		border: none;
		padding: 0.4rem 0.85rem;
	}

	main {
		padding: 1.5rem;
		max-width: 40rem;
		margin: 0 auto;
	}
</style>
