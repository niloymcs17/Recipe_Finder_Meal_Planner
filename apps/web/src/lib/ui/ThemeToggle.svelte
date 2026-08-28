<script lang="ts">
	import { onMount } from 'svelte';
	import { themeStore, type ThemePreference } from '$lib/stores/theme.svelte';

	const themeOptions: { value: ThemePreference; label: string; hint: string }[] = [
		{ value: 'light', label: 'Light', hint: 'Always use light mode' },
		{ value: 'dark', label: 'Dark', hint: 'Always use dark mode' },
		{ value: 'system', label: 'Auto', hint: 'Match your device setting' }
	];

	let menuOpen = $state(false);
	let controlEl = $state<HTMLDivElement | null>(null);

	const activeOption = $derived(
		themeOptions.find((option) => option.value === themeStore.preference) ?? themeOptions[2]
	);

	const isDark = $derived(themeStore.resolved === 'dark');
	const followsSystem = $derived(themeStore.preference === 'system');

	function toggleMenu(event: MouseEvent) {
		event.stopPropagation();
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}

	function selectTheme(value: ThemePreference) {
		themeStore.setPreference(value);
		closeMenu();
	}

	onMount(() => {
		function handleDocumentClick(event: MouseEvent) {
			const target = event.target as Node;
			if (menuOpen && controlEl && !controlEl.contains(target)) {
				closeMenu();
			}
		}

		function handleEscape(event: KeyboardEvent) {
			if (event.key === 'Escape') closeMenu();
		}

		document.addEventListener('click', handleDocumentClick);
		document.addEventListener('keydown', handleEscape);
		return () => {
			document.removeEventListener('click', handleDocumentClick);
			document.removeEventListener('keydown', handleEscape);
		};
	});
</script>

