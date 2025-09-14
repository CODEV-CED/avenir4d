'use client';

import React from 'react';
import type { FormationStatic } from '@/types/formation';

type Props = {
  ids: string[]; // ids des vœux sélectionnés
  formations: FormationStatic[]; // dataset pour retrouver nom/infos
  onRemove: (id: string) => void; // retirer un vœu
  onReorder?: (from: number, to: number) => void; // (optionnel, non utilisé ici)
  onClear?: () => void; // (optionnel) réinitialiser tous les vœux
};

const CAP = 6;

export default function VoeuxBar({
  ids,
  formations,
  onRemove,
  onReorder, // non utilisé pour l’instant (placeholder)
  onClear,
}: Props) {
  // Ne rien afficher s’il n’y a aucun vœu
  if (!ids || ids.length === 0) return null;

  // Map id -> formation (sécurisé si l’id n’existe plus dans le dataset)
  const map = React.useMemo(() => {
    const m = new Map<string, FormationStatic>();
    formations.forEach((f) => m.set(f.id, f));
    return m;
  }, [formations]);

  const items = ids.map((id) => map.get(id)).filter(Boolean) as FormationStatic[]; // enlève les ids obsolètes

  const count = items.length;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur print:hidden"
      role="region"
      aria-label="Barre Mes vœux"
    >
      <div className="container mx-auto flex items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Mes vœux</span>
          <span
            className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
              count >= CAP ? 'bg-red-50 text-red-700' : 'bg-indigo-50 text-indigo-700'
            }`}
          >
            {count}/{CAP}
          </span>
        </div>

        {/* Liste horizontale des vœux (scroll si trop) */}
        <div className="no-scrollbar -mx-1 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-1">
          {items.map((f, idx) => (
            <div
              key={f.id}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1 shadow-sm"
              title={`${f.nom} • ${f.type} • ${f.etablissement} • ${f.ville}`}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-semibold text-white">
                {idx + 1}
              </span>
              <span className="max-w-[28ch] truncate text-xs text-gray-800">{f.nom}</span>
              <button
                type="button"
                onClick={() => onRemove(f.id)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label={`Retirer ${f.nom} de mes vœux`}
                title="Retirer"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Actions à droite */}
        <div className="flex items-center gap-2">
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
              title="Réinitialiser tous mes vœux"
            >
              Réinitialiser mes vœux
            </button>
          )}

          <a
            href="/voeux"
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            Voir la fiche vœux
          </a>
        </div>
      </div>
    </div>
  );
}
