// components/sweet-spot/index.tsx
'use client';

import React, { useEffect } from 'react';
import { SweetSpotProvider } from '@sweet-spot/state/SweetSpotProvider';
import { ErrorBoundary } from './ui/shared/ErrorBoundary';
import SweetSpotLabTeen from './SweetSpotLabTeen';
import { measureSweetSpotPerf } from './utils/performance';
// ❌ Ne pas importer de global CSS ici, fais-le via app/globals.css
// import '@sweet-spot/styles/animations.css';

export default function SweetSpot() {
  // Initialiser les métriques de performance (client only)
  useEffect(() => {
    try {
      measureSweetSpotPerf?.init?.();
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('measureSweetSpotPerf init skipped:', e);
      }
    }
  }, []);

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // En prod : envoie vers ton outil de monitoring (Sentry, etc.)
    if (process.env.NODE_ENV === 'production') {
      console.error('SweetSpot Error:', error, errorInfo);
    }
  };

  return (
    <ErrorBoundary onError={handleError}>
      <SweetSpotProvider>
        <SweetSpotLabTeen />
      </SweetSpotProvider>
    </ErrorBoundary>
  );
}

// Re-exports utiles
export { SweetSpotProvider } from './state/SweetSpotProvider';
export { ErrorBoundary } from './ui/shared/ErrorBoundary';

// Types (vérifie que ces noms existent bien dans ./types/index.ts)
export type {
  UIKey,
  DimKey,
  TabKey,
  SliderValues,
  UserKeywords,
  FilterMode,
  UIConvergence,
  EngineConvergence,
  SweetSpotState,
  UIState,
  UIContextState,
  PersistedData,
} from './types';

// Hooks
export { useLocalStorage, useDebounce, useSweetSpot } from './hooks';

// UI
export { Card } from './ui/shared/Card';
export { CanvasLoader, ConvergencesLoader } from './ui/shared/LoadingSpinner';

// Constantes (⚠ vérifie que ces symboles existent bien)
export {
  SWEETSPOT_CONFIG /*, ONBOARDING_STEPS, SAMPLE_CONVERGENCES, TAG_POOL*/,
} from './constants';
