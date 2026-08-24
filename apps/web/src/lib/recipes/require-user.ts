import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { getCurrentUser } from '$lib/local-db/auth';
import type { PublicUser } from '$lib/local-db/types';

export function loginRedirect(pathname: string): string {
	const next = pathname.startsWith('/') && !pathname.startsWith('//') ? pathname : '/';
	return `/login?next=${encodeURIComponent(next)}`;
}

/** Client-only: send signed-out visitors to login. Safe to call from `ssr = false` loads. */
export function requireLocalUser(pathname: string): PublicUser {
	if (!browser) {
		throw redirect(302, loginRedirect(pathname));
	}
	const user = getCurrentUser();
	if (!user) {
		throw redirect(302, loginRedirect(pathname));
	}
	return user;
}
