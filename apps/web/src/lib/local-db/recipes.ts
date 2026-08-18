import { KEYS } from './keys';
import { createId, migrate, readJson, writeJson } from './storage';
import { getCurrentUser } from './auth';
import type { Recipe } from './types';

function requireUserId(): string {
	const user = getCurrentUser();
	if (!user) throw new Error('Not authenticated');
	return user.id;
}

function allRecipes(): Recipe[] {
	migrate();
	return readJson<Recipe[]>(KEYS.recipes, []);
}

function saveRecipes(recipes: Recipe[]): void {
	writeJson(KEYS.recipes, recipes);
}

export function listMine(): Recipe[] {
	const userId = requireUserId();
	return allRecipes().filter((r) => r.ownerId === userId);
}

export function getById(id: string): Recipe | null {
	return allRecipes().find((r) => r.id === id) ?? null;
}

export type RecipeInput = Omit<Recipe, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'> & {
	id?: string;
};

export function create(input: RecipeInput): Recipe {
	const userId = requireUserId();
	const now = new Date().toISOString();
	const recipe: Recipe = {
		id: input.id ?? createId(),
		ownerId: userId,
		title: input.title,
		imageUrl: input.imageUrl ?? null,
		category: input.category ?? null,
		area: input.area ?? null,
		cookTimeMinutes: input.cookTimeMinutes ?? null,
		servings: input.servings ?? null,
		ingredients: input.ingredients,
		steps: input.steps,
		createdAt: now,
		updatedAt: now
	};
	const recipes = allRecipes();
	recipes.push(recipe);
	saveRecipes(recipes);
	return recipe;
}

export function update(id: string, patch: Partial<RecipeInput>): Recipe {
	const userId = requireUserId();
	const recipes = allRecipes();
	const index = recipes.findIndex((r) => r.id === id);
	if (index < 0) throw new Error('Recipe not found');
	if (recipes[index].ownerId !== userId) throw new Error('Forbidden');

	const updated: Recipe = {
		...recipes[index],
		...patch,
		id: recipes[index].id,
		ownerId: recipes[index].ownerId,
		createdAt: recipes[index].createdAt,
		updatedAt: new Date().toISOString()
	};
	recipes[index] = updated;
	saveRecipes(recipes);
	return updated;
}

export function remove(id: string): void {
	const userId = requireUserId();
	const recipes = allRecipes();
	const recipe = recipes.find((r) => r.id === id);
	if (!recipe) throw new Error('Recipe not found');
	if (recipe.ownerId !== userId) throw new Error('Forbidden');
	saveRecipes(recipes.filter((r) => r.id !== id));
}
