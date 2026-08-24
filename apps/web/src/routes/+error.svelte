<script lang="ts">
	import { page } from '$app/state';

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? 'Something went wrong.');
</script>

<section class="error-page">
	<h1>{status === 404 ? 'Page not found' : 'Something went wrong'}</h1>
	<p role="alert">{message}</p>
	<p class="actions">
		<a href="/">Back to discovery</a>
	</p>
</section>

<style>
	.error-page {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-width: 36rem;
	}

	h1 {
		margin: 0;
		color: var(--rf-color-primary, #1f5c3a);
	}

	p {
		margin: 0;
		opacity: 0.85;
	}

	a {
		color: var(--rf-color-primary, #1f5c3a);
	}
</style>
