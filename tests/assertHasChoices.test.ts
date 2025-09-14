// tests/assertHasChoices.test.ts
import { describe, it, expect } from 'vitest';
import { assertHasChoices, toSubmitChoices } from '@/lib/utils/assertHasChoices';

describe('assertHasChoices', () => {
  it('throws if rawChoices is undefined', () => {
    expect(() => assertHasChoices({} as any)).toThrow(/Aucun choix fourni/);
  });

  it('throws if rawChoices is empty', () => {
    expect(() => assertHasChoices({ rawChoices: [] })).toThrow(/len=0/);
  });

  it('narrows type and returns void when valid', () => {
    const params: any = { rawChoices: [{ questionId: 'q1', optionId: 'a1' }] };
    expect(() => assertHasChoices(params)).not.toThrow();
    // @ts-expect-no-error – après l’assert, rawChoices est non-undefined
    const mapped = toSubmitChoices(params.rawChoices);
    expect(mapped).toEqual([{ questionId: 'q1', optionId: 'a1' }]);
  });
});

describe('toSubmitChoices', () => {
  it('keeps confidence when present', () => {
    const out = toSubmitChoices([{ questionId: 'q1', optionId: 'a1', confidence: 4 } as any]);
    expect(out[0]).toMatchObject({ questionId: 'q1', optionId: 'a1', confidence: 4 });
  });
  it('omits confidence when absent', () => {
    const out = toSubmitChoices([{ questionId: 'q1', optionId: 'a1' } as any]);
    expect(out[0]).toEqual({ questionId: 'q1', optionId: 'a1' });
  });
});
