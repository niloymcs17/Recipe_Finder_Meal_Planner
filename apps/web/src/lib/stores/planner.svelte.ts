import * as plannerApi from '$lib/local-db/planner';
import type { MealPlanEntry, MealType, RecipeSource, WeekDay } from '$lib/local-db/types';
import { startOfWeek } from '$lib/utils/dates';
import { parseRecipeId } from '$lib/utils/ids';
import { authStore } from './auth.svelte';

let weekStart = $state(startOfWeek(new Date()));
let entries = $state<MealPlanEntry[]>([]);
let ready = $state(false);

function snapshot(): MealPlanEntry[] {
	return entries.map((entry) => ({ ...entry }));
}

function loadWeek(nextWeek: string) {
	weekStart = nextWeek;
	if (!authStore.user) {
		entries = [];
		ready = true;
		return;
	}
	try {
		entries = plannerApi.listByWeek(nextWeek);
	} catch {
		entries = [];
	}
	ready = true;
}

export const plannerStore = {
	get weekStart() {
		return weekStart;
	},
	get entries() {
		return entries;
	},
	get ready() {
		return ready;
	},
	hydrate(nextWeek = weekStart) {
		loadWeek(nextWeek);
	},
	setWeek(nextWeek: string) {
		loadWeek(nextWeek);
	},
	hasRecipe(recipeId: string): boolean {
		return entries.some((entry) => entry.recipeId === recipeId);
	},
	assign(input: {
		recipeId: string;
		day: WeekDay;
		source?: RecipeSource;
		mealType?: MealType | null;
		weekStart?: string;
	}): MealPlanEntry {
		const parsed = parseRecipeId(input.recipeId);
		if (!parsed) throw new Error('Invalid recipe id');

		const targetWeek = input.weekStart ?? weekStart;
		const previous = snapshot();
		const optimistic: MealPlanEntry = {
			id: `tmp-${Date.now()}`,
			userId: authStore.user?.id ?? '',
			weekStart: targetWeek,
			day: input.day,
			mealType: input.mealType ?? null,
			recipeId: input.recipeId,
			source: input.source ?? parsed.source,
			createdAt: new Date().toISOString()
		};
		if (targetWeek === weekStart) {
			entries = [...entries, optimistic];
		}

		try {
			const saved = plannerApi.assign({
				weekStart: targetWeek,
				day: input.day,
				recipeId: input.recipeId,
				source: input.source ?? parsed.source,
				mealType: input.mealType ?? null
			});
			if (targetWeek === weekStart) {
				entries = plannerApi.listByWeek(weekStart);
			}
			return saved;
		} catch (error) {
			if (targetWeek === weekStart) entries = previous;
			throw error;
		}
	},
	remove(entryId: string): void {
		const previous = snapshot();
		entries = entries.filter((entry) => entry.id !== entryId);
		try {
			plannerApi.remove(entryId);
			entries = plannerApi.listByWeek(weekStart);
		} catch (error) {
			entries = previous;
			throw error;
		}
	}
};
