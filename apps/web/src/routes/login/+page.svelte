<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';

	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let submitting = $state(false);

	$effect(() => {
		authStore.hydrate();
		if (authStore.ready && authStore.user) {
			goto('/');
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
			return;
		}
		goto('/');
	}
</script>

<section>
	<h1>Log in</h1>
	<p>Sign in with email and password. Credentials stay in this browser only.</p>

	{#if error}
		<p class="error" role="alert">{error}</p>
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
		color: #1f5c3a;
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
		border: 1px solid rgba(26, 26, 26, 0.2);
		background: #fff;
	}

	button {
		font: inherit;
		cursor: pointer;
		align-self: flex-start;
		background: #1f5c3a;
		color: #fff;
		border: none;
		padding: 0.55rem 1.1rem;
	}

	button:disabled {
		opacity: 0.7;
		cursor: wait;
	}

	.error {
		color: #8b1e1e;
		background: rgba(139, 30, 30, 0.08);
		padding: 0.75rem;
		border-left: 3px solid #8b1e1e;
	}

	.footer {
		margin-top: 1.5rem;
	}

	a {
		color: #1f5c3a;
	}
</style>
