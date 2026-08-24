import { validateServerEnv } from '$lib/server/env';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	validateServerEnv();
	return resolve(event);
};
