import { create } from 'zustand';
import {
  GAP,
  MIN_VIAB,
  applySliderConstraintVerbose,
  type SliderKey,
  type SliderValues,
  type AutoAdjustEvent,
} from './sliderConstraints';
import type { TuningPreset } from '@/lib/sweetSpotEngine';
import type { ResultMeta, Convergence } from '@/lib/sweetspot/types';
import type { HybridProject } from '@/types/hybrid-project.schema';
import type { EmergingCareerBatch3 as EmergingCareerLycee } from '@/data/emerging-careers-batch3';
import { hybridProjectGenerator } from '@/services';

// Re-export types if needed elsewhere
export type { SliderKey, SliderValues };

// types utiles
export type Dimension = 'passions' | 'talents' | 'utilite' | 'viabilite';
export type DimKey = Dimension;
export type FilterMode = 'union' | 'intersection';
// Convergence type now comes from shared types

// Debounce handle for detect
let detectTimer: ReturnType<typeof setTimeout> | null = null;

// Normalize keywords: trim and collapse spaces
function norm(s: string): string {
  return (s || '').replace(/\s+/g, ' ').trim();
}

// Tag normalization (lowercase + trimmed + max length)
function normTag(s: string): string {
  return (s || '').trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 64);
}

// Persistence helpers for dimension filters
const LS_KEY = 'ikigaiFilters.v1';
function defaultFilterState(): { activeDims: DimKey[]; filterMode: FilterMode } {
  return { activeDims: [], filterMode: 'union' };
}
function loadFilters(): { activeDims: DimKey[]; filterMode: FilterMode } {
  if (typeof window === 'undefined') return defaultFilterState();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultFilterState();
    const parsed = JSON.parse(raw);
    const dims = Array.isArray(parsed.activeDims)
      ? (parsed.activeDims.filter((d: string) =>
          ['passions', 'talents', 'utilite', 'viabilite'].includes(d),
        ) as DimKey[])
      : [];
    const mode: FilterMode = parsed.filterMode === 'intersection' ? 'intersection' : 'union';
    return { activeDims: Array.from(new Set(dims)), filterMode: mode };
  } catch {
    return defaultFilterState();
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
function defaultPrefsState(): {
  sliders: SliderValues;
  boostEnabled: boolean;
  preset: TuningPreset;
} {
  return { sliders: defaultSliders(), boostEnabled: true, preset: 'balanced' as TuningPreset };
}
function loadPrefs(): { sliders: SliderValues; boostEnabled: boolean; preset: TuningPreset } {
  if (typeof window === 'undefined') {
    return defaultPrefsState();
  }
  try {
    const raw = localStorage.getItem(LS_PREFS);
    if (!raw) return defaultPrefsState();
    const parsed = JSON.parse(raw);
    const s = parsed?.sliders ?? {};
    const sliders: SliderValues = {
      passions: typeof s.passions === 'number' ? s.passions : 0.25,
      talents: typeof s.talents === 'number' ? s.talents : 0.25,
      utilite: typeof s.utilite === 'number' ? s.utilite : 0.25,
      viabilite: typeof s.viabilite === 'number' ? Math.max(MIN_VIAB, s.viabilite) : 0.25,
    };
    const boost = typeof parsed?.boostEnabled === 'boolean' ? parsed.boostEnabled : true;
    const preset: TuningPreset =
      parsed?.preset === 'lax' || parsed?.preset === 'strict' ? parsed.preset : 'balanced';
    return { sliders, boostEnabled: boost, preset };
  } catch {
    return defaultPrefsState();
  }
}
function savePrefs(sliders: SliderValues, boostEnabled: boolean, preset: TuningPreset) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_PREFS, JSON.stringify({ sliders, boostEnabled, preset }));
  } catch {}
}

