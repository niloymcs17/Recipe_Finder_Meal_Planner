import { KEYS } from './keys';
import { createId, migrate, readJson, writeJson } from './storage';
import { getCurrentUser } from './auth';
import type { MealPlanEntry, MealType, RecipeSource, WeekDay } from './types';
import { assignMealSchema } from '$lib/validation/planner';
import { parseIsoDate, startOfWeek } from '$lib/utils/dates';

function requireUserId(): string {
	const user = getCurrentUser();
	if (!user) throw new Error('Not authenticated');
	return user.id;
}

function allEntries(): MealPlanEntry[] {
	migrate();
	return readJson<MealPlanEntry[]>(KEYS.mealPlan, []);
}

function saveEntries(entries: MealPlanEntry[]): void {
	writeJson(KEYS.mealPlan, entries);
}

export function listByWeek(weekStart: string): MealPlanEntry[] {
	const userId = requireUserId();
	const canonical = startOfWeek(parseIsoDate(weekStart));
	return allEntries().filter((e) => e.userId === userId && e.weekStart === canonical);
}

export function assign(input: {
	weekStart: string;
	day: WeekDay;
	recipeId: string;
	source: RecipeSource;
	mealType?: MealType | null;
}): MealPlanEntry {
	const userId = requireUserId();
	const parsed = assignMealSchema.safeParse(input);
	if (!parsed.success) {
		throw new Error(parsed.error.issues[0]?.message ?? 'Invalid meal plan entry');
	}

	const weekStart = startOfWeek(parseIsoDate(parsed.data.weekStart));
	const entry: MealPlanEntry = {
		id: createId(),
		userId,
		weekStart,
		day: parsed.data.day,
		mealType: parsed.data.mealType ?? null,
		recipeId: parsed.data.recipeId,
		source: parsed.data.source,
		createdAt: new Date().toISOString()
	};
	const entries = allEntries();
	entries.push(entry);
	saveEntries(entries);
	return entry;
}

export function remove(entryId: string): void {
	const userId = requireUserId();
	const entries = allEntries();
	const entry = entries.find((e) => e.id === entryId);
	if (!entry) throw new Error('Entry not found');
	if (entry.userId !== userId) throw new Error('Forbidden');
	saveEntries(entries.filter((e) => e.id !== entryId));
}
