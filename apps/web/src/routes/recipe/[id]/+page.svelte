<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let id = $derived(page.params.id ?? '');
</script>

<section>
	<h1>Recipe</h1>
	<p class="id"><code>{id}</code></p>
	<p>
		Full details, create, and edit land in the next phase. This page exists so discovery cards can
		navigate with source-prefixed ids (<code>mealdb:…</code> / <code>user:…</code>).
	</p>
	<p><a href="/">Back to discovery</a></p>
</section>

<style>
	h1 {
		margin-top: 0;
		color: var(--rf-color-primary, #1f5c3a);
	}

	.id {
		padding: 0.75rem 1rem;
		background: color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 10%, transparent);
		border-left: 3px solid var(--rf-color-primary, #1f5c3a);
		word-break: break-all;
	}

	code {
		font-family: ui-monospace, monospace;
		font-size: 0.9em;
	}

	a {
		color: var(--rf-color-primary, #1f5c3a);
	}
</style>
