import { create } from 'zustand';
import {
  applySliderConstraint,
  GAP,
  clamp,
  type SliderKey,
  type SliderValues,
} from './sliderConstraints';

// Re-export types if needed elsewhere
export type { SliderKey, SliderValues };

// types utiles
export type Dimension = 'passions' | 'talents' | 'utilite' | 'viabilite';
export type Convergence = {
  keyword: string;
  strength: number;
  matchedDimensions: Dimension[];
  boosted?: boolean;
  boostedBy?: string[];
};

// ...imports & types existants
export type SweetSpotStore = {
  userKeywords: Record<Dimension, string[]>;
  sliderValues: SliderValues;
  convergences: Convergence[];
  sweetSpotScore: number;
  isLoading: boolean;
  // UX: last auto-adjusted slider + sequence for animation triggers
  autoAdjustedKey: SliderKey | null;
  autoAdjustSeq: number;

  // TAGS pour le boost
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;

  // ✅ nouveau
  boostEnabled: boolean;
  setBoostEnabled: (v: boolean) => void;

  setSliderValue: (dimension: SliderKey, rawValue: number) => void;
  setUserKeywords: (kw: Record<Dimension, string[]>) => void;
  fetchConvergences: () => Promise<void>;
};

export const useSweetSpotStore = create<SweetSpotStore>((set, get) => ({
  userKeywords: { passions: [], talents: [], utilite: [], viabilite: [] },
  sliderValues: { passions: 0.25, talents: 0.25, utilite: 0.25, viabilite: 0.25 },
  convergences: [],
  sweetSpotScore: 0,
  isLoading: false,
  autoAdjustedKey: null,
  autoAdjustSeq: 0,

  selectedTags: [],
  setSelectedTags: (tags) =>
    set({ selectedTags: Array.from(new Set(tags.map((t) => t.toLowerCase()))) }),

  // ✅ état + action
  boostEnabled: true,
  setBoostEnabled: (v) => set({ boostEnabled: v }),

  setSliderValue: (dimension, rawValue) => {
    const prev = get().sliderValues;
    const next = applySliderConstraint(prev, dimension, rawValue);
    // detect auto-adjusted key (other than the actively moved one)
    let autoKey: SliderKey | null = null;
    (Object.keys(next) as SliderKey[]).some((k) => {
      if (k === dimension) return false;
      if (Math.abs(next[k] - prev[k]) > 1e-6) {
        autoKey = k;
        return true;
      }
      return false;
    });
    set((s) => ({
      sliderValues: next,
      autoAdjustedKey: autoKey,
      autoAdjustSeq: autoKey ? s.autoAdjustSeq + 1 : s.autoAdjustSeq,
    }));
    get().fetchConvergences();
  },

  setUserKeywords: (kw) => set({ userKeywords: kw }),

  fetchConvergences: async () => {
    const { sliderValues, userKeywords, selectedTags, boostEnabled } = get();
    set({ isLoading: true });
    try {
      const res = await fetch('/api/sweet-spot/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weights: sliderValues,
          keywords: userKeywords,
          boostTags: selectedTags,
          boostEnabled,
        }),
      });
      const data = await res.json();
      set({
        convergences: data.convergences ?? [],
        sweetSpotScore: data.score ?? 0,
        isLoading: false,
      });
    } catch (e) {
      console.error(e);
      set({ isLoading: false });
    }
  },
}));