// ...imports & types existants
export type SweetSpotStore = {
  userKeywords: Record<Dimension, string[]>;
  sliderValues: SliderValues;
  convergences: Convergence[];
  sweetSpotScore: number;
  resultMeta: ResultMeta | null;
  isLoading: boolean;
  keywordsDirty: boolean;
  savingKeywords: boolean;
  // UX: last auto-adjusted slider + sequence for animation triggers
  autoAdjustedKey: SliderKey | null;
  autoAdjustSeq: number;
  // Banner event describing auto-adjustments
  autoAdjust: AutoAdjustEvent | null;
  clearAutoAdjust: () => void;

  // TAGS pour le boost
  selectedTags: string[];
  candidateTags: string[];
  setSelectedTags: (tags: string[]) => void;
  addTag: (t: string) => void;
  removeTag: (t: string) => void;
  hydrateTagsFromKeywords: () => void; // auto à partir des keywords
  refreshCandidates: () => void; // (keywords + convergences)
  searchTagSuggestions: (q: string) => Promise<string[]>; // via API

  // ✅ nouveau
  boostEnabled: boolean;
  setBoostEnabled: (v: boolean) => void;

  // ====== B3: hybrid projects ======
  generatedProjects: HybridProject[];
  selectedProject: HybridProject | null;
  isGeneratingProjects: boolean;
  projectGenerationError: string | null;

  generateProjects: (seedCareers: EmergingCareerLycee[]) => Promise<void>;
  selectProject: (project: HybridProject) => void;
  saveProjectToProfile: (project: HybridProject) => Promise<void>;
  clearProjects: () => void;

  // Tuning preset for engine
  tuningPreset: TuningPreset;
  setTuningPreset: (p: TuningPreset) => void;

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
  debouncedDetect: () => void;
  addKeyword: (dim: DimKey, kw: string) => void;
  removeKeyword: (dim: DimKey, kw: string) => void;
  saveKeywords: (profileId: string) => Promise<void>;
  seedDemoKeywords: () => void;

  // Réinitialisation complète des préférences
  resetAllPrefs: () => void;
};

