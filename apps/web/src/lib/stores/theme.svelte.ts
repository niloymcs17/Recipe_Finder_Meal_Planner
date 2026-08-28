import { KEYS } from '$lib/local-db/keys';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const VALID: ThemePreference[] = ['light', 'dark', 'system'];

let preference = $state<ThemePreference>('system');
let resolved = $state<ResolvedTheme>('light');
let ready = $state(false);

let mediaQuery: MediaQueryList | null = null;
let mediaHandler: ((event: MediaQueryListEvent) => void) | null = null;

function readStoredPreference(): ThemePreference {
	if (typeof localStorage === 'undefined') return 'system';
	const stored = localStorage.getItem(KEYS.theme);
	return VALID.includes(stored as ThemePreference) ? (stored as ThemePreference) : 'system';
}

function systemPrefersDark(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveTheme(pref: ThemePreference): ResolvedTheme {
	if (pref === 'dark') return 'dark';
	if (pref === 'light') return 'light';
	return systemPrefersDark() ? 'dark' : 'light';
}

function applyToDocument(pref: ThemePreference) {
	if (typeof document === 'undefined') return;
	const root = document.documentElement;
	if (pref === 'system') {
		root.removeAttribute('data-theme');
	} else {
		root.setAttribute('data-theme', pref);
	}
	resolved = resolveTheme(pref);
}

function detachSystemListener() {
	if (mediaQuery && mediaHandler) {
		mediaQuery.removeEventListener('change', mediaHandler);
	}
	mediaQuery = null;
	mediaHandler = null;
}

function attachSystemListener() {
	if (typeof window === 'undefined') return;
	detachSystemListener();
	mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	mediaHandler = () => {
		if (preference === 'system') {
			resolved = systemPrefersDark() ? 'dark' : 'light';
		}
	};
	mediaQuery.addEventListener('change', mediaHandler);
}

export const themeStore = {
	get preference() {
		return preference;
	},
	get resolved() {
		return resolved;
	},
	get ready() {
		return ready;
	},
	setPreference(value: ThemePreference) {
		preference = value;
		localStorage.setItem(KEYS.theme, value);
		applyToDocument(value);
		if (value === 'system') {
			attachSystemListener();
		} else {
			detachSystemListener();
		}
	},
	hydrate() {
		if (ready) return;
		preference = readStoredPreference();
		applyToDocument(preference);
		if (preference === 'system') {
			attachSystemListener();
		}
		ready = true;
	}
};
