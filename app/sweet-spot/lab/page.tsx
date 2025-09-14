// app/sweet-spot/lab/page.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useIsClient } from '@/lib/hooks/useIsClient';
import { useSJTProfile } from '@/lib/hooks/useSJTProfile';
import SweetSpotLabStep from '@/components/SweetSpotLabStep';
import SweetSpotLabSkeleton from '@/components/skeletons/SweetSpotLabSkeleton';

export default function LabPage() {
  // ✅ Tous les hooks sont appelés à chaque render (ordre stable)
  const isClient = useIsClient();
  const sp = useSearchParams();
  const v = sp?.get('profile');
  const qId = v && v.trim() ? v : undefined;

  // Désactive l’auto-fetch pour éviter de lancer un fetch avant hydratation
  const { loading, error, fetchProfile } = useSJTProfile({
    id: qId,
    auto: false,
    hydrateSliders: true,
  });

  // Lance le fetch après hydratation uniquement (et avec fallback localStorage)
  useEffect(() => {
    if (!isClient) return;
    const pid = qId || (typeof window !== 'undefined' ? localStorage.getItem('sjtProfileId') || '' : '');
    if (pid) fetchProfile(pid);
  }, [isClient, qId, fetchProfile]);

  // ✅ Rendu : même skeleton SSR/CSR → pas de mismatch d’hydratation
  if (!isClient) return <SweetSpotLabSkeleton />;
  if (loading)   return <SweetSpotLabSkeleton />;
  if (error)     return <div className="p-6 text-red-500">{error}</div>;

  return <SweetSpotLabStep />;
}