<div class="theme-control" bind:this={controlEl}>
	<button
		type="button"
		class="theme-toggle"
		class:open={menuOpen}
		class:dark={isDark}
		onclick={toggleMenu}
		aria-expanded={menuOpen}
		aria-haspopup="menu"
		aria-label="Theme: {activeOption.label}. Change appearance"
		title="Change theme ({activeOption.label})"
	>
		<span class="theme-toggle-icons" aria-hidden="true">
			<svg class="icon icon-sun" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.75" />
				<path
					d="M12 2.75v2.5M12 18.75v2.5M4.68 4.68l1.77 1.77M17.55 17.55l1.77 1.77M2.75 12h2.5M18.75 12h2.5M4.68 19.32l1.77-1.77M17.55 6.45l1.77-1.77"
					stroke="currentColor"
					stroke-width="1.75"
					stroke-linecap="round"
				/>
			</svg>
			<svg class="icon icon-moon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
					stroke="currentColor"
					stroke-width="1.75"
					stroke-linejoin="round"
				/>
			</svg>
		</span>

		<span class="theme-toggle-copy">
			<span class="theme-toggle-label">{activeOption.label}</span>
			{#if followsSystem}
				<span class="theme-toggle-hint">Device</span>
			{/if}
		</span>

		<svg
			class="theme-toggle-chevron"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M6 9l6 6 6-6"
				stroke="currentColor"
				stroke-width="1.75"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>

	{#if menuOpen}
		<div class="theme-menu" role="menu" aria-label="Theme options">
			<p class="theme-menu-heading" id="theme-menu-label">Appearance</p>
			{#each themeOptions as option (option.value)}
				<button
					type="button"
					class="theme-option"
					class:active={themeStore.preference === option.value}
					role="menuitemradio"
					aria-checked={themeStore.preference === option.value}
					aria-describedby="theme-menu-label"
					title={option.hint}
					onclick={() => selectTheme(option.value)}
				>
					<span class="theme-option-icon" aria-hidden="true">
						{#if option.value === 'light'}
							<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.75" />
								<path
									d="M12 2.75v2.5M12 18.75v2.5M4.68 4.68l1.77 1.77M17.55 17.55l1.77 1.77M2.75 12h2.5M18.75 12h2.5M4.68 19.32l1.77-1.77M17.55 6.45l1.77-1.77"
									stroke="currentColor"
									stroke-width="1.75"
									stroke-linecap="round"
								/>
							</svg>
						{:else if option.value === 'dark'}
							<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path
									d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
									stroke="currentColor"
									stroke-width="1.75"
									stroke-linejoin="round"
								/>
							</svg>
						{:else}
							<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<rect
									x="3"
									y="4"
									width="18"
									height="12"
									rx="2"
									stroke="currentColor"
									stroke-width="1.75"
								/>
								<path
									d="M8 20h8M12 16v4"
									stroke="currentColor"
									stroke-width="1.75"
									stroke-linecap="round"
								/>
							</svg>
						{/if}
					</span>
					<span class="theme-option-text">
						<span class="theme-option-label">{option.label}</span>
						<span class="theme-option-hint">{option.hint}</span>
					</span>
					<svg
						class="theme-option-check"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						<path
							d="M5 12.5l4.25 4.25L19 7"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.theme-control {
		position: relative;
	}

	.theme-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		height: 2.5rem;
		padding: 0 0.65rem 0 0.55rem;
		border: 1px solid var(--rf-color-border, #e7e5e4);
		border-radius: 999px;
		background: color-mix(in srgb, var(--rf-color-surface, #fff) 94%, transparent);
		color: var(--rf-color-text, #1a1a1a);
		font-family: var(--rf-font-sans);
		cursor: pointer;
		flex-shrink: 0;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}

	.theme-toggle:hover,
	.theme-toggle:focus-visible {
		background: color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 8%, var(--rf-color-surface, #fff));
		border-color: color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 28%, transparent);
	}

	.theme-toggle:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 45%, transparent);
		outline-offset: 2px;
	}

	.theme-toggle.open {
		border-color: color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 35%, transparent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 12%, transparent);
	}

	.theme-toggle-icons {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.35rem;
		height: 1.35rem;
		flex-shrink: 0;
	}

	.icon {
		position: absolute;
		width: 1.35rem;
		height: 1.35rem;
		transition:
			opacity 0.2s ease,
			transform 0.25s ease;
	}

	.icon-sun {
		opacity: 1;
		transform: rotate(0deg) scale(1);
		color: var(--rf-color-primary, #1f5c3a);
	}

	.icon-moon {
		opacity: 0;
		transform: rotate(-24deg) scale(0.82);
		color: var(--rf-color-text-muted, #78716c);
	}

	.theme-toggle.dark .icon-sun {
		opacity: 0;
		transform: rotate(24deg) scale(0.82);
	}

	.theme-toggle.dark .icon-moon {
		opacity: 1;
		transform: rotate(0deg) scale(1);
		color: var(--rf-color-primary, #1f5c3a);
	}

	.theme-toggle-copy {
		display: none;
		flex-direction: column;
		align-items: flex-start;
		line-height: 1.1;
		min-width: 0;
	}

	.theme-toggle-label {
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--rf-color-text, #1a1a1a);
	}

	.theme-toggle-hint {
		font-size: 0.68rem;
		font-weight: 500;
		color: var(--rf-color-text-muted, #78716c);
	}

	.theme-toggle-chevron {
		width: 0.95rem;
		height: 0.95rem;
		color: var(--rf-color-text-muted, #78716c);
		transition: transform 0.2s ease;
		flex-shrink: 0;
	}

	.theme-toggle.open .theme-toggle-chevron {
		transform: rotate(180deg);
	}

	.theme-menu {
		position: absolute;
		top: calc(100% + 0.45rem);
		right: 0;
		z-index: 30;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 13.5rem;
		padding: 0.45rem;
		border: 1px solid var(--rf-color-border, #e7e5e4);
		border-radius: 0.85rem;
		background: var(--rf-color-surface, #fff);
		box-shadow: var(--rf-shadow-md, 0 4px 12px rgb(28 25 23 / 8%));
	}

	.theme-menu-heading {
		margin: 0;
		padding: 0.35rem 0.55rem 0.25rem;
		font-family: var(--rf-font-sans);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--rf-color-text-muted, #78716c);
	}

	.theme-option {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 0.65rem;
		width: 100%;
		padding: 0.55rem 0.6rem;
		border: none;
		border-radius: 0.6rem;
		background: transparent;
		color: var(--rf-color-text, #1a1a1a);
		font: inherit;
		text-align: left;
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.theme-option:hover,
	.theme-option:focus-visible {
		background: color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 8%, transparent);
	}

	.theme-option:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 45%, transparent);
		outline-offset: -2px;
	}

	.theme-option.active {
		background: color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 12%, transparent);
	}

	.theme-option-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 10%, transparent);
		color: var(--rf-color-primary, #1f5c3a);
		flex-shrink: 0;
	}

	.theme-option-icon :global(svg) {
		width: 1rem;
		height: 1rem;
	}

	.theme-option-text {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
	}

	.theme-option-label {
		font-family: var(--rf-font-sans);
		font-size: 0.88rem;
		font-weight: 700;
	}

	.theme-option-hint {
		font-family: var(--rf-font-sans);
		font-size: 0.72rem;
		font-weight: 500;
		color: var(--rf-color-text-muted, #78716c);
	}

	.theme-option-check {
		width: 1rem;
		height: 1rem;
		color: var(--rf-color-primary, #1f5c3a);
		opacity: 0;
		transform: scale(0.85);
		transition:
			opacity 0.15s ease,
			transform 0.15s ease;
	}

	.theme-option.active .theme-option-check {
		opacity: 1;
		transform: scale(1);
	}

	@media (min-width: 640px) {
		.theme-toggle {
			padding: 0 0.75rem 0 0.6rem;
		}

		.theme-toggle-copy {
			display: flex;
		}
	}
</style>
