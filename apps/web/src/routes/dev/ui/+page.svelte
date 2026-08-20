<script lang="ts">
	import { onMount } from 'svelte';

	let lastEvent = $state('—');
	let cardEl = $state<HTMLElement | null>(null);
	let searchEl = $state<HTMLElement | null>(null);

	onMount(() => {
		let cancelled = false;

		const onSearchChange = (event: Event) => {
			const detail = (event as CustomEvent<{ value: string }>).detail;
			lastEvent = `searchChange → ${JSON.stringify(detail)}`;
		};

		const onRecipeSelect = (event: Event) => {
			const detail = (event as CustomEvent<{ recipeId?: string }>).detail;
			lastEvent = `recipeSelect → ${JSON.stringify(detail)}`;
		};

		void (async () => {
			await customElements.whenDefined('recipe-card');
			await customElements.whenDefined('search-bar');
			if (cancelled) return;

			if (cardEl) {
				(cardEl as HTMLElement & { tags: string[] }).tags = ['Italian', 'Pasta'];
				cardEl.addEventListener('recipeSelect', onRecipeSelect);
			}
			searchEl?.addEventListener('searchChange', onSearchChange);
		})();

		return () => {
			cancelled = true;
			searchEl?.removeEventListener('searchChange', onSearchChange);
			cardEl?.removeEventListener('recipeSelect', onRecipeSelect);
		};
	});
</script>

<section class="smoke">
	<h1>UI smoke (`/dev/ui`)</h1>
	<p class="lede">
		Temporary Phase 06 check — custom elements registered from the root layout. Type in the
		search bar or click the card to verify events.
	</p>

	<p class="event" aria-live="polite">Last event: <code>{lastEvent}</code></p>

	<search-bar bind:this={searchEl} placeholder="Search recipes…" label="Search"></search-bar>

	<div class="demo">
		<recipe-card
			bind:this={cardEl}
			heading="Lemon Herb Pasta"
			image="https://www.themealdb.com/images/media/meals/wvqpwt1468338086.jpg"
			cook-time={25}
			rating={4}
			recipe-id="smoke-pasta"
			favorited={false}
		></recipe-card>

		<empty-state message="No planner meals yet — this is the empty-state component." icon="inbox"
		></empty-state>
	</div>
</section>

<style>
	.smoke {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	h1 {
		margin: 0;
		font-size: 1.75rem;
		color: var(--rf-color-primary, #1f5c3a);
	}

	.lede {
		margin: 0;
		opacity: 0.85;
	}

	.event {
		margin: 0;
		padding: 0.75rem 1rem;
		background: color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 10%, transparent);
		border-left: 3px solid var(--rf-color-primary, #1f5c3a);
		font-size: 0.9rem;
	}

	.event code {
		font-family: ui-monospace, monospace;
		font-size: 0.85em;
	}

	.demo {
		display: grid;
		gap: 1.5rem;
	}

	@media (min-width: 40rem) {
		.demo {
			grid-template-columns: 1fr 1fr;
			align-items: start;
		}
	}
</style>
