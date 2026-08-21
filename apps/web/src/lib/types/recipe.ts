export type RecipeSource = 'mealdb' | 'user';

export type RecipeIngredient = {
	name: string;
	quantity: string;
};

/** Unified discovery/details recipe (source-prefixed `id`). */
export type Recipe = {
	id: string;
	source: RecipeSource;
	title: string;
	image: string | null;
	category: string | null;
	area: string | null;
	cookTimeMinutes?: number | null;
	servings?: number | null;
	ingredients: RecipeIngredient[];
	steps: string[];
	ownerId?: string;
};
