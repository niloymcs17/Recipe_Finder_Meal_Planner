export type RecipeQuery = {
	q: string;
	category: string;
	area: string;
	ingredient: string;
};

const MAX_PARAM = 80;

function take(url: URL, key: string): string {
	return url.searchParams.get(key)?.trim().slice(0, MAX_PARAM) ?? '';
}

export function parseRecipeQuery(url: URL): RecipeQuery {
	return {
		q: take(url, 'q'),
		category: take(url, 'category'),
		area: take(url, 'area'),
		ingredient: take(url, 'ingredient')
	};
}

export function categoriesFromQuery(category: string): string[] {
	return category
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean);
}
