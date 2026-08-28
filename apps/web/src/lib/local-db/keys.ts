export const STORAGE_VERSION = 1;

export const KEYS = {
	meta: 'rfmp:meta',
	users: 'rfmp:users',
	session: 'rfmp:session',
	recipes: 'rfmp:recipes',
	favorites: 'rfmp:favorites',
	mealPlan: 'rfmp:meal_plan',
	theme: 'rfmp:theme'
} as const;

export type StorageMeta = {
	version: number;
};
