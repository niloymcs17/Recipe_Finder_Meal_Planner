import type { RecipeIngredient } from '$lib/types/recipe';

export type ShoppingLine = {
	name: string;
	quantity: string;
};

type Qty = { amount: number; unit: string };

function parseQuantity(quantity: string): Qty | null {
	const trimmed = quantity.trim();
	if (!trimmed) return null;
	const match = /^([\d.]+)\s*(.*)$/.exec(trimmed);
	if (!match) return null;
	const amount = Number(match[1]);
	if (!Number.isFinite(amount)) return null;
	return { amount, unit: match[2].trim().toLowerCase() };
}

function formatAmount(amount: number): string {
	if (Number.isInteger(amount)) return String(amount);
	return String(Math.round(amount * 100) / 100);
}

/** Merge ingredients across recipes; sum amounts when the unit text matches. */
export function aggregateIngredients(ingredients: RecipeIngredient[]): ShoppingLine[] {
	type Bucket = {
		displayName: string;
		byUnit: Map<string, Qty>;
		leftovers: string[];
	};

	const groups = new Map<string, Bucket>();

	for (const item of ingredients) {
		const name = item.name.trim();
		if (!name) continue;
		const key = name.toLowerCase();
		let bucket = groups.get(key);
		if (!bucket) {
			bucket = { displayName: name, byUnit: new Map(), leftovers: [] };
			groups.set(key, bucket);
		}

		const parsed = parseQuantity(item.quantity);
		if (parsed) {
			const existing = bucket.byUnit.get(parsed.unit);
			if (existing) existing.amount += parsed.amount;
			else bucket.byUnit.set(parsed.unit, { ...parsed });
		} else if (item.quantity.trim()) {
			bucket.leftovers.push(item.quantity.trim());
		}
	}

	return [...groups.values()]
		.sort((a, b) => a.displayName.localeCompare(b.displayName))
		.map((bucket) => {
			const parts = [
				...[...bucket.byUnit.values()].map((qty) =>
					qty.unit ? `${formatAmount(qty.amount)} ${qty.unit}` : formatAmount(qty.amount)
				),
				...bucket.leftovers
			];
			return { name: bucket.displayName, quantity: parts.join(' + ') };
		});
}
