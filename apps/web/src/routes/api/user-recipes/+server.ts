import { json } from '@sveltejs/kit';
import {
	parseRecipeFormFromJson,
	type FieldErrors,
	type RecipeWritePayload
} from '$lib/validation/recipe';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ errors: { _form: 'Request body must be valid JSON.' } satisfies FieldErrors }, {
			status: 400
		});
	}

	const parsed = parseRecipeFormFromJson(body);
	if (!parsed.ok) {
		return json({ errors: parsed.errors }, { status: 400 });
	}

	return json({ data: parsed.data satisfies RecipeWritePayload });
};
