import { env } from '$env/dynamic/private';
import type { Recipe, RecipeIngredient } from '$lib/types/recipe';
import { toMealDbId } from '$lib/utils/ids';
import { categoriesFromQuery, type RecipeQuery } from '$lib/validation/recipes-query';

export class MealDbUnavailableError extends Error {
	constructor(message = 'Recipe catalog is temporarily unavailable.') {
		super(message);
		this.name = 'MealDbUnavailableError';
	}
}

export const FALLBACK_CATEGORIES = [
	'Beef',
	'Breakfast',
	'Chicken',
	'Dessert',
	'Goat',
	'Lamb',
	'Miscellaneous',
	'Pasta',
	'Pork',
	'Seafood',
	'Side',
	'Starter',
	'Vegan',
	'Vegetarian'
];

const DEFAULT_BASE = 'https://www.themealdb.com/api/json/v1/1';
const FETCH_MS = 10_000;
const MAX_RESULTS = 36;

type MealRecord = Record<string, unknown>;

type MealsPayload = {
	meals?: MealRecord[] | null;
};

function baseUrl(): string {
	const raw = env.MEALDB_BASE_URL?.trim() || DEFAULT_BASE;
	return raw.replace(/\/$/, '');
}

function asMeals(payload: MealsPayload): MealRecord[] {
	return Array.isArray(payload.meals) ? payload.meals : [];
}

function asString(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

export function normalizeIngredients(meal: MealRecord): RecipeIngredient[] {
	const ingredients: RecipeIngredient[] = [];
	for (let i = 1; i <= 20; i += 1) {
		const name = asString(meal[`strIngredient${i}`]).trim();
		if (!name) continue;
		ingredients.push({
			name,
			quantity: asString(meal[`strMeasure${i}`]).trim()
		});
	}
	return ingredients;
}

export function normalizeSteps(instructions: string | null | undefined): string[] {
	if (!instructions) return [];
	return instructions
		.split(/\r?\n+/)
		.map((line) =>
			line
				.replace(/^(step\s*\d+\s*[-.:)]?\s*)/i, '')
				.replace(/^\d+\s*[-.:)]\s*/, '')
				.trim()
		)
		.filter(Boolean);
}

export function normalizeMeal(
	meal: MealRecord,
	extras: { category?: string | null } = {}
): Recipe | null {
	const rawId = asString(meal.idMeal).trim();
	const title = asString(meal.strMeal).trim();
	if (!rawId || !title) return null;

	const category = extras.category ?? (asString(meal.strCategory).trim() || null);
	const area = asString(meal.strArea).trim() || null;
	const thumb = asString(meal.strMealThumb).trim();

	return {
		id: toMealDbId(rawId),
		source: 'mealdb',
		title,
		image: thumb || null,
		category,
		area,
		ingredients: normalizeIngredients(meal),
		steps: normalizeSteps(asString(meal.strInstructions) || null)
	};
}

function normalizeList(meals: MealRecord[], extras: { category?: string | null } = {}): Recipe[] {
	const recipes: Recipe[] = [];
	const seen = new Set<string>();
	for (const meal of meals) {
		const recipe = normalizeMeal(meal, extras);
		if (!recipe || seen.has(recipe.id)) continue;
		seen.add(recipe.id);
		recipes.push(recipe);
	}
	return recipes;
}

async function mealDbGet(pathAndQuery: string): Promise<MealsPayload> {
	const url = `${baseUrl()}${pathAndQuery.startsWith('/') ? '' : '/'}${pathAndQuery}`;
	try {
		const response = await fetch(url, {
			headers: { Accept: 'application/json' },
			signal: AbortSignal.timeout(FETCH_MS)
		});
		if (!response.ok) {
			console.error('[mealdb] HTTP', response.status, pathAndQuery);
			throw new MealDbUnavailableError();
		}
		return (await response.json()) as MealsPayload;
	} catch (error) {
		if (error instanceof MealDbUnavailableError) throw error;
		console.error('[mealdb] fetch failed', pathAndQuery, error);
		throw new MealDbUnavailableError();
	}
}

export async function searchByName(name: string): Promise<Recipe[]> {
	const payload = await mealDbGet(`/search.php?s=${encodeURIComponent(name)}`);
	return normalizeList(asMeals(payload));
}

export async function listByCategory(category: string): Promise<Recipe[]> {
	const payload = await mealDbGet(`/filter.php?c=${encodeURIComponent(category)}`);
	return normalizeList(asMeals(payload), { category });
}

export async function listByArea(area: string): Promise<Recipe[]> {
	const payload = await mealDbGet(`/filter.php?a=${encodeURIComponent(area)}`);
	return normalizeList(asMeals(payload));
}

export async function listByIngredient(ingredient: string): Promise<Recipe[]> {
	const needle = ingredient.trim().replace(/\s+/g, '_');
	const payload = await mealDbGet(`/filter.php?i=${encodeURIComponent(needle)}`);
	return normalizeList(asMeals(payload));
}

export async function lookupById(id: string): Promise<Recipe | null> {
	const payload = await mealDbGet(`/lookup.php?i=${encodeURIComponent(id)}`);
	const meal = asMeals(payload)[0];
	return meal ? normalizeMeal(meal) : null;
}

/** Default discovery set — empty name search returns a MealDB starter list. */
export async function browse(): Promise<Recipe[]> {
	return searchByName('');
}

export async function listCategories(): Promise<string[]> {
	try {
		const payload = await mealDbGet('/list.php?c=list');
		const names = asMeals(payload)
			.map((row) => asString(row.strCategory).trim())
			.filter(Boolean);
		return names.length > 0 ? names : FALLBACK_CATEGORIES;
	} catch {
		return FALLBACK_CATEGORIES;
	}
}

export async function searchRecipes(query: RecipeQuery): Promise<Recipe[]> {
	const categories = categoriesFromQuery(query.category);
	const q = query.q.trim();
	const area = query.area.trim();
	const ingredient = query.ingredient.trim();

	if (q) {
		let recipes = await searchByName(q);
		if (categories.length) {
			recipes = recipes.filter((recipe) => recipe.category && categories.includes(recipe.category));
		}
		if (area) {
			recipes = recipes.filter(
				(recipe) => (recipe.area ?? '').toLowerCase() === area.toLowerCase()
			);
		}
		if (ingredient) {
			const needle = ingredient.toLowerCase();
			recipes = recipes.filter((recipe) =>
				recipe.ingredients.some((item) => item.name.toLowerCase().includes(needle))
			);
		}
		return recipes.slice(0, MAX_RESULTS);
	}

	if (categories.length) {
		const groups = await Promise.all(categories.map((category) => listByCategory(category)));
		const seen = new Set<string>();
		let recipes: Recipe[] = [];
		for (const recipe of groups.flat()) {
			if (seen.has(recipe.id)) continue;
			seen.add(recipe.id);
			recipes.push(recipe);
		}
		if (area) {
			recipes = recipes.filter(
				(recipe) => (recipe.area ?? '').toLowerCase() === area.toLowerCase()
			);
		}
		return recipes.slice(0, MAX_RESULTS);
	}

	if (area) {
		return (await listByArea(area)).slice(0, MAX_RESULTS);
	}

	if (ingredient) {
		return (await listByIngredient(ingredient)).slice(0, MAX_RESULTS);
	}

	return (await browse()).slice(0, MAX_RESULTS);
}
