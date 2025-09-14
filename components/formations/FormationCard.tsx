// components/formations/FormationCard.tsx
import React, { useEffect } from 'react';
import type { FormationStatic, Ranking } from '@/types/formation';
import FeedbackButtons from '@/components/formations/FeedbackButtons';
import ExplainPopover from './ExplainPopover';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/UI/tooltip';
// Import “namespace” — fonctionne même si ton module exporte {telemetry} ou des fonctions séparées
import * as Telemetry from '@/lib/telemetry';
import Link from 'next/link';

type Explanation = {
  main_reasons?: string[];
  breakdown?: Record<string, number>;
  evidences?: string[];
};

type Props = {
  formation: FormationStatic & { compatibilityScore?: number; explanation?: Explanation };
  inWishlist?: boolean;
  wishlistFull?: boolean;
  onAdd?: (id: string) => void;
  className?: string;
};

function bestRanking(r?: Ranking[]) {
  if (!r?.length) return null;
  // plus petit “position” = meilleur
  return [...r].sort((a, b) => a.position - b.position)[0];
}

export default function FormationCard({
  formation,
  inWishlist = false,
  wishlistFull = false,
  onAdd,
  className = '',
}: Props) {
  const score = Math.round((formation.compatibilityScore ?? 0) * 100);
  const conf = Math.round((formation.confidence ?? 0) * 100);
  const top = formation.ranking ?? null;

  useEffect(() => {
    // appel no-op si non défini
    (Telemetry as any)?.telemetry?.view?.(formation.id);
  }, [formation.id]);

  const handleAdd = () => {
    if (!inWishlist && !wishlistFull) {
      (Telemetry as any)?.telemetry?.click?.(formation.id);
      onAdd?.(formation.id);
    }
  };

  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold">
          <Link href={`/formations/${formation.id}`} className="hover:underline">
            {formation.nom}
          </Link>
        </h3>

        <div className="flex items-center gap-2">
          {/* Badge Classement si dispo */}
          {top && top.source && (
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={formation.website || '#'}
                  target={formation.website ? '_blank' : undefined}
                  rel={formation.website ? 'noopener noreferrer' : undefined}
                  className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800"
                >
                  #{top.position ?? ''} {top.source ?? ''}
                </a>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>
                {`${top.source ?? ''}${top.year ? ` • ${top.year}` : ''}`}
              </TooltipContent>
            </Tooltip>
          )}

          <ExplainPopover explanation={formation.explanation} />
        </div>
      </div>

      <p className="mt-1 text-sm text-gray-600">
        {formation.type} • {formation.etablissement} • {formation.ville}
      </p>

      {/* Alerte Ikigaï (si injecté par applyIkigaiConstraints) */}
      {'warning' in formation && (formation as any).warning && (
        <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {(formation as any).warning}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {formation.plaisir_tags?.map((t) => (
          <span key={t} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-4">
        {inWishlist ? (
          <div className="w-full rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            ✅ Déjà dans mes vœux
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleAdd}
                disabled={wishlistFull}
                className="focus-ring w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                aria-disabled={wishlistFull}
              >
                {wishlistFull ? 'Limite atteinte (6/6)' : 'Ajouter aux vœux'}
              </button>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>
              {wishlistFull ? 'Limite de 6 vœux atteinte' : 'Ajouter cette formation à mes vœux'}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <FeedbackButtons formationId={formation.id} />
      </div>
    </div>
  );
}
