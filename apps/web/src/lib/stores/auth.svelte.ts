import * as authApi from '$lib/local-db/auth';
import type { PublicUser } from '$lib/local-db/types';

let user = $state<PublicUser | null>(null);
let ready = $state(false);

export const authStore = {
	get user() {
		return user;
	},
	get ready() {
		return ready;
	},
	hydrate() {
		user = authApi.getCurrentUser();
		ready = true;
	},
	async signup(input: { email: string; password: string; displayName?: string }) {
		const result = await authApi.signup(input);
		if (result.ok) user = result.user;
		return result;
	},
	async login(input: { email: string; password: string }) {
		const result = await authApi.login(input);
		if (result.ok) user = result.user;
		return result;
	},
	logout() {
		authApi.logout();
		user = null;
	}
};
