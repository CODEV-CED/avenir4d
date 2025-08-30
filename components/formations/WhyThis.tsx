// components/formations/WhyThis.tsx
'use client';
import { useState, MouseEvent } from 'react';

type Breakdown = {
  plaisir?: number;
  competence?: number;
  utilite?: number;
  viabilite?: number;
};

type Explanation = {
  main_reasons?: string[];
  evidences?: string[];
  breakdown?: Breakdown; // si ton matching l’envoie (optionnel)
};

export default function WhyThis({ explanation }: { explanation?: Explanation }) {
  const [open, setOpen] = useState(false);
  if (!explanation) return null;

  const { main_reasons = [], evidences = [], breakdown } = explanation;

  const stop = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="inline-flex shrink-0 items-center gap-1 text-xs leading-none whitespace-nowrap text-indigo-700 hover:underline"
        title="Voir les raisons de cette recommandation"
      >
        Pourquoi je vois ça ?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-lg" onClick={stop}>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold">Pourquoi cette formation ?</h4>
              <button
                className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Fermer ✕
              </button>
            </div>

            {main_reasons.length > 0 && (
              <div className="mb-3">
                <div className="mb-1 text-xs font-medium text-gray-700">Raisons principales</div>
                <ul className="list-inside list-disc text-xs text-gray-700">
                  {main_reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {evidences.length > 0 && (
              <div className="mb-3">
                <div className="mb-1 text-xs font-medium text-gray-700">Indices</div>
                <ul className="list-inside list-disc text-xs text-gray-700">
                  {evidences.map((evi, i) => (
                    <li key={i}>{evi}</li>
                  ))}
                </ul>
              </div>
            )}

            {breakdown && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(['plaisir', 'competence', 'utilite', 'viabilite'] as const).map(
                  (k) =>
                    breakdown[k] !== undefined && (
                      <div key={k} className="rounded border border-gray-200 p-2">
                        <div className="mb-1 text-[10px] text-gray-500 uppercase">{k}</div>
                        <div className="h-2 w-full overflow-hidden rounded bg-gray-100">
                          <div
                            className="h-2 rounded bg-indigo-500"
                            style={{ width: `${Math.round((breakdown[k] ?? 0) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ),
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
