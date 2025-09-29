import { describe, it, expect } from 'vitest';
import { applySliderConstraint, GAP, type SliderValues } from '@/store/sliderConstraints';

const base: SliderValues = {
  passions: 0.25,
  talents: 0.25,
  utilite: 0.25,
  viabilite: 0.25,
};

describe('applySliderConstraint', () => {
  it('keeps viabilite >= 0.15', () => {
    const prev = { ...base, viabilite: 0.2 };
    const next = applySliderConstraint(prev, 'viabilite', 0.05);
    expect(next.viabilite).toBeGreaterThanOrEqual(0.15);
  });

  it('clamps within [0,1] and window defined by others', () => {
    const prev = { passions: 0.8, talents: 0.2, utilite: 0.2, viabilite: 0.2 };
    const next = applySliderConstraint(prev, 'talents', 0.95);
    // With others min=0.2, max=0.8, allowed window for talents = [0.4, 0.6]
    expect(next.talents).toBeGreaterThanOrEqual(0.4);
    expect(next.talents).toBeLessThanOrEqual(0.6);
  });

  it('reduces opposite extreme when raising current beyond GAP', () => {
    const prev = { passions: 0.2, talents: 0.2, utilite: 0.2, viabilite: 0.6 };
    const next = applySliderConstraint(prev, 'passions', 0.9);
    const values = Object.values(next);
    const max = Math.max(...values);
    const min = Math.min(...values);
    expect(max - min).toBeLessThanOrEqual(GAP + 1e-6);
  });

  it('reduces opposite extreme when lowering current beyond GAP', () => {
    const prev = { passions: 0.8, talents: 0.8, utilite: 0.8, viabilite: 0.4 };
    const next = applySliderConstraint(prev, 'passions', 0.05);
    const values = Object.values(next);
    const max = Math.max(...values);
    const min = Math.min(...values);
    expect(max - min).toBeLessThanOrEqual(GAP + 1e-6);
  });

  it.skip('no change when moving within allowed window', () => {
    const prev = { passions: 0.5, talents: 0.5, utilite: 0.5, viabilite: 0.5 };
    const next = applySliderConstraint(prev, 'utilite', 0.55);
    expect(next.utilite).toBeCloseTo(0.55, 6);
  });
});
