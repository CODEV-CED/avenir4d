'use client';
import { useEffect, useRef, useState } from 'react';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';
import DimensionSlider from '@/components/DimensionSlider';
import EurekaFX from '@/components/EurekaFX';
import AutoAdjustBanner from '@/components/AutoAdjustBanner';
import IkigaiLegend from '@/components/IkigaiLegend';
import { TooltipProvider } from '@/components/UI/tooltip';
import IkigaiCanvas from '@/components/IkigaiCanvas';

export default function SweetSpotLabStep() {
  const {
    convergences,
    sweetSpotScore,
    isLoading,
    sliderValues,
    autoAdjustedKey,
    autoAdjustSeq,
    setSliderValue,
    fetchConvergences,
    // ✅ récupère le toggle
    boostEnabled,
    setBoostEnabled,
  } = useSweetSpotStore();

  useEffect(() => {
    fetchConvergences();
  }, [fetchConvergences]);

  // Debounce sliders (inchangé)
  const tRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(() => fetchConvergences(), 250);
    return () => {
      if (tRef.current) clearTimeout(tRef.current);
    };
  }, [
    sliderValues.passions,
    sliderValues.talents,
    sliderValues.utilite,
    sliderValues.viabilite,
    fetchConvergences,
  ]);

  const isEureka = sweetSpotScore > 0.7;
  // Replay animation on rising edge
  const [eurekaSeq, setEurekaSeq] = useState(0);
  const prevEurekaRef = useRef<boolean>(false);
  useEffect(() => {
    if (!prevEurekaRef.current && isEureka) setEurekaSeq((n) => n + 1);
    prevEurekaRef.current = isEureka;
  }, [isEureka]);

  return (
    <div className="p-6">
      <AutoAdjustBanner />
      <h2 className="mb-4 text-xl font-bold">🎯 Sweet Spot Lab</h2>

      {/* ✅ Toggle Boost */}
      <div className="mb-4 flex items-center justify-between rounded border p-3">
        <div>
          <div className="font-medium">Boost par tags</div>
          <div className="text-xs text-gray-600">
            Augmente la force des mots-clés présents dans vos tags sélectionnés.
          </div>
        </div>
        <label className="inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={boostEnabled}
            onChange={(e) => {
              setBoostEnabled(e.target.checked);
              fetchConvergences();
            }} // ✅ recalcul immédiat
          />
          <span className="mr-2 text-xs text-gray-600">{boostEnabled ? 'ON' : 'OFF'}</span>
          <div className="relative h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-emerald-500">
            <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
          </div>
        </label>
      </div>

      {/* Sliders with auto-adjust pulse */}
      <div className="mb-6 rounded bg-gray-100 p-4">
        <h3 className="mb-3 font-semibold">🧭 Ajustez vos priorités :</h3>
        <DimensionSlider
          label="Passions"
          value={sliderValues.passions}
          onChange={(v) => setSliderValue('passions', v)}
          pulse={autoAdjustedKey === 'passions' && !!autoAdjustSeq}
        />
        <DimensionSlider
          label="Talents"
          value={sliderValues.talents}
          onChange={(v) => setSliderValue('talents', v)}
          pulse={autoAdjustedKey === 'talents' && !!autoAdjustSeq}
        />
        <DimensionSlider
          label="Utilité"
          value={sliderValues.utilite}
          onChange={(v) => setSliderValue('utilite', v)}
          pulse={autoAdjustedKey === 'utilite' && !!autoAdjustSeq}
        />
        <DimensionSlider
          label="Viabilité"
          value={sliderValues.viabilite}
          min={0.15}
          onChange={(v) => setSliderValue('viabilite', v)}
          pulse={autoAdjustedKey === 'viabilite' && !!autoAdjustSeq}
        />
      </div>

      {/* Légende + Canvas */}
      <TooltipProvider delayDuration={150}>
        <IkigaiLegend className="mb-1" />
        <p className="mb-3 text-xs text-gray-500">
          Cliquez pour filtrer. Réinitialiser pour tout afficher.
        </p>
        <IkigaiCanvas />
      </TooltipProvider>

      {isLoading ? (
        <p>🔄 Analyse en cours…</p>
      ) : (
        <div className="relative">
          {/* overlay anchor */}
          <div className="mt-2 text-lg">
            ✅ <strong>Sweet Spot Score :</strong> {Math.round(sweetSpotScore * 100)}%
          </div>

          <EurekaFX key={eurekaSeq} show={isEureka} count={22} radius={112} />

          {isEureka && (
            <div className="animate-in fade-in-50 mt-3 rounded bg-yellow-100 p-3 text-center duration-300">
              ✨ <strong>Moment Eureka :</strong> convergence puissante !
            </div>
          )}

          <h3 className="mt-6 font-semibold">🔎 Convergences détectées</h3>
          <ul className="mt-2 space-y-2">
            {convergences.map((c, i) => (
              <li
                key={`${c.keyword}-${i}`}
                className="flex items-start justify-between gap-2 rounded border p-3"
              >
                <div className="flex-1">
                  <div className="font-medium">{c.keyword}</div>
                  <div className="text-sm text-gray-600">
                    Présent dans : {c.matchedDimensions.join(', ')} — Force{' '}
                    {Math.round(c.strength * 100)}%
                  </div>
                </div>

                {/* ✅ Badge + tooltip natif (title) */}
                {c.boosted && (
                  <span
                    className="shrink-0 rounded-full bg-emerald-600 px-2 py-1 text-xs text-white"
                    title={
                      c.boostedBy?.length
                        ? `Boosté par vos tags : ${c.boostedBy.join(', ')}`
                        : 'Boosté par vos tags'
                    }
                  >
                    Boosté
                  </span>
                )}
              </li>
            ))}
          </ul>

          {/* ✅ Légende rapide */}
          <p className="mt-3 text-xs text-gray-500">
            Astuce : désactivez le “Boost par tags” pour comparer l’impact de vos tags sur le score.
          </p>
        </div>
      )}
    </div>
  );
}
