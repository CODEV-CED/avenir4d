// components/sweet-spot/ui/sections/SlidersSection.tsx

import React, { memo, useCallback } from 'react';

import { useSweetSpot } from '@sweet-spot/hooks';

import { sliderEntries, sliderToneStyles, UI_CLASSES } from '@sweet-spot/constants';

import { uiToEngine } from '@sweet-spot/types';

import { percentToDecimal } from '@sweet-spot/utils';

import { ModeToggle } from '@sweet-spot/ui/components/ModeToggle';

import { usePerformanceMonitor } from '@sweet-spot/hooks/usePerformanceMonitor';

export const SlidersSection = memo(() => {

  usePerformanceMonitor('SlidersSection');

  const { state, uiState, actions } = useSweetSpot();

  // Calculer le score ici aussi

  const scorePct = Math.round(Math.max(0, Math.min(1, state.sweetSpotScore)) * 100);

  const isFirstInteraction = Object.values(state.sliderValues).every((v) => v === 0.5);

  const handleSliderChange = useCallback(

    (key: (typeof sliderEntries)[number]['key'], value: number) => {

      const engineKey = uiToEngine[key];

      actions.setSliderValue(engineKey, percentToDecimal(value));

      actions.setScreenReaderMessage(`${key} ajusté à ${value}%`);

    },

    [actions],

  );

  // Calculer les pourcentages à partir des valeurs 0-1

  const sliderPct = {

    passions: Math.round(state.sliderValues.passions * 100),

    talents: Math.round(state.sliderValues.talents * 100),

    impact: Math.round(state.sliderValues.utilite * 100),

    potentiel: Math.round(state.sliderValues.viabilite * 100),

  };

  return (

    <>

      {/* Header avec mode toggle */}

      <div className="mb-5 flex items-center justify-between">

        <p className={`${UI_CLASSES.SUBTITLE} mb-0`}>

          Donne plus ou moins d'importance à chaque dimension et observe ton profil évoluer.

        </p>

        <ModeToggle

          mode={state.filterMode}

          onChange={actions.setFilterMode}

          isMobile={uiState.isMobile}

        />

      </div>

      {/* Indicateur d'aide si profil par défaut */}

      {isFirstInteraction && (

        <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">

          <p className="flex items-center gap-2 text-sm text-yellow-300">

            <span>💡</span>

            Ajuste les curseurs pour découvrir ton Sweet Spot personnel

          </p>

        </div>

      )}

      {/* Sliders grid */}

      <div

        className={`grid gap-5 ${uiState.isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}

      >

        {sliderEntries.map((entry) => (

          <div

            key={entry.key}

            className={`rounded-xl border border-white/10 bg-black/60 p-4 transition-colors hover:border-white/15 ${

              uiState.isMobile ? 'min-h-[80px]' : ''

            }`}

          >

            <div className="mb-4 flex items-center justify-between">

              <div className="flex items-center gap-2">

                <span className="text-2xl">{entry.emoji}</span>

                <span className="font-semibold capitalize">{entry.label}</span>

              </div>

              <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-black shadow-sm">

                {sliderPct[entry.key]}%

              </span>

            </div>

            <div className="relative flex h-6 items-center">

              {/* Piste grise */}

              <div className="absolute inset-x-0 h-2 rounded-lg bg-gray-800" />

              {/* Remplissage colore (tone) */}

              <div

                className="absolute h-2 rounded-lg transition-all duration-300 ease-out"

                style={{

                  width: `${sliderPct[entry.key]}%`,

                  background: sliderToneStyles[entry.tone].gradient,

                }}

              />

              {/* Handle blanc */}

              <input

                type="range"

                min={0}

                max={100}

                value={sliderPct[entry.key]}

                onChange={(e) => handleSliderChange(entry.key, Number(e.target.value))}

                aria-label={`Ajuster ${entry.label}: ${sliderPct[entry.key]}%`}

                className="slider-custom absolute inset-0 z-10 h-6 w-full cursor-pointer appearance-none bg-transparent"

                style={{ WebkitAppearance: 'none', background: 'transparent' }}

              />

            </div>

          </div>

        ))}

      </div>

      {/* ✅ Styles scoped pour que la poignée soit bien blanche */}

      <style jsx>{`

        /* Neutralise la coloration auto du navigateur */

        input[type='range'].slider-custom {

          accent-color: transparent;

          -webkit-appearance: none;

          appearance: none;

          width: 100%;

          outline: none;

        }

        /* Chrome/Edge/Safari */

        input[type='range'].slider-custom::-webkit-slider-thumb {

          -webkit-appearance: none;

          appearance: none;

          width: 20px;

          height: 20px;

          background: #fff;            /* ✅ THUMB BLANC */

          border-radius: 50%;

          border: 2px solid rgba(0, 0, 0, 0.06);

          box-shadow:

            0 2px 8px rgba(0, 0, 0, 0.35),

            0 0 0 2px rgba(255, 255, 255, 0.9);

          cursor: pointer;

          transition: transform 0.15s ease, box-shadow 0.15s ease;

        }

        input[type='range'].slider-custom::-webkit-slider-thumb:hover { transform: scale(1.06); }

        input[type='range'].slider-custom::-webkit-slider-thumb:active { transform: scale(1.12); }

        /* Firefox */

        input[type='range'].slider-custom::-moz-range-thumb {

          width: 20px;

          height: 20px;

          background: #fff;            /* ✅ THUMB BLANC */

          border-radius: 50%;

          border: 2px solid rgba(0, 0, 0, 0.06);

          box-shadow:

            0 2px 8px rgba(0, 0, 0, 0.35),

            0 0 0 2px rgba(255, 255, 255, 0.9);

          cursor: pointer;

          transition: transform 0.15s ease, box-shadow 0.15s ease;

        }

        input[type='range'].slider-custom::-moz-range-thumb:hover { transform: scale(1.06); }

        input[type='range'].slider-custom::-moz-range-thumb:active { transform: scale(1.12); }

        input[type='range'].slider-custom::-moz-range-track { height: 6px; background: transparent; border: none; }

      `}</style>

    </>

  );

});

SlidersSection.displayName = 'SlidersSection';

