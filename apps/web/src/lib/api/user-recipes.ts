import type { FieldErrors, RecipeFormFields, RecipeWritePayload } from '$lib/validation/recipe';

export type ValidateRecipeResult =
	| { ok: true; data: RecipeWritePayload }
	| { ok: false; errors: FieldErrors };

export async function validateRecipeOnServer(
	form: RecipeFormFields
): Promise<ValidateRecipeResult> {
	let response: Response;
	try {
		response = await fetch('/api/user-recipes', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(form)
		});
	} catch {
		return { ok: false, errors: { _form: 'Could not reach the server. Try again.' } };
	}

	let payload: { data?: RecipeWritePayload; errors?: FieldErrors; error?: string };
	try {
		payload = (await response.json()) as typeof payload;
	} catch {
		return { ok: false, errors: { _form: 'Unexpected server response.' } };
	}

	if (response.ok && payload.data) {
		return { ok: true, data: payload.data };
	}

	return {
		ok: false,
		errors: payload.errors ?? { _form: payload.error ?? 'Validation failed.' }
	};
}
