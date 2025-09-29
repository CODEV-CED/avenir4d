// hooks/useSweetSpotConvergencesDebounced.ts

import { useEffect, useState, useRef, useDeferredValue, useMemo } from 'react';
import { useSweetSpotConvergences } from './useSweetSpotConvergences';
import { arrayEqual, shallowEqual } from './__utils__/equality';
import { useDebouncedValue } from './__utils__/useDebouncedValue';

type DimKey = 'passions' | 'talents' | 'utilite' | 'viabilite';
type SliderValues = Record<DimKey, number>;
type UserKeywords = Record<DimKey, string[]>;

// ============= OPTIONS DE DEBOUNCE =============
/**
 * Options granulaires pour contrôler le debounce de chaque type de données
 */
type DebounceOptions = {
  /** Délai pour les sliders (défaut: 300ms) */
  slidersMs?: number;
  /** Délai pour les keywords (défaut: 150ms - plus rapide pour le feedback) */
  keywordsMs?: number;
  /** Délai pour les tags (défaut: 300ms) */
  tagsMs?: number;
  /** Délai pour le score (défaut: 300ms) */
  scoreMs?: number;
  /** Si true, le mode n'est pas debounced (défaut: true car changement intentionnel) */
  modeImmediate?: boolean;
  /** Si true, utilise useDeferredValue pour les sliders (React 18+) */
  useDeferredForSliders?: boolean;
  /** Callback appelé quand toutes les valeurs sont stabilisées */
  onStable?: () => void;
};

const DEFAULT_OPTIONS: Required<Omit<DebounceOptions, 'onStable'>> = {
  slidersMs: 300,
  keywordsMs: 150,
  tagsMs: 300,
  scoreMs: 300,
  modeImmediate: true,
  useDeferredForSliders: false,
};

// ============= HOOK PRINCIPAL AVEC DEBOUNCE =============
/**
 * Hook wrapper avec debounce configurable pour éviter les appels réseau excessifs
 * Retourne également les valeurs debouncées pour afficher un état "stabilizing" si nécessaire
 */
export const useSweetSpotConvergencesDebounced = (
  sliderValues: SliderValues,
  userKeywords: UserKeywords,
  selectedTags: string[],
  sweetSpotScore: number,
  filterMode: 'union' | 'intersection',
  options: DebounceOptions = {},
) => {
  // Merge avec les options par défaut - mémoïsé pour éviter les recréations
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);

  // Debounce de chaque valeur avec le hook réutilisable
  const debouncedSliders = opts.useDeferredForSliders
    ? useDeferredValue(sliderValues) // React 18 deferred pour sliders fluides
    : useDebouncedValue(sliderValues, opts.slidersMs);

  const debouncedKeywords = useDebouncedValue(userKeywords, opts.keywordsMs);
  const debouncedTags = useDebouncedValue(selectedTags, opts.tagsMs);
  const debouncedScore = useDebouncedValue(sweetSpotScore, opts.scoreMs);

  // Le mode est souvent immédiat car c'est un changement intentionnel de l'utilisateur
  const debouncedMode = opts.modeImmediate ? filterMode : useDebouncedValue(filterMode, 100);

  // États pour détecter si on est en cours de stabilisation - mémoïsé pour performance
  const isStabilizing = useMemo(
    () => ({
      sliders: !shallowEqual(sliderValues, debouncedSliders),
      keywords: !shallowEqual(userKeywords, debouncedKeywords),
      tags: !arrayEqual(selectedTags, debouncedTags),
      score: sweetSpotScore !== debouncedScore,
      mode: filterMode !== debouncedMode,
    }),
    [
      sliderValues,
      debouncedSliders,
      userKeywords,
      debouncedKeywords,
      selectedTags,
      debouncedTags,
      sweetSpotScore,
      debouncedScore,
      filterMode,
      debouncedMode,
    ],
  );

  const isAnyStabilizing = useMemo(
    () => Object.values(isStabilizing).some(Boolean),
    [isStabilizing],
  );

  // Flag pour savoir si le debounce est actif
  const isDebounceActive = useMemo(
    () =>
      opts.slidersMs > 0 ||
      opts.keywordsMs > 0 ||
      opts.tagsMs > 0 ||
      opts.scoreMs > 0 ||
      !opts.modeImmediate ||
      opts.useDeferredForSliders,
    [opts],
  );

  // Callback onStable quand tout est stabilisé
  const prevStabilizingRef = useRef(isAnyStabilizing);
  useEffect(() => {
    // Détecte la transition de "stabilizing" vers "stable"
    if (prevStabilizingRef.current && !isAnyStabilizing) {
      opts.onStable?.();
    }
    prevStabilizingRef.current = isAnyStabilizing;
  }, [isAnyStabilizing, opts.onStable]);

  // Utiliser le hook principal avec les valeurs debouncées
  const queryResult = useSweetSpotConvergences(
    debouncedSliders,
    debouncedKeywords,
    debouncedTags,
    debouncedScore,
    debouncedMode,
  );

  // Retourner les résultats avec les états de stabilisation
  return {
    ...queryResult,
    // Valeurs debouncées exposées (utile pour debug ou UI)
    debouncedValues: {
      sliders: debouncedSliders,
      keywords: debouncedKeywords,
      tags: debouncedTags,
      score: debouncedScore,
      mode: debouncedMode,
    },
    // États de stabilisation
    isStabilizing,
    isAnyStabilizing,
    // Flag pour savoir si le debounce est actif
    isDebounceActive,
  };
};

