<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import { authStore } from '$lib/stores/auth.svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import { plannerStore } from '$lib/stores/planner.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { ceBind } from '$lib/ui/ce-bind';
	import { registerRecipeUi } from '$lib/ui/register';
	import '../app.css';

	let { children } = $props();

	const toast = $derived(toastStore.current);
	const wideMain = $derived(page.route.id?.startsWith('/planner') ?? false);
	const pathname = $derived(page.url.pathname);

	const navLinks = [
		{ href: '/', label: 'Home', icon: '🏠' },
		{ href: '/favorites', label: 'Favorites', icon: '♥' },
		{ href: '/planner', label: 'Planner', icon: '📅' },
		{ href: '/recipe/new', label: 'New recipe', icon: '+' }
	] as const;

	function isNavActive(href: string): boolean {
		if (href === '/') return pathname === '/';
		return pathname === href || pathname.startsWith(`${href}/`);
	}

	function userInitial(email: string): string {
		const local = email.split('@')[0]?.trim();
		return (local?.[0] ?? email[0] ?? '?').toUpperCase();
	}

	let showUserEmail = $state(false);
	let mobileNavOpen = $state(false);
	let siteHeaderEl = $state<HTMLElement | null>(null);

	function toggleUserEmail(event: MouseEvent) {
		event.stopPropagation();
		showUserEmail = !showUserEmail;
	}

	function toggleMobileNav(event: MouseEvent) {
		event.stopPropagation();
		mobileNavOpen = !mobileNavOpen;
		if (mobileNavOpen) showUserEmail = false;
	}

	function closeMobileNav() {
		mobileNavOpen = false;
	}

	$effect(() => {
		authStore.hydrate();
	});

	$effect(() => {
		if (!authStore.ready) return;
		void authStore.user;
		favoritesStore.hydrate();
		plannerStore.hydrate();
	});

	$effect(() => {
		if (!authStore.user) showUserEmail = false;
	});

	$effect(() => {
		pathname;
		closeMobileNav();
	});

	// Register Stencil CEs once for every route (browser-only; SSR-safe).
	onMount(() => {
		void registerRecipeUi();

		function handleDocumentClick(event: MouseEvent) {
			const target = event.target as Node;

			if (showUserEmail) showUserEmail = false;

			if (mobileNavOpen && siteHeaderEl && !siteHeaderEl.contains(target)) {
				mobileNavOpen = false;
			}
		}

		function handleEscape(event: KeyboardEvent) {
			if (event.key !== 'Escape') return;
			showUserEmail = false;
			mobileNavOpen = false;
		}

		document.addEventListener('click', handleDocumentClick);
		document.addEventListener('keydown', handleEscape);
		return () => {
			document.removeEventListener('click', handleDocumentClick);
			document.removeEventListener('keydown', handleEscape);
		};
	});

	function handleLogout() {
		authStore.logout();
		toastStore.show('Signed out. Your data remains in this browser.', 'info');
		closeMobileNav();
		goto('/');
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Recipe Finder & Meal Planner</title>
</svelte:head>

<header class="site-header" bind:this={siteHeaderEl}>
	<a class="brand" href="/" onclick={closeMobileNav}>
		<span class="brand-mark" aria-hidden="true">
			<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M12 21s8-5.5 8-11a8 8 0 1 0-16 0c0 5.5 8 11 8 11Z"
					stroke="currentColor"
					stroke-width="1.75"
					stroke-linejoin="round"
				/>
				<path d="M12 21V11" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
				<path
					d="M12 11c2-3 5-4.5 7-4.5"
					stroke="currentColor"
					stroke-width="1.75"
					stroke-linecap="round"
				/>
			</svg>
		</span>
		<span class="brand-copy">
			<span class="brand-name">Recipe Finder</span>
			<span class="brand-tagline">Discover & plan meals</span>
		</span>
	</a>

	<button
		type="button"
		class="nav-toggle"
		onclick={toggleMobileNav}
		aria-expanded={mobileNavOpen}
		aria-controls="site-nav"
		aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
	>
		<span class="nav-toggle-icon" aria-hidden="true"></span>
	</button>

	<nav id="site-nav" class:open={mobileNavOpen} aria-label="Main">
		{#if authStore.ready && authStore.user}
			<div class="nav-links">
				{#each navLinks as link (link.href)}
					<a href={link.href} class:active={isNavActive(link.href)} onclick={closeMobileNav}>
						<span class="nav-icon" aria-hidden="true">{link.icon}</span>
						{link.label}
					</a>
				{/each}
			</div>

			<div class="nav-user">
				<button
					type="button"
					class="user-badge"
					class:expanded={showUserEmail}
					onclick={toggleUserEmail}
					aria-expanded={showUserEmail}
					aria-label={showUserEmail ? authStore.user.email : 'Show account email'}
				>
					<span class="user-avatar" aria-hidden="true">{userInitial(authStore.user.email)}</span>
					{#if showUserEmail}
						<span class="user-email">{authStore.user.email}</span>
					{/if}
				</button>
				<button type="button" class="logout-btn" onclick={handleLogout}>Log out</button>
			</div>
		{:else if authStore.ready}
			<div class="nav-links">
				<a href="/" class:active={isNavActive('/')} onclick={closeMobileNav}>
					<span class="nav-icon" aria-hidden="true">🏠</span>
					Home
				</a>
				<a href="/login" class:active={isNavActive('/login')} onclick={closeMobileNav}>Log in</a>
				<a
					href="/signup"
					class="nav-cta"
					class:active={isNavActive('/signup')}
					onclick={closeMobileNav}
				>
					Sign up
				</a>
			</div>
		{/if}
	</nav>
</header>

<p class="storage-notice" role="note">
	Accounts, recipes, favorites, and meal plans are stored in <strong>this browser only</strong> — not
	in a cloud database. Clearing site data or using another browser starts empty.
</p>

<main class:wide={wideMain}>
	{@render children()}
</main>

<toast-notification
	use:ceBind={{
		message: toast.message,
		type: toast.type,
		visible: toast.visible
	}}
></toast-notification>

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
		flex-wrap: wrap;
		gap: 0.75rem 1.25rem;
		padding: 0.85rem clamp(1rem, 3vw, 2rem);
		background: color-mix(in srgb, var(--rf-color-surface, #fff) 92%, transparent);
		border-bottom: 1px solid var(--rf-color-border, #e7e5e4);
		box-shadow: var(--rf-shadow-sm, 0 1px 2px rgb(28 25 23 / 6%));
		backdrop-filter: blur(10px);
		position: sticky;
		top: 0;
		z-index: 20;
	}

	.nav-toggle {
		display: none;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		padding: 0;
		border: 1px solid var(--rf-color-border, #e7e5e4);
		border-radius: 0.75rem;
		background: var(--rf-color-surface, #fff);
		color: var(--rf-color-text, #1a1a1a);
		cursor: pointer;
		flex-shrink: 0;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease;
	}

	.nav-toggle:hover,
	.nav-toggle:focus-visible {
		background: color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 8%, transparent);
		border-color: color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 25%, transparent);
	}

	.nav-toggle:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 45%, transparent);
		outline-offset: 2px;
	}

	.nav-toggle-icon,
	.nav-toggle-icon::before,
	.nav-toggle-icon::after {
		display: block;
		width: 1.1rem;
		height: 2px;
		border-radius: 999px;
		background: currentColor;
		transition:
			transform 0.2s ease,
			opacity 0.2s ease;
	}

	.nav-toggle-icon {
		position: relative;
	}

	.nav-toggle-icon::before,
	.nav-toggle-icon::after {
		content: '';
		position: absolute;
		left: 0;
	}

	.nav-toggle-icon::before {
		top: -0.35rem;
	}

	.nav-toggle-icon::after {
		top: 0.35rem;
	}

	.nav-toggle[aria-expanded='true'] .nav-toggle-icon {
		background: transparent;
	}

	.nav-toggle[aria-expanded='true'] .nav-toggle-icon::before {
		top: 0;
		transform: rotate(45deg);
	}

	.nav-toggle[aria-expanded='true'] .nav-toggle-icon::after {
		top: 0;
		transform: rotate(-45deg);
	}

	.storage-notice {
		margin: 0;
		padding: 0.55rem 1.5rem;
		font-size: 0.85rem;
		background: rgba(31, 92, 58, 0.08);
		border-bottom: 1px solid rgba(31, 92, 58, 0.12);
		color: #1a1a1a;
	}

	.storage-notice strong {
		color: var(--rf-color-primary, #1f5c3a);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		text-decoration: none;
		color: inherit;
		min-width: 0;
	}

	.brand-mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.85rem;
		background: color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 12%, transparent);
		color: var(--rf-color-primary, #1f5c3a);
		flex-shrink: 0;
	}

	.brand-mark svg {
		width: 1.35rem;
		height: 1.35rem;
	}

	.brand-copy {
		display: flex;
		flex-direction: column;
		gap: 0.05rem;
		min-width: 0;
	}

	.brand-name {
		font-family: var(--rf-font-display);
		font-size: 1.15rem;
		font-weight: 700;
		line-height: 1.15;
		color: var(--rf-color-primary, #1f5c3a);
	}

	.brand-tagline {
		font-family: var(--rf-font-sans);
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		color: var(--rf-color-text-muted, #78716c);
	}

	nav {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.nav-links,
	.nav-user {
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}

	.nav-user {
		padding-left: 0.85rem;
		border-left: 1px solid var(--rf-color-border, #e7e5e4);
	}

	nav a {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-family: var(--rf-font-sans);
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--rf-color-text-muted, #78716c);
		text-decoration: none;
		padding: 0.45rem 0.85rem;
		border-radius: 999px;
		border: 1px solid transparent;
		transition:
			background-color 0.15s ease,
			color 0.15s ease,
			border-color 0.15s ease;
		white-space: nowrap;
	}

	nav a:hover {
		color: var(--rf-color-text, #1a1a1a);
		background: color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 8%, transparent);
	}

	nav a.active {
		color: var(--rf-color-primary, #1f5c3a);
		background: color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 12%, transparent);
		border-color: color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 22%, transparent);
	}

	.nav-icon {
		font-size: 0.85rem;
		line-height: 1;
	}

	.nav-cta {
		background: var(--rf-color-primary, #1f5c3a);
		color: var(--rf-color-primary-contrast, #fff) !important;
	}

	.nav-cta:hover {
		background: color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 88%, #000);
		color: var(--rf-color-primary-contrast, #fff) !important;
	}

	.user-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		max-width: 14rem;
		padding: 0;
		border: 1px solid transparent;
		border-radius: 999px;
		background: transparent;
		cursor: pointer;
		font: inherit;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease,
			padding 0.15s ease;
	}

	.user-badge:hover .user-avatar,
	.user-badge:focus-visible .user-avatar {
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 25%, transparent);
	}

	.user-badge:focus-visible {
		outline: none;
	}

	.user-badge.expanded {
		padding: 0.2rem 0.65rem 0.2rem 0.2rem;
		background: var(--rf-color-bg, #f7f5f0);
		border-color: var(--rf-color-border, #e7e5e4);
	}

	.user-avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 999px;
		background: var(--rf-color-primary, #1f5c3a);
		color: var(--rf-color-primary-contrast, #fff);
		font-family: var(--rf-font-sans);
		font-size: 0.75rem;
		font-weight: 700;
		flex-shrink: 0;
	}

	.user-email {
		font-family: var(--rf-font-sans);
		font-size: 0.82rem;
		font-weight: 500;
		color: var(--rf-color-text-muted, #78716c);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.logout-btn {
		font: inherit;
		font-family: var(--rf-font-sans);
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		background: transparent;
		color: var(--rf-color-text-muted, #78716c);
		border: 1px solid var(--rf-color-border, #e7e5e4);
		padding: 0.45rem 0.9rem;
		border-radius: 999px;
		transition:
			background-color 0.15s ease,
			color 0.15s ease,
			border-color 0.15s ease;
	}

	.logout-btn:hover {
		color: var(--rf-color-danger, #b91c1c);
		border-color: color-mix(in srgb, var(--rf-color-danger, #b91c1c) 35%, transparent);
		background: color-mix(in srgb, var(--rf-color-danger, #b91c1c) 8%, transparent);
	}

	@media (max-width: 899px) {
		.brand {
			flex: 1;
			min-width: 0;
		}

		.brand-tagline {
			display: none;
		}

		.nav-toggle {
			display: inline-flex;
		}

		nav {
			display: none;
			flex-basis: 100%;
			flex-direction: column;
			align-items: stretch;
			gap: 0.85rem;
			padding-top: 0.85rem;
			border-top: 1px solid var(--rf-color-border, #e7e5e4);
		}

		nav.open {
			display: flex;
		}

		.nav-links,
		.nav-user {
			flex-direction: column;
			align-items: stretch;
			width: 100%;
			gap: 0.35rem;
		}

		.nav-user {
			padding-left: 0;
			border-left: none;
			padding-top: 0.65rem;
			border-top: 1px solid var(--rf-color-border, #e7e5e4);
		}

		nav a,
		.logout-btn {
			width: 100%;
			justify-content: flex-start;
			border-radius: 0.75rem;
			padding: 0.65rem 0.9rem;
		}

		.nav-cta {
			text-align: center;
			justify-content: center;
		}

		.user-badge {
			align-self: flex-start;
		}

		.user-badge.expanded {
			align-self: stretch;
			max-width: none;
		}
	}

	main {
		padding: 1.5rem;
		max-width: 40rem;
		margin: 0 auto;
	}

	main.wide {
		max-width: min(96rem, calc(100vw - 3rem));
	}

	:global(toast-notification) {
		position: fixed;
		top: 1.25rem;
		right: 1.25rem;
		z-index: 40;
		max-width: min(24rem, calc(100vw - 2rem));
	}
</style>
