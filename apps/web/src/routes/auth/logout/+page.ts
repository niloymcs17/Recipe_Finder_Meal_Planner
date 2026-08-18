import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

/** Logout is handled client-side via the auth store; keep a route for bookmarks. */
export const load: PageLoad = async () => {
	redirect(303, '/');
};
