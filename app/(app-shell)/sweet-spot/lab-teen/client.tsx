// app/(app-shell)/sweet-spot/lab-teen/client.tsx

'use client';

import dynamic from 'next/dynamic';

const SweetSpot = dynamic(() => import('@sweet-spot/index'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        <p className="text-white/60">Chargement du Sweet Spot Lab...</p>
      </div>
    </div>
  ),
});

export default function SweetSpotLabClient() {
  return <SweetSpot />;
}


