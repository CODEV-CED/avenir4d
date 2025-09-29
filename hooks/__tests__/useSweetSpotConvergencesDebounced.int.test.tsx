import { renderHook, act } from '@testing-library/react';
// ▼▼▼ MODIFIÉ : Utilisation de l'alias pour le chemin correct ▼▼▼
import { useSweetSpotConvergencesDebounced } from '@/components/sweet-spot/hooks/useSweetSpotConvergencesDebounced';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ▼▼▼ MODIFIÉ : Le chemin du mock est aussi mis à jour ▼▼▼
vi.mock('@/components/sweet-spot/hooks/useSweetSpotConvergences', () => ({
  useSweetSpotConvergences: vi.fn(() => ({ data: 'OK', convergences: [] })),
}));

describe('useSweetSpotConvergencesDebounced (integration)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('attend avant d’appeler le hook principal (sliders debounce)', () => {
    const { result, rerender } = renderHook(
      (props) =>
        useSweetSpotConvergencesDebounced(
          props.sliderValues,
          props.userKeywords,
          props.selectedTags,
          props.sweetSpotScore,
          props.filterMode,
          { slidersMs: 300 }
        ),
      {
        initialProps: {
          sliderValues: { passions: 0.1, talents: 0.2, utilite: 0.3, viabilite: 0.4 },
          userKeywords: { passions: [], talents: [], utilite: [], viabilite: [] },
          selectedTags: [],
          sweetSpotScore: 0.5,
          filterMode: 'union' as const,
        },
      }
    );

    expect(result.current.isAnyStabilizing).toBe(false);

    // On simule un mouvement de slider
    rerender({
      sliderValues: { passions: 0.2, talents: 0.3, utilite: 0.4, viabilite: 0.5 },
      userKeywords: { passions: [], talents: [], utilite: [], viabilite: [] },
      selectedTags: [],
      sweetSpotScore: 0.5,
      filterMode: 'union' as const,
    });

    // Le hook doit immédiatement indiquer qu'il est en train d'attendre
    expect(result.current.isAnyStabilizing).toBe(true);

    // On avance le temps, et l'attente devrait se terminer
    act(() => vi.advanceTimersByTime(300));
    expect(result.current.isAnyStabilizing).toBe(false);
  });
});

