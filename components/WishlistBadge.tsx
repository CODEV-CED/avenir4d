'use client';
import { useWishlist } from '@/hooks/useWishlist';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';

export default function WishlistBadge() {
  const profile = useCurrentProfile();
  const { count, max } = useWishlist(
    profile ?? { plaisir: 0.6, competence: 0.6, utilite: 0.6, viabilite: 0.6, confidence_avg: 0.7 },
  );
  return (
    <span
      title="Nombre de vœux pour le profil courant"
      className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
      aria-live="polite"
    >
      Vœux {count}/{max}
    </span>
  );
}
