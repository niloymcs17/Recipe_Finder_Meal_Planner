import { requireLocalUser } from '$lib/recipes/require-user';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = ({ data, url }) => {
	requireLocalUser(url.pathname);
	return data;
};
