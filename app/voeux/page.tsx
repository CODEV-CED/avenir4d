'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useVoeux } from '@/lib/voeux';

type FormationLite = {
  id: string;
  nom: string;
  type: string;
  etablissement?: string;
  ville?: string;
};

export default function VoeuxPage() {
  const { hydrated, ids } = useVoeux();
  const [items, setItems] = useState<FormationLite[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!ids || ids.length === 0) {
      setItems([]);
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/formations/by-ids', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids }),
          cache: 'no-store',
        });
        const json = await res.json();
        const rows: FormationLite[] = Array.isArray(json) ? json : (json.rows ?? []);
        setItems(rows);
        if (!Array.isArray(json) && json?.notFoundIds?.length) {
          console.warn('IDs introuvables:', json.notFoundIds);
        }
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? 'Erreur');
      }
    })();
  }, [hydrated, ids]);

  if (!hydrated) return null;
  if (error) return <div className="p-6 text-red-400">Erreur: {error}</div>;
  if (!items) return <div className="p-6 text-neutral-300">Chargement…</div>;
  if (items.length === 0)
    return (
      <main className="container mx-auto p-6">
        <div className="mb-4">
          <Link href="/" className="text-sm text-neutral-400 hover:text-neutral-200">
            ← Retour accueil
          </Link>
        </div>
        <div className="text-neutral-300">Tu n’as pas encore de vœux.</div>
      </main>
    );

  return (
    <main className="container mx-auto p-6">
      <div className="mb-4">
        <Link href="/" className="text-sm text-neutral-400 hover:text-neutral-200">
          ← Retour accueil
        </Link>
      </div>
      <h1 className="mb-6 text-3xl font-bold text-white">Ma fiche de vœux</h1>
      <ol className="space-y-3">
        {ids.map((id, idx) => {
          const f = items.find((x) => x.id === id);
          return (
            <li key={id} className="ny-card flex items-start gap-3 p-4">
              <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600/80 text-sm font-bold text-white">
                {idx + 1}
              </span>
              <div className="flex-1">
                <div className="font-semibold text-white">
                  <Link href={`/formations/${id}`} className="ny-gradient-text hover:underline">
                    {f?.nom ?? id}
                  </Link>
                </div>
                <div className="text-sm text-neutral-400">
                  {f ? `${f.type} • ${f.etablissement ?? '—'} • ${f.ville ?? '—'}` : '—'}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
