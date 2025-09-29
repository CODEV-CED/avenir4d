// components/sweet-spot/hooks/useSweetSpot.ts

import { useContext } from 'react';
import { SweetSpotContext } from '@sweet-spot/state/SweetSpotProvider';

export const useSweetSpot = () => {
  const context = useContext(SweetSpotContext);

  if (!context) {
    throw new Error('useSweetSpot must be used within a SweetSpotProvider');
  }

  return context;
};
