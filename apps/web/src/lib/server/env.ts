import { env } from '$env/dynamic/private';
import { z } from 'zod';

export const DEFAULT_MEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

const urlSchema = z.string().url();

let validated = false;

/**
 * Validate server env on first request. Fails fast in Node with a clear message.
 * MEALDB_BASE_URL is optional — defaults to the public TheMealDB API.
 */
export function validateServerEnv(): void {
	if (validated) return;

	const raw = env.MEALDB_BASE_URL?.trim();
	if (raw) {
		const result = urlSchema.safeParse(raw);
		if (!result.success) {
			throw new Error(
				`Invalid MEALDB_BASE_URL: expected a full URL (e.g. https://www.themealdb.com/api/json/v1/1). Received: "${raw}"`
			);
		}
	}

	validated = true;
}

export function getMealDbBaseUrl(): string {
	validateServerEnv();
	const raw = env.MEALDB_BASE_URL?.trim();
	return (raw || DEFAULT_MEALDB_BASE_URL).replace(/\/$/, '');
}
