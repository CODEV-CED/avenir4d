// app/sweet-spot/lab/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useSJTProfile } from '@/lib/hooks/useSJTProfile';
import { useIsClient } from '@/lib/hooks/useIsClient';
import SweetSpotLabStep from '@/components/SweetSpotLabStep';
import SweetSpotLabSkeleton from '@/components/skeletons/SweetSpotLabSkeleton';

export default function LabPage() {
  // 1) Toujours rendre le skeleton avant hydratation → pas de mismatch
  const isClient = useIsClient();
  if (!isClient) return <SweetSpotLabSkeleton />;

  // 2) Une fois hydraté, on lit les params et on charge
  const sp = useSearchParams();
  const v = sp?.get('profile');
  const qId = v && v.trim() ? v : undefined;

  const { loading, error } = useSJTProfile({ id: qId, auto: true, hydrateSliders: true });

  if (loading) return <SweetSpotLabSkeleton />; // même fallback
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return <SweetSpotLabStep />;
}
