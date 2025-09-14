// lib/diversify.test.ts
import { describe, it, expect } from 'vitest';
import { diversifyResults } from './matching';

it('limite le nombre par type', () => {
  const items = [
    { id: '1', type: 'BUT' },
    { id: '2', type: 'BUT' },
    { id: '3', type: 'BUT' },
    { id: '4', type: 'BTS' },
    { id: '5', type: 'BTS' },
  ] as any[];
  const out = diversifyResults(items, 2);
  expect(out.filter((x) => x.type === 'BUT').length).toBeLessThanOrEqual(2);
});
