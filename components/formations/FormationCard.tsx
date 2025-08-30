// components/formations/FormationCard.tsx
import React from 'react';
import type { FormationStatic } from '@/types/formation';
import FeedbackButtons from '@/components/formations/FeedbackButtons';
import WhyThis from '@/components/formations/WhyThis';

type Props = {
  formation: FormationStatic & { compatibilityScore?: number; explanation?: any };
  inWishlist?: boolean;
  wishlistFull?: boolean;
  onAdd?: (id: string) => void;
};

export default function FormationCard({
  formation,
  inWishlist = false,
  wishlistFull = false,
  onAdd,
}: Props) {
  const score = Math.round((formation.compatibilityScore ?? 0) * 100);
  const conf = Math.round((formation.confidence ?? 0) * 100);

  const handleAdd = () => {
    if (!inWishlist && !wishlistFull) onAdd?.(formation.id);
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold">{formation.nom}</h3>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
            Score {score}%
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
            Conf {conf}%
          </span>
        </div>
      </div>

      <p className="mt-1 text-sm text-gray-600">
        {formation.type} • {formation.etablissement} • {formation.ville}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {formation.plaisir_tags?.slice(0, 3).map((t) => (
          <span key={t} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
            {t}
          </span>
        ))}
      </div>

      {/* CTA vœux */}
      <div className="mt-4">
        {inWishlist ? (
          <div className="w-full rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            ✅ Déjà dans mes vœux
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            disabled={wishlistFull}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            title={
              wishlistFull ? 'Limite de 6 vœux atteinte' : 'Ajouter cette formation à mes vœux'
            }
          >
            {wishlistFull ? 'Limite atteinte (6/6)' : 'Ajouter aux vœux'}
          </button>
        )}
      </div>

      {/* Feedback + Pourquoi */}
      <div className="mt-3 flex items-center justify-between">
        <FeedbackButtons formationId={formation.id} />
        <WhyThis explanation={(formation as any).explanation} />
      </div>
    </div>
  );
}
