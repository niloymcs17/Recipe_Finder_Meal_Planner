export type RecipeSource = 'user' | 'mealdb';

export type WeekDay =
	| 'monday'
	| 'tuesday'
	| 'wednesday'
	| 'thursday'
	| 'friday'
	| 'saturday'
	| 'sunday';

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export type LocalUser = {
	id: string;
	email: string;
	passwordHash: string;
	displayName: string | null;
	createdAt: string;
};

export type PublicUser = Omit<LocalUser, 'passwordHash'>;

export type Session = {
	userId: string;
	createdAt: string;
};

export type Ingredient = {
	name: string;
	quantity: string;
};

export type Recipe = {
	id: string;
	ownerId: string;
	title: string;
	imageUrl: string | null;
	category: string | null;
	area: string | null;
	cookTimeMinutes: number | null;
	servings: number | null;
	ingredients: Ingredient[];
	steps: string[];
	createdAt: string;
	updatedAt: string;
};

export type Favorite = {
	userId: string;
	recipeId: string;
	source: RecipeSource;
	addedAt: string;
};

export type MealPlanEntry = {
	id: string;
	userId: string;
	weekStart: string;
	day: WeekDay;
	mealType: MealType | null;
	recipeId: string;
	source: RecipeSource;
	createdAt: string;
};
