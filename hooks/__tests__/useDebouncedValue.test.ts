import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from '../__utils__/useDebouncedValue';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('retourne immédiatement la valeur si delay=0', () => {
    const { result, rerender } = renderHook(({ v, d }) => useDebouncedValue(v, d), {
      initialProps: { v: 'a', d: 0 },
    });
    expect(result.current).toBe('a');

    rerender({ v: 'b', d: 0 });
    expect(result.current).toBe('b'); // pas d’attente
  });

  it('retarde la mise à jour avec delay>0', () => {
    const { result, rerender } = renderHook(({ v, d }) => useDebouncedValue(v, d), {
      initialProps: { v: 'a', d: 300 },
    });

    expect(result.current).toBe('a');
    rerender({ v: 'b', d: 300 });
    // pas encore mis à jour
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('b');
  });

  it('annule le timer si la valeur change avant la fin', () => {
    const { result, rerender } = renderHook(({ v, d }) => useDebouncedValue(v, d), {
      initialProps: { v: 'a', d: 300 },
    });

    // change rapidement plusieurs fois
    rerender({ v: 'b', d: 300 });
    act(() => vi.advanceTimersByTime(150));
    rerender({ v: 'c', d: 300 });
    act(() => vi.advanceTimersByTime(150));
    // à 300ms total, on n’a pas encore laissé 300ms *continus* pour 'c'
    expect(result.current).toBe('a');

    act(() => vi.advanceTimersByTime(150));
    expect(result.current).toBe('c'); // enfin mis à jour
  });
});
