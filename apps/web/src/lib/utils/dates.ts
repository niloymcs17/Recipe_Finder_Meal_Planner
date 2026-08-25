import type { WeekDay } from '$lib/local-db/types';

export const WEEK_DAYS = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday'
] as const satisfies readonly WeekDay[];

export const WEEK_DAY_LABELS: Record<WeekDay, string> = {
	monday: 'Monday',
	tuesday: 'Tuesday',
	wednesday: 'Wednesday',
	thursday: 'Thursday',
	friday: 'Friday',
	saturday: 'Saturday',
	sunday: 'Sunday'
};

export const WEEK_DAY_SHORT: Record<WeekDay, string> = {
	monday: 'Mon',
	tuesday: 'Tue',
	wednesday: 'Wed',
	thursday: 'Thu',
	friday: 'Fri',
	saturday: 'Sat',
	sunday: 'Sun'
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
	return ISO_DATE.test(value);
}

export function toIsoDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function parseIsoDate(iso: string): Date {
	if (!isIsoDate(iso)) {
		throw new Error('Invalid ISO date');
	}
	const [year, month, day] = iso.split('-').map(Number);
	return new Date(year, month - 1, day);
}

/** Monday of the week containing `date`, as `YYYY-MM-DD`. */
export function startOfWeek(date: Date = new Date()): string {
	const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const weekday = local.getDay();
	const offset = weekday === 0 ? -6 : 1 - weekday;
	local.setDate(local.getDate() + offset);
	return toIsoDate(local);
}

export function addWeeks(weekStart: string, weeks: number): string {
	const date = parseIsoDate(weekStart);
	date.setDate(date.getDate() + weeks * 7);
	return toIsoDate(date);
}

export function formatWeekRange(weekStart: string): string {
	const start = parseIsoDate(weekStart);
	const end = new Date(start);
	end.setDate(start.getDate() + 6);
	const sameYear = start.getFullYear() === end.getFullYear();
	const startLabel = start.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: sameYear ? undefined : 'numeric'
	});
	const endLabel = end.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
	return `${startLabel} – ${endLabel}`;
}

export function weekDayMeta(weekStart: string): { day: WeekDay; date: string; label: string }[] {
	const start = parseIsoDate(weekStart);
	return WEEK_DAYS.map((day, index) => {
		const date = new Date(start);
		date.setDate(start.getDate() + index);
		return {
			day,
			date: toIsoDate(date),
			label: `${WEEK_DAY_LABELS[day]} ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
		};
	});
}
