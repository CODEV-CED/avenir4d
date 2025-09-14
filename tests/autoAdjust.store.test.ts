import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';

// Mock fetch used by fetchConvergences to avoid network
beforeEach(() => {
  (globalThis as any).fetch = vi.fn().mockResolvedValue({
    json: vi.fn().mockResolvedValue({ convergences: [], score: 0 }),
  });

  // Reset key parts of the store between tests
  useSweetSpotStore.setState({
    sliderValues: { passions: 0.25, talents: 0.25, utilite: 0.25, viabilite: 0.25 },
    autoAdjust: null,
    autoAdjustedKey: null,
    autoAdjustSeq: 0,
  });
});

describe('useSweetSpotStore autoAdjust events', () => {
  it('emits viabilityMin when Viabilité < 0.15', () => {
    const { setSliderValue } = useSweetSpotStore.getState();
    setSliderValue('viabilite' as const, 0.05);

    const { autoAdjust, sliderValues } = useSweetSpotStore.getState();
    expect(autoAdjust?.type).toBe('viabilityMin');
    expect(autoAdjust?.adjusted?.key).toBe('viabilite');
    expect(sliderValues.viabilite).toBeGreaterThanOrEqual(0.15);
  });

  it('emits clamp when value exceeds allowed window', () => {
    useSweetSpotStore.setState({
      sliderValues: { passions: 0.9, talents: 0.5, utilite: 0.5, viabilite: 0.5 },
      autoAdjust: null,
    });

    const { setSliderValue } = useSweetSpotStore.getState();
    setSliderValue('talents' as const, 0.0);

    const { autoAdjust, sliderValues } = useSweetSpotStore.getState();
    expect(autoAdjust?.type).toBe('clamp');
    expect(autoAdjust?.adjusted?.key).toBe('talents');
    expect(sliderValues.talents).toBeCloseTo(0.5, 6);
  });

  it('emits gap and adjusts opposite extreme when global range > GAP', () => {
    // Deliberately set an invalid state (range > 0.40) to validate correction
    useSweetSpotStore.setState({
      sliderValues: { passions: 0.0, talents: 1.0, utilite: 0.5, viabilite: 0.5 },
      autoAdjust: null,
    });

    const { setSliderValue } = useSweetSpotStore.getState();
    setSliderValue('utilite' as const, 0.6);

    const { autoAdjust, sliderValues } = useSweetSpotStore.getState();
    expect(autoAdjust?.type).toBe('gap');
    // Expect min (passions) raised towards max - GAP = 1.0 - 0.4 = 0.6
    expect(autoAdjust?.adjusted?.key).toBe('passions');
    expect(sliderValues.passions).toBeCloseTo(0.6, 6);
  });
});
