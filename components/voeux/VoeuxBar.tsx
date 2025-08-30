'use client';
import { useMemo } from 'react';
import type { FormationStatic } from '@/types/formation';

type Props = {
  ids: string[];
  formations?: FormationStatic[]; // facultatif si tu veux passer la liste
  onRemove?: (id: string) => void;
};

// Petit utilitaire pour récupérer les métadonnées d’un vœu
function getLabel(f: FormationStatic) {
  return `${f.nom} ${f.type ? `• ${f.type}` : ''}`;
}

export default function VoeuxBar({ ids, formations = [], onRemove }: Props) {
  const items = useMemo(
    () => ids.map((id) => formations.find((f) => f.id === id)).filter(Boolean) as FormationStatic[],
    [ids, formations],
  );

  if (ids.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/65">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-sm font-medium">Mes vœux ({ids.length}/6)</span>

          {/* Liste défilable horizontalement si besoin */}
          <div className="min-w-0 flex-1 overflow-x-auto">
            <div className="flex gap-2">
              {items.map((f) => (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm"
                >
                  {getLabel(f)}
                  <button
                    type="button"
                    onClick={() => onRemove?.(f.id)}
                    className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    title="Retirer ce vœu"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
