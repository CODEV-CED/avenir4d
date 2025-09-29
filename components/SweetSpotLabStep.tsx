'use client';

import { useEffect, useRef } from 'react';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';
import DimensionSlider from '@/components/DimensionSlider';
import IkigaiLegend, { DIM_META } from '@/components/IkigaiLegend';
import { TooltipProvider } from '@/components/UI/tooltip';
import IkigaiCanvas from '@/components/IkigaiCanvas';
import { Button } from '@/components/UI/button';
import KeywordEditor from '@/components/KeywordEditor';
import TagBoostBar from '@/components/TagBoostBar';
import { H2 } from '@/components/UI/Typography';

export default function SweetSpotLabStep({ profileId }: { profileId?: string }) {
  const {
    convergences,
    sweetSpotScore,
    isLoading,
    sliderValues,
    autoAdjustedKey,
    autoAdjustSeq,
    setSliderValue,
    resultMeta,
    tuningPreset,
    setTuningPreset,
    filterMode,
    setFilterMode,
    resetAllPrefs,
  } = useSweetSpotStore();

  const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

  // 1) first fetch
  useEffect(() => {
    if (isTest) return;
    // ensure we don't return any value from the effect (in case fetchConvergences returns something)
    void useSweetSpotStore.getState().fetchConvergences();
  }, [isTest]);

  // 2) debounce on sliders
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (isTest) return;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    // avoid returning any value from the timeout callback
    debounceRef.current = setTimeout(
      () => void useSweetSpotStore.getState().fetchConvergences(),
      250,
    );
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [
    sliderValues.passions,
    sliderValues.talents,
    sliderValues.utilite,
    sliderValues.viabilite,
    isTest,
  ]);

  const scorePct = Math.round(Math.max(0, Math.min(1, sweetSpotScore)) * 100);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      {/* En-tête */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <H2 className="text-2xl font-semibold">🎯 Sweet Spot Lab</H2>
        {resultMeta?.usedBaseline && (
          <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-300 ring-1 ring-amber-300/30">
            Baseline active
          </span>
        )}
        <div className="ml-auto flex items-center gap-2 text-xs text-white/70">
          <span className="hidden sm:inline">Preset</span>
          <select
            className="rounded border border-white/15 bg-black/20 px-2 py-1 text-xs"
            value={tuningPreset}
            onChange={(e) => setTuningPreset((e.target.value as any) || 'balanced')}
          >
            <option value="lax">Lax</option>
            <option value="balanced">Balanced</option>
            <option value="strict">Strict</option>
          </select>
        </div>
      </div>

      {/* Barre résumé Sweet Spot */}
      <div className="card -mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-sm tracking-wide text-slate-400 uppercase">Sweet Spot</span>
            <span className="text-xl font-semibold">{scorePct}%</span>
            {resultMeta && (
              <span className="text-xs text-slate-400">
                tri {resultMeta.overlaps.x3} • quad {resultMeta.overlaps.x4}
              </span>
            )}
          </div>
          <div className="h-2 w-40 overflow-hidden rounded bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-300 via-emerald-400 to-cyan-400"
              style={{ width: `${scorePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Intro */}
      <div className="card text-sm text-white/80">
        <p>
          Calibrez vos 4 dimensions et visualisez en temps réel l&apos;intersection qui constitue
          votre Sweet Spot.
        </p>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/70">
          <li>• Réglez Passions, Talents, Utilité, Viabilité</li>
          <li>• Filtrez via la légende (Union/Intersection)</li>
          <li>• Moment « Eurêka » si le score dépasse 70%</li>
        </ul>
      </div>

      {/* 1) Sliders sous l'intro */}
      <div className="card">
        <h3 className="section-title">🧭 Ajustez vos priorités</h3>
        <p className="section-sub">Contraintes : Viabilité ≥ 15% • Écart ≤ 40%</p>
        <DimensionSlider
          label="Passions"
          value={sliderValues.passions}
          onChange={(v) => setSliderValue('passions', v)}
          bulletColorClass={DIM_META.passions.color}
          pulse={autoAdjustedKey === 'passions' && !!autoAdjustSeq}
        />
        <DimensionSlider
          label="Talents"
          value={sliderValues.talents}
          onChange={(v) => setSliderValue('talents', v)}
          bulletColorClass={DIM_META.talents.color}
          pulse={autoAdjustedKey === 'talents' && !!autoAdjustSeq}
        />
        <DimensionSlider
          label="Utilité"
          value={sliderValues.utilite}
          onChange={(v) => setSliderValue('utilite', v)}
          bulletColorClass={DIM_META.utilite.color}
          pulse={autoAdjustedKey === 'utilite' && !!autoAdjustSeq}
        />
        <DimensionSlider
          label="Viabilité"
          value={sliderValues.viabilite}
          min={0.15}
          onChange={(v) => setSliderValue('viabilite', v)}
          bulletColorClass={DIM_META.viabilite.color}
          pulse={autoAdjustedKey === 'viabilite' && !!autoAdjustSeq}
        />
      </div>

      {/* 2) Canvas plein format */}
      <div className="card flex items-center justify-center">
        <IkigaiCanvas size={720} />
      </div>

      {/* 3) Toolbar unique (puces + Union/Intersection + Reset) */}
      <TooltipProvider delayDuration={150}>
        <div className="card flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3 overflow-x-auto">
            <IkigaiLegend />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setFilterMode('union')}
              aria-pressed={filterMode === 'union'}
              className={`rounded-md border px-2 py-1 text-xs transition ${
                filterMode === 'union'
                  ? 'border-white/30 bg-white/10 text-white'
                  : 'border-white/15 text-slate-200 hover:bg-white/5'
              }`}
            >
              Union
            </button>
            <button
              onClick={() => setFilterMode('intersection')}
              aria-pressed={filterMode === 'intersection'}
              className={`rounded-md border px-2 py-1 text-xs transition ${
                filterMode === 'intersection'
                  ? 'border-white/30 bg-white/10 text-white'
                  : 'border-white/15 text-slate-200 hover:bg-white/5'
              }`}
            >
              Intersection
            </button>
            <Button variant="outline" size="sm" onClick={resetAllPrefs} title="Réinitialiser tout">
              Réinitialiser
            </Button>
          </div>
        </div>
      </TooltipProvider>

      {/* 4) Mots-clés ⬄ Boost par tags alignés */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-7 lg:col-span-8">
          <div className="card h-full">
            <h3 className="section-title">📝 Mots-clés par dimension</h3>
            {!isTest && <KeywordEditor profileId={profileId} />}
          </div>
        </div>
        <div className="md:col-span-5 lg:col-span-4">
          <div className="card h-full">
            {/* card-ghost avoids a second inner border */}
            {!isTest && <TagBoostBar className="card-ghost" />}
          </div>
        </div>
      </div>

      {/* 5) Convergences */}
      {isLoading ? (
        <div className="card">🔄 Analyse en cours…</div>
      ) : (
        <div className="card">
          <h3 className="section-title">🔎 Convergences détectées</h3>
          <ul className="mt-3 space-y-2">
            {convergences.map((c, i) => (
              <li
                key={`${c.keyword}-${i}`}
                className="flex items-start justify-between gap-2 rounded-lg border border-white/10 p-3"
              >
                <div className="flex-1">
                  <div className="font-medium">{c.keyword}</div>
                  <div className="text-sm text-gray-400">
                    Présent dans : {c.matchedDimensions.join(', ')}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs text-slate-200">
                    {Math.round(c.strength * 100)}%
                  </span>
                  {c.boosted && (
                    <span
                      className="rounded-full bg-emerald-600 px-2 py-1 text-[10px] text-white"
                      title={
                        c.boostedBy?.length
                          ? `Boosté par : ${c.boostedBy.join(', ')}`
                          : 'Boosté par vos tags'
                      }
                    >
                      Boosté
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {/* Légende rapide */}
          <p className="mt-3 text-xs text-white/60">
            Astuce : désactivez le "Boost par tags" pour comparer l'impact de vos tags sur le score.
          </p>
        </div>
      )}
    </div>
  );
}
