// components/sweet-spot/ui/components/ConvergenceCard.tsx
'use client';

import React, { memo, useMemo } from 'react';
import type { UIConvergence } from '@sweet-spot/types/convergences';
import { calculateConvergenceScore } from '@sweet-spot/utils';

type Props = {
  convergence: UIConvergence;
  index: number;
  baseScorePct?: number; // optionnel: pour affiner l'affichage du badge
};

export const ConvergenceCard = memo(({ convergence, index, baseScorePct = 50 }: Props) => {
  const score = useMemo(
    () => calculateConvergenceScore(convergence, baseScorePct),
    [convergence, baseScorePct],
  );

  return (
    <div
      className="convergence-card group relative cursor-pointer rounded-xl border border-white/10 bg-black/80 p-5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Score badge */}
      <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/90 text-xs font-bold text-black">
        {score}%
      </div>

      {/* Barre de progression top (effet hover) */}
      <div className="absolute top-0 left-0 h-0.5 w-full rounded-t-xl bg-gradient-to-r from-white/20 to-white/40 opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Formule */}
      <div className="mb-3 flex flex-wrap items-center gap-1">
        {convergence.formula.map((element, i) => (
          <span key={`${convergence.id}_${i}`} className="flex items-center gap-1">
            <span className="rounded border border-white/20 bg-white/10 px-2 py-1 text-xs font-medium text-white/90">
              {element}
            </span>
            {i < convergence.formula.length - 1 && <span className="text-xs text-white/50">+</span>}
          </span>
        ))}
        <span className="mx-1 font-bold text-white/70">→</span>
      </div>

      {/* Titre */}
      <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-white/90">
        {convergence.result}
      </h3>

      {/* Description */}
      <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-white/60">
        {convergence.description}
      </p>

      {/* Exemple (si présent) */}
      {convergence.example && (
        <div className="rounded-r-lg border-l-4 border-white/20 bg-white/5 p-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 text-lg text-white/70">💡</span>
            <div>
              <strong className="mb-1 block text-white/80">Exemple concret :</strong>
              <span className="text-white/70">{convergence.example}</span>
            </div>
          </div>
        </div>
      )}

      {/* CTA hover */}
      <div className="absolute right-3 bottom-3 opacity-0 transition-opacity group-hover:opacity-100">
        <button className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 transition-colors hover:bg-white/20">
          Explorer cette piste →
        </button>
      </div>
    </div>
  );
});

ConvergenceCard.displayName = 'ConvergenceCard';
