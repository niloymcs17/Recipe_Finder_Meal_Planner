import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter()
		})
	],
	// Bundle @recipe-finder/ui for SSR so Vite does not treat Stencil CEs as a Node external.
	// Registration itself still runs only in the browser via `$lib/ui/register`.
	ssr: {
		noExternal: ['@recipe-finder/ui']
	},
	optimizeDeps: {
		include: ['@recipe-finder/ui']
	}
});
