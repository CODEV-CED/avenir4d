// components/sweet-spot/utils/performance.ts
// VERSION SANS DÉPENDANCES EXTERNES

export const measureSweetSpotPerf = {
  init: () => {
    if (typeof window !== 'undefined') {
      console.log('Performance monitoring initialized');
    }
  },

  measureRenderTime: (componentName: string, startTime: number) => {
    if (typeof window !== 'undefined') {
      const duration = performance.now() - startTime;
      if (duration > 16) {
        console.warn(`⚠️ ${componentName} render took ${duration.toFixed(2)}ms`);
      }
    }
  },

  measureFCP: () => {
    // Placeholder pour l'instant
  },

  measureTTI: () => {
    // Placeholder pour l'instant
  },
};

export const sweetSpotAnalytics = {
  trackPerformance: (name: string, value: number) => {
    if (typeof window !== 'undefined') {
      console.log(`[Performance] ${name}: ${value}`);
    }
  },
};
