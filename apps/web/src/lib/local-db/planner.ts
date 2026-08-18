import { KEYS } from './keys';
import { createId, migrate, readJson, writeJson } from './storage';
import { getCurrentUser } from './auth';
import type { MealPlanEntry, MealType, RecipeSource, WeekDay } from './types';

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
	return allEntries().filter((e) => e.userId === userId && e.weekStart === weekStart);
}

export function assign(input: {
	weekStart: string;
	day: WeekDay;
	recipeId: string;
	source: RecipeSource;
	mealType?: MealType | null;
}): MealPlanEntry {
	const userId = requireUserId();
	const entry: MealPlanEntry = {
		id: createId(),
		userId,
		weekStart: input.weekStart,
		day: input.day,
		mealType: input.mealType ?? null,
		recipeId: input.recipeId,
		source: input.source,
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
