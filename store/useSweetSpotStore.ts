import { create } from 'zustand';
import { GAP, clamp, type SliderKey, type SliderValues } from './sliderConstraints';

// Re-export types if needed elsewhere
export type { SliderKey, SliderValues };

// types utiles
export type Dimension = 'passions' | 'talents' | 'utilite' | 'viabilite';
export type DimKey = Dimension;
export type FilterMode = 'union' | 'intersection';
export type Convergence = {
  keyword: string;
  strength: number;
  matchedDimensions: Dimension[];
  boosted?: boolean;
  boostedBy?: string[];
};

// Persistence helpers for dimension filters
const LS_KEY = 'ikigaiFilters.v1';
function loadFilters(): { activeDims: DimKey[]; filterMode: FilterMode } {
  if (typeof window === 'undefined') return { activeDims: [], filterMode: 'union' };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { activeDims: [], filterMode: 'union' };
    const parsed = JSON.parse(raw);
    const dims = Array.isArray(parsed.activeDims)
      ? (parsed.activeDims.filter((d: string) =>
          ['passions', 'talents', 'utilite', 'viabilite'].includes(d),
        ) as DimKey[])
      : [];
    const mode: FilterMode = parsed.filterMode === 'intersection' ? 'intersection' : 'union';
    return { activeDims: Array.from(new Set(dims)), filterMode: mode };
  } catch {
    return { activeDims: [], filterMode: 'union' };
  }
}
function saveFilters(activeDims: DimKey[], filterMode: FilterMode) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ activeDims, filterMode }));
  } catch {}
}

// Preferences (sliders + boost) persistence
const LS_PREFS = 'ikigaiPrefs.v1';
function defaultSliders(): SliderValues {
  return { passions: 0.25, talents: 0.25, utilite: 0.25, viabilite: 0.25 };
}
function loadPrefs(): { sliders: SliderValues; boostEnabled: boolean } {
  if (typeof window === 'undefined') {
    return { sliders: defaultSliders(), boostEnabled: true };
  }
  try {
    const raw = localStorage.getItem(LS_PREFS);
    if (!raw) return { sliders: defaultSliders(), boostEnabled: true };
    const parsed = JSON.parse(raw);
    const s = parsed?.sliders ?? {};
    const sliders: SliderValues = {
      passions: typeof s.passions === 'number' ? s.passions : 0.25,
      talents: typeof s.talents === 'number' ? s.talents : 0.25,
      utilite: typeof s.utilite === 'number' ? s.utilite : 0.25,
      viabilite: typeof s.viabilite === 'number' ? Math.max(0.15, s.viabilite) : 0.25,
    };
    const boost = typeof parsed?.boostEnabled === 'boolean' ? parsed.boostEnabled : true;
    return { sliders, boostEnabled: boost };
  } catch {
    return { sliders: defaultSliders(), boostEnabled: true };
  }
}
function savePrefs(sliders: SliderValues, boostEnabled: boolean) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_PREFS, JSON.stringify({ sliders, boostEnabled }));
  } catch {}
}

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

  /** Filtres actifs (vide = toutes dimensions) */
  activeDims: DimKey[];
  toggleDim: (k: DimKey) => void;
  clearDims: () => void;

  /** Mode de filtre pour les convergences */
  filterMode: FilterMode;
  setFilterMode: (m: FilterMode) => void;

  setSliderValue: (dimension: SliderKey, rawValue: number) => void;
  setUserKeywords: (kw: Record<Dimension, string[]>) => void;
  fetchConvergences: () => Promise<void>;

  // Réinitialisation complète des préférences
  resetAllPrefs: () => void;
};

export const useSweetSpotStore = create<SweetSpotStore>((set, get) => ({
  // Load persisted filters (no-op on server) but ensure defaults present
  activeDims: loadFilters().activeDims,
  filterMode: loadFilters().filterMode,

  userKeywords: { passions: [], talents: [], utilite: [], viabilite: [] },
  sliderValues: loadPrefs().sliders,
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
  boostEnabled: loadPrefs().boostEnabled,
  setBoostEnabled: (v) => {
    set({ boostEnabled: v });
    savePrefs(get().sliderValues, v);
  },

  // filtres de dimensions
  toggleDim: (k) =>
    set((s) => {
      const on = new Set<DimKey>(s.activeDims);
      on.has(k) ? on.delete(k) : on.add(k);
      const next = Array.from(on);
      saveFilters(next, s.filterMode);
      return { activeDims: next };
    }),
  clearDims: () =>
    set((s) => {
      saveFilters([], s.filterMode);
      return { activeDims: [] };
    }),

  setFilterMode: (m) =>
    set((s) => {
      saveFilters(s.activeDims, m);
      return { filterMode: m };
    }),

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
    // persist sliders + boost
    savePrefs(next, get().boostEnabled);
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

  // Réinitialise sliders, boost, filtres et mode puis relance la détection
  resetAllPrefs: () => {
    const sliders = defaultSliders();
    const boostEnabled = true;
    const activeDims: DimKey[] = [];
    const filterMode: FilterMode = 'union';

    // 1) Persistance (écrit puis supprime pour repartir propre)
    savePrefs(sliders, boostEnabled);
    saveFilters(activeDims, filterMode);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(LS_PREFS);
        localStorage.removeItem(LS_KEY);
        // Si vous souhaitez conserver les valeurs par défaut, commentez les deux lignes ci-dessus.
      } catch {}
    }

    // 2) Mise à jour du store
    set({
      sliderValues: sliders,
      boostEnabled,
      activeDims,
      filterMode,
      autoAdjust: null,
      autoAdjustedKey: null,
      autoAdjustSeq: 0,
      // selectedTags: [], // décommentez si vous souhaitez aussi purger les tags
    });

    // 3) Recalcule immédiat
    get().fetchConvergences();
  },
}));
