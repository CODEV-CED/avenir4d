// hooks/usePostPaymentAutoplay.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAccessStore } from '@/store/useAccessStore';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';
import { EMERGING_CAREERS_BATCH3 } from '@/data/emerging-careers-batch3';

export function usePostPaymentAutoplay() {
  const sp = useSearchParams();
  const { isPremium } = useAccessStore();
  const { generatedProjects, isGeneratingProjects, generateProjects } = useSweetSpotStore();
  const hasRun = useRef(false);

  useEffect(() => {
    // Ne déclencher qu'une seule fois
    if (hasRun.current) return;

    // Attendre que l'utilisateur soit premium
    if (!isPremium) return;

    // Vérifier si on a déjà des projets
    const alreadyHave = Array.isArray(generatedProjects) && generatedProjects.length > 0;
    const busy = !!isGeneratingProjects;

    // Priorité 1: URL ?genSeed=
    // Priorité 2: localStorage.a4d.pendingSeed
    // Priorité 3: Fallback premier métier
    const seedFromUrl = sp.get('genSeed') || '';
    let seedId =
      seedFromUrl ||
      (typeof window !== 'undefined' ? localStorage.getItem('a4d.pendingSeed') || '' : '');

    if (!seedId) {
      seedId = EMERGING_CAREERS_BATCH3[0]?.id || '';
    }

    // Générer uniquement si pas déjà fait et pas en cours
    if (!alreadyHave && !busy && seedId) {
      hasRun.current = true;

      const seed =
        EMERGING_CAREERS_BATCH3.find((c) => c.id === seedId) || EMERGING_CAREERS_BATCH3[0];

      // Nettoyer le localStorage
      try {
        localStorage.removeItem('a4d.pendingSeed');
      } catch {}

      // Générer et scroller
      generateProjects([seed]).finally(() => {
        setTimeout(() => {
          document
            .getElementById('hybrid-projects-section')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
      });
    }
  }, [isPremium, sp, generatedProjects, isGeneratingProjects, generateProjects]);

  return null;
}
