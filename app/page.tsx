'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HeroPitch from '@/components/marketing/HeroPitch';
// ... (tes imports actuels : FiltersBar, FormationCard, MesVoeuxPanel, useVoeux, dataset, etc.)

export default function AccueilPage() {
  return (
    <Suspense fallback={null}>
      <HomeInner />
    </Suspense>
  );
}

function HomeInner() {
  const sp = useSearchParams();
  useEffect(() => {
    const wantReco = sp?.get('from') === 'sjt' || window.location.hash === '#reco';
    if (wantReco) {
      setTimeout(() => {
        document.getElementById('reco')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [sp]);

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <HeroPitch />
        <div id="reco" className="h-6" />
        {/* ensuite: aside Filtres + main Liste + panel Vœux exactement comme déjà en place */}
      </div>
    </div>
  );
}
