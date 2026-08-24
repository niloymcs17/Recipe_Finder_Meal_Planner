import { KEYS, STORAGE_VERSION, type StorageMeta } from './keys';
import type { Favorite, LocalUser, MealPlanEntry, Recipe, Session } from './types';

function canUseStorage(): boolean {
	return typeof localStorage !== 'undefined';
}

function ensureDefaults(): void {
	if (readJson<StorageMeta | null>(KEYS.meta, null) == null) {
		writeJson<StorageMeta>(KEYS.meta, { version: STORAGE_VERSION });
	}
	if (readJson<Record<string, LocalUser> | null>(KEYS.users, null) == null) {
		writeJson<Record<string, LocalUser>>(KEYS.users, {});
	}
	if (readJson<Session | null | undefined>(KEYS.session, undefined) === undefined) {
		writeJson<Session | null>(KEYS.session, null);
	}
	if (readJson<Recipe[] | null>(KEYS.recipes, null) == null) {
		writeJson<Recipe[]>(KEYS.recipes, []);
	}
	if (readJson<Favorite[] | null>(KEYS.favorites, null) == null) {
		writeJson<Favorite[]>(KEYS.favorites, []);
	}
	if (readJson<MealPlanEntry[] | null>(KEYS.mealPlan, null) == null) {
		writeJson<MealPlanEntry[]>(KEYS.mealPlan, []);
	}
}

export function readJson<T>(key: string, fallback: T): T {
	if (!canUseStorage()) return fallback;
	try {
		const raw = localStorage.getItem(key);
		if (raw == null) return fallback;
		return JSON.parse(raw) as T;
	} catch (error) {
		console.warn(`[local-db] failed to parse ${key}`, error);
		return fallback;
	}
}

export function writeJson<T>(key: string, value: T): void {
	if (!canUseStorage()) return;
	localStorage.setItem(key, JSON.stringify(value));
}

export function migrate(): void {
	if (!canUseStorage()) return;

	const meta = readJson<StorageMeta | null>(KEYS.meta, null);
	if (meta?.version === STORAGE_VERSION) return;

	if (!meta) {
		ensureDefaults();
		writeJson<StorageMeta>(KEYS.meta, { version: STORAGE_VERSION });
		return;
	}

	// Upgrade older schema versions without wiping existing data.
	if (meta.version < STORAGE_VERSION) {
		ensureDefaults();
	}

	writeJson<StorageMeta>(KEYS.meta, { version: STORAGE_VERSION });
}

export function createId(): string {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
		return crypto.randomUUID();
	}
	return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
