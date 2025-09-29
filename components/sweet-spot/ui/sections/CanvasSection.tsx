// components/sweet-spot/ui/sections/CanvasSection.tsx

import React, { memo, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useSweetSpot, useDebounce } from '@sweet-spot/hooks';
import { UI_CLASSES, SWEETSPOT_CONFIG } from '@sweet-spot/constants';
import { isEurekaScore } from '@sweet-spot/utils';
import { CanvasLoader } from '@sweet-spot/ui/shared/LoadingSpinner';

// Chargement dynamique du canvas pour optimiser les perfs
const IkigaiCanvas = dynamic(
  () => import('@sweet-spot/ui/components/IkigaiCanvas').then((mod) => mod.IkigaiCanvas),
  {
    loading: () => <CanvasLoader />,
    ssr: false,
  },
);

export const CanvasSection = memo(() => {
  const { state, uiState } = useSweetSpot();

  const isMobile = uiState.isMobile;
  const canvasQuality = isMobile
    ? { filter: 'blur(0.2px)', opacity: 0.7 as number, mixBlendMode: 'normal' as const }
    : { filter: 'blur(0.4px)', opacity: 0.85 as number, mixBlendMode: 'screen' as const };

  // Debounce les valeurs pour éviter trop de re-renders
  const debouncedSliders = useDebounce(
    state.sliderValues,
    SWEETSPOT_CONFIG.ANIMATIONS.DEBOUNCE_DELAY,
  );

  // Calcul des pourcentages
  const sliderPct = useMemo(
    () => ({
      passions: Math.round(debouncedSliders.passions * 100),
      talents: Math.round(debouncedSliders.talents * 100),
      impact: Math.round(debouncedSliders.utilite * 100),
      potentiel: Math.round(debouncedSliders.viabilite * 100),
    }),
    [debouncedSliders],
  );

  const scorePct = Math.round(Math.max(0, Math.min(1, state.sweetSpotScore)) * 100);
  const isEureka = isEurekaScore(state.sweetSpotScore);

  return (
    <>
      <p className={`${UI_CLASSES.SUBTITLE} mb-8`}>
        Là où les cercles se superposent, ton Sweet Spot apparaît. Plus le score est élevé, plus tu
        es proche de ton équilibre idéal.
      </p>

      <IkigaiCanvas
        sliderPct={sliderPct}
        state={state}
        isEureka={isEureka}
        scorePct={scorePct}
        isMobile={uiState.isMobile}
        canvasQuality={canvasQuality}
      />
    </>
  );
});

CanvasSection.displayName = 'CanvasSection';

export default CanvasSection;
