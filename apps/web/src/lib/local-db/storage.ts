import { KEYS, STORAGE_VERSION, type StorageMeta } from './keys';
import type { Favorite, LocalUser, MealPlanEntry, Recipe, Session } from './types';

function canUseStorage(): boolean {
	return typeof localStorage !== 'undefined';
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
		writeJson<StorageMeta>(KEYS.meta, { version: STORAGE_VERSION });
		writeJson<Record<string, LocalUser>>(KEYS.users, {});
		writeJson<Session | null>(KEYS.session, null);
		writeJson<Recipe[]>(KEYS.recipes, []);
		writeJson<Favorite[]>(KEYS.favorites, []);
		writeJson<MealPlanEntry[]>(KEYS.mealPlan, []);
		return;
	}

	// Future migrations can branch on meta.version.
	writeJson<StorageMeta>(KEYS.meta, { version: STORAGE_VERSION });
}

export function createId(): string {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
		return crypto.randomUUID();
	}
	return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
