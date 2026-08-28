<script lang="ts">
	type Props = {
		label?: string;
	};

	let { label = 'Loading…' }: Props = $props();
</script>

<p class="loading" role="status" aria-live="polite">
	<span class="spinner" aria-hidden="true"></span>
	{label}
</p>

<style>
	.loading {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		font-size: 0.9rem;
		opacity: 0.85;
	}

	.spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid color-mix(in srgb, var(--rf-color-primary, #1f5c3a) 20%, transparent);
		border-top-color: var(--rf-color-primary, #1f5c3a);
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