// ============= HOOK SIMPLIFIÉ AVEC DEBOUNCE GLOBAL =============
/**
 * Version simple avec un seul délai pour toutes les props
 * Plus simple mais moins granulaire
 */
export const useSweetSpotConvergencesSimpleDebounced = (
  sliderValues: SliderValues,
  userKeywords: UserKeywords,
  selectedTags: string[],
  sweetSpotScore: number,
  filterMode: 'union' | 'intersection',
  debounceMs: number = 400,
) => {
  // Debounce global de toutes les props ensemble
  const debouncedProps = useDebouncedValue(
    {
      sliderValues,
      userKeywords,
      selectedTags,
      sweetSpotScore,
      filterMode,
    },
    debounceMs,
  );

  // Comparaison légère pour détecter la stabilisation
  const isStabilizing =
    !shallowEqual(sliderValues, debouncedProps.sliderValues) ||
    !shallowEqual(userKeywords, debouncedProps.userKeywords) ||
    !arrayEqual(selectedTags, debouncedProps.selectedTags) ||
    sweetSpotScore !== debouncedProps.sweetSpotScore ||
    filterMode !== debouncedProps.filterMode;

  const queryResult = useSweetSpotConvergences(
    debouncedProps.sliderValues,
    debouncedProps.userKeywords,
    debouncedProps.selectedTags,
    debouncedProps.sweetSpotScore,
    debouncedProps.filterMode,
  );

  return {
    ...queryResult,
    debouncedValues: debouncedProps,
    isStabilizing,
  };
};

// ============= PRESETS DE CONFIGURATION =============
/**
 * Configurations recommandées pour différents cas d'usage
 */
export const DEBOUNCE_PRESETS = {
  /** Configuration fluide pour desktop */
  DESKTOP: {
    slidersMs: 250,
    keywordsMs: 100,
    tagsMs: 250,
    scoreMs: 250,
    modeImmediate: true,
  },

  /** Configuration pour mobile (plus de latence acceptable) */
  MOBILE: {
    slidersMs: 500,
    keywordsMs: 200,
    tagsMs: 500,
    scoreMs: 500,
    modeImmediate: true,
  },

  /** Configuration agressive pour connexions lentes */
  SLOW_CONNECTION: {
    slidersMs: 800,
    keywordsMs: 400,
    tagsMs: 800,
    scoreMs: 800,
    modeImmediate: true,
  },

  /** Configuration React 18 avec deferred values */
  REACT_18_OPTIMIZED: {
    slidersMs: 0, // Pas utilisé car useDeferredForSliders
    keywordsMs: 100,
    tagsMs: 300,
    scoreMs: 300,
    modeImmediate: true,
    useDeferredForSliders: true,
  },

  /** Mode développement - instantané pour debug */
  DEVELOPMENT: {
    slidersMs: 0,
    keywordsMs: 0,
    tagsMs: 0,
    scoreMs: 0,
    modeImmediate: true,
  },
} as const satisfies Record<string, DebounceOptions>;

// ============= EXEMPLE D'UTILISATION =============
/**
 * Exemple d'utilisation dans un composant:
 *
 * ```tsx
 * // Mémoïser onStable pour éviter les déclenchements fantômes
 * const handleStable = useCallback(() => {
 *   console.log('Valeurs stabilisées !');
 *   trackEvent('sweetspot_stable', { score: sweetSpotScore });
 * }, [sweetSpotScore]);
 *
 * const sweetSpot = useSweetSpotConvergencesDebounced(
 *   sliderValues,
 *   userKeywords,
 *   selectedTags,
 *   sweetSpotScore,
 *   filterMode,
 *   {
 *     ...DEBOUNCE_PRESETS.DESKTOP,
 *     onStable: handleStable
 *   }
 * );
 *
 * // Afficher si le debounce est actif
 * {sweetSpot.isDebounceActive && sweetSpot.isAnyStabilizing && (
 *   <span className="text-xs text-yellow-400">
 *     Mise à jour en cours...
 *   </span>
 * )}
 *
 * // Mode instantané (pas de debounce)
 * {!sweetSpot.isDebounceActive && (
 *   <Badge variant="success">Mode temps réel</Badge>
 * )}
 * ```
 *
 * Note sur useDeferredValue:
 * - Il diffère le RENDU mais pas le calcul
 * - Dans notre flux, c'est parfait car on passe la valeur différée au hook de fetch
 * - React Query reçoit donc moins de changements de clé → moins de fetches
 * - Combinaison idéale : useDeferredValue (sliders) + debounce classique (keywords)
 */
