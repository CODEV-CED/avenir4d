// components/sweet-spot/hooks/usePerformanceMonitor.ts

import { useEffect, useRef } from 'react';
import { measureSweetSpotPerf } from '@sweet-spot/utils/performance';

export const usePerformanceMonitor = (componentName: string): void => {
  const renderStart = useRef<number>(0);

  useEffect(() => {
    renderStart.current = performance.now();

    return () => {
      measureSweetSpotPerf.measureRenderTime(componentName, renderStart.current);
    };
  });
};
