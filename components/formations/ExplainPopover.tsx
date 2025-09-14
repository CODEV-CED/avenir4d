// components/formations/ExplainPopover.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  explanation?: {
    main_reasons?: string[]; // ex: ['plaisir','competence']
    breakdown?: Record<string, number>; // ex: { plaisir: 0.72, competence: 0.64, ... }
    evidences?: string[]; // ex: ['Formation gratuite', 'Activités: ...']
  };
};

/**
 * Petit popover "?" pour expliquer la reco.
 * - Type tolérant (pas de type 'Explanation' exporté) → évite les conflits.
 * - Clique dehors pour fermer.
 * - Affiche raisons + mini barres pour le breakdown + évidences.
 */
export default function ExplainPopover({ explanation }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fermer si clic à l'extérieur
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!explanation) return null;

  const main = explanation.main_reasons ?? [];
  const breakdownEntries = Object.entries(explanation.breakdown ?? {});
  const evidences = explanation.evidences ?? [];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Pourquoi cette recommandation ?"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
        title="Pourquoi cette recommandation ?"
      >
        ?
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
        >
          <div className="mb-2 text-xs font-semibold text-gray-700">
            Pourquoi cette recommandation ?
          </div>

          {main.length > 0 && (
            <div className="mb-2 text-xs text-gray-700">
              Points forts : <span className="font-medium">{main.slice(0, 2).join(' + ')}</span>
            </div>
          )}

          {breakdownEntries.length > 0 && (
            <ul className="mb-2 space-y-1">
              {breakdownEntries.map(([k, v]) => {
                const pct = Math.max(0, Math.min(100, Math.round((v ?? 0) * 100)));
                return (
                  <li key={k} className="text-[11px] text-gray-600">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="capitalize">{k}</span>
                      <span className="tabular-nums">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded bg-indigo-100">
                      <div className="h-1.5 rounded bg-indigo-500" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {evidences.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-[11px] text-gray-600">
              {evidences.slice(0, 3).map((evi, i) => (
                <li key={i}>{evi}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
