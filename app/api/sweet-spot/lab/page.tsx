'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSJTProfile } from '@/lib/hooks/useSJTProfile';
import SweetSpotLabStep from '@/components/SweetSpotLabStep';
import { useIsClient } from '@/lib/hooks/useIsClient';

export default function LabPage() {
  return (
    <Suspense fallback={<p className="p-6">Chargement…</p>}>
      <LabInner />
    </Suspense>
  );
}

function LabInner() {
  const isClient = useIsClient();
  const sp = useSearchParams();
  const v = sp?.get('profile');
  const qId = v && v.trim() ? v : undefined;

  const { loading, error } = useSJTProfile({ id: qId, auto: true, hydrateSliders: true });

  if (!isClient) return <p className="p-6">Chargement…</p>;
  if (loading) return <p className="p-6">Chargement…</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  return <SweetSpotLabStep />;
}
