'use client';

import { useEffect } from 'react';
import { useAccessStore } from '@/store/useAccessStore';

// Facultatif: si tu veux re-hydrater aussi quand la session change
// évite d'importer du code SSR ici. Reste 100% client.
export default function AppInit() {
  const hydrateFromDB = useAccessStore((s: { hydrateFromDB?: () => void }) => s.hydrateFromDB);

  useEffect(() => {
    // Hydrate le flag premium dès le montage
    hydrateFromDB?.();

    // Si tu veux écouter d'autres signaux (post-paiement redirect, etc.)
    // c'est aussi l’endroit idéal pour rejouer des actions différées.
  }, [hydrateFromDB]);

  return null; // Composant invisible
}
