/**
 * Show a loading label only after `delayMs` to avoid flicker on fast operations.
 * Returns a cancel function that clears the timer and resets loading to false.
 */
export function scheduleDelayedLoading(
	onChange: (loading: boolean) => void,
	delayMs = 250
): () => void {
	let timer = setTimeout(() => onChange(true), delayMs);
	return () => {
		clearTimeout(timer);
		onChange(false);
	};
}
