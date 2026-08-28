<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authStore } from '$lib/stores/auth.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';

	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let submitting = $state(false);
	let errorEl = $state<HTMLParagraphElement | null>(null);

	function safeNext(raw: string | null): string {
		if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('://')) return '/';
		if (raw.startsWith('/login') || raw.startsWith('/signup')) return '/';
		return raw;
	}

	const nextPath = $derived(safeNext(page.url.searchParams.get('next')));

	$effect(() => {
		if (authStore.ready && authStore.user) {
			goto(nextPath);
		}
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		error = null;
		submitting = true;
		const result = await authStore.login({ email, password });
		submitting = false;
		if (!result.ok) {
			error = result.error;
			queueMicrotask(() => errorEl?.focus());
			return;
		}
		toastStore.show('Signed in.', 'success');
		goto(nextPath);
	}
</script>

<section>
	<h1>Log in</h1>
	<p>Sign in with email and password. Credentials stay in this browser only.</p>

	{#if error}
		<p class="error" role="alert" tabindex="-1" bind:this={errorEl}>{error}</p>
	{/if}

	<form onsubmit={handleSubmit}>
		<label>
			Email
			<input type="email" name="email" autocomplete="email" required bind:value={email} />
		</label>
		<label>
			Password
			<input
				type="password"
				name="password"
				autocomplete="current-password"
				required
				bind:value={password}
			/>
		</label>
		<button type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Log in'}</button>
	</form>

	<p class="footer">
		No account? <a href="/signup">Sign up</a>
	</p>
</section>

<style>
	h1 {
		margin-top: 0;
		color: var(--rf-color-primary, #1f5c3a);
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1.25rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.95rem;
	}

	input {
		font: inherit;
		padding: 0.55rem 0.65rem;
		border: 1px solid color-mix(in srgb, var(--rf-color-text) 20%, transparent);
		background: var(--rf-color-surface, #fff);
		color: var(--rf-color-text);
	}

	button {
		font: inherit;
		cursor: pointer;
		align-self: flex-start;
		background: var(--rf-color-primary, #1f5c3a);
		color: var(--rf-color-primary-contrast, #fff);
		border: none;
		padding: 0.55rem 1.1rem;
	}

	button:disabled {
		opacity: 0.7;
		cursor: wait;
	}

	.error {
		color: var(--rf-color-error-text, #8b1e1e);
		background: var(--rf-color-error-bg, rgba(139, 30, 30, 0.08));
		padding: 0.75rem;
		border-left: 3px solid var(--rf-color-error-border, #8b1e1e);
	}

	.footer {
		margin-top: 1.5rem;
	}

	a {
		color: var(--rf-color-primary, #1f5c3a);
	}
</style>
