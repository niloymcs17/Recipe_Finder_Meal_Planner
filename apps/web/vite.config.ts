import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// Bundle SSR deps for Netlify functions (pnpm monorepo + manual CLI deploy).
	ssr: {
		noExternal: true
	},
	optimizeDeps: {
		include: ['@recipe-finder/ui']
	}
});
