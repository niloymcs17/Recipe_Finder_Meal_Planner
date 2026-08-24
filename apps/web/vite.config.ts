import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// Bundle @recipe-finder/ui for SSR so Vite does not treat Stencil CEs as a Node external.
	// Registration itself still runs only in the browser via `$lib/ui/register`.
	ssr: {
		noExternal: ['@recipe-finder/ui']
	},
	optimizeDeps: {
		include: ['@recipe-finder/ui']
	}
});
