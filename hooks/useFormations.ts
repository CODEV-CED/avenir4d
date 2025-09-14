// hooks/useFormations.ts
'use client';
import { useEffect, useState } from 'react';
import type { FormationStatic } from '@/types/formation';
import {
  loadFormationsCache,
  saveFormationsCache,
  invalidateFormationsCache,
} from '@/lib/formations-cache';

export function useFormations() {
  const [all, setAll] = useState<FormationStatic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abort = new AbortController();

    async function run() {
      try {
        const cached = loadFormationsCache<FormationStatic[]>();
        if (cached && !abort.signal.aborted) {
          setAll(cached);
          setLoading(false);
        }

        const res = await fetch('/data/formations.json?v=2', {
          cache: 'no-store',
          signal: abort.signal,
        });
        if (!res.ok) throw new Error('fetch formations failed');
        const fresh = (await res.json()) as FormationStatic[];

        if (!abort.signal.aborted) {
          setAll(fresh);
          setLoading(false);
          saveFormationsCache(fresh);
        }
      } catch (e: any) {
        if (!abort.signal.aborted) {
          setError(e?.message ?? 'Erreur inconnue');
          setLoading(false);
        }
      }
    }

    run();
    return () => abort.abort();
  }, []);

  return {
    all,
    loading,
    error,
    refresh: () => {
      invalidateFormationsCache();
      window.location.reload();
    },
  };
}
