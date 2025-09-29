'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { useSweetSpot } from '@sweet-spot/hooks';
// import { UI_CLASSES } from '@sweet-spot/constants'; // <- pas utilisé, tu peux supprimer
import { useSweetSpotWorker } from '@sweet-spot/hooks/useSweetSpotWorker';
import {
  useSweetSpotConvergencesDebounced,
  DEBOUNCE_PRESETS,
} from '@sweet-spot/hooks/useSweetSpotConvergencesDebounced';
import { useSweetSpotCache } from '@sweet-spot/hooks/useSweetSpotConvergences';

const LOADING_CARDS = Array.from({ length: 3 }).map((_, i) => ({
  id: `loading_${i}`,
  formula: ['…', '…', '…'],
  result: 'Analyse en cours…',
  description: 'Génération de tes convergences personnalisées…',
  example: 'Patiente quelques secondes…',
}));

const SAMPLE_CONVERGENCES = [
  {
    id: 'sample_1',
    formula: ['Design', 'IA', 'Éducation'],
    result: "Coach d'app créatives pour lycéens",
    description:
      "Créer des expériences d'apprentissage visuelles et interactives qui utilisent l'IA.",
    example: "Développe une app qui aide les lycéens à créer leur portfolio numérique avec l'IA.",
  },
  {
    id: 'sample_2',
    formula: ['Écologie', 'Tech', 'Social'],
    result: 'Innovateur impact environnemental',
    description: 'Développer des solutions tech pour mobiliser des communautés autour du climat.',
    example: 'Plateforme collaborative pour les initiatives écologiques locales.',
  },
  {
    id: 'sample_3',
    formula: ['Gaming', 'Psycho', 'Impact'],
    result: 'Game designer thérapeutique',
    description: 'Concevoir des jeux qui aident à développer des compétences émotionnelles.',
    example: 'Serious games pour la gestion du stress.',
  },
] as const;

export default function ConvergencesSection() {
  const { state } = useSweetSpot();

  // Worker local (fallback/boost UI)
  const {
    supported: wSupported,
    busy: wBusy,
    data: wData,
  } = useSweetSpotWorker(
    state.sliderValues,
    state.userKeywords,
    state.selectedTags,
    state.filterMode,
    true,
  );

  // Cache helpers (warmup + métriques)
  const { warmupCache, getCacheSize } = useSweetSpotCache();
  useEffect(() => {
    warmupCache();
  }, [warmupCache]);

  // Hook réseau debouncé
  const {
    convergences,
    analysis,
    isLoading,
    isFetching,
    isEmpty,
    hasError,
    error,
    refetch,
    prefetchProjects,
    isAnyStabilizing,
    isStabilizing,
  } = useSweetSpotConvergencesDebounced(
    state.sliderValues,
    state.userKeywords,
    state.selectedTags,
    state.sweetSpotScore,
    state.filterMode,
    {
      ...DEBOUNCE_PRESETS.DESKTOP,
      onStable: () => {
        try {
          const dataStr = JSON.stringify({ state });
          if (dataStr.length <= 2_000_000) {
            localStorage.setItem('sweetspot-state', dataStr);
          } else {
            console.warn('État trop volumineux pour localStorage');
          }
        } catch (e: unknown) {
          // @ts-expect-error DOMException typage variable selon env
          if (e?.name === 'QuotaExceededError') {
            console.error('Quota localStorage dépassé');
          }
        }
      },
    },
  );

  // Items à afficher (priorise résultat serveur, fallback worker, puis samples)
  const items = useMemo(() => {
    if (isLoading) return wData?.convergences || LOADING_CARDS;
    if (hasError) {
      console.error('Erreur convergences:', error);
      return SAMPLE_CONVERGENCES;
    }
    return convergences.length > 0 ? convergences : wData?.convergences || SAMPLE_CONVERGENCES;
  }, [isLoading, hasError, error, convergences, wData]);

  // Prefetch auto si profil "chaud"
  useEffect(() => {
    if ((state.sweetSpotScore ?? 0) > 0.7 && convergences.length > 0) {
      prefetchProjects();
    }
  }, [state.sweetSpotScore, convergences.length, prefetchProjects]);

  // Export JSON (état + convergences)
  const exportData = useCallback(() => {
    try {
      const dataStr = JSON.stringify({ state, convergences }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sweetspot-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export JSON échoué', e);
    }
  }, [state, convergences]);

  return (
    <div className="relative">
      {/* Badge mode + bannière de stabilisation + métriques dev */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs text-white/80">
          Mode optimisé
        </span>

        {isAnyStabilizing && (
          <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-400">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
            Mise à jour
            {isStabilizing.sliders && ' des curseurs'}
            {isStabilizing.keywords && ' des mots-clés'}
            {isStabilizing.tags && ' des tags'}
            {isStabilizing.score && ' du score'}
            {isStabilizing.mode && ' du mode'}…
          </div>
        )}

        {process.env.NODE_ENV === 'development' && (
          <span className="ml-auto text-xs text-white/40">Cache: {getCacheSize()} requêtes</span>
        )}
      </div>

      {/* Empty / Errors */}
      {isEmpty && (
        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
          Aucun résultat pour l&apos;instant — ajoute des mots-clés ou ajuste les curseurs.
        </div>
      )}
      {hasError && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          Oups. Une erreur est survenue.
          <button
            onClick={() => refetch()}
            className="ml-2 rounded border border-red-400/40 px-2 py-0.5 text-xs hover:bg-red-500/10"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Grid convergences */}
      <div className="convergences-grid grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((conv, i) => (
          <div
            key={conv.id}
            className={`convergence-card animate-fadeInUp rounded-xl border border-white/10 bg-black/80 p-5 ${
              isLoading ? 'animate-pulse' : ''
            }`}
            style={{ animationDelay: `${i * 60}ms` }} // petit stagger plus léger
          >
            <div className="mb-2 text-xs text-white/50">
              {Array.isArray(conv.formula) ? conv.formula.join(' + ') : '…'}
            </div>
            <div className="mb-1 text-lg font-semibold">{conv.result}</div>
            <div className="mb-2 text-sm text-white/80">{conv.description}</div>
            <div className="text-xs text-white/50">Exemple : {conv.example}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={prefetchProjects}
          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm hover:bg-white/20 disabled:opacity-40"
          disabled={isLoading || convergences.length === 0}
        >
          Préparer les projets
        </button>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm hover:bg-white/20 disabled:opacity-40"
          disabled={isLoading}
        >
          <RotateCcw className="h-4 w-4" />
          Régénérer
        </button>
        <button
          onClick={exportData}
          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
          title="Exporter l'état + les convergences en JSON"
        >
          Exporter JSON
        </button>
        {isFetching && !isLoading && (
          <span className="text-xs text-white/40">Mise à jour en cours…</span>
        )}
      </div>

      {/* Analyse (optionnel) */}
      {analysis && (
        <div className="mt-6 text-xs text-white/50">
          Force: {analysis.strongestDimension} • Faiblesse: {analysis.weakestDimension} • Balance:{' '}
          {analysis.balance}
        </div>
      )}

      {!!wData?.isEureka && (
        <span className="mt-3 inline-block rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300">
          ✨ Eureka local: {Math.round((wData.sweetSpotScore ?? 0) * 100)}%
        </span>
      )}
    </div>
  );
}
