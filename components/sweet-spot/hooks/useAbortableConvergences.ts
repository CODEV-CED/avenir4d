import { useRef, useCallback } from 'react';
import iaService from '@sweet-spot/services/ia-service';
import type { IAOptions, UserProfile } from '@sweet-spot/services/ia-service';
import type { UIConvergence, EngineConvergence } from '@sweet-spot/types/convergences';
import { toUIConvergences } from '@sweet-spot/types/convergences';

export function useAbortableConvergences() {
  const ctrlRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (profile: UserProfile, opts?: IAOptions): Promise<UIConvergence[]> => {
      // Annule l’appel précédent s’il existe
      if (ctrlRef.current) ctrlRef.current.abort();

      const ctrl = new AbortController();
      ctrlRef.current = ctrl;

      try {
        // Le service renvoie des EngineConvergence[]
        const engineConvs: EngineConvergence[] = await iaService.generateConvergences(profile, {
          ...opts,
          signal: ctrl.signal,
        });
        // ➜ on adapte vers UIConvergence[]
        return toUIConvergences(engineConvs);
      } finally {
        // Nettoie le ref si c’est bien le dernier controller
        if (ctrlRef.current === ctrl) ctrlRef.current = null;
      }
    },
    [],
  );

  return run;
}
