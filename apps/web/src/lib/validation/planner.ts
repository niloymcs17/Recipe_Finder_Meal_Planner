import { z } from 'zod';
import { WEEK_DAYS, isIsoDate } from '$lib/utils/dates';
import { parseRecipeId } from '$lib/utils/ids';

export const weekDaySchema = z.enum(WEEK_DAYS);

export const recipeSourceSchema = z.enum(['user', 'mealdb']);

export const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner']);

export const assignMealSchema = z
	.object({
		weekStart: z
			.string()
			.trim()
			.refine(isIsoDate, 'weekStart must be an ISO date (YYYY-MM-DD)'),
		day: weekDaySchema,
		recipeId: z.string().trim().min(1, 'recipeId is required'),
		source: recipeSourceSchema,
		mealType: mealTypeSchema.nullable().optional()
	})
	.superRefine((value, ctx) => {
		const parsed = parseRecipeId(value.recipeId);
		if (!parsed) {
			ctx.addIssue({
				code: 'custom',
				path: ['recipeId'],
				message: 'recipeId must be a prefixed id (mealdb:… or user:…)'
			});
			return;
		}
		if (parsed.source !== value.source) {
			ctx.addIssue({
				code: 'custom',
				path: ['source'],
				message: 'source does not match recipeId prefix'
			});
		}
	});

export const toggleFavoriteSchema = z
	.object({
		recipeId: z.string().trim().min(1, 'recipeId is required'),
		source: recipeSourceSchema
	})
	.superRefine((value, ctx) => {
		const parsed = parseRecipeId(value.recipeId);
		if (!parsed) {
			ctx.addIssue({
				code: 'custom',
				path: ['recipeId'],
				message: 'recipeId must be a prefixed id (mealdb:… or user:…)'
			});
			return;
		}
		if (parsed.source !== value.source) {
			ctx.addIssue({
				code: 'custom',
				path: ['source'],
				message: 'source does not match recipeId prefix'
			});
		}
	});

export type AssignMealInput = z.infer<typeof assignMealSchema>;
export type ToggleFavoriteInput = z.infer<typeof toggleFavoriteSchema>;
