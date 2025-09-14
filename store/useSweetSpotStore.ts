import { create } from 'zustand';
import { GAP, clamp, type SliderKey, type SliderValues } from './sliderConstraints';

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
  // Banner event describing auto-adjustments
  autoAdjust: null | {
    at: number;
    type: 'gap' | 'viabilityMin' | 'clamp';
    adjusted: { key: SliderKey; from: number; to: number } | null;
  };
  clearAutoAdjust: () => void;

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
  autoAdjust: null,
  clearAutoAdjust: () => set({ autoAdjust: null }),

  selectedTags: [],
  setSelectedTags: (tags) =>
    set({ selectedTags: Array.from(new Set(tags.map((t) => t.toLowerCase()))) }),

  // ✅ état + action
  boostEnabled: true,
  setBoostEnabled: (v) => set({ boostEnabled: v }),

  setSliderValue: (dimension, rawValue) => {
    const state = get();
    const prev = state.sliderValues;
    const prevVal = prev[dimension];

    const lower = dimension === 'viabilite' ? 0.15 : 0;
    const others = Object.entries(prev)
      .filter(([k]) => k !== dimension)
      .map(([, v]) => v) as number[];
    const minOther = Math.min(...others);
    const maxOther = Math.max(...others);

    // 1) clamp local + fenêtre autorisée par les autres
    let nextVal = clamp(rawValue, lower, 1);
    const allowedMin = Math.max(maxOther - GAP, lower);
    const allowedMax = Math.min(minOther + GAP, 1);
    const beforeClamp = nextVal;
    nextVal = clamp(nextVal, allowedMin, allowedMax);

    let evt: null | {
      at: number;
      type: 'gap' | 'viabilityMin' | 'clamp';
      adjusted: { key: SliderKey; from: number; to: number } | null;
    } = null;
    if (dimension === 'viabilite' && nextVal !== rawValue && rawValue < 0.15) {
      evt = {
        at: Date.now(),
        type: 'viabilityMin',
        adjusted: { key: 'viabilite', from: rawValue, to: nextVal },
      };
    } else if (nextVal !== beforeClamp) {
      evt = {
        at: Date.now(),
        type: 'clamp',
        adjusted: { key: dimension, from: beforeClamp, to: nextVal },
      };
    }

    // 2) construit l’état
    const next: SliderValues = { ...prev, [dimension]: nextVal };

    // 3) si la plage globale dépasse, ajuste l’extrême opposé
    const entries = Object.entries(next) as [SliderKey, number][];
    const minEntry = entries.reduce((a, b) => (a[1] <= b[1] ? a : b));
    const maxEntry = entries.reduce((a, b) => (a[1] >= b[1] ? a : b));
    const range = maxEntry[1] - minEntry[1];

    if (range > GAP) {
      if (nextVal >= prevVal) {
        const target = maxEntry[1] - GAP; // remonte le minimum
        const key = minEntry[0];
        const lb = key === 'viabilite' ? 0.15 : 0;
        const from = next[key];
        next[key] = clamp(target, lb, 1);
        evt = { at: Date.now(), type: 'gap', adjusted: { key, from, to: next[key] } };
      } else {
        const target = minEntry[1] + GAP; // baisse le maximum
        const key = maxEntry[0];
        const from = next[key];
        next[key] = clamp(target, 0, 1);
        evt = { at: Date.now(), type: 'gap', adjusted: { key, from, to: next[key] } };
      }
    }

    // detect auto-adjusted key (other than the actively moved one) for pulses
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
      autoAdjust: evt,
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