export const useSweetSpotStore = create<SweetSpotStore>((set, get) => {
  const baseFilters = defaultFilterState();
  const basePrefs = defaultPrefsState();

  if (typeof window !== 'undefined') {
    setTimeout(() => {
      const { sliders, boostEnabled, preset } = loadPrefs();
      const { activeDims, filterMode } = loadFilters();
      const current = get();
      const sliderKeys = Object.keys(sliders) as SliderKey[];
      const slidersChanged = sliderKeys.some((key) => current.sliderValues[key] !== sliders[key]);
      const dimsChanged =
        current.activeDims.length !== activeDims.length ||
        current.activeDims.some((dim, index) => dim !== activeDims[index]);
      if (
        !slidersChanged &&
        current.boostEnabled === boostEnabled &&
        current.tuningPreset === preset &&
        current.filterMode === filterMode &&
        !dimsChanged
      ) {
        return;
      }
      set({
        sliderValues: sliders,
        boostEnabled,
        tuningPreset: preset,
        activeDims,
        filterMode,
      });
    }, 0);
  }

  return {
    activeDims: baseFilters.activeDims,
    filterMode: baseFilters.filterMode,

    userKeywords: { passions: [], talents: [], utilite: [], viabilite: [] },
    sliderValues: basePrefs.sliders,
    convergences: [],
    sweetSpotScore: 0,
    resultMeta: null,
    isLoading: false,
    keywordsDirty: false,
    savingKeywords: false,
    autoAdjustedKey: null,
    autoAdjustSeq: 0,
    autoAdjust: null,
    clearAutoAdjust: () => set({ autoAdjust: null }),

    selectedTags: [],
    candidateTags: [],
    setSelectedTags: (tags) => {
      const uniq = Array.from(new Set(tags.map(normTag)))
        .filter(Boolean)
        .slice(0, 12);
      set({ selectedTags: uniq });
    },
    addTag: (t) => {
      const v = normTag(t);
      if (!v) return;
      set((s) => {
        const next = Array.from(new Set([...s.selectedTags, v])).slice(0, 12);
        return { selectedTags: next } as any;
      });
      get().debouncedDetect?.();
    },
    removeTag: (t) => {
      const v = normTag(t);
      set((s) => ({ selectedTags: s.selectedTags.filter((x) => x !== v) }));
      get().debouncedDetect?.();
    },
    hydrateTagsFromKeywords: () => {
      const { userKeywords, convergences } = get() as any;
      const pool = [
        ...(userKeywords?.passions ?? []),
        ...(userKeywords?.talents ?? []),
        ...(userKeywords?.utilite ?? []),
        ...(userKeywords?.viabilite ?? []),
        ...(Array.isArray(convergences) ? convergences.map((c: any) => c.keyword) : []),
      ]
        .map(normTag)
        .filter(Boolean);

      const freq = new Map<string, number>();
      for (const k of pool) freq.set(k, (freq.get(k) ?? 0) + 1);

      const top = Array.from(freq.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([k]) => k)
        .slice(0, 8);

      set({ candidateTags: top });
      if (get().selectedTags.length === 0 && top.length) {
        set({ selectedTags: top.slice(0, 3) });
      }
    },
    refreshCandidates: () => {
      get().hydrateTagsFromKeywords();
    },
    searchTagSuggestions: async (q: string) => {
      const query = (q || '').trim();
      if (!query) {
        const cs = get().candidateTags;
        return cs.length ? cs : [];
      }
      try {
        const res = await fetch(`/api/tags/suggest?q=${encodeURIComponent(query)}&limit=8`, {
          cache: 'no-store',
        });
        const json = await res.json();
        if (Array.isArray(json?.tags)) {
          const canon = json.tags
            .map((t: any) => normTag(String(t?.label ?? t?.slug ?? t)))
            .filter(Boolean);
          set((s) => ({
            candidateTags: Array.from(new Set([...canon, ...s.candidateTags])).slice(0, 20),
          }));
          return canon;
        }
      } catch {}
      return [];
    },

    // ✅ état + action
    boostEnabled: basePrefs.boostEnabled,
    setBoostEnabled: (v) => {
      set({ boostEnabled: v });
      savePrefs(get().sliderValues, v, get().tuningPreset);
    },

    // ====== B3: hybrid projects ======
    generatedProjects: [],
    selectedProject: null,
    isGeneratingProjects: false,
    projectGenerationError: null,

    clearProjects: () => set({ generatedProjects: [], selectedProject: null, projectGenerationError: null }),

    selectProject: (project) => set({ selectedProject: project }),

    saveProjectToProfile: async (project) => {
      console.log('[Store] save project:', project.title);
      try {
        await fetch('/api/sweet-spot/projects/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project }),
        });
      } catch (error) {
        console.error('saveProjectToProfile failed', error);
      }
    },

    generateProjects: async (seedCareers) => {
      const { userKeywords, convergences } = get();
      set({ isGeneratingProjects: true, projectGenerationError: null });

      const simplifiedConvergences = (convergences ?? [])
        .filter((item) => typeof item?.keyword === 'string' && item.keyword.trim().length > 0)
        .slice(0, 3)
        .map((item) => ({
          keywords: [item.keyword.trim()],
          strength:
            typeof item.strength === 'number'
              ? item.strength
              : typeof (item as any)?.score === 'number'
                ? (item as any).score
                : 0.6,
        }));

      try {
        const result = await hybridProjectGenerator.generate(
          userKeywords || {},
          simplifiedConvergences,
          seedCareers,
        );

        if (!result.projects.length) {
          throw new Error('no projects generated');
        }

        set({
          generatedProjects: result.projects,
          selectedProject: result.projects[0] ?? null,
          isGeneratingProjects: false,
          projectGenerationError: null,
        });

        console.log(`[Store] generation ${result.source}${result.cached ? ' (cache)' : ''}: ${result.projects.length} projects (key ${result.cacheKey})`);
      } catch (error) {
        console.error('[Store] project generation failed', error);
        set({
          generatedProjects: [],
          selectedProject: null,
          isGeneratingProjects: false,
          projectGenerationError: 'Impossible de generer des projets pour ce metier. Reessaie ou choisis-en un autre.',
        });
      }
    },

    tuningPreset: basePrefs.preset,
    setTuningPreset: (p) => {
      set({ tuningPreset: p });
      // persist alongside sliders and boost
      savePrefs(get().sliderValues, get().boostEnabled, p);
      // retrigger detection with new preset
      get().fetchConvergences();
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
      const prev = get().sliderValues;

      // ← récupère exactement ce que renvoie la version verbose
      const { next, evt, autoKey } = applySliderConstraintVerbose(prev, dimension, rawValue);

      set((s) => ({
        sliderValues: next,
        autoAdjustedKey: autoKey,
        autoAdjustSeq: autoKey ? s.autoAdjustSeq + 1 : s.autoAdjustSeq,
        autoAdjust: evt, // ← c’est bien “evt” renvoyé par la fonction verbose
      }));

      savePrefs(next, get().boostEnabled, get().tuningPreset);
      get().fetchConvergences();
    },

    setUserKeywords: (kw) => set({ userKeywords: kw }),

    seedDemoKeywords: () =>
      set({
        userKeywords: {
          passions: ['design', 'ia', 'education'],
          talents: ['design', 'ui', 'ia'],
          utilite: ['impact', 'education', 'design'],
          viabilite: ['design', 'freelance', 'saas'],
        },
      }),

    debouncedDetect: () => {
      if (detectTimer) clearTimeout(detectTimer);
      detectTimer = setTimeout(() => get().fetchConvergences(), 300);
    },

    addKeyword: (dim, kw) => {
      const v = norm(kw);
      if (!v) return;
      set((s) => {
        const cur = s.userKeywords[dim] || [];
        const exists = cur.some((x) => x.toLowerCase() === v.toLowerCase());
        if (exists) return s as any;
        return {
          userKeywords: { ...s.userKeywords, [dim]: [...cur, v] },
          keywordsDirty: true,
        } as any;
      });
      get().debouncedDetect();
    },

    removeKeyword: (dim, kw) => {
      set((s) => ({
        userKeywords: {
          ...s.userKeywords,
          [dim]: (s.userKeywords[dim] || []).filter((x) => x.toLowerCase() !== kw.toLowerCase()),
        },
        keywordsDirty: true,
      }));
      get().debouncedDetect();
    },

    saveKeywords: async (profileId) => {
      if (!profileId) return;
      set({ savingKeywords: true });
      try {
        const res = await fetch('/api/sweet-spot/keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: profileId, keywords: get().userKeywords }),
        });
        const json = await res.json();
        if (!res.ok || json?.ok === false) throw new Error(json?.error || 'save failed');
        set({ keywordsDirty: false, savingKeywords: false });
      } catch (e) {
        console.error(e);
        set({ savingKeywords: false });
      }
    },

    fetchConvergences: async () => {
      const { sliderValues, userKeywords, selectedTags, boostEnabled, tuningPreset } = get();
      set({ isLoading: true });
      try {
        const res = await fetch('/api/sweet-spot/detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weights: sliderValues,
            keywords: userKeywords,
            boostTags: boostEnabled ? selectedTags : [],
            preset: tuningPreset,
          }),
        });
        const data = await res.json();
        set({
          convergences: (data?.convergences ?? []) as Convergence[],
          sweetSpotScore: Number(data?.score ?? 0),
          resultMeta: (data?.meta ?? null) as ResultMeta,
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
      savePrefs(sliders, boostEnabled, 'balanced');
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
        selectedTags: [],
      });

      // 3) Recalcule immédiat
      get().fetchConvergences();
    },
  };
});
