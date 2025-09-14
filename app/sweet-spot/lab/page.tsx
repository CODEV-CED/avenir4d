// app/sweet-spot/lab/page.tsx
'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import SweetSpotLabStep from '@/components/SweetSpotLabStep';
import SweetSpotLabSkeleton from '@/components/skeletons/SweetSpotLabSkeleton';
import { useSJTProfile } from '@/hooks/useSJTProfile';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';

export default function SweetSpotLabPage() {
  return (
    <Suspense fallback={<SweetSpotLabSkeleton />}>
      <SweetSpotLabInner />
    </Suspense>
  );
}

function SweetSpotLabInner() {
  const params = useSearchParams();
  const queryId = params ? params.get('profile') : null;
  const localId = typeof window !== 'undefined' ? localStorage.getItem('sjtProfileId') : null;
  const id = useMemo(() => queryId || localId, [queryId, localId]);

  const { profile, loading, error } = useSJTProfile(id || undefined);
  const setUserKeywords = useSweetSpotStore((s) => s.setUserKeywords);
  const fetchConvergences = useSweetSpotStore((s) => s.fetchConvergences);

  // Effet pour hydrater le store une fois le profil chargé
  useEffect(() => {
    if (profile?.keywords) {
      const kw = {
        passions: profile.keywords.passions ?? [],
        talents: profile.keywords.talents ?? [],
        utilite: profile.keywords.utilite ?? [],
        viabilite: profile.keywords.viabilite ?? [],
      };
      setUserKeywords(kw as any);
      fetchConvergences();
    }
  }, [profile, setUserKeywords, fetchConvergences]);

  // Effet pour afficher les erreurs dans un toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // --- Clauses de garde (Guard Clauses) ---

  // 1. Pas d'ID
  if (!id) {
    return <p className="p-6">Aucun profil fourni. Reprenez le SJT pour générer votre profil.</p>;
  }

  // 2. Chargement en cours
  if (loading) {
    return <SweetSpotLabSkeleton />;
  }

  // 3. Erreur lors du chargement (le toast s'affiche déjà)
  if (error) {
    return (
      <p className="p-6 text-red-600">Une erreur est survenue. Le profil n'a pas pu être chargé.</p>
    );
  }

  // 4. Profil non trouvé après chargement
  if (!profile) {
    return <p className="p-6">Profil introuvable.</p>;
  }

  // --- Rendu principal ---
  // Si toutes les gardes sont passées, on affiche le Lab
  return <SweetSpotLabStep />;
}
