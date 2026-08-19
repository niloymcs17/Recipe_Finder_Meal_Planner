import { describe, expect, it, vi } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
  it('invokes once after the wait window', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 350);

    debounced('a');
    debounced('b');
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(349);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('b');

    vi.useRealTimers();
  });
});
