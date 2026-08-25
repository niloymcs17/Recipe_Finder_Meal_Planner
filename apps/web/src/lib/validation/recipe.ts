import { z } from 'zod';
import type { Recipe as LocalRecipe } from '$lib/local-db/types';
import { isHttpUrl, stripHtml } from '$lib/sanitize';

export type RecipeFormFields = {
	title: string;
	imageUrl: string;
	category: string;
	area: string;
	cookTimeMinutes: string;
	servings: string;
	ingredients: { name: string; quantity: string }[];
	steps: string[];
};

export type RecipeWritePayload = {
	title: string;
	imageUrl: string | null;
	category: string | null;
	area: string | null;
	cookTimeMinutes: number;
	servings: number;
	ingredients: { name: string; quantity: string }[];
	steps: string[];
};

export type FieldErrors = Record<string, string>;

const ingredientSchema = z.object({
	name: z.string().trim().min(1, 'Ingredient name is required'),
	quantity: z.string().trim().min(1, 'Quantity is required')
});

const wholeNumber = (label: string, max: number, maxMessage: string) =>
	z
		.string()
		.trim()
		.min(1, `${label} is required`)
		.regex(/^\d+$/, `${label} must be a whole number`)
		.transform((value) => Number(value))
		.pipe(z.number().int().positive(`${label} must be at least 1`).max(max, maxMessage));

export const recipeFormSchema = z.object({
	title: z
		.string()
		.trim()
		.min(3, 'Title must be 3–100 characters')
		.max(100, 'Title must be 3–100 characters'),
	imageUrl: z
		.string()
		.trim()
		.refine((value) => value === '' || isHttpUrl(value), 'Enter a valid image URL'),
	category: z.string(),
	area: z.string(),
	cookTimeMinutes: wholeNumber('Cook time', 1440, 'Cook time cannot exceed 1440 minutes'),
	servings: wholeNumber('Servings', 50, 'Servings cannot exceed 50'),
	ingredients: z.array(ingredientSchema).min(1, 'Add at least one ingredient'),
	steps: z
		.array(z.string().trim().min(1, 'Step cannot be empty'))
		.min(1, 'Add at least one step')
});

export function emptyRecipeForm(): RecipeFormFields {
	return {
		title: '',
		imageUrl: '',
		category: '',
		area: '',
		cookTimeMinutes: '',
		servings: '',
		ingredients: [{ name: '', quantity: '' }],
		steps: ['']
	};
}

export function formFromLocalRecipe(recipe: LocalRecipe): RecipeFormFields {
	return {
		title: recipe.title,
		imageUrl: recipe.imageUrl ?? '',
		category: recipe.category ?? '',
		area: recipe.area ?? '',
		cookTimeMinutes: recipe.cookTimeMinutes != null ? String(recipe.cookTimeMinutes) : '',
		servings: recipe.servings != null ? String(recipe.servings) : '',
		ingredients:
			recipe.ingredients.length > 0
				? recipe.ingredients.map((row) => ({ name: row.name, quantity: row.quantity }))
				: [{ name: '', quantity: '' }],
		steps: recipe.steps.length > 0 ? [...recipe.steps] : ['']
	};
}

export function sanitizeFormFields(form: RecipeFormFields): RecipeFormFields {
	return {
		title: stripHtml(form.title),
		imageUrl: stripHtml(form.imageUrl),
		category: stripHtml(form.category),
		area: stripHtml(form.area),
		cookTimeMinutes: form.cookTimeMinutes.trim(),
		servings: form.servings.trim(),
		ingredients: form.ingredients.map((row) => ({
			name: stripHtml(row.name),
			quantity: stripHtml(row.quantity)
		})),
		steps: form.steps.map((step) => stripHtml(step))
	};
}

export function fieldErrorsFromZod(error: z.ZodError): FieldErrors {
	const errors: FieldErrors = {};
	for (const issue of error.issues) {
		const key = issue.path.map(String).join('.') || '_form';
		if (!errors[key]) errors[key] = issue.message;
	}
	return errors;
}

export function parseRecipeForm(
	form: RecipeFormFields
): { ok: true; data: RecipeWritePayload } | { ok: false; errors: FieldErrors } {
	const result = recipeFormSchema.safeParse(sanitizeFormFields(form));
	if (!result.success) {
		return { ok: false, errors: fieldErrorsFromZod(result.error) };
	}

	const image = result.data.imageUrl.trim();
	const category = result.data.category.trim();
	const area = result.data.area.trim();

	return {
		ok: true,
		data: {
			title: result.data.title,
			imageUrl: image.length > 0 ? image : null,
			category: category.length > 0 ? category : null,
			area: area.length > 0 ? area : null,
			cookTimeMinutes: result.data.cookTimeMinutes,
			servings: result.data.servings,
			ingredients: result.data.ingredients,
			steps: result.data.steps
		}
	};
}

/** Server-side entry point: validate arbitrary JSON request bodies. */
export function parseRecipeFormFromJson(
	body: unknown
): { ok: true; data: RecipeWritePayload } | { ok: false; errors: FieldErrors } {
	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		return { ok: false, errors: { _form: 'Invalid request body.' } };
	}

	const candidate = body as Partial<RecipeFormFields>;
	if (!Array.isArray(candidate.ingredients) || !Array.isArray(candidate.steps)) {
		return { ok: false, errors: { _form: 'Invalid recipe form.' } };
	}

	return parseRecipeForm({
		title: typeof candidate.title === 'string' ? candidate.title : '',
		imageUrl: typeof candidate.imageUrl === 'string' ? candidate.imageUrl : '',
		category: typeof candidate.category === 'string' ? candidate.category : '',
		area: typeof candidate.area === 'string' ? candidate.area : '',
		cookTimeMinutes:
			typeof candidate.cookTimeMinutes === 'string' ? candidate.cookTimeMinutes : '',
		servings: typeof candidate.servings === 'string' ? candidate.servings : '',
		ingredients: candidate.ingredients.map((row) => ({
			name: typeof row?.name === 'string' ? row.name : '',
			quantity: typeof row?.quantity === 'string' ? row.quantity : ''
		})),
		steps: candidate.steps.map((step) => (typeof step === 'string' ? step : ''))
	});
}
