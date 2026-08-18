/**
 * Delays invoking `fn` until `waitMs` has elapsed since the last call.
 * Default 350ms matches search-bar’s 300–400ms debounce window (Phase 04).
 */
export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  waitMs = 350,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>) => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, waitMs);
  };
}
